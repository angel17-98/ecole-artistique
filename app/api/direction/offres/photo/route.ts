// app/api/direction/offres/photo/route.ts
// Envoi de la photo d'une offre (13/11/2026). Réservé à la direction.
// Les photos vont dans le bucket public « offres » (images du site) et la
// route renvoie leur adresse publique, à enregistrer dans l'offre.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

const BUCKET = "offres";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Aucune photo reçue" }, { status: 400 });

    const ext = TYPES[file.type];
    if (!ext) return NextResponse.json({ error: "Format accepté : JPG, PNG ou WEBP" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "La photo dépasse 5 MB" }, { status: 400 });

    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (error) {
      console.error("Upload photo offre error:", error);
      return NextResponse.json({ error: "Envoi de la photo impossible" }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("Photo offre route error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}