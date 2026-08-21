import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Un cours dure réellement 45 minutes — cf. commentaire historique dans
// l'ancien route.ts (fin_blocage = marge technique de 60min pour le prof,
// jamais l'heure de fin réelle du cours affichée à la famille).
const DUREE_COURS_MIN = 45;

async function sendEmail(params: Parameters<typeof resend.emails.send>[0]) {
  try {
    const result = await resend.emails.send(params);
    if (result.error) console.error("Resend error (réservation cours individuel):", result.error);
    return result;
  } catch (err) {
    console.error("sendEmail exception (réservation cours individuel):", err);
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
    console.error("sendNotification exception (réservation cours individuel):", err);
  }
}

function formatDateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
}
function formatHeureFr(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

export interface ConfirmerReservationParams {
  creneauId: string;
  eleveId: string;
  eleve: { prenom: string };
  participants: number;
  mode: "seance" | "annuel";
  tarifFinal: number;
  origineTarif: "decouverte" | "fidelite" | null;
  note: string | null;
  userId: string;
  userEmail: string | null;
}

export async function confirmerReservationCoursIndividuel(
  params: ConfirmerReservationParams
): Promise<{ success: true } | { error: string }> {
  const {
    creneauId, eleveId, eleve, participants, mode,
    tarifFinal, origineTarif, note, userId, userEmail,
  } = params;

  const { data: creneau } = await supabaseAdmin
    .from("creneaux")
    .select("id, prof_id, discipline, debut")
    .eq("id", creneauId)
    .maybeSingle();

  if (!creneau) {
    console.error("confirmerReservationCoursIndividuel: créneau introuvable", creneauId);
    return { error: "Créneau introuvable" };
  }

  // La colonne "type" a sa propre contrainte en base (reservations_indiv_type_check) :
  // elle n'accepte que 'ponctuel' ou 'abonnement', jamais "seance"/"annuel" brut.
  const typeReservation = mode === "annuel" ? "abonnement" : "ponctuel";

  const { error: resErr } = await supabaseAdmin
    .from("reservations_indiv")
    .insert({
      creneau_id: creneauId,
      eleve_id: eleveId,
      type: typeReservation,
      statut: "confirmee",
      participants,
      mode_reservation: mode,
      tarif_final: tarifFinal,
      origine_tarif: origineTarif,
      note_eleve: note ?? null,
    });

  if (resErr) {
    // Rollback : libérer le créneau si la réservation n'a pas pu être créée.
    await supabaseAdmin.from("creneaux").update({ statut: "disponible" }).eq("id", creneauId);
    console.error("confirmerReservationCoursIndividuel: insert reservation a échoué", resErr);
    return { error: resErr.message };
  }

  // ── Fidélité ────────────────────────────────────────────────────────────
  // Incrément du compteur uniquement pour un cours payant "classique" (ni
  // découverte -50%, ni déjà gratuit via fidélité — ce dernier cas ne passe
  // de toute façon jamais par ici, il est résolu avant l'appel à Mollie).
  // Même règle que l'ancien code synchrone.
  if (mode === "seance" && origineTarif !== "decouverte" && origineTarif !== "fidelite") {
    const { data: eleveRow } = await supabaseAdmin
      .from("eleves")
      .select("foyer_id")
      .eq("id", eleveId)
      .maybeSingle();

    if (eleveRow?.foyer_id) {
      const { data: carte } = await supabaseAdmin
        .from("fidelite")
        .select("id, compteur")
        .eq("foyer_id", eleveRow.foyer_id)
        .eq("type_carte", "cours_individuel")
        .maybeSingle();

      if (carte) {
        await supabaseAdmin.from("fidelite").update({ compteur: carte.compteur + 1 }).eq("id", carte.id);
      } else {
        await supabaseAdmin.from("fidelite").insert({
          foyer_id: eleveRow.foyer_id, type_carte: "cours_individuel", compteur: 1, total_offerts: 0,
        });
      }
    } else {
      console.error("confirmerReservationCoursIndividuel: eleve sans foyer_id, fidélité non mise à jour", eleveId);
    }
  }

  // ── Email + notification de confirmation — non bloquant ───────────────────
  if (userEmail) {
    const { data: profData } = await supabaseAdmin
      .from("profs")
      .select("profile:profiles!profs_user_id_fkey(prenom, nom)")
      .eq("id", creneau.prof_id)
      .maybeSingle();

    const profNomComplet = profData?.profile
      ? `${(profData.profile as any).prenom ?? ""} ${(profData.profile as any).nom ?? ""}`.trim()
      : null;

    const finCours = new Date(new Date(creneau.debut).getTime() + DUREE_COURS_MIN * 60000).toISOString();
    const dateLabel = formatDateFr(creneau.debut);
    const heureLabel = `${formatHeureFr(creneau.debut)} – ${formatHeureFr(finCours)}`;
    const modeLabel = mode === "annuel" ? "Abonnement annuel" : "À la séance";

    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: userEmail,
      subject: `Réservation confirmée — ${creneau.discipline} le ${dateLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="background: rgb(22,92,71); padding: 28px 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 8px;">
              Crea'Star · Cours individuel
            </p>
            <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 600;">
              Réservation confirmée pour ${eleve.prenom} 🎉
            </h1>
          </div>
          <div style="background: white; padding: 28px 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.45); width: 120px;">Discipline</td>
                <td style="padding: 6px 0; font-weight: 500;">${creneau.discipline}</td>
              </tr>
              ${profNomComplet ? `
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Intervenant</td>
                <td style="padding: 6px 0;">${profNomComplet}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Date</td>
                <td style="padding: 6px 0; text-transform: capitalize;">${dateLabel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Horaire</td>
                <td style="padding: 6px 0;">${heureLabel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Formule</td>
                <td style="padding: 6px 0;">${modeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Tarif</td>
                <td style="padding: 6px 0; font-weight: 600; color: rgb(22,92,71);">
                  ${tarifFinal === 0 ? "Offert (carte fidélité)" : `${tarifFinal} €`}
                </td>
              </tr>
            </table>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/planning"
              style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 26px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Voir dans mon planning →
            </a>
            <p style="font-size: 12px; color: rgba(0,0,0,0.35); margin-top: 24px;">
              Une question ou besoin de modifier ce créneau ? Contacte la direction.<br/>L'équipe Crea'Star
            </p>
          </div>
        </div>
      `,
    });

    await sendNotification(
      userId,
      "systeme",
      "Réservation confirmée",
      `${creneau.discipline} le ${dateLabel} à ${formatHeureFr(creneau.debut)} pour ${eleve.prenom}.`,
      "/plateforme/planning"
    );
  }

  return { success: true };
}