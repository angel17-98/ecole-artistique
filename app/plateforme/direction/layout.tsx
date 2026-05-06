// app/plateforme/direction/layout.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DirectionSidebar from "./DirectionSidebar";

function getProfilePhoto(prenom: string | null, photoUrl: string | null): string | null {
  if (photoUrl) return photoUrl;
  if (!prenom) return null;
  const map: Record<string, string> = {
    "Angélie": "/equipe/lisman-angelie.jpg",
    "Angelie": "/equipe/lisman-angelie.jpg",
    "Mélissa": "/equipe/delvaux-melissa.jpg",
    "Melissa": "/equipe/delvaux-melissa.jpg",
  };
  return map[prenom] ?? null;
}

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
    .select("role, prenom, nom, photo_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") redirect("/plateforme");

  const photoSrc = getProfilePhoto(profile?.prenom ?? null, profile?.photo_url ?? null);

  return (
    <div className="-mt-24 min-h-screen" style={{ paddingLeft: "72px" }}>
      <DirectionSidebar profile={profile} photoSrc={photoSrc} />
      {children}
    </div>
  );
}