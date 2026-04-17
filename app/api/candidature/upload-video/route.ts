import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, parcours, filename, contentType } = await req.json();

    if (!email || !parcours || !filename) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Nom de fichier unique et sûr
    const ext = filename.split(".").pop() ?? "mp4";
    const timestamp = Date.now();
    const safeEmail = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const storagePath = `${parcours}/${safeEmail}_${timestamp}.${ext}`;

    // Générer une URL d'upload signée valable 10 minutes
    // Le navigateur uploadera directement vers Supabase Storage avec cette URL
    const { data, error } = await supabase.storage
      .from("candidature-videos")
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("Signed URL error:", error);
      return NextResponse.json({ error: error?.message ?? "Erreur inconnue" }, { status: 500 });
    }

    // Générer aussi l'URL de lecture signée pour la stocker après upload
    const { data: readData } = await supabase.storage
      .from("candidature-videos")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 an

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      storagePath,
      readUrl: readData?.signedUrl ?? "",
    });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
