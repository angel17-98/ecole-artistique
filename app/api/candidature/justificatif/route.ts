// app/api/candidature/justificatif/route.ts
// Dépôt du justificatif de composition de ménage (demande de réduction).
// Stockage PRIVÉ (bucket "justificatifs", créé par la migration du 10/11) :
// aucun lien public. Le fichier est rangé dans un dossier au nom du compte,
// ce qui permet à la route d'envoi de vérifier qu'il appartient bien à la famille.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

const BUCKET = "justificatifs";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    const ext = TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Format non supporté : PDF, JPG, PNG ou WEBP." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Le fichier dépasse 10 MB." }, { status: 400 });
    }

    const path = `${user.id}/composition-menage-${Date.now()}.${ext}`;
    const buffer = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Upload justificatif error:", error);
      return NextResponse.json({ error: "Envoi du justificatif impossible" }, { status: 500 });
    }

    return NextResponse.json({ path });
  } catch (err) {
    console.error("Justificatif route error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}