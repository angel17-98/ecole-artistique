import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import MonCompteClient from "./MonCompteClient";

export default async function MonComptePage() {
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

  return (
    <MonCompteClient
      profile={profile}
      foyer={foyer}
      eleves={foyer?.eleves || []}
      email={user.email ?? ""}
    />
  );
}