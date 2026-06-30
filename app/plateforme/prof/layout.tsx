// app/plateforme/prof/layout.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfLayout({
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

  const rolesAutorises = ["prof_salarie", "prof_independant", "direction"];
  if (!profile || !rolesAutorises.includes(profile.role)) {
    redirect("/plateforme/dashboard");
  }

  return (
    // -mt-24 annule le pt-24 du RootLayout
    // pl-[72px] compense la sidebar fixe de 72px
    <div style={{ marginTop: "-96px", paddingLeft: "72px", minHeight: "100vh" }}>
      {children}
    </div>
  );
}