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

  const eleves = foyer?.eleves ?? [];

  // ── Notifications / Reçus ────────────────────────────────────────────────
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // ── Conversations enrichies ───────────────────────────────────────────────
  const { data: rawConvs } = await supabase
    .from("conversations")
    .select("*")
    .contains("participants", [user.id])
    .order("updated_at", { ascending: false });

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

      // Profil de l'interlocuteur
      const otherUserId = conv.participants.find((p: string) => p !== user.id);
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id, prenom, nom, role")
        .eq("id", otherUserId)
        .maybeSingle();

      // Discipline du prof via profs.disciplines (pas prenom/nom qui n'existent pas)
      let discipline: string | undefined;
      if (otherProfile?.role === "prof_salarie" || otherProfile?.role === "prof_independant") {
        const { data: profData } = await supabase
          .from("profs")
          .select("disciplines")
          .eq("user_id", otherUserId)
          .maybeSingle();
        discipline = profData?.disciplines?.[0];
      }

      // ── Vrai comptage des messages non lus ────────────────────────────────
      // On compte tous les messages de la conv où lu_par ne contient pas user.id
      const { count: nonLus } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .not("lu_par", "cs", `{${user.id}}`);

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
        nonLus: nonLus ?? 0,
      };
    })
  );

  // ── Contacts disponibles ──────────────────────────────────────────────────
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
      // FIX : profs n'a pas prenom/nom — on joint avec profiles via user_id
      const { data: coursData } = await supabase
        .from("cours")
        .select("discipline, prof:profs(user_id, disciplines)")
        .in("parcours_id", parcoursIds);

      // Récupérer les profils des profs séparément
      const profUserIds = [...new Set(
        (coursData ?? [])
          .map((c: any) => c.prof?.user_id)
          .filter(Boolean)
      )];

      const { data: profProfiles } = profUserIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, prenom, nom, role")
            .in("id", profUserIds)
        : { data: [] };

      const profileMap = Object.fromEntries(
        (profProfiles ?? []).map((p: any) => [p.id, p])
      );

      const seen = new Set<string>();
      profsAssignes = (coursData ?? [])
        .filter((c: any) => c.prof?.user_id && !seen.has(c.prof.user_id) && seen.add(c.prof.user_id))
        .map((c: any) => {
          const p = profileMap[c.prof.user_id] ?? {};
          return {
            user_id: c.prof.user_id,
            prenom: p.prenom ?? "Prof",
            nom: p.nom ?? "",
            role: "prof_salarie" as const,
            discipline: c.discipline ?? c.prof.disciplines?.[0],
          };
        });
    }
  }

  // Direction — toujours accessible
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