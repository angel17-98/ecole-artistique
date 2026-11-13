// app/api/candidature/submit/route.ts
// Envoi d'une candidature aux parcours annuels — réécrite le 10/11/2026.
//
// Ce qui change par rapport à l'ancienne version :
//   - connexion obligatoire : la candidature est liée au compte (user_id) et à
//     un élève du foyer (eleve_id), plus de rapprochement par email après coup
//   - date de naissance au lieu d'un âge tapé à la main
//   - tranche d'âge, jours possibles, droit à l'image, santé, réduction ménage
//   - tout est revérifié côté serveur (jamais confiance au navigateur)
//   - les emails ne peuvent plus faire échouer l'envoi : avant, si Resend
//     plantait APRÈS l'enregistrement, la famille voyait une erreur, renvoyait,
//     et la candidature existait en double.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import {
  JOURS_PARCOURS, TRANCHES, PARCOURS_LABELS, EVALS_PAR_PARCOURS,
  ageAu, estParcoursAnnuel, estTranche, horaireDeTranche,
} from "@/lib/grille";

const resend = new Resend(process.env.RESEND_API_KEY);

const EVALS = ["eval_chant", "eval_danse", "eval_theatre", "eval_ecriture", "eval_scenique", "eval_studio"] as const;
const STATUTS_TERMINES = ["refusee", "sans_reponse", "expiree", "annulee"];

// Échappe le texte saisi par la famille avant de l'insérer dans un email HTML
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function erreur(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getAnneeActiveId(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("annees_scolaires").select("id").eq("active", true).maybeSingle();
  return data?.id ?? null;
}

// ── Alerte storage vidéos (reprise de l'ancienne version, non bloquante) ──────
async function checkStorageAndAlert() {
  const BUCKET = "candidature-videos";
  const LIMIT_MB = 500;
  let totalBytes = 0;
  for (const folder of ["", "full-artist", "comedie-musicale", "eveil-musical"]) {
    const { data: files } = await supabaseAdmin.storage.from(BUCKET).list(folder, { limit: 1000 });
    for (const f of files ?? []) if (f.metadata?.size) totalBytes += f.metadata.size;
  }
  const usedMB = totalBytes / 1024 / 1024;
  if (usedMB < LIMIT_MB * 0.8) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_TO_EMAIL!,
    subject: `⚠️ Stockage vidéos Crea'Star à ${Math.round((usedMB / LIMIT_MB) * 100)}%`,
    html: `<p style="font-family:sans-serif">Le stockage des vidéos de candidature est à
      <strong>${usedMB.toFixed(0)} MB / ${LIMIT_MB} MB</strong>. Transfère ou supprime les vidéos
      des candidatures déjà traitées (Supabase → Storage → candidature-videos).</p>`,
  });
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Connexion ──────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return erreur("Connexion requise", 401);

    const body = await req.json().catch(() => null);
    if (!body) return erreur("Requête invalide");

    // ── 2. Vérifications du contenu ──────────────────────────────────────────
    const parcours = body.parcours;
    if (!estParcoursAnnuel(parcours)) return erreur("Parcours invalide");

    const tranche = body.tranche;
    if (!estTranche(tranche)) return erreur("Groupe d'âge invalide");

    const joursAutorises = JOURS_PARCOURS[parcours].map((j) => j.id);
    const jours: string[] = Array.isArray(body.jours)
      ? Array.from(new Set(body.jours.filter((j: unknown) => typeof j === "string" && joursAutorises.includes(j))))
      : [];
    if (jours.length === 0) return erreur("Indique au moins un jour possible");

    const pourquoi = texte(body.pourquoi);
    const projet = texte(body.projet);
    const esprit = texte(body.esprit_creastar);
    if (pourquoi.length < 80 || projet.length < 40 || esprit.length < 40) {
      return erreur("Les réponses de motivation sont trop courtes");
    }

    // Auto-évaluation : seulement les disciplines du parcours (le CM n'a ni
    // écriture ni studio). Les autres colonnes restent vides.
    const evalsDemandees: readonly string[] = EVALS_PAR_PARCOURS[parcours];
    const evals: Record<string, number | null> = {};
    for (const k of EVALS) {
      if (!evalsDemandees.includes(k)) { evals[k] = null; continue; }
      const v = Number(body[k]);
      if (!Number.isInteger(v) || v < 1 || v > 5) return erreur("Auto-évaluation incomplète");
      evals[k] = v;
    }

    const videoUrl = texte(body.video_url) || null;
    const videoLink = texte(body.video_link) || null;
    if (!videoUrl && !videoLink) return erreur("La vidéo est obligatoire");
    if (videoLink && !/^https?:\/\/\S{6,}$/.test(videoLink)) return erreur("Lien vidéo invalide");

    if (typeof body.droit_image !== "boolean") return erreur("Réponds à la question du droit à l'image");

    const reduction = body.reduction_menage === true;
    const justificatifPath = texte(body.justificatif_path) || null;
    if (reduction) {
      // Le fichier doit avoir été déposé par CE compte (dossier à son nom)
      if (!justificatifPath || !justificatifPath.startsWith(`${user.id}/`)) {
        return erreur("Justificatif de composition de ménage manquant");
      }
    }

    // ── 3. Foyer ─────────────────────────────────────────────────────────────
    const { data: foyer } = await supabaseAdmin
      .from("foyers").select("id, telephone, ville").eq("user_id", user.id).maybeSingle();
    if (!foyer) return erreur("Aucun foyer lié à ce compte", 403);

    // ── 4. Élève : existant (vérifié dans le foyer) ou nouveau ───────────────
    const dateSaisie = texte(body.dateNaissance);
    if (dateSaisie && !/^\d{4}-\d{2}-\d{2}$/.test(dateSaisie)) return erreur("Date de naissance invalide");

    let eleve: { id: string; prenom: string; nom: string; date_naissance: string | null };

    if (body.eleveId) {
      const { data } = await supabaseAdmin
        .from("eleves").select("id, prenom, nom, date_naissance")
        .eq("id", body.eleveId).eq("foyer_id", foyer.id).maybeSingle();
      if (!data) return erreur("Élève introuvable dans ton foyer", 403);
      eleve = data;

      // Date de naissance manquante sur la fiche → on la complète
      if (!eleve.date_naissance) {
        if (!dateSaisie) return erreur("Date de naissance manquante");
        const { error } = await supabaseAdmin
          .from("eleves").update({ date_naissance: dateSaisie }).eq("id", eleve.id);
        if (error) return erreur("Impossible d'enregistrer la date de naissance", 500);
        eleve.date_naissance = dateSaisie;
      }
    } else {
      const prenom = texte(body.nouvelEleve?.prenom);
      const nom = texte(body.nouvelEleve?.nom);
      if (!prenom || !nom || !dateSaisie) return erreur("Prénom, nom et date de naissance obligatoires");
      const { data, error } = await supabaseAdmin
        .from("eleves")
        .insert({ foyer_id: foyer.id, prenom, nom, date_naissance: dateSaisie })
        .select("id, prenom, nom, date_naissance")
        .single();
      if (error || !data) {
        console.error("Création élève error:", error);
        return erreur("Impossible d'ajouter l'élève au foyer", 500);
      }
      eleve = data;
    }

    const age = ageAu(eleve.date_naissance!);
    if (age === null) return erreur("Date de naissance invalide");

    // ── 5. Pas de doublon (même élève, même parcours, candidature en cours) ───
    const { data: doublon } = await supabaseAdmin
      .from("candidatures")
      .select("id")
      .eq("eleve_id", eleve.id)
      .eq("parcours", parcours)
      .not("statut", "in", `(${STATUTS_TERMINES.map((s) => `"${s}"`).join(",")})`)
      .limit(1);
    if (doublon && doublon.length > 0) {
      return erreur(`${eleve.prenom} a déjà une candidature en cours pour ce parcours`, 409);
    }

    // ── 6. Enregistrement ────────────────────────────────────────────────────
    const anneeId = await getAnneeActiveId();
    const telephone = texte(body.telephone) || foyer.telephone || null;

    const { data: candidature, error: dbError } = await supabaseAdmin
      .from("candidatures")
      .insert({
        user_id: user.id,
        eleve_id: eleve.id,
        prenom: eleve.prenom,
        nom: eleve.nom,
        email: user.email,
        telephone,
        age,
        ville: foyer.ville ?? null,
        parcours,
        tranche,
        jours_possibles: jours,
        pourquoi, projet, esprit_creastar: esprit,
        ...evals,
        video_url: videoUrl,
        video_link: videoLink,
        droit_image: body.droit_image,
        infos_sante: texte(body.infos_sante) || null,
        reduction_menage_demandee: reduction,
        justificatif_menage_path: reduction ? justificatifPath : null,
        reduction_menage_statut: reduction ? "en_attente" : null,
        statut: "en_attente",
        type: "nouvelle",
        annee_id: anneeId,
      })
      .select("id")
      .single();

    if (dbError || !candidature) {
      console.error("Insert candidature error:", dbError);
      return erreur("Erreur lors de l'enregistrement de la candidature", 500);
    }

    // ── 7. Emails (non bloquants) ────────────────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creastar.be";
    const parcoursLabel = PARCOURS_LABELS[parcours];
    const trancheLabel = TRANCHES.find((t) => t.id === tranche)?.label ?? tranche;
    const joursLabel = JOURS_PARCOURS[parcours].filter((j) => jours.includes(j.id)).map((j) => j.label).join(" et ");

    // Justificatif de ménage joint au mail de la direction (si demandé)
    const piecesJointes: { filename: string; content: Buffer }[] = [];
    if (reduction && justificatifPath) {
      try {
        const { data: fichier } = await supabaseAdmin.storage.from("justificatifs").download(justificatifPath);
        if (fichier) {
          const ext = justificatifPath.split(".").pop() ?? "pdf";
          piecesJointes.push({
            filename: `composition-menage-${eleve.nom}-${eleve.prenom}.${ext}`.replace(/[^a-zA-Z0-9._-]/g, "_"),
            content: Buffer.from(await fichier.arrayBuffer()),
          });
        }
      } catch (e) {
        console.error("Pièce jointe justificatif error:", e); // non bloquant : il reste visible dans la fiche
      }
    }

    const emails = [
      // Confirmation à la famille
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: user.email,
        subject: `Candidature reçue — ${eleve.prenom} · ${parcoursLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
            <div style="background:rgb(22,92,71);padding:28px 32px;border-radius:16px 16px 0 0;">
              <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Crea'Star · Candidature reçue</p>
              <h1 style="color:white;font-size:22px;margin:0;font-weight:600;">Merci !</h1>
            </div>
            <div style="background:#f9f8f5;padding:28px 32px;border-radius:0 0 16px 16px;border:1px solid rgba(0,0,0,0.06);">
              <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
                On a bien reçu la candidature de <strong>${esc(eleve.prenom)}</strong> pour le parcours
                <strong style="color:rgb(22,92,71);">${parcoursLabel}</strong>
                (${esc(trancheLabel)}, ${esc(joursLabel)} de ${horaireDeTranche(tranche)}).
                On lit chaque dossier attentivement : tu reçois notre réponse <strong>dans la semaine</strong>.
              </p>
              <p style="font-size:14px;line-height:1.7;color:rgba(0,0,0,0.6);margin:0 0 20px;">
                Si la candidature est acceptée, tu paieras un acompte pour réserver la place. Le jour définitif
                est confirmé une fois les groupes composés.
              </p>
              <a href="${siteUrl}/plateforme/dashboard"
                style="display:inline-block;background:rgb(22,92,71);color:white;padding:10px 22px;border-radius:100px;text-decoration:none;font-size:13px;font-weight:600;">
                Suivre ma candidature →
              </a>
              <p style="font-size:13px;color:rgba(0,0,0,0.45);margin:24px 0 0;">L'équipe Crea'Star · Waterloo</p>
            </div>
          </div>`,
      }),

      // Notification à la direction
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        replyTo: user.email,
        subject: `[Candidature] ${eleve.prenom} ${eleve.nom} — ${parcoursLabel} · ${trancheLabel}`,
        attachments: piecesJointes,
        html: `
          <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#111;">
            <div style="background:rgb(12,50,38);padding:20px 28px;border-radius:12px 12px 0 0;">
              <p style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 6px;">Nouvelle candidature</p>
              <h1 style="color:white;font-size:20px;margin:0;">${esc(eleve.prenom)} ${esc(eleve.nom)} — ${parcoursLabel}</h1>
            </div>
            <div style="background:white;padding:24px 28px;border:1px solid rgba(0,0,0,0.06);border-radius:0 0 12px 12px;">
              <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);width:170px;">Âge à la rentrée</td><td>${age} ans</td></tr>
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Groupe choisi</td><td>${esc(trancheLabel)} (${horaireDeTranche(tranche)})</td></tr>
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Jours possibles</td><td><strong>${esc(joursLabel)}</strong></td></tr>
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Compte</td><td><a href="mailto:${esc(user.email)}">${esc(user.email)}</a></td></tr>
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Téléphone</td><td>${esc(telephone ?? "—")}</td></tr>
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Droit à l'image</td><td>${body.droit_image ? "Accepté" : "<strong>Refusé</strong>"}</td></tr>
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Réduction ménage</td><td>${reduction ? "<strong>Demandée</strong> · justificatif en pièce jointe, à valider dans la fiche candidature" : "Non"}</td></tr>
                <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Santé</td><td>${esc(texte(body.infos_sante) || "—")}</td></tr>
              </table>
              <p style="font-size:12px;color:rgba(0,0,0,0.4);margin:0 0 4px;">Pourquoi ce parcours</p>
              <p style="font-size:14px;line-height:1.6;margin:0 0 16px;white-space:pre-wrap;">${esc(pourquoi)}</p>
              ${videoLink ? `<p style="font-size:14px;margin:0 0 16px;">Vidéo : <a href="${esc(videoLink)}">${esc(videoLink)}</a></p>` : ""}
              <a href="${siteUrl}/plateforme/direction/candidatures/${candidature.id}"
                style="display:inline-block;background:rgb(22,92,71);color:white;text-decoration:none;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:600;">
                Voir la candidature →
              </a>
            </div>
          </div>`,
      }),
    ];

    const resultats = await Promise.allSettled(emails);
    resultats.forEach((r, i) => {
      if (r.status === "rejected") console.error(`Email candidature #${i} error:`, r.reason);
    });

    if (videoUrl) checkStorageAndAlert().catch((e) => console.error("Storage check error:", e));

    return NextResponse.json({ success: true, id: candidature.id });
  } catch (err: any) {
    console.error("Submit candidature error:", err);
    return erreur(err?.message ?? "Erreur serveur", 500);
  }
}