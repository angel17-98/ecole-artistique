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

  // Le pt-24 du layout global pousse le contenu de 96px sous le header.
  // Le hero gère lui-même son paddingTop: 88px pour que le fond vert
  // remonte visuellement sous le header sans cacher le contenu.
  // On compense ici avec -mt-24 pour que le hero parte du bon endroit.
  return (
    <div className="-mt-24">
      {children}
    </div>
  );
}