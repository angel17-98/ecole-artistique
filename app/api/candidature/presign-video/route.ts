import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_PLATEFORME_URL!,
  process.env.PLATEFORME_SERVICE_ROLE_KEY!
);

const BUCKET = "candidature-videos";
const LIMIT_BYTES = 500 * 1024 * 1024; // 500 MB
const SAFETY_MARGIN = 0.92;             // bloquer à 92% pour garder une marge

async function getStorageUsedBytes(): Promise<number> {
  let total = 0;
  for (const folder of ["", "full-artist", "comedie-musicale"]) {
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 1000 });
    if (files) {
      for (const f of files) {
        if (f.metadata?.size) total += f.metadata.size;
      }
    }
  }
  return total;
}

export async function POST(req: NextRequest) {
  try {
    const { email, parcours, filename, contentType, fileSize } = await req.json();

    if (!email || !parcours || !filename) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // ── Vérifier si le storage peut accueillir ce fichier ────────────────────
    const usedBytes = await getStorageUsedBytes();
    const incomingBytes = fileSize ?? 0;
    const wouldExceed = (usedBytes + incomingBytes) > (LIMIT_BYTES * SAFETY_MARGIN);

    if (wouldExceed) {
      const usedMB = (usedBytes / 1024 / 1024).toFixed(0);
      // On retourne un code spécial 507 (Insufficient Storage)
      // La page candidature intercepte ce code et bascule en mode lien
      return NextResponse.json(
        {
          error: "storage_full",
          usedMB,
          message: "Le stockage vidéo est temporairement indisponible.",
        },
        { status: 507 }
      );
    }

    // ── Générer l'URL d'upload signée ────────────────────────────────────────
    const ext = filename.split(".").pop() ?? "mp4";
    const timestamp = Date.now();
    const safeEmail = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const storagePath = `${parcours}/${safeEmail}_${timestamp}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("Signed URL error:", error);
      return NextResponse.json({ error: error?.message ?? "Erreur inconnue" }, { status: 500 });
    }

    const { data: readData } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

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