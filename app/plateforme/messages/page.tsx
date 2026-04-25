import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
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

  // ── Notifications / Reçus ────────────────────────────────────────────────
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // ── Conversations ────────────────────────────────────────────────────────
  const { data: rawConvs } = await supabase
    .from("conversations")
    .select("*")
    .contains("participants", [user.id])
    .order("updated_at", { ascending: false });

  // Enrichir chaque conversation avec le dernier message et l'interlocuteur
  const conversations = await Promise.all(
    (rawConvs ?? []).map(async (conv: any) => {
      // Dernier message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("contenu, created_at, lu_par")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Profil de l'interlocuteur (l'autre participant)
      const otherUserId = conv.participants.find((p: string) => p !== user.id);
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id, prenom, nom, role")
        .eq("id", otherUserId)
        .maybeSingle();

      // Discipline du prof si applicable
      let discipline: string | undefined;
      if (otherProfile?.role === "prof_salarie" || otherProfile?.role === "prof_independant") {
        const { data: profData } = await supabase
          .from("profs")
          .select("disciplines")
          .eq("user_id", otherUserId)
          .maybeSingle();
        discipline = profData?.disciplines?.[0];
      }

      // Nombre de messages non lus
      const nonLus = lastMsg && !lastMsg.lu_par?.includes(user.id) ? 1 : 0;

      return {
        id: conv.id,
        contact: {
          user_id: otherUserId,
          prenom: otherProfile?.prenom ?? "Utilisateur",
          nom: otherProfile?.nom ?? "",
          role: otherProfile?.role ?? "direction",
          discipline,
        },
        dernierMessage: lastMsg?.contenu,
        dernierMessageDate: lastMsg?.created_at,
        nonLus,
      };
    })
  );

  // ── Contacts disponibles (profs assignés + direction) ─────────────────────
  // Profs assignés aux parcours des élèves du foyer
  const eleves = foyer?.eleves ?? [];
  const eleveIds = eleves.map((e: any) => e.id);

  let profsAssignes: any[] = [];
  if (eleveIds.length > 0) {
    const { data: inscriptions } = await supabase
      .from("inscriptions")
      .select("reference_id")
      .in("eleve_id", eleveIds)
      .eq("type_inscription", "parcours");

    const parcoursIds = (inscriptions ?? []).map((i: any) => i.reference_id);

    if (parcoursIds.length > 0) {
      const { data: cours } = await supabase
        .from("cours")
        .select("prof_id, discipline, prof:profs(user_id, prenom, nom, disciplines)")
        .in("parcours_id", parcoursIds);

      // Dédupliquer par prof_id
      const seen = new Set<string>();
      profsAssignes = (cours ?? [])
        .filter((c: any) => c.prof && !seen.has(c.prof.user_id) && seen.add(c.prof.user_id))
        .map((c: any) => ({
          user_id: c.prof.user_id,
          prenom: c.prof.prenom,
          nom: c.prof.nom,
          role: "prof_salarie" as const,
          discipline: c.discipline ?? c.prof.disciplines?.[0],
        }));
    }
  }

  // Direction (toujours accessible)
  const { data: directionUsers } = await supabase
    .from("profiles")
    .select("id, prenom, nom, role")
    .eq("role", "direction");

  const directionContacts = (directionUsers ?? []).map((d: any) => ({
    user_id: d.id,
    prenom: d.prenom ?? "Direction",
    nom: d.nom ?? "",
    role: "direction" as const,
  }));

  // Fusionner et dédupliquer par rapport aux conversations existantes
  const allContacts = [...directionContacts, ...profsAssignes];

  return (
    <MessagesClient
      profile={profile}
      eleves={eleves}
      userId={user.id}
      initialNotifications={notifications ?? []}
      initialConversations={conversations}
      contacts={allContacts}
    />
  );
}