// app/plateforme/dashboard/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import PlatformShell, { ShellProfile, ShellEleve } from "@/app/components/plateforme/PlatformShell";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, prenom, nom, role, telephone")
    .eq("id", user.id)
    .single();

  const { data: foyer } = await supabase
    .from("foyers")
    .select("id, eleves(id, prenom, nom, statut_premium)")
    .eq("user_id", user.id)
    .single();

  const eleves: ShellEleve[] = (foyer?.eleves ?? []).map((e: any) => ({
    id: e.id,
    prenom: e.prenom,
    nom: e.nom,
    statut_premium: e.statut_premium ?? false,
  }));

  const { data: candidature } = await supabase
    .from("candidatures")
    .select("id, parcours, statut, place_expire_at")
    .eq("user_id", user.id)
    .not("statut", "in", '("refusee","sans_reponse","expiree")')
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: totalCandidatures } = await supabase
    .from("candidatures")
    .select("id", { count: "exact", head: true });

  const candidaturesArrondies = totalCandidatures
    ? Math.floor(totalCandidatures / 10) * 10
    : 0;

  return (
    <PlatformShell profile={profile as ShellProfile} eleves={eleves}>
      <div className="max-w-3xl mx-auto">
        <DashboardClient
          candidature={candidature ?? null}
          candidaturesArrondies={candidaturesArrondies}
        />
      </div>
    </PlatformShell>
  );
}