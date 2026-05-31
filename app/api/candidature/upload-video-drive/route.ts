// app/api/candidature/upload-video-drive/route.ts
// Upload vidéo de candidature directement vers Google Drive
// Remplace presign-video (Supabase Storage)
// Pas d'auth requise — formulaire public de candidature

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getOrCreateFolder, uploadFileToDrive, makeFilePublic } from "@/lib/drive";

const parcoursToFolder: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie Musicale",
  "eveil-musical": "Éveil Musical",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const email = formData.get("email") as string;
    const prenom = formData.get("prenom") as string;
    const nom = formData.get("nom") as string;
    const parcours = formData.get("parcours") as string;
    const annee = (formData.get("annee") as string) || "2025-2026";

    if (!file || !email || !prenom || !nom || !parcours) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Vérifications fichier
    const maxSize = 500 * 1024 * 1024; // 500 MB
    const allowedTypes = ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo", "video/webm"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté. Utilise MP4, MOV ou AVI." }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: "Le fichier dépasse 500 MB." }, { status: 400 });
    }

    const token = await getAccessToken();
    const candidaturesRootId = process.env.GOOGLE_DRIVE_CANDIDATURES_FOLDER_ID!;

    // Candidatures/[année]/[parcours]/
    const anneeId = await getOrCreateFolder(token, annee, candidaturesRootId);
    const parcoursFolder = parcoursToFolder[parcours] ?? parcours;
    const parcoursId = await getOrCreateFolder(token, parcoursFolder, anneeId);

    // Nom du fichier : Dupont_Marie_1704067200000.mp4
    const ext = file.name.split(".").pop() ?? "mp4";
    const safeName = `${nom}_${prenom}_${Date.now()}.${ext}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // enlever accents
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    // Lire le fichier
    const buffer = new Uint8Array(await file.arrayBuffer());

    // Upload vers Drive
    const driveFile = await uploadFileToDrive(
      token,
      { name: safeName, mimeType: file.type, buffer },
      parcoursId
    );

    // Rendre accessible en lecture (lien partageable)
    await makeFilePublic(token, driveFile.id);

    return NextResponse.json({
      success: true,
      fileId: driveFile.id,
      url: driveFile.webViewLink,
    });

  } catch (err: any) {
    console.error("Drive video upload error:", err);
    return NextResponse.json({ error: err.message ?? "Erreur serveur" }, { status: 500 });
  }
}