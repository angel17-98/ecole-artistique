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

  // ── Vraies notifications depuis la base ──────────────────────────────────
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // ── Messages non lus dans les discussions ────────────────────────────────
  // Compter les convs avec messages non lus
  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .contains("participants", [user.id]);

  let unreadDiscussions = 0;
  if (convs && convs.length > 0) {
    for (const conv of convs) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .not("lu_par", "cs", `{${user.id}}`);
      unreadDiscussions += count ?? 0;
    }
  }

  return (
    <DashboardClient
      profile={profile}
      foyer={foyer}
      eleves={foyer?.eleves || []}
      fidelite={fidelite || []}
      initialNotifications={notifications || []}
      unreadDiscussions={unreadDiscussions}
    />
  );
}