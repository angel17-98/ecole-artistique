// app/api/plateforme/link-candidature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    if (!userId || !email)
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    // ── 1. Lier toutes les candidatures sans user_id ayant cet email ──────────
    const { data: candidaturesLiees, error } = await supabaseAdmin
      .from("candidatures")
      .update({ user_id: userId })
      .eq("email", email)
      .is("user_id", null)
      .select("id, prenom, nom, parcours, statut");

    if (error) {
      console.error("Link candidature error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── 2. Si au moins une candidature a été liée → notifier la direction ─────
    if (candidaturesLiees && candidaturesLiees.length > 0) {
      const PARCOURS_LABELS: Record<string, string> = {
        "full-artist":      "Full Artist",
        "comedie-musicale": "Comédie musicale",
        "eveil-musical":    "Éveil musical",
      };

      const STATUT_LABELS: Record<string, string> = {
        "en_attente":          "En attente",
        "validee":             "Retenue",
        "acceptee":            "Acceptée",
        "liste_attente":       "Liste d'attente",
        "place_proposee":      "Place proposée",
        "inscrit":             "Inscrit",
        "refusee":             "Refusée",
        "info_complementaire": "Info demandée",
      };

      const candidature = candidaturesLiees[0];
      const parcoursLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;
      const statutLabel = STATUT_LABELS[candidature.statut] ?? candidature.statut;
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/direction/candidatures/${candidature.id}`;

      // Non bloquant — on ne fait pas échouer l'inscription si l'email rate
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `✅ Compte créé — ${candidature.prenom} ${candidature.nom} (candidature liée)`,
        html: `
          <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; color: #111;">
            <div style="background: rgb(22,92,71); padding: 24px 28px; border-radius: 12px 12px 0 0;">
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Crea'Star · Plateforme</p>
              <h1 style="color: white; font-size: 18px; margin: 0; font-weight: 600;">
                Compte créé — candidature liée automatiquement
              </h1>
            </div>
            <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.07); border-radius: 0 0 12px 12px;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45); width: 140px;">Candidat</td>
                  <td style="padding: 7px 0; font-weight: 500;">${candidature.prenom} ${candidature.nom}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45);">Email</td>
                  <td style="padding: 7px 0;"><a href="mailto:${email}" style="color: rgb(22,92,71);">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45);">Parcours</td>
                  <td style="padding: 7px 0;">${parcoursLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45);">Statut</td>
                  <td style="padding: 7px 0;">
                    <span style="background: rgb(239,244,239); color: rgb(22,92,71); padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600;">
                      ${statutLabel}
                    </span>
                  </td>
                </tr>
                ${candidaturesLiees.length > 1 ? `
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45);">Note</td>
                  <td style="padding: 7px 0; color: rgba(180,100,0,1);">
                    ${candidaturesLiees.length} candidatures liées à ce compte
                  </td>
                </tr>` : ""}
              </table>

              <div style="background: rgb(239,244,239); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
                <p style="font-size: 13px; color: rgb(15,65,48); margin: 0; line-height: 1.6;">
                  Le candidat peut maintenant suivre sa candidature en temps réel depuis son espace.
                  Son compte a été automatiquement lié à sa candidature existante.
                </p>
              </div>

              <a href="${dashboardUrl}"
                style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600;">
                Voir la candidature →
              </a>
            </div>
          </div>
        `,
      }).catch(err => console.error("Email direction (link-candidature) error:", err));
    }

    return NextResponse.json({ success: true, linked: candidaturesLiees?.length ?? 0 });

  } catch (err) {
    console.error("Link candidature error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}