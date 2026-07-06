// app/api/direction/profs/[id]/documents/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { getAccessToken, getOrCreateFolder, uploadFileToDrive, makeFilePublic } from "@/lib/drive";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "profs-documents"; // ancien bucket Supabase Storage — gardé pour compat historique

async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "direction" ? user : null;
}

// ── GET — Lister les documents d'un prof ──────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: profId } = await params;

  const { data: documents, error } = await supabaseAdmin
    .from("documents_profs")
    .select("id, nom, label, type, storage_path, drive_file_id, drive_url, taille_octets, created_at")
    .eq("prof_id", profId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const documentsAvecUrl = await Promise.all(
    (documents ?? []).map(async (doc) => {
      if (doc.drive_url) return { ...doc, url: doc.drive_url };
      if (doc.storage_path) {
        const { data: signedUrl } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(doc.storage_path, 3600);
        return { ...doc, url: signedUrl?.signedUrl ?? null };
      }
      return { ...doc, url: null };
    })
  );

  return NextResponse.json({ documents: documentsAvecUrl });
}

// ── POST — Uploader un document sur Drive ─────────────────────────────────────
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
  const label = ((formData.get("label") as string) || file?.name || "Document").trim();

  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });

  // Nom du prof pour organiser le dossier Drive : Profs documents/[Prénom_Nom]/
  const { data: profRow } = await supabaseAdmin
    .from("profs")
    .select("profile:profiles!profs_user_id_fkey(prenom, nom)")
    .eq("id", profId)
    .single();
  const profil = profRow?.profile as any;
  const profDossier = `${profil?.prenom ?? ""}_${profil?.nom ?? ""}`.trim() || profId;

  try {
    const token = await getAccessToken();
    const rootId = process.env.GOOGLE_DRIVE_PROFS_DOCS_FOLDER_ID!;
    const folderId = await getOrCreateFolder(token, profDossier, rootId);

    const ext = file.name.split(".").pop() ?? "pdf";
    const safeName = `${label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")}.${ext}`;

    const buffer = new Uint8Array(await file.arrayBuffer());

    const driveFile = await uploadFileToDrive(
      token,
      { name: safeName, mimeType: file.type || "application/octet-stream", buffer },
      folderId
    );
    await makeFilePublic(token, driveFile.id);

    const { data: doc, error: insertError } = await supabaseAdmin
      .from("documents_profs")
      .insert({
        prof_id: profId,
        nom: file.name,
        label,
        type,
        drive_file_id: driveFile.id,
        drive_url: driveFile.webViewLink,
        taille_octets: file.size,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erreur insert documents_profs:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, document: doc });
  } catch (err: any) {
    console.error("Erreur upload Drive:", err);
    return NextResponse.json({ error: err.message ?? "Upload Drive échoué" }, { status: 500 });
  }
}

// ── DELETE — Supprimer un document (Drive ou ancien Supabase Storage) ─────────
export async function DELETE(req: NextRequest) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId manquant" }, { status: 400 });

  const { data: doc } = await supabaseAdmin
    .from("documents_profs")
    .select("storage_path, drive_file_id")
    .eq("id", docId)
    .single();

  if (doc?.drive_file_id) {
    try {
      const token = await getAccessToken();
      await fetch(`https://www.googleapis.com/drive/v3/files/${doc.drive_file_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Erreur suppression Drive (non bloquant):", err);
    }
  } else if (doc?.storage_path) {
    await supabaseAdmin.storage.from(BUCKET).remove([doc.storage_path]);
  }

  const { error } = await supabaseAdmin.from("documents_profs").delete().eq("id", docId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}