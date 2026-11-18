// app/api/candidature/dossier/[id]/route.ts
// Inscription en deux temps — TEMPS 2 (18/11/2026) : compléter le dossier.
//
//   POST { section: "motivation", pourquoi, projet, esprit_creastar }
//   POST { section: "niveau", eval_chant, eval_danse, … }
//   POST { section: "video", video_url | video_link }
//   POST { section: "infos", droit_image, infos_sante, reduction_menage, justificatif_path, telephone }
//   POST { action: "envoyer" }   → dossier complet : envoyé à la direction
//
// Chaque section s'enregistre séparément : la famille peut s'arrêter et
// revenir plus tard. Tout est revérifié ici (jamais confiance au navigateur).

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import {
  JOURS_PARCOURS, TRANCHES, PARCOURS_LABELS, horaireDeTranche, estParcoursAnnuel, estTranche,
} from "@/lib/grille";
import {
  STATUT_DOSSIER_INCOMPLET, COLONNES_DOSSIER, MIN_POURQUOI, MIN_PROJET, MIN_ESPRIT,
  LIEN_VIDEO_VALIDE, disciplinesDuParcours, etatDossier, dossierComplet,
  type DonneesDossier,
} from "@/lib/dossier";

// Créé à la première utilisation (et pas au chargement du fichier) : sinon le
// build Vercel échoue si la variable d'environnement n'est pas lisible à ce moment-là.
let _resend: Resend | null = null;
const resend = () => (_resend ??= new Resend(process.env.RESEND_API_KEY));
const EVALS = ["eval_chant", "eval_danse", "eval_theatre", "eval_ecriture", "eval_scenique", "eval_studio"] as const;

const texte = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const erreur = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

const COLONNES = `id, user_id, statut, prenom, nom, email, telephone, age, tranche, jours_possibles, pack_studio_artistes, ${COLONNES_DOSSIER}`;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return erreur("Connexion requise", 401);

    const { id } = await params;
    const { data: c } = await supabaseAdmin.from("candidatures").select(COLONNES).eq("id", id).maybeSingle();
    if (!c || c.user_id !== user.id) return erreur("Dossier introuvable", 404);
    if (c.statut !== STATUT_DOSSIER_INCOMPLET) return erreur("Ce dossier a déjà été envoyé à la direction", 409);

    const body = await req.json().catch(() => ({}));

    // ── Envoi final ──────────────────────────────────────────────────────────
    if (body.action === "envoyer") {
      if (!dossierComplet(c as DonneesDossier)) return erreur("Le dossier n'est pas encore complet");
      const { error } = await supabaseAdmin
        .from("candidatures")
        .update({ statut: "en_attente", dossier_complete_at: new Date().toISOString() })
        .eq("id", id).eq("statut", STATUT_DOSSIER_INCOMPLET);
      if (error) {
        console.error("Envoi dossier error:", error);
        return erreur("Envoi impossible pour l'instant, réessaie dans un instant", 500);
      }
      await envoyerMails(c as any, user.email ?? c.email);
      return NextResponse.json({ ok: true, envoye: true });
    }

    // ── Enregistrement d'une section ─────────────────────────────────────────
    const maj: Record<string, unknown> = {};

    switch (body.section) {
      case "motivation": {
        const pourquoi = texte(body.pourquoi);
        const projet = texte(body.projet);
        const esprit = texte(body.esprit_creastar);
        if (pourquoi.length < MIN_POURQUOI || projet.length < MIN_PROJET || esprit.length < MIN_ESPRIT) {
          return erreur("Réponds aux trois questions (longueur minimale indiquée sous chaque champ)");
        }
        Object.assign(maj, { pourquoi, projet, esprit_creastar: esprit });
        break;
      }
      case "niveau": {
        const demandees = disciplinesDuParcours(c.parcours).map((d) => d.id as string);
        for (const k of EVALS) {
          if (!demandees.includes(k)) { maj[k] = null; continue; }
          const v = Number(body[k]);
          if (!Number.isInteger(v) || v < 1 || v > 5) return erreur("Choisis un niveau pour chaque discipline");
          maj[k] = v;
        }
        break;
      }
      case "video": {
        const videoUrl = texte(body.video_url, 2000) || null;
        const videoLink = texte(body.video_link, 500) || null;
        if (!videoUrl && !videoLink) return erreur("Ajoute une vidéo ou un lien");
        if (videoLink && !LIEN_VIDEO_VALIDE.test(videoLink)) return erreur("Lien vidéo invalide");
        Object.assign(maj, { video_url: videoUrl, video_link: videoLink });
        break;
      }
      case "infos": {
        if (typeof body.droit_image !== "boolean") return erreur("Réponds à la question du droit à l'image");
        const reduction = body.reduction_menage === true;
        let justificatif = texte(body.justificatif_path, 300) || null;
        if (reduction) {
          // Nouveau fichier déposé par CE compte, ou fichier déjà enregistré
          justificatif = justificatif ?? c.justificatif_menage_path;
          if (!justificatif || !justificatif.startsWith(`${user.id}/`)) {
            return erreur("Joins la composition de ménage pour demander la réduction");
          }
        }
        const tel = texte(body.telephone, 40);
        Object.assign(maj, {
          droit_image: body.droit_image,
          infos_sante: texte(body.infos_sante, 2000) || null,
          reduction_menage_demandee: reduction,
          justificatif_menage_path: reduction ? justificatif : null,
          reduction_menage_statut: reduction ? "en_attente" : null,
          ...(tel ? { telephone: tel } : {}),
        });
        break;
      }
      default:
        return erreur("Section inconnue");
    }

    const { data: apres, error } = await supabaseAdmin
      .from("candidatures").update(maj).eq("id", id).select(COLONNES).single();
    if (error || !apres) {
      console.error("Section dossier error:", error);
      return erreur("Enregistrement impossible, réessaie dans un instant", 500);
    }

    return NextResponse.json({
      ok: true,
      etat: etatDossier(apres as DonneesDossier),
      complet: dossierComplet(apres as DonneesDossier),
    });
  } catch (err) {
    console.error("Dossier route error:", err);
    return erreur("Erreur serveur", 500);
  }
}

// ─── MAILS À L'ENVOI DU DOSSIER (non bloquants) ──────────────────────────────

async function envoyerMails(c: any, emailFamille: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creastar.be";
  const parcoursLabel = PARCOURS_LABELS[c.parcours] ?? c.parcours;
  const tranche = estTranche(c.tranche) ? c.tranche : null;
  const trancheLabel = tranche ? TRANCHES.find((t) => t.id === tranche)?.label ?? tranche : "—";
  const horaire = tranche ? horaireDeTranche(tranche) : "";
  const jours: string[] = c.jours_possibles ?? [];
  const parcours: string = c.parcours;
  const joursLabel = estParcoursAnnuel(parcours)
    ? JOURS_PARCOURS[parcours].filter((j) => jours.includes(j.id)).map((j) => j.label).join(" et ")
    : jours.join(", ");

  const piecesJointes: { filename: string; content: Buffer }[] = [];
  if (c.reduction_menage_demandee && c.justificatif_menage_path) {
    try {
      const { data: fichier } = await supabaseAdmin.storage.from("justificatifs").download(c.justificatif_menage_path);
      if (fichier) {
        const ext = c.justificatif_menage_path.split(".").pop() ?? "pdf";
        piecesJointes.push({
          filename: `composition-menage-${c.nom}-${c.prenom}.${ext}`.replace(/[^a-zA-Z0-9._-]/g, "_"),
          content: Buffer.from(await fichier.arrayBuffer()),
        });
      }
    } catch (e) {
      console.error("Pièce jointe justificatif error:", e);
    }
  }

  const mails = [
    resend().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: emailFamille,
      subject: `Dossier reçu — ${c.prenom} · ${parcoursLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
          <div style="background:rgb(22,92,71);padding:28px 32px;border-radius:16px 16px 0 0;">
            <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Crea'Star · Dossier reçu</p>
            <h1 style="color:white;font-size:22px;margin:0;font-weight:600;">Merci !</h1>
          </div>
          <div style="background:#f9f8f5;padding:28px 32px;border-radius:0 0 16px 16px;border:1px solid rgba(0,0,0,0.06);">
            <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
              Le dossier de <strong>${esc(c.prenom)}</strong> pour le parcours
              <strong style="color:rgb(22,92,71);">${esc(parcoursLabel)}</strong>
              (${esc(trancheLabel)}, ${esc(joursLabel)}${horaire ? ` de ${horaire}` : ""}) est complet et bien arrivé.
              On lit chaque dossier attentivement : tu reçois notre réponse <strong>dans la semaine</strong>.
            </p>
            <a href="${siteUrl}/plateforme/dashboard"
              style="display:inline-block;background:rgb(22,92,71);color:white;padding:10px 22px;border-radius:100px;text-decoration:none;font-size:13px;font-weight:600;">
              Suivre ma candidature →
            </a>
            <p style="font-size:13px;color:rgba(0,0,0,0.45);margin:24px 0 0;">L'équipe Crea'Star</p>
          </div>
        </div>`,
    }),
    resend().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      replyTo: emailFamille,
      subject: `[Candidature] ${c.prenom} ${c.nom} — ${parcoursLabel} · ${trancheLabel}`,
      attachments: piecesJointes,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#111;">
          <div style="background:rgb(12,50,38);padding:20px 28px;border-radius:12px 12px 0 0;">
            <p style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 6px;">Nouveau dossier complet</p>
            <h1 style="color:white;font-size:20px;margin:0;">${esc(c.prenom)} ${esc(c.nom)} — ${esc(parcoursLabel)}</h1>
          </div>
          <div style="background:white;padding:24px 28px;border:1px solid rgba(0,0,0,0.06);border-radius:0 0 12px 12px;">
            <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);width:170px;">Âge à la rentrée</td><td>${esc(c.age ?? "—")} ans</td></tr>
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Groupe choisi</td><td>${esc(trancheLabel)}${horaire ? ` (${horaire})` : ""}</td></tr>
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Jours possibles</td><td><strong>${esc(joursLabel || "—")}</strong></td></tr>
              ${c.parcours === "comedie-musicale" ? `<tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Pack Studio &amp; Artistes</td><td>${c.pack_studio_artistes ? "<strong>Oui</strong>" : "Non"}</td></tr>` : ""}
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Compte</td><td><a href="mailto:${esc(emailFamille)}">${esc(emailFamille)}</a></td></tr>
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Téléphone</td><td>${esc(c.telephone ?? "—")}</td></tr>
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Droit à l'image</td><td>${c.droit_image ? "Accepté" : "<strong>Refusé</strong>"}</td></tr>
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Réduction ménage</td><td>${c.reduction_menage_demandee ? "<strong>Demandée</strong> · justificatif en pièce jointe, à valider dans la fiche candidature" : "Non"}</td></tr>
              <tr><td style="padding:6px 0;color:rgba(0,0,0,0.5);">Santé</td><td>${esc(c.infos_sante || "—")}</td></tr>
            </table>
            <p style="font-size:12px;color:rgba(0,0,0,0.4);margin:0 0 4px;">Pourquoi ce parcours</p>
            <p style="font-size:14px;line-height:1.6;margin:0 0 16px;white-space:pre-wrap;">${esc(c.pourquoi)}</p>
            ${c.video_link ? `<p style="font-size:14px;margin:0 0 16px;">Vidéo : <a href="${esc(c.video_link)}">${esc(c.video_link)}</a></p>` : ""}
            <a href="${siteUrl}/plateforme/direction/candidatures/${c.id}"
              style="display:inline-block;background:rgb(22,92,71);color:white;text-decoration:none;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:600;">
              Voir la candidature →
            </a>
          </div>
        </div>`,
    }),
  ];

  (await Promise.allSettled(mails)).forEach((r, i) => {
    if (r.status === "rejected") console.error(`Mail dossier #${i} error:`, r.reason);
  });
}