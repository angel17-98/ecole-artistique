// app/api/interet/route.ts
// Formulaire public « Je suis intéressé·e » de la page Stages & Workshops
// (13/11/2026). Pas de compte nécessaire. Enregistre la demande dans la table
// interets, prévient la direction et envoie une confirmation à la personne.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { TYPES_DEMANDE, type TypeDemande } from "@/lib/offres";

const resend = new Resend(process.env.RESEND_API_KEY);

const texte = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const erreur = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return erreur("Requête invalide");

    // Champ piège invisible : un robot le remplit, un humain non.
    if (texte(body.site_web)) return NextResponse.json({ ok: true });

    const prenom = texte(body.prenom, 80);
    const nom = texte(body.nom, 80);
    const email = texte(body.email, 160).toLowerCase();
    const telephone = texte(body.telephone, 40) || null;
    const age = texte(body.age, 40) || null;
    const message = texte(body.message, 2000) || null;
    const typeDemande: TypeDemande = ["interet", "inscription", "attente"].includes(body.typeDemande) ? body.typeDemande : "interet";

    if (!prenom || !nom) return erreur("Indique ton prénom et ton nom");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return erreur("Adresse mail invalide");

    // Offre visée (facultative : intérêt général pour les modules, par exemple)
    let offreTitre: string | null = null;
    let offreId: string | null = null;
    if (body.offreId) {
      const { data: offre } = await supabaseAdmin
        .from("offres").select("id, titre, visible").eq("id", body.offreId).maybeSingle();
      if (!offre || !offre.visible) return erreur("Cette offre n'est plus disponible", 404);
      offreId = offre.id;
      offreTitre = offre.titre;
    } else {
      offreTitre = texte(body.sujet, 160) || "Modules à la carte (intérêt général)";
    }

    const { error } = await supabaseAdmin.from("interets").insert({
      offre_id: offreId, offre_titre: offreTitre, type_demande: typeDemande,
      prenom, nom, email, telephone, age, message,
    });
    if (error) {
      console.error("Insert interet error:", error);
      return erreur("Enregistrement impossible, réessaie dans un instant", 500);
    }

    // ── Mails (non bloquants) ────────────────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creastar.be";
    const libelle = TYPES_DEMANDE[typeDemande].label;
    const mails = [
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        replyTo: email,
        subject: `[${libelle}] ${offreTitre} — ${prenom} ${nom}`,
        html: `
          <div style="font-family:sans-serif;max-width:580px;margin:0 auto;color:#111;">
            <div style="background:rgb(12,50,38);padding:20px 28px;border-radius:12px 12px 0 0;">
              <p style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 6px;">${esc(libelle)}</p>
              <h1 style="color:white;font-size:18px;margin:0;">${esc(offreTitre)}</h1>
            </div>
            <div style="background:white;padding:22px 28px;border:1px solid rgba(0,0,0,0.06);border-radius:0 0 12px 12px;">
              <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <tr><td style="padding:5px 0;color:rgba(0,0,0,0.5);width:110px;">Nom</td><td>${esc(prenom)} ${esc(nom)}</td></tr>
                <tr><td style="padding:5px 0;color:rgba(0,0,0,0.5);">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
                <tr><td style="padding:5px 0;color:rgba(0,0,0,0.5);">Téléphone</td><td>${esc(telephone ?? "—")}</td></tr>
                <tr><td style="padding:5px 0;color:rgba(0,0,0,0.5);">Âge</td><td>${esc(age ?? "—")}</td></tr>
              </table>
              ${message ? `<p style="font-size:14px;line-height:1.6;margin:16px 0 0;white-space:pre-wrap;">${esc(message)}</p>` : ""}
              <a href="${siteUrl}/plateforme/direction/offres?onglet=demandes"
                style="display:inline-block;margin-top:18px;background:rgb(22,92,71);color:white;text-decoration:none;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:600;">
                Voir les demandes →
              </a>
            </div>
          </div>`,
      }),
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: `Crea'Star — on a bien reçu ta demande`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
            <div style="background:rgb(22,92,71);padding:26px 30px;border-radius:16px 16px 0 0;">
              <h1 style="color:white;font-size:20px;margin:0;font-weight:600;">Merci ${esc(prenom)} !</h1>
            </div>
            <div style="background:#f9f8f5;padding:26px 30px;border-radius:0 0 16px 16px;border:1px solid rgba(0,0,0,0.06);">
              <p style="font-size:15px;line-height:1.7;margin:0 0 14px;">
                On a bien noté ton intérêt pour <strong style="color:rgb(22,92,71);">${esc(offreTitre)}</strong>.
                ${typeDemande === "interet"
                  ? "Tu seras parmi les premiers prévenus à l'ouverture des inscriptions."
                  : typeDemande === "attente"
                    ? "Tu es sur la liste d'attente : on te contacte dès qu'une place se libère."
                    : "On revient vers toi très vite pour finaliser ton inscription."}
              </p>
              <a href="${siteUrl}/stages" style="color:rgb(22,92,71);font-size:14px;font-weight:600;">Voir tous les stages & workshops →</a>
              <p style="font-size:13px;color:rgba(0,0,0,0.45);margin:22px 0 0;">L'équipe Crea'Star</p>
            </div>
          </div>`,
      }),
    ];
    (await Promise.allSettled(mails)).forEach((r, i) => {
      if (r.status === "rejected") console.error(`Mail interet #${i} error:`, r.reason);
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Interet route error:", err);
    return erreur("Erreur serveur", 500);
  }
}