// app/api/candidature/demande/route.ts
// Inscription en deux temps — TEMPS 1 (18/11/2026) : la demande courte.
//
// Reçoit : l'élève (prénom, nom, date de naissance), le parcours, le groupe
// d'âge, les jours possibles, l'option Pack Studio & Artistes (Comédie
// musicale) et, si la personne n'est pas connectée, ses coordonnées.
//
//   - Connecté·e      → la demande est ajoutée à son foyer.
//   - Pas de compte   → on crée le compte (sans mot de passe), le foyer et
//                       l'élève, puis on ouvre la session tout de suite.
//   - Compte existant → on ne crée rien : on envoie un lien de connexion par
//                       mail, pour continuer l'inscription une fois connecté·e.
//
// La candidature est créée avec le statut « dossier_incomplet ». Elle n'est
// examinée par la direction qu'une fois le dossier complété et envoyé
// (temps 2 : /candidature/dossier/[id]).

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import {
  JOURS_PARCOURS, TRANCHES, PARCOURS_LABELS,
  ageAu, estParcoursAnnuel, estTranche,
} from "@/lib/grille";
import { STATUT_DOSSIER_INCOMPLET } from "@/lib/dossier";
import { envoyerLienConnexion, ouvrirSession } from "@/lib/lien-connexion";

const STATUTS_TERMINES = ["refusee", "sans_reponse", "expiree", "annulee"];

const texte = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const erreur = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

async function getAnneeActiveId(): Promise<string | null> {
  const { data } = await supabaseAdmin.from("annees_scolaires").select("id").eq("active", true).maybeSingle();
  return data?.id ?? null;
}

/** Crée compte + foyer + carte fidélité + élève. Annule tout en cas d'échec. */
async function creerCompte(opts: {
  email: string; telephone: string;
  prenomCompte: string; nomCompte: string;
  eleve: { prenom: string; nom: string; date_naissance: string };
}): Promise<{ userId: string; foyerId: string; eleveId: string } | "existe" | null> {
  const { data: auth, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: opts.email,
    email_confirm: true,
    user_metadata: { prenom: opts.prenomCompte, nom: opts.nomCompte },
  });

  if (authError || !auth?.user) {
    const msg = (authError?.message ?? "").toLowerCase();
    if ((authError as any)?.code === "email_exists" || msg.includes("already") || msg.includes("registered")) return "existe";
    console.error("createUser error:", authError);
    return null;
  }
  const userId = auth.user.id;

  try {
    // Le trigger handle_new_user a déjà créé la ligne profiles (rôle « eleve »)
    await supabaseAdmin.from("profiles")
      .update({ prenom: opts.prenomCompte, nom: opts.nomCompte, telephone: opts.telephone })
      .eq("id", userId);

    const { data: foyer, error: foyerError } = await supabaseAdmin
      .from("foyers")
      .insert({ user_id: userId, nom_famille: opts.eleve.nom, telephone: opts.telephone })
      .select("id").single();
    if (foyerError || !foyer) throw foyerError ?? new Error("foyer");

    const { error: fideliteError } = await supabaseAdmin
      .from("fidelite")
      .insert({ foyer_id: foyer.id, type_carte: "cours_individuel", compteur: 0, total_offerts: 0 });
    if (fideliteError) console.error("Carte fidélité error (non bloquant):", fideliteError);

    const { data: eleve, error: eleveError } = await supabaseAdmin
      .from("eleves")
      .insert({ foyer_id: foyer.id, ...opts.eleve })
      .select("id").single();
    if (eleveError || !eleve) throw eleveError ?? new Error("eleve");

    return { userId, foyerId: foyer.id, eleveId: eleve.id };
  } catch (e) {
    console.error("Création compte (rollback):", e);
    await supabaseAdmin.from("foyers").delete().eq("user_id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return erreur("Requête invalide");

    // Champ piège invisible : un robot le remplit, un humain non.
    if (texte(body.site_web)) return NextResponse.json({ ok: true, robot: true });

    // ── 1. Choix du parcours ─────────────────────────────────────────────────
    const parcours = body.parcours;
    if (!estParcoursAnnuel(parcours)) return erreur("Choisis un parcours");
    const tranche = body.tranche;
    if (!estTranche(tranche)) return erreur("Choisis un groupe d'âge");
    const joursValides = JOURS_PARCOURS[parcours].map((j) => j.id);
    const jours: string[] = Array.isArray(body.jours) ? body.jours.filter((j: unknown) => joursValides.includes(j as string)) : [];
    if (jours.length === 0) return erreur("Coche au moins un jour possible");
    const pack = parcours === "comedie-musicale" && body.pack === true;

    const dateSaisie = texte(body.dateNaissance, 10);
    if (dateSaisie && !/^\d{4}-\d{2}-\d{2}$/.test(dateSaisie)) return erreur("Date de naissance invalide");

    // ── 2. Qui fait la demande ? ─────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId: string;
    let email: string;
    let telephone: string | null;
    let eleve: { id: string; prenom: string; nom: string; date_naissance: string | null };
    let nouveauCompte = false;

    if (user) {
      // ── 2a. Connecté·e : élève du foyer existant, ou nouvel élève ─────────
      const { data: foyer } = await supabaseAdmin
        .from("foyers").select("id, telephone").eq("user_id", user.id).maybeSingle();
      if (!foyer) return erreur("Aucun foyer lié à ce compte", 403);

      userId = user.id;
      email = user.email ?? "";
      telephone = texte(body.telephone, 40) || foyer.telephone || null;

      if (body.eleveId) {
        const { data } = await supabaseAdmin
          .from("eleves").select("id, prenom, nom, date_naissance")
          .eq("id", body.eleveId).eq("foyer_id", foyer.id).maybeSingle();
        if (!data) return erreur("Élève introuvable dans ton foyer", 403);
        eleve = data;
        if (!eleve.date_naissance) {
          if (!dateSaisie) return erreur("Date de naissance manquante");
          await supabaseAdmin.from("eleves").update({ date_naissance: dateSaisie }).eq("id", eleve.id);
          eleve.date_naissance = dateSaisie;
        }
      } else {
        const prenom = texte(body.prenom, 80);
        const nom = texte(body.nom, 80);
        if (!prenom || !nom || !dateSaisie) return erreur("Prénom, nom et date de naissance obligatoires");
        const { data, error } = await supabaseAdmin
          .from("eleves")
          .insert({ foyer_id: foyer.id, prenom, nom, date_naissance: dateSaisie })
          .select("id, prenom, nom, date_naissance").single();
        if (error || !data) return erreur("Impossible d'ajouter l'élève au foyer", 500);
        eleve = data;
      }
    } else {
      // ── 2b. Pas connecté·e : création du compte ───────────────────────────
      const prenom = texte(body.prenom, 80);
      const nom = texte(body.nom, 80);
      email = texte(body.email, 160).toLowerCase();
      telephone = texte(body.telephone, 40) || null;
      const pourEnfant = body.pourQui === "enfant";
      const prenomParent = texte(body.prenomParent, 80);
      const nomParent = texte(body.nomParent, 80);

      if (!prenom || !nom || !dateSaisie) return erreur("Prénom, nom et date de naissance obligatoires");
      if (pourEnfant && (!prenomParent || !nomParent)) return erreur("Indique ton prénom et ton nom de parent");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return erreur("Adresse mail invalide");
      if (!telephone || telephone.replace(/\D/g, "").length < 8) return erreur("Numéro de téléphone invalide");
      if (ageAu(dateSaisie) === null) return erreur("Date de naissance invalide");

      const compte = await creerCompte({
        email, telephone,
        prenomCompte: pourEnfant ? prenomParent : prenom,
        nomCompte: pourEnfant ? nomParent : nom,
        eleve: { prenom, nom, date_naissance: dateSaisie },
      });

      if (compte === "existe") {
        // On ne crée rien : la personne se connecte d'abord, puis refait sa demande
        // (le formulaire reconnaîtra son foyer et ses élèves).
        await envoyerLienConnexion({
          email,
          next: `/candidature?parcours=${parcours}`,
          sujet: "Ton lien de connexion Crea'Star",
          titre: "Tu as déjà un compte",
          texte: `Tu as demandé une inscription pour <strong>${esc(prenom)}</strong> au parcours <strong>${esc(PARCOURS_LABELS[parcours])}</strong>. Un compte existe déjà avec cette adresse : connecte-toi avec le bouton ci-dessous, puis termine la demande en une minute.`,
          bouton: "Me connecter et continuer",
        });
        return NextResponse.json({ ok: true, compteExistant: true });
      }
      if (!compte) return erreur("Impossible de créer ton compte pour l'instant. Réessaie dans un instant.", 500);

      userId = compte.userId;
      eleve = { id: compte.eleveId, prenom, nom, date_naissance: dateSaisie };
      nouveauCompte = true;
    }

    const age = ageAu(eleve.date_naissance!);
    if (age === null) return erreur("Date de naissance invalide");

    // ── 3. Pas de doublon (même élève, même parcours, demande en cours) ──────
    const { data: doublon } = await supabaseAdmin
      .from("candidatures").select("id, statut")
      .eq("eleve_id", eleve.id).eq("parcours", parcours)
      .not("statut", "in", `(${STATUTS_TERMINES.map((s) => `"${s}"`).join(",")})`)
      .limit(1);
    if (doublon && doublon.length > 0) {
      // Demande déjà commencée : on renvoie vers son dossier plutôt qu'une erreur
      if (doublon[0].statut === STATUT_DOSSIER_INCOMPLET) {
        return NextResponse.json({ ok: true, id: doublon[0].id, session: true, dejaCommencee: true });
      }
      return erreur(`${eleve.prenom} a déjà une candidature en cours pour ce parcours`, 409);
    }

    // ── 4. Enregistrement de la demande ──────────────────────────────────────
    const { data: candidature, error: dbError } = await supabaseAdmin
      .from("candidatures")
      .insert({
        user_id: userId,
        eleve_id: eleve.id,
        prenom: eleve.prenom,
        nom: eleve.nom,
        email,
        telephone,
        age,
        parcours,
        tranche,
        jours_possibles: jours,
        pack_studio_artistes: pack,
        statut: STATUT_DOSSIER_INCOMPLET,
        type: "nouvelle",
        annee_id: await getAnneeActiveId(),
      })
      .select("id").single();

    if (dbError || !candidature) {
      console.error("Insert demande error:", dbError);
      return erreur("Erreur lors de l'enregistrement de la demande", 500);
    }

    // ── 5. Session + mail « complète le dossier » (non bloquants) ────────────
    const session = nouveauCompte ? await ouvrirSession(email) : true;
    const trancheLabel = TRANCHES.find((t) => t.id === tranche)?.label ?? tranche;
    await envoyerLienConnexion({
      email,
      next: `/candidature/dossier/${candidature.id}`,
      sujet: `Inscription de ${eleve.prenom} : il reste le dossier à compléter`,
      titre: "Demande bien reçue !",
      texte: `La demande d'inscription de <strong>${esc(eleve.prenom)}</strong> au parcours <strong>${esc(PARCOURS_LABELS[parcours])}</strong> (${esc(trancheLabel)}) est enregistrée. Il reste à compléter le dossier : motivation, niveau, une courte vidéo et quelques infos pratiques. Tu peux le faire en plusieurs fois, tout est enregistré au fur et à mesure.`,
      bouton: "Compléter le dossier",
    });

    return NextResponse.json({ ok: true, id: candidature.id, session });
  } catch (err: any) {
    console.error("Demande candidature error:", err);
    return erreur("Erreur serveur", 500);
  }
}