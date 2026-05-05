// app/plateforme/direction/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DirectionDashboardClient from "./DirectionDashboardClient";

export default async function DirectionDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  // ⚠️ Ajout de photo_url dans le select pour le hero personnalisé
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, prenom, nom, telephone, is_active, photo_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") redirect("/plateforme");

  const [
    { count: totalCandidatures },
    { count: candidaturesAttente },
    { count: totalEleves },
    { count: totalProfs },
    { data: todosData },
    { data: messagesData },
    { data: liensData },
    { data: candidaturesData },
  ] = await Promise.all([
    supabase.from("candidatures").select("id", { count: "exact", head: true }),
    supabase.from("candidatures").select("id", { count: "exact", head: true }).eq("statut", "en_attente"),
    supabase.from("eleves").select("id", { count: "exact", head: true }),
    supabase.from("profs").select("id", { count: "exact", head: true }).eq("actif", true),
    supabase.from("todos").select("*").eq("statut", "ouvert").order("deadline", { ascending: true }),
    supabase.from("conversations").select("id, messages(id, lu_par, sender_id)").contains("participants", [user.id]),
    supabase.from("liens_famille").select("*, foyer:foyers(nom_famille), eleve:eleves(prenom, nom)").eq("statut", "pending"),
    supabase.from("candidatures").select("*").eq("statut", "en_attente").order("created_at", { ascending: true }),
  ]);

  const messagesNonLus = (messagesData ?? []).reduce((acc: number, conv: any) => {
    const nonLus = (conv.messages ?? []).filter(
      (m: any) => !m.lu_par?.includes(user.id) && m.sender_id !== user.id
    ).length;
    return acc + nonLus;
  }, 0);

  return (
    <DirectionDashboardClient
      profile={profile}
      stats={{
        totalCandidatures: totalCandidatures ?? 0,
        candidaturesAttente: candidaturesAttente ?? 0,
        totalEleves: totalEleves ?? 0,
        totalProfs: totalProfs ?? 0,
        todosOuverts: (todosData ?? []).length,
        todosEnRetard: (todosData ?? []).filter((t: any) => t.deadline && new Date(t.deadline) < new Date()).length,
        messagesNonLus,
        liensAttente: (liensData ?? []).length,
      }}
      todos={todosData ?? []}
      candidatures={candidaturesData ?? []}
      liens={liensData ?? []}
    />
  );
}