// app/plateforme/direction/candidatures/[id]/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect, notFound } from "next/navigation";
import CandidatureDetailClient from "./CandidatureDetailClient";

export default async function CandidatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, prenom, nom").eq("id", user.id).single();
  if (profile?.role !== "direction") redirect("/plateforme");

  const { data: candidature } = await supabase
    .from("candidatures").select("*").eq("id", id).single();
  if (!candidature) notFound();

  // Notes direction — avec type, ordre chronologique pour la timeline
  const { data: notesDiriData } = await supabase
    .from("notes_direction")
    .select("id, contenu, type, created_at, auteur:profiles!auteur_id(prenom, nom)")
    .eq("candidature_id", id)
    .order("created_at", { ascending: true }); // ← chronologique

  const notesDiri = (notesDiriData ?? []).map((n: any) => ({
    id: n.id,
    contenu: n.contenu,
    type: n.type ?? "note",
    created_at: n.created_at,
    auteur_prenom: n.auteur?.prenom ?? "Direction",
    auteur_nom: n.auteur?.nom ?? "",
  }));

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const hasAccount = users.some(u => u.email === candidature.email);

  const { data: allSameParcours } = await supabase
    .from("candidatures").select("id, created_at")
    .eq("parcours", candidature.parcours)
    .order("created_at", { ascending: true });

  const rang = (allSameParcours ?? []).findIndex(c => c.id === candidature.id) + 1;

  return (
    <CandidatureDetailClient
      candidature={candidature}
      hasAccount={hasAccount}
      rang={rang}
      totalParcours={(allSameParcours ?? []).length}
      notesDiri={notesDiri}
      currentUserPrenom={profile?.prenom ?? "Direction"}
      currentUserNom={profile?.nom ?? ""}
    />
  );
}