// app/plateforme/dashboard/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: foyer } = await supabase
    .from("foyers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // Candidature active (la plus récente non terminée)
  const { data: candidature } = await supabase
    .from("candidatures")
    .select("id, parcours, statut, place_expire_at")
    .eq("user_id", user.id)
    .not("statut", "in", '("refusee","sans_reponse","expiree")')
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Stat candidatures pour les non-premium
  const { count: totalCandidatures } = await supabase
    .from("candidatures")
    .select("id", { count: "exact", head: true });

  const candidaturesArrondies = totalCandidatures
    ? Math.floor(totalCandidatures / 10) * 10
    : 0;

  return (
    <DashboardClient
      candidature={candidature ?? null}
      candidaturesArrondies={candidaturesArrondies}
    />
  );
}