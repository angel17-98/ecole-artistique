import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: foyer } = await supabase
    .from("foyers")
    .select("*, eleves(*)")
    .eq("user_id", user.id)
    .single();

  const { data: fidelite } = await supabase
    .from("fidelite")
    .select("*")
    .eq("foyer_id", foyer?.id ?? "");

  return (
    <DashboardClient
      profile={profile}
      foyer={foyer}
      eleves={foyer?.eleves || []}
      fidelite={fidelite || []}
    />
  );
}