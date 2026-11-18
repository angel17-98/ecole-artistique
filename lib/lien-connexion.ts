// lib/lien-connexion.ts
// Connexion sans mot de passe (18/11/2026), utilisée par l'inscription en deux
// temps et par la page /connexion.
//
// On fabrique nous-mêmes le lien (au lieu de passer par les modèles de mail de
// Supabase) : il mène à /plateforme/auth/confirm, qui ouvre la session puis
// redirige vers la page demandée (paramètre « next »). Le mail part avec
// Resend, comme tous les autres mails du site.
//
// À utiliser UNIQUEMENT côté serveur (routes API).

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { createClient } from "@/lib/plateforme/supabase/server";

// Créé à la première utilisation (et pas au chargement du fichier) : sinon le
// build Vercel échoue si la variable d'environnement n'est pas lisible à ce moment-là.
let _resend: Resend | null = null;
const resend = () => (_resend ??= new Resend(process.env.RESEND_API_KEY));

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://creastar.be";

/** N'accepte que des adresses internes au site (« /… »), jamais « //autre-site » */
export function cheminSur(next: unknown, defaut = "/plateforme/dashboard"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : defaut;
}

/** Jeton de connexion à usage unique pour un compte existant (null si le compte n'existe pas) */
async function jetonConnexion(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
  if (error) {
    console.error("generateLink error:", error.message);
    return null;
  }
  return data?.properties?.hashed_token ?? null;
}

/** Lien de connexion complet, qui redirige vers « next » une fois connecté */
export async function lienConnexion(email: string, next: string): Promise<string | null> {
  const jeton = await jetonConnexion(email);
  if (!jeton) return null;
  const params = new URLSearchParams({ token_hash: jeton, type: "magiclink", next: cheminSur(next) });
  return `${siteUrl()}/plateforme/auth/confirm?${params.toString()}`;
}

/**
 * Ouvre directement la session dans le navigateur qui a fait la demande
 * (cookies posés sur la réponse de la route API). Sert juste après la
 * création du compte, pour que la famille enchaîne sans aller dans ses mails.
 */
export async function ouvrirSession(email: string): Promise<boolean> {
  const jeton = await jetonConnexion(email);
  if (!jeton) return false;
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: jeton, type: "magiclink" });
  if (error) console.error("verifyOtp error:", error.message);
  return !error;
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Envoie un mail avec un bouton de connexion. Ne lève jamais d'erreur. */
export async function envoyerLienConnexion(opts: {
  email: string;
  next: string;
  sujet: string;
  titre: string;
  texte: string;      // HTML simple autorisé (déjà échappé par l'appelant)
  bouton: string;
}): Promise<boolean> {
  try {
    const lien = await lienConnexion(opts.email, opts.next);
    if (!lien) return false;
    await resend().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: opts.email,
      subject: opts.sujet,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
          <div style="background:rgb(22,92,71);padding:26px 30px;border-radius:16px 16px 0 0;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Crea'Star</p>
            <h1 style="color:white;font-size:21px;margin:0;font-weight:600;">${esc(opts.titre)}</h1>
          </div>
          <div style="background:#f9f8f5;padding:26px 30px;border-radius:0 0 16px 16px;border:1px solid rgba(0,0,0,0.06);">
            <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">${opts.texte}</p>
            <a href="${lien}"
              style="display:inline-block;background:rgb(22,92,71);color:white;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600;">
              ${esc(opts.bouton)}
            </a>
            <p style="font-size:12px;line-height:1.6;color:rgba(0,0,0,0.45);margin:22px 0 0;">
              Ce bouton te connecte sans mot de passe. Il ne fonctionne qu'une fois et pendant une durée limitée.
              S'il a expiré, demande un nouveau lien sur <a href="${siteUrl()}/connexion" style="color:rgb(22,92,71);">${siteUrl().replace(/^https?:\/\//, "")}/connexion</a>.
            </p>
            <p style="font-size:13px;color:rgba(0,0,0,0.45);margin:18px 0 0;">L'équipe Crea'Star</p>
          </div>
        </div>`,
    });
    return true;
  } catch (e) {
    console.error("Envoi lien de connexion error:", e);
    return false;
  }
}