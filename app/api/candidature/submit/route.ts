import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const parcoursLabels: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie Musicale",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      prenom, nom, email, telephone, age, ville, parcours,
      pourquoi, projet, esprit_creastar,
      eval_chant, eval_danse, eval_theatre,
      eval_ecriture, eval_scenique, eval_studio,
      video_url,
    } = body;

    const parcoursLabel = parcoursLabels[parcours] ?? parcours;

    // ── 1. Enregistrer en base Supabase ──────────────────────────────────────
    const { error: dbError } = await supabase
      .from("candidatures")
      .insert({
        prenom,
        nom,
        email,
        telephone: telephone || null,
        age: parseInt(age),
        ville: ville || null,
        parcours,
        pourquoi,
        projet,
        esprit_creastar,
        eval_chant,
        eval_danse,
        eval_theatre,
        eval_ecriture,
        eval_scenique,
        eval_studio,
        video_url,
        statut: "en_attente", // en_attente | acceptee | refusee | en_discussion
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // ── 2. Email de confirmation au candidat ──────────────────────────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Ta candidature Crea'Star — Parcours ${parcoursLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="background: rgb(22,92,71); padding: 28px 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star · Candidature reçue</p>
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">Merci ${prenom} !</h1>
          </div>
          <div style="background: #f9f8f5; padding: 28px 32px; border-radius: 0 0 16px 16px; border: 1px solid rgba(0,0,0,0.06);">
            <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              On a bien reçu ta candidature pour le parcours <strong style="color: rgb(22,92,71);">${parcoursLabel}</strong>.
            </p>
            <p style="font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
              On prend le temps de lire chaque candidature attentivement. Tu recevras notre réponse
              <strong>dans les 2 semaines</strong> qui suivent. Si on a des questions, on te contactera directement.
            </p>
            <div style="background: rgb(239,244,239); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="font-size: 13px; color: rgb(15,65,48); margin: 0; line-height: 1.6;">
                <strong>Et maintenant ?</strong> Rien à faire de ton côté — on s'occupe de tout.
                Si tu as des questions entre-temps, réponds directement à cet email.
              </p>
            </div>
            <p style="font-size: 13px; color: rgba(0,0,0,0.45); margin: 0;">
              L'équipe Crea'Star · Waterloo, Brabant Wallon
            </p>
          </div>
        </div>
      `,
    });

    // ── 3. Notification interne à la direction ────────────────────────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      subject: `[Candidature] ${prenom} ${nom} — ${parcoursLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; color: #111;">
          <div style="background: rgb(12,50,38); padding: 20px 28px; border-radius: 12px 12px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Nouvelle candidature</p>
            <h1 style="color: white; font-size: 20px; margin: 0;">${prenom} ${nom} — ${parcoursLabel}</h1>
          </div>
          <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 12px 12px;">

            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5); width: 140px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Téléphone</td><td style="padding: 6px 0;">${telephone || "—"}</td></tr>
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Âge</td><td style="padding: 6px 0;">${age} ans</td></tr>
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Ville</td><td style="padding: 6px 0;">${ville || "—"}</td></tr>
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Parcours</td><td style="padding: 6px 0;"><strong>${parcoursLabel}</strong></td></tr>
            </table>

            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 0 0 20px;">

            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0,0,0,0.45); margin: 0 0 16px;">Lettre d'intention</h3>

            <div style="margin-bottom: 16px;">
              <p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 0 0 4px;">Pourquoi Crea'Star ?</p>
              <p style="font-size: 14px; line-height: 1.65; margin: 0; background: #f9f8f5; padding: 12px 14px; border-radius: 8px;">${pourquoi}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 0 0 4px;">Projet de l'année</p>
              <p style="font-size: 14px; line-height: 1.65; margin: 0; background: #f9f8f5; padding: 12px 14px; border-radius: 8px;">${projet}</p>
            </div>
            <div style="margin-bottom: 24px;">
              <p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 0 0 4px;">Esprit Crea'Star</p>
              <p style="font-size: 14px; line-height: 1.65; margin: 0; background: #f9f8f5; padding: 12px 14px; border-radius: 8px;">${esprit_creastar}</p>
            </div>

            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 0 0 20px;">

            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0,0,0,0.45); margin: 0 0 14px;">Auto-évaluation</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              ${[
                ["Chant", eval_chant],
                ["Danse", eval_danse],
                ["Théâtre & Impro", eval_theatre],
                ["Écriture & Composition", eval_ecriture],
                ["Expression scénique", eval_scenique],
                ["Studio", eval_studio],
              ].map(([label, val]) => `
                <tr>
                  <td style="padding: 5px 0; color: rgba(0,0,0,0.5); width: 180px;">${label}</td>
                  <td style="padding: 5px 0;">
                    ${"●".repeat(Number(val))}${"○".repeat(5 - Number(val))}
                    <span style="color: rgba(0,0,0,0.4); margin-left: 6px;">${val}/5</span>
                  </td>
                </tr>
              `).join("")}
            </table>

            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 20px 0;">

            <a href="${video_url}" style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600;">
              ▶ Voir la vidéo de présentation
            </a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}