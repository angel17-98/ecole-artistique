// app/api/prof/documents/route.ts
// Lecture seule : le prof consulte ses documents (uploadés par la direction).
// Le prof ne peut pas uploader ni supprimer — ça reste une action direction.

import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";

const BUCKET = "profs-documents"; // ancien bucket, gardé pour compat historique

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  const isProf = profile?.role === "prof_salarie" || profile?.role === "prof_independant";
  if (!isProf) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { data: prof } = await supabaseAdmin
    .from("profs").select("id").eq("user_id", user.id).single();
  if (!prof) return NextResponse.json({ error: "Profil prof introuvable" }, { status: 404 });

  const { data: documentsRaw, error } = await supabaseAdmin
    .from("documents_profs")
    .select("id, nom, label, type, storage_path, drive_url, taille_octets, created_at")
    .eq("prof_id", prof.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const documents = await Promise.all(
    (documentsRaw ?? []).map(async (doc) => {
      if (doc.drive_url) return { ...doc, drive_url: doc.drive_url };
      if (doc.storage_path) {
        const { data: signedUrl } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(doc.storage_path, 3600);
        return { ...doc, drive_url: signedUrl?.signedUrl ?? null };
      }
      return { ...doc, drive_url: null };
    })
  );

  return NextResponse.json({ documents });
}