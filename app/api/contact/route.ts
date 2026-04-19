import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { nom, email, sujet, message } = await req.json();

    if (!nom || !email || !sujet || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Email de notification à la direction
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      replyTo: email, // Répondre directement à l'expéditeur
      subject: `[Contact] ${sujet} — ${nom}`,
      html: `
        <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; color: #111;">
          <div style="background: rgb(22,92,71); padding: 20px 28px; border-radius: 12px 12px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Nouveau message — Crea'Star</p>
            <h1 style="color: white; font-size: 18px; margin: 0; font-weight: 600;">${sujet}</h1>
          </div>
          <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 12px 12px;">

            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 5px 0; color: rgba(0,0,0,0.5); width: 80px;">Nom</td>
                <td style="padding: 5px 0; font-weight: 500;">${nom}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: rgba(0,0,0,0.5);">Email</td>
                <td style="padding: 5px 0;">
                  <a href="mailto:${email}" style="color: rgb(22,92,71);">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: rgba(0,0,0,0.5);">Sujet</td>
                <td style="padding: 5px 0;">${sujet}</td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 0 0 18px;">

            <p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 0 0 8px;">Message</p>
            <div style="background: #f9f8f5; border-radius: 10px; padding: 14px 16px; font-size: 14px; line-height: 1.7; color: #111; white-space: pre-wrap;">${message}</div>

            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 18px 0;">

            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(sujet)}"
              style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600;">
              Répondre à ${nom} →
            </a>
          </div>
        </div>
      `,
    });

    // Email de confirmation à l'expéditeur
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Message reçu — Crea'Star`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="background: rgb(22,92,71); padding: 24px 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Crea'Star · Message reçu</p>
            <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 600;">Merci ${nom.split(" ")[0]} !</h1>
          </div>
          <div style="background: #f9f8f5; padding: 24px 32px; border-radius: 0 0 16px 16px; border: 1px solid rgba(0,0,0,0.06);">
            <p style="font-size: 14px; line-height: 1.7; margin: 0 0 14px;">
              On a bien reçu ton message concernant
              <strong style="color: rgb(22,92,71);">"${sujet}"</strong>.
            </p>
            <p style="font-size: 14px; line-height: 1.7; margin: 0 0 20px;">
              On te répond généralement sous <strong>48 heures</strong> en semaine.
              Si ta demande est urgente, tu peux aussi nous appeler au
              <strong>+32 (0) 471 01 61 81</strong>.
            </p>
            <div style="background: rgb(239,244,239); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
              <p style="font-size: 13px; color: rgb(15,65,48); margin: 0; line-height: 1.6;">
                Tu peux répondre directement à cet email si tu veux compléter ta demande.
              </p>
            </div>
            <p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 0;">
              L'équipe Crea'Star · Waterloo, Brabant Wallon
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}