// app/plateforme/direction/layout.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";

export default async function DirectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") redirect("/plateforme");

  return <>{children}</>;
}