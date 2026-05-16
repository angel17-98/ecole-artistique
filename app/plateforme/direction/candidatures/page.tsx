// app/plateforme/direction/candidatures/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import CandidaturesListClient from "./CandidaturesListClient";

export default async function CandidaturesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction") redirect("/plateforme");

  // ── Années scolaires ──────────────────────────────────────────────────────
  const { data: annees } = await supabaseAdmin
    .from("annees_scolaires")
    .select("id, libelle, active")
    .order("date_debut", { ascending: false });

  const anneeActive = (annees ?? []).find(a => a.active) ?? annees?.[0] ?? null;

  // ── Candidatures — toutes les années par défaut, filtre côté client ───────
  // On envoie toutes les candidatures au client avec annee_id pour qu'il puisse filtrer
  const { data: candidatures } = await supabaseAdmin
    .from("candidatures")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <CandidaturesListClient
      candidatures={candidatures ?? []}
      annees={annees ?? []}
      anneeActiveId={anneeActive?.id ?? ""}
    />
  );
}