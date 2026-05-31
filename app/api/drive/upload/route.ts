// app/api/drive/upload/route.ts
// Upload de fichiers Drive depuis le dashboard direction (photos, docs, etc.)
// Utilise lib/drive.ts pour le token et les helpers

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { getAccessToken, uploadFileToDrive, makeFilePublic } from "@/lib/drive";

export async function POST(req: NextRequest) {
  // Vérifier que c'est la direction
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

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const candidatureId = formData.get("candidatureId") as string;
    const candidatNom = formData.get("candidatNom") as string;

    if (!file || !candidatureId) {
      return NextResponse.json({ error: "Fichier ou ID manquant" }, { status: 400 });
    }

    const token = await getAccessToken();
    const folderId = process.env.GOOGLE_DRIVE_CANDIDATURES_FOLDER_ID!;

    const ext = file.name.split(".").pop() ?? "mp4";
    const fileName = `${candidatNom}_${candidatureId}.${ext}`;
    const buffer = new Uint8Array(await file.arrayBuffer());

    const driveFile = await uploadFileToDrive(
      token,
      { name: fileName, mimeType: file.type || "video/mp4", buffer },
      folderId
    );

    await makeFilePublic(token, driveFile.id);

    // Mettre à jour la candidature avec l'URL Drive
    await supabase
      .from("candidatures")
      .update({
        drive_video_url: driveFile.webViewLink,
        drive_file_id: driveFile.id,
        video_url: null,
      })
      .eq("id", candidatureId);

    return NextResponse.json({
      success: true,
      fileId: driveFile.id,
      url: driveFile.webViewLink,
    });

  } catch (err: any) {
    console.error("Drive upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Supprimer un fichier Drive
export async function DELETE(req: NextRequest) {
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

  const { fileId, candidatureId } = await req.json();

  try {
    const token = await getAccessToken();

    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (candidatureId) {
      await supabase
        .from("candidatures")
        .update({ drive_video_url: null, drive_file_id: null })
        .eq("id", candidatureId);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}