// app/plateforme/dashboard/layout.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import EleveSidebar from "@/app/components/plateforme/eleve/EleveSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, prenom, nom, photo_url")
    .eq("id", user.id)
    .single();

  if (profile?.role === "direction") redirect("/plateforme/direction");
  if (profile?.role === "prof_salarie" || profile?.role === "prof_independant") redirect("/plateforme/prof");

  return (
    <div className="-mt-24 min-h-screen" style={{ paddingLeft: "72px" }}>
      <EleveSidebar profile={profile ?? {}} photoSrc={profile?.photo_url ?? null} />
      {children}
    </div>
  );
}