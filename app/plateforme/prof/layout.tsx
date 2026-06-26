// // app/plateforme/prof/layout.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { redirect } from "next/navigation";
// import ProfSidebar from "./ProfSidebar";

// export default async function ProfLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("role, prenom, nom, photo_url")
//     .eq("id", user.id)
//     .single();

//   // La direction peut accéder pour supervision — les élèves non
//   const rolesAutorises = ["prof_salarie", "prof_independant", "direction"];
//   if (!profile || !rolesAutorises.includes(profile.role)) {
//     redirect("/plateforme/dashboard");
//   }

//   return (
//     <div className="-mt-24 min-h-screen" style={{ paddingLeft: "72px" }}>
//       <ProfSidebar profile={profile} />
//       {children}
//     </div>
//   );
// }

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

  // Le ProfDashboardClient gère sa propre sidebar intégrée
  // Le paddingLeft compense la sidebar de 72px
  return (
    <div style={{ paddingLeft: "72px", minHeight: "100vh" }}>
      {children}
    </div>
  );
}