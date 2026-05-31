// app/api/candidature/sign-url/route.ts
// Génère une URL de lecture signée (1 an) APRÈS que l'upload est terminé
// Appelée par le client une fois le PUT vers Supabase réussi

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_PLATEFORME_URL!,
  process.env.PLATEFORME_SERVICE_ROLE_KEY!
);

const BUCKET = "candidature-videos";

export async function POST(req: NextRequest) {
  try {
    const { storagePath } = await req.json();

    if (!storagePath) {
      return NextResponse.json({ error: "storagePath manquant" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 an

    if (error || !data?.signedUrl) {
      console.error("Sign URL error:", error);
      return NextResponse.json({ error: error?.message ?? "Erreur inconnue" }, { status: 500 });
    }

    return NextResponse.json({ readUrl: data.signedUrl });

  } catch (err) {
    console.error("Sign URL error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}