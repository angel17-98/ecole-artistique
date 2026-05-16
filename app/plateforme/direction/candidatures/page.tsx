// app/plateforme/direction/candidatures/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import CandidaturesListClient from "./CandidaturesListClient";

export default async function CandidaturesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") redirect("/plateforme");

  const { data: candidatures } = await supabase
    .from("candidatures")
    .select("*")
    .order("created_at", { ascending: true }); // ordre d'arrivée

  return (
    <CandidaturesListClient
      candidatures={candidatures ?? []}
    />
  );
}