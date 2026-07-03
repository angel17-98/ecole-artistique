// app/api/direction/profs/[id]/documents/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "profs-documents";

async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "direction" ? user : null;
}

// ── GET — Lister les documents d'un prof avec URL signée (1h) ────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: profId } = await params;

  const { data: documents, error } = await supabaseAdmin
    .from("documents_profs")
    .select("id, nom, type, storage_path, taille_octets, created_at")
    .eq("prof_id", profId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const documentsAvecUrl = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: signedUrl } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(doc.storage_path, 3600);
      return { ...doc, url: signedUrl?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ documents: documentsAvecUrl });
}

// ── POST — Uploader un document ───────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: profId } = await params;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "autre";

  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "pdf";
  const storagePath = `${profId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const buffer = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    console.error("Erreur upload storage:", uploadError);
    return NextResponse.json({ error: `Upload échoué : ${uploadError.message}` }, { status: 500 });
  }

  const { data: doc, error: insertError } = await supabaseAdmin
    .from("documents_profs")
    .insert({
      prof_id: profId,
      nom: file.name,
      type,
      storage_path: storagePath,
      taille_octets: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Erreur insert documents_profs:", insertError);
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, document: doc });
}

// ── DELETE — Supprimer un document ────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId manquant" }, { status: 400 });

  const { data: doc } = await supabaseAdmin
    .from("documents_profs")
    .select("storage_path")
    .eq("id", docId)
    .single();

  if (doc) {
    await supabaseAdmin.storage.from(BUCKET).remove([doc.storage_path]);
  }

  const { error } = await supabaseAdmin.from("documents_profs").delete().eq("id", docId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}