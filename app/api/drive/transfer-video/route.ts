// app/api/drive/transfer-video/route.ts
// Transfère une vidéo de candidature depuis Supabase Storage vers Google Drive personnel
// Puis supprime le fichier de Supabase pour libérer le quota

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { getOrCreateFolder, uploadFileToDrive, makeFilePublic } from "@/lib/drive";

const BUCKET = "candidature-videos";

const parcoursToFolder: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie Musicale",
  "eveil-musical": "Éveil Musical",
};

/**
 * Récupère un access token valide depuis le refresh token stocké en base.
 * Renouvelle automatiquement si expiré.
 */
async function getOAuthAccessToken(userId: string): Promise<string> {
  const { data: tokenRow, error } = await supabaseAdmin
    .from("drive_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !tokenRow) {
    throw new Error("Drive non connecté. Veuillez connecter votre compte Google Drive.");
  }

  const isExpired = new Date(tokenRow.expires_at) <= new Date(Date.now() + 60_000);

  if (!isExpired && tokenRow.access_token) {
    return tokenRow.access_token;
  }

  // Renouveler via refresh token
  const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: tokenRow.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const refreshData = await refreshRes.json();

  if (!refreshData.access_token) {
    throw new Error("Impossible de renouveler le token Drive. Reconnectez votre compte Google.");
  }

  const expiresAt = new Date(Date.now() + (refreshData.expires_in ?? 3600) * 1000);

  // Mettre à jour en base
  await supabaseAdmin
    .from("drive_tokens")
    .update({
      access_token: refreshData.access_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return refreshData.access_token;
}

export async function POST(req: NextRequest) {
  // Vérifier direction
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { candidatureId } = await req.json();

  if (!candidatureId) {
    return NextResponse.json({ error: "candidatureId manquant" }, { status: 400 });
  }

  // Récupérer la candidature
  const { data: candidature, error: candError } = await supabaseAdmin
    .from("candidatures")
    .select("id, prenom, nom, parcours, video_url, drive_video_url, annee_id")
    .eq("id", candidatureId)
    .single();

  if (candError || !candidature) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  // Déjà sur Drive ?
  if (candidature.drive_video_url) {
    return NextResponse.json({
      success: true,
      alreadyOnDrive: true,
      url: candidature.drive_video_url,
    });
  }

  // Pas de vidéo dans Supabase ?
  if (!candidature.video_url) {
    return NextResponse.json({ error: "Aucune vidéo à transférer" }, { status: 400 });
  }

  try {
    // Récupérer le token OAuth de la direction
    const accessToken = await getOAuthAccessToken(user.id);

    // Récupérer l'année scolaire
    let anneeLabel = "2025-2026";
    if (candidature.annee_id) {
      const { data: annee } = await supabaseAdmin
        .from("annees_scolaires")
        .select("libelle")
        .eq("id", candidature.annee_id)
        .single();
      if (annee) anneeLabel = annee.libelle;
    }

    // Télécharger la vidéo depuis Supabase Storage
    // video_url peut être une URL signée ou une URL publique
    const videoRes = await fetch(candidature.video_url);
    if (!videoRes.ok) {
      throw new Error("Impossible de télécharger la vidéo depuis Supabase");
    }

    const videoBuffer = new Uint8Array(await videoRes.arrayBuffer());
    const contentType = videoRes.headers.get("content-type") ?? "video/mp4";
    const ext = contentType.includes("quicktime") ? "mov" :
                contentType.includes("avi") ? "avi" : "mp4";

    // Construire la structure Drive : Candidatures/[année]/[parcours]/
    const candidaturesFolderId = process.env.GOOGLE_DRIVE_CANDIDATURES_FOLDER_ID!;
    const anneeId = await getOrCreateFolder(accessToken, anneeLabel, candidaturesFolderId);
    const parcoursFolder = parcoursToFolder[candidature.parcours] ?? candidature.parcours;
    const parcoursId = await getOrCreateFolder(accessToken, parcoursFolder, anneeId);

    // Nom du fichier propre
    const safeName = `${candidature.nom}_${candidature.prenom}_${candidatureId}.${ext}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    // Upload vers Drive personnel
    const driveFile = await uploadFileToDrive(
      accessToken,
      { name: safeName, mimeType: contentType, buffer: videoBuffer },
      parcoursId
    );

    // Rendre accessible (lien partageable)
    await makeFilePublic(accessToken, driveFile.id);

    // Mettre à jour la candidature en base
    await supabaseAdmin
      .from("candidatures")
      .update({
        drive_video_url: driveFile.webViewLink,
        drive_file_id: driveFile.id,
      })
      .eq("id", candidatureId);

    // Supprimer de Supabase Storage pour libérer le quota
    // Extraire le path depuis l'URL
    try {
      const url = new URL(candidature.video_url);
      const pathParts = url.pathname.split(`/${BUCKET}/`);
      if (pathParts.length > 1) {
        const storagePath = decodeURIComponent(pathParts[1].split("?")[0]);
        await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
      }
    } catch (cleanupErr) {
      // Non bloquant — le transfert a réussi même si la suppression échoue
      console.error("Cleanup Supabase Storage error:", cleanupErr);
    }

    return NextResponse.json({
      success: true,
      fileId: driveFile.id,
      url: driveFile.webViewLink,
    });

  } catch (err: any) {
    console.error("Transfer video error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}