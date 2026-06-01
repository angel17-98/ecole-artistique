// app/api/candidature/submit/route.ts
// FIXES :
//   1. annee_id rattaché automatiquement à l'année scolaire active
//   2. statut "acceptee" supprimé — seul "validee" existe désormais

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_PLATEFORME_URL!,
  process.env.PLATEFORME_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const parcoursLabels: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie Musicale",
  "eveil-musical": "Éveil Musical",
};

// ── Récupérer l'id de l'année scolaire active (non bloquant si absent) ────────
async function getAnneeActiveId(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("annees_scolaires")
      .select("id")
      .eq("active", true)
      .single();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

// ── Alerte storage Supabase (non bloquante) ───────────────────────────────────
async function checkStorageAndAlert() {
  try {
    const BUCKET = "candidature-videos";
    const LIMIT_MB = 500;
    const ALERT_THRESHOLD = 0.8;

    let totalBytes = 0;
    const { data: files, error } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
    if (error || !files) return;
    for (const file of files) { if (file.metadata?.size) totalBytes += file.metadata.size; }

    for (const folder of ["full-artist", "comedie-musicale", "eveil-musical"]) {
      const { data: subFiles } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000 });
      if (subFiles) { for (const file of subFiles) { if (file.metadata?.size) totalBytes += file.metadata.size; } }
    }

    const usedMB = totalBytes / 1024 / 1024;
    const usedPercent = Math.round((usedMB / LIMIT_MB) * 100);

    if (usedMB >= LIMIT_MB * ALERT_THRESHOLD) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `⚠️ Alerte storage Crea'Star — ${usedPercent}% utilisé`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
            <div style="background: rgb(180,100,0); padding: 20px 28px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; font-size: 18px; margin: 0;">⚠️ Alerte storage Supabase</h1>
            </div>
            <div style="background: #fffbf5; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 12px 12px;">
              <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                Le storage des vidéos est à <strong style="color: rgb(180,100,0);">${usedPercent}%</strong>
                (${usedMB.toFixed(0)} MB / ${LIMIT_MB} MB).
              </p>
              <div style="background: rgb(255,245,230); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
                <p style="font-size: 13px; color: rgb(120,60,0); margin: 0; line-height: 1.6;">
                  <strong>Action recommandée :</strong> Supprime les vidéos des candidatures déjà examinées
                  dans Supabase Storage → bucket <code>candidature-videos</code>.
                </p>
              </div>
              <a href="https://supabase.com/dashboard"
                style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none;
                       padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600;">
                Ouvrir Supabase Dashboard →
              </a>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Storage check error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prenom, nom, email, telephone, age, ville, parcours,
      pourquoi, projet, esprit_creastar,
      eval_chant, eval_danse, eval_theatre,
      eval_ecriture, eval_scenique, eval_studio,
      video_url, video_link, drive_video_url, drive_file_id,
    } = body;

    const parcoursLabel = parcoursLabels[parcours] ?? parcours;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creastar.be";

    // ── FIX 1 : récupérer l'année active pour lier la candidature ────────────
    const anneeId = await getAnneeActiveId();

    // ── 1. Enregistrer en base ────────────────────────────────────────────────
    const { error: dbError } = await supabase.from("candidatures").insert({
      prenom, nom, email,
      telephone: telephone || null,
      age: parseInt(age),
      ville: ville || null,
      parcours, pourquoi, projet, esprit_creastar,
      eval_chant, eval_danse, eval_theatre,
      eval_ecriture, eval_scenique, eval_studio,
      video_url: video_url || null,
      video_link: video_link || null,
      drive_video_url: drive_video_url || null,
      drive_file_id: drive_file_id || null,
      statut: "en_attente",
      // FIX 1 : annee_id rattaché dès la soumission
      annee_id: anneeId,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // ── 2. Vérification storage (non bloquante) ───────────────────────────────
    checkStorageAndAlert().catch(console.error);

    // ── 3. Bloc vidéo pour email direction ────────────────────────────────────
    const videoBlock = (() => {
      const parts: string[] = [];
      if (drive_video_url)
        parts.push(`<a href="${drive_video_url}" style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-right: 8px; margin-bottom: 8px;">▶ Voir la vidéo sur Drive</a>`);
      if (video_url)
        parts.push(`<a href="${video_url}" style="display: inline-block; background: rgb(12,50,38); color: white; text-decoration: none; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-bottom: 8px;">▶ Voir le fichier vidéo</a>`);
      if (video_link)
        parts.push(`<a href="${video_link}" style="display: inline-block; background: rgb(12,50,38); color: white; text-decoration: none; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-bottom: 8px;">▶ Voir la vidéo en ligne</a><p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 4px 0 0;">${video_link}</p>`);
      return parts.length > 0
        ? `<hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 20px 0;">${parts.join("")}`
        : "";
    })();

    // ── 4. Email confirmation candidat ────────────────────────────────────────
    const registerUrl = `${siteUrl}/plateforme/register?email=${encodeURIComponent(email)}&source=candidature`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Ta candidature Crea'Star — Parcours ${parcoursLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="background: rgb(22,92,71); padding: 28px 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 8px;">
              Crea'Star · Candidature reçue
            </p>
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">Merci ${prenom} !</h1>
          </div>
          <div style="background: #f9f8f5; padding: 28px 32px; border-radius: 0 0 16px 16px; border: 1px solid rgba(0,0,0,0.06);">
            <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              On a bien reçu ta candidature pour le parcours
              <strong style="color: rgb(22,92,71);">${parcoursLabel}</strong>.
              On prend le temps de lire chaque dossier attentivement — tu recevras notre réponse
              <strong>dans la semaine</strong>.
            </p>
            <div style="background: rgb(239,244,239); border-radius: 12px; padding: 16px 20px; margin: 20px 0; border: 1px solid rgba(22,92,71,0.12);">
              <p style="font-size: 13px; font-weight: 600; color: rgb(22,92,71); margin: 0 0 8px;">
                📱 Crée ton espace pour suivre ta candidature
              </p>
              <p style="font-size: 13px; color: rgba(0,0,0,0.6); margin: 0 0 14px; line-height: 1.6;">
                Depuis ton espace, tu vois l'état de ta candidature en temps réel et tu pourras
                confirmer ta place dès qu'elle est disponible.
              </p>
              <a href="${registerUrl}"
                style="display: inline-block; background: rgb(22,92,71); color: white; padding: 10px 22px;
                       border-radius: 100px; text-decoration: none; font-size: 13px; font-weight: 600;">
                Créer mon espace →
              </a>
            </div>
            <p style="font-size: 13px; color: rgba(0,0,0,0.45); margin: 0;">
              L'équipe Crea'Star · Waterloo, Brabant Wallon
            </p>
          </div>
        </div>
      `,
    });

    // ── 5. Notification interne direction ─────────────────────────────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAIL!,
      subject: `[Candidature] ${prenom} ${nom} — ${parcoursLabel}`,
      html: `
        <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; color: #111;">
          <div style="background: rgb(12,50,38); padding: 20px 28px; border-radius: 12px 12px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">
              Nouvelle candidature
            </p>
            <h1 style="color: white; font-size: 20px; margin: 0;">
              ${prenom} ${nom} — ${parcoursLabel}
            </h1>
          </div>
          <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 12px 12px;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5); width: 140px;">Email</td>
                  <td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Téléphone</td>
                  <td>${telephone || "—"}</td></tr>
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Âge</td>
                  <td>${age} ans</td></tr>
              <tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Ville</td>
                  <td>${ville || "—"}</td></tr>
              ${anneeId ? `<tr><td style="padding: 6px 0; color: rgba(0,0,0,0.5);">Année</td>
                  <td style="color: rgb(22,92,71); font-weight: 600;">Rattachée à l'année active ✓</td></tr>` : ""}
            </table>
            ${videoBlock}
            <a href="${siteUrl}/plateforme/direction/candidatures"
              style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none;
                     padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-top: 16px;">
              Voir la candidature →
            </a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Submit candidature error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}