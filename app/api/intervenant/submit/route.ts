import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const prenom     = formData.get("prenom")     as string;
    const nom        = formData.get("nom")        as string;
    const email      = formData.get("email")      as string;
    const telephone  = formData.get("telephone")  as string | null;
    const ville      = formData.get("ville")      as string;
    const discipline = formData.get("discipline") as string;
    const experience = formData.get("experience") as string;
    const motivation = formData.get("motivation") as string;
    const cvFile     = formData.get("cv")         as File | null;

    if (!prenom || !nom || !email || !discipline || !experience || !motivation) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // ── Préparer la pièce jointe CV ──────────────────────────────────────────
    const attachments: { filename: string; content: Buffer }[] = [];
    if (cvFile && cvFile.size > 0) {
      const arrayBuffer = await cvFile.arrayBuffer();
      attachments.push({
        filename: cvFile.name,
        content: Buffer.from(arrayBuffer),
      });
    }

    // ── Email de notification à la direction ─────────────────────────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      replyTo: email,
      subject: `[Intervenant] ${prenom} ${nom} — ${discipline}`,
      attachments,
      html: `
        <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; color: #111;">

          <div style="background: rgb(12,22,17); padding: 24px 28px; border-radius: 14px 14px 0 0;">
            <p style="color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 8px;">
              Nouvelle demande intervenant
            </p>
            <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 600;">
              ${prenom} ${nom} — ${discipline}
            </h1>
          </div>

          <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.07); border-top: none; border-radius: 0 0 14px 14px;">

            <!-- Infos de contact -->
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.46); width: 120px; vertical-align: top;">Nom complet</td>
                <td style="padding: 6px 0; font-weight: 500;">${prenom} ${nom}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.46); vertical-align: top;">Email</td>
                <td style="padding: 6px 0;">
                  <a href="mailto:${email}" style="color: rgb(22,92,71); font-weight: 500;">${email}</a>
                </td>
              </tr>
              ${telephone ? `
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.46); vertical-align: top;">Téléphone</td>
                <td style="padding: 6px 0;">${telephone}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.46); vertical-align: top;">Ville</td>
                <td style="padding: 6px 0;">${ville}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(0,0,0,0.46); vertical-align: top;">Discipline</td>
                <td style="padding: 6px 0;">
                  <span style="display: inline-block; background: rgb(239,244,239); color: rgb(22,92,71); font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 100px;">
                    ${discipline}
                  </span>
                </td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 0 0 20px;">

            <!-- Parcours / Expérience -->
            <p style="font-size: 11px; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.14em; margin: 0 0 8px;">
              Parcours dans la discipline
            </p>
            <div style="background: rgb(249,248,245); border-radius: 10px; padding: 14px 16px; font-size: 14px; line-height: 1.75; color: #222; white-space: pre-wrap; margin-bottom: 20px;">
              ${experience}
            </div>

            <!-- Motivation -->
            <p style="font-size: 11px; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.14em; margin: 0 0 8px;">
              Motivation
            </p>
            <div style="background: rgb(249,248,245); border-radius: 10px; padding: 14px 16px; font-size: 14px; line-height: 1.75; color: #222; white-space: pre-wrap; margin-bottom: 24px;">
              ${motivation}
            </div>

            <!-- CV -->
            ${cvFile && cvFile.size > 0
              ? `<div style="background: rgb(239,244,239); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                   <p style="font-size: 13px; color: rgb(15,65,48); margin: 0;">
                     📎 CV joint : <strong>${cvFile.name}</strong>
                     (${(cvFile.size / 1024).toFixed(0)} KB)
                   </p>
                 </div>`
              : `<div style="background: rgb(255,248,240); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                   <p style="font-size: 13px; color: rgba(0,0,0,0.5); margin: 0;">Aucun CV joint.</p>
                 </div>`
            }

            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 0 0 20px;">

            <!-- CTA répondre -->
            <a href="mailto:${email}?subject=Re: Ta demande intervenant Crea'Star"
              style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none;
                     padding: 11px 22px; border-radius: 100px; font-size: 13px; font-weight: 600;">
              Répondre à ${prenom} →
            </a>

            <p style="font-size: 11px; color: rgba(0,0,0,0.34); margin: 20px 0 0;">
              Demande reçue via la page Cours individuels · Crea'Star
            </p>
          </div>
        </div>
      `,
    });

    // ── Email de confirmation à l'intervenant ────────────────────────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Demande reçue — Crea'Star`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="background: rgb(22,92,71); padding: 24px 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.55); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; margin: 0 0 6px;">
              Crea'Star · Demande reçue
            </p>
            <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 600;">
              Merci ${prenom} !
            </h1>
          </div>
          <div style="background: #f9f8f5; padding: 26px 32px; border-radius: 0 0 16px 16px; border: 1px solid rgba(0,0,0,0.06);">
            <p style="font-size: 14px; line-height: 1.75; margin: 0 0 14px;">
              On a bien reçu ta demande pour rejoindre le réseau d'intervenants
              Crea'Star en tant que <strong style="color: rgb(22,92,71);">${discipline}</strong>.
            </p>
            <p style="font-size: 14px; line-height: 1.75; margin: 0 0 20px;">
              On prend le temps de lire chaque demande sérieusement.
              Tu recevras notre réponse sous <strong>48h</strong>.
              Si ton profil correspond à ce qu'on cherche, on t'invite à un échange
              pour en discuter.
            </p>
            <div style="background: rgb(239,244,239); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
              <p style="font-size: 13px; color: rgb(15,65,48); margin: 0; line-height: 1.6;">
                Tu peux répondre directement à cet email si tu veux ajouter des informations.
              </p>
            </div>
            <p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 0;">
              L'équipe Crea'Star · Braine-l'Alleud, Brabant Wallon
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Intervenant submit error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}