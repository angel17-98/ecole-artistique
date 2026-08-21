// app/api/reservation/cours-individuel/annuler/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const COURS_POUR_GRATUIT = 10;

// Un cours dure réellement 45 minutes — le créneau, lui, bloque 60 minutes
// dans l'agenda (marge de battement/changement de salle pour le prof).
// Ne jamais montrer fin_blocage comme heure de fin du cours à la famille ou
// au prof (bug repéré le 20/08/2026 dans l'email de confirmation).
const DUREE_COURS_MIN = 45;

const resend = new Resend(process.env.RESEND_API_KEY);

// Même pattern défensif que /api/reservation/cours-individuel/route.ts :
// un échec d'envoi d'email ne doit jamais faire échouer l'annulation, qui
// est déjà écrite en base à ce stade.
async function sendEmail(params: Parameters<typeof resend.emails.send>[0]) {
  try {
    const result = await resend.emails.send(params);
    if (result.error) console.error("Resend error (annulation cours individuel):", result.error);
    return result;
  } catch (err) {
    console.error("sendEmail exception (annulation cours individuel):", err);
  }
}

async function sendNotification(
  userId: string, type: string, titre: string, contenu: string, lien?: string
) {
  try {
    await supabaseAdmin.from("notifications").insert({
      user_id: userId, type, titre, contenu, lu: false, lien,
    });
  } catch (err) {
    console.error("sendNotification exception (annulation cours individuel):", err);
  }
}

function formatDateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
}
function formatHeureFr(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

// Les délais d'annulation sont stockés en base sous la forme "2h"/"12h"/"24h"/"48h"
// (cf. const DEADLINES dans CreneauxClient.tsx). On retombe sur 24h par défaut si
// le format est inattendu plutôt que de bloquer une annulation légitime sur une
// erreur de parsing.
function parseDeadlineHeures(valeur: string | null | undefined): number {
  const n = parseInt(valeur ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 24;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { reservationId } = await req.json();
  if (!reservationId) {
    return NextResponse.json({ error: "reservationId manquant" }, { status: 400 });
  }

  // 1. Récupérer la réservation + son créneau (avec le nom du prof, via profiles —
  //    profs n'a pas de colonnes prenom/nom, cf. bug corrigé le 20/08/2026 sur
  //    Planning/Dossier).
  const { data: reservation } = await supabaseAdmin
    .from("reservations_indiv")
    .select(`
      id, eleve_id, creneau_id, statut, mode_reservation, tarif_final, origine_tarif,
      creneau:creneaux(
        id, debut, discipline, deadline_annulation, prof_id,
        prof:profs(user_id, profile:profiles!profs_user_id_fkey(prenom, nom))
      )
    `)
    .eq("id", reservationId)
    .maybeSingle();

  if (!reservation) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  // 2. Vérifier que l'élève concerné appartient bien au foyer de l'utilisateur
  //    connecté — empêche d'annuler la réservation de quelqu'un d'autre en
  //    devinant un id.
  const { data: foyer } = await supabase
    .from("foyers")
    .select("id, eleves(id)")
    .eq("user_id", user.id)
    .single();

  const appartientAuFoyer = foyer?.eleves?.some((e: any) => e.id === reservation.eleve_id);
  if (!foyer || !appartientAuFoyer) {
    return NextResponse.json({ error: "Cette réservation n'appartient pas à ton foyer" }, { status: 403 });
  }

  if (reservation.statut !== "confirmee") {
    return NextResponse.json({ error: "Cette réservation ne peut plus être annulée" }, { status: 409 });
  }

  const creneau: any = reservation.creneau;
  if (!creneau) {
    return NextResponse.json({ error: "Créneau introuvable pour cette réservation" }, { status: 404 });
  }

  // 3. Vérifier le délai d'annulation (ex. "24h avant le cours", promesse FAQ)
  const deadlineHeures = parseDeadlineHeures(creneau.deadline_annulation);
  const limiteAnnulation = new Date(new Date(creneau.debut).getTime() - deadlineHeures * 60 * 60 * 1000);
  if (new Date() > limiteAnnulation) {
    return NextResponse.json({
      error: `Le délai d'annulation (${deadlineHeures}h avant le cours) est dépassé. Contacte la direction si besoin.`,
    }, { status: 409 });
  }

  // 4. Annuler la réservation
  // reservations_indiv_statut_check n'autorise PAS "annulee" seul : deux
  // valeurs distinctes existent, "annulee_eleve" et "annulee_prof" — vérifié
  // via pg_get_constraintdef le 20/08/2026 après une 1ère tentative en
  // erreur. On utilise "annulee_eleve" ici puisque c'est la famille qui
  // annule (utile aussi pour distinguer plus tard qui a annulé, ex. dans le
  // futur suivi de crédits/remboursements).
  const { error: updateErr } = await supabaseAdmin
    .from("reservations_indiv")
    .update({ statut: "annulee_eleve" })
    .eq("id", reservationId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // 5. Libérer le créneau pour qu'il redevienne réservable par quelqu'un d'autre
  await supabaseAdmin
    .from("creneaux")
    .update({ statut: "disponible" })
    .eq("id", creneau.id)
    .eq("statut", "reserve");

  // 6. Fidélité — décision Angélie du 20/08/2026 : annuler = comme si le cours
  //    n'avait jamais existé.
  //    Le tarif "découverte" se révise déjà tout seul ailleurs : l'éligibilité
  //    (dans /api/reservation/cours-individuel) ne compte que les réservations au
  //    statut "confirmee"/"effectuee" — en passant celle-ci à "annulee" elle
  //    redevient donc automatiquement éligible, rien à faire ici.
  //    Le compteur fidélité, lui, n'est pas recalculé à la volée : on le corrige
  //    explicitement.
  if (reservation.mode_reservation === "seance") {
    const { data: carte } = await supabaseAdmin
      .from("fidelite")
      .select("id, compteur, total_offerts")
      .eq("foyer_id", foyer.id)
      .eq("type_carte", "cours_individuel")
      .maybeSingle();

    if (carte) {
      if (reservation.origine_tarif === "fidelite") {
        // Ce cours avait été offert par la fidélité (compteur remis à 0 à ce
        // moment-là) — on restaure le compteur au seuil et on retire le cours
        // offert comptabilisé.
        await supabaseAdmin
          .from("fidelite")
          .update({
            compteur: COURS_POUR_GRATUIT,
            total_offerts: Math.max(0, (carte.total_offerts ?? 0) - 1),
          })
          .eq("id", carte.id);
      } else {
        // Cours payant normal ou tarif découverte : on décrémente l'avancement,
        // jamais sous 0.
        await supabaseAdmin
          .from("fidelite")
          .update({ compteur: Math.max(0, carte.compteur - 1) })
          .eq("id", carte.id);
      }
    }
  }

  // 7. Email + notification de confirmation d'annulation.
  //    Pas de paiement réel aujourd'hui (Mollie non branché, cf. audit du
  //    2 août) — donc pas de remboursement automatique possible. Si un montant
  //    > 0 avait été enregistré sur la réservation (tarif_final), on prévient
  //    la direction par notification pour qu'elle traite manuellement un
  //    éventuel avoir/remboursement, en attendant que le paiement réel soit
  //    branché (à ce moment-là, cette étape devra déclencher un vrai
  //    remboursement/avoir Mollie au lieu d'une simple notification).
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, prenom, nom")
    .eq("id", user.id)
    .maybeSingle();

  const profNom = `${creneau.prof?.profile?.prenom ?? ""} ${creneau.prof?.profile?.nom ?? ""}`.trim() || "ton intervenant";
  const finCours = new Date(new Date(creneau.debut).getTime() + DUREE_COURS_MIN * 60000).toISOString();
  const horaireLabel = `${formatHeureFr(creneau.debut)} – ${formatHeureFr(finCours)}`;

  if (profile?.email) {
    await sendEmail({
      from: "Crea'Star <reservations@creastar.be>",
      to: profile.email,
      subject: "Cours individuel annulé",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: rgb(22,92,71);">Cours annulé</h2>
          <p>Ton cours de <strong>${creneau.discipline}</strong> avec ${profNom},
             prévu le ${formatDateFr(creneau.debut)} à ${formatHeureFr(creneau.debut)},
             a bien été annulé.</p>
          <p style="color: rgba(0,0,0,0.5); font-size: 13px;">
            Tu peux réserver un nouveau créneau à tout moment depuis ton espace élève.
          </p>
        </div>
      `,
    });
  }

  await sendNotification(
    user.id,
    "systeme",
    "Cours individuel annulé",
    `Ton cours de ${creneau.discipline} du ${formatDateFr(creneau.debut)} a été annulé.`,
  );

  // Prévenir aussi le prof — email + notification in-app. Demande d'Angélie
  // le 20/08/2026 en testant ce chantier : jusqu'ici, seule la famille était
  // prévenue, le prof découvrait l'annulation en se connectant.
  // Remarque : la notification in-app est écrite en base même si le nouveau
  // chrome prof n'a pas (encore) de panneau "Reçus" pour l'afficher — cf.
  // chantier 8 du journal (panneau Reçus disparu). L'email, lui, arrive dans
  // tous les cas.
  if (creneau.prof?.user_id) {
    const { data: { user: profAuthUser } } = await supabaseAdmin.auth.admin.getUserById(creneau.prof.user_id);

    if (profAuthUser?.email) {
      await sendEmail({
        from: "Crea'Star <reservations@creastar.be>",
        to: profAuthUser.email,
        subject: "Un élève a annulé son cours individuel",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: rgb(22,92,71);">Cours annulé par l'élève</h2>
            <p>Ton cours de <strong>${creneau.discipline}</strong> du
               ${formatDateFr(creneau.debut)} à ${horaireLabel} a été annulé par la famille.</p>
            <p style="color: rgba(0,0,0,0.5); font-size: 13px;">
              Ce créneau redevient disponible dans ton planning — une autre famille peut le réserver.
            </p>
          </div>
        `,
      });
    }

    await sendNotification(
      creneau.prof.user_id,
      "systeme",
      "Cours individuel annulé par l'élève",
      `Le cours de ${creneau.discipline} du ${formatDateFr(creneau.debut)} à ${horaireLabel} a été annulé.`,
    );
  }

  if ((reservation.tarif_final ?? 0) > 0) {
    const { data: directionUsers } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "direction");

    for (const d of directionUsers ?? []) {
      await sendNotification(
        d.id,
        "systeme",
        "Annulation à traiter — avoir potentiel",
        `${profile?.prenom ?? ""} ${profile?.nom ?? ""} a annulé un cours individuel payant ` +
        `(${reservation.tarif_final} €, ${creneau.discipline}, ${formatDateFr(creneau.debut)}). ` +
        `Aucun paiement réel n'est encore débité automatiquement (Mollie non branché) — ` +
        `à vérifier manuellement si un remboursement/avoir est dû.`,
      );
    }
  }

  return NextResponse.json({ success: true });
}