// app/plateforme/direction/candidatures/[id]/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect, notFound } from "next/navigation";
import CandidatureDetailClient from "./CandidatureDetailClient";

export default async function CandidatureDetailPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = await Promise.resolve(props.params);
  const { id } = params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, prenom, nom").eq("id", user.id).single();
  if (profile?.role !== "direction") redirect("/plateforme");

  const { data: candidature } = await supabase
    .from("candidatures").select("*").eq("id", id).single();
  if (!candidature) notFound();

  // ── hasAccount via user_id (UUID propre) ──────────────────────────────────
  let hasAccount = false;
  if (candidature.user_id) {
    const { data: profileExists } = await supabaseAdmin
      .from("profiles").select("id").eq("id", candidature.user_id).maybeSingle();
    hasAccount = !!profileExists;
  } else {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const matchedUser = users.find(u => u.email === candidature.email);
    hasAccount = !!matchedUser;
    if (matchedUser) {
      await supabaseAdmin.from("candidatures")
        .update({ user_id: matchedUser.id }).eq("id", id);
    }
  }

  // ── Groupe assigné (nom + planning) ──────────────────────────────────────
  let groupeAssigne: {
    id: string;
    nom: string;
    jour_semaine?: string | null;
    heure_debut?: string | null;
    heure_fin?: string | null;
    places_max: number;
    placesOccupees: number;
  } | null = null;

  if (candidature.groupe_inscription_id) {
    const { data: groupe } = await supabaseAdmin
      .from("groupes_inscription")
      .select("id, nom, jour_semaine, heure_debut, heure_fin, places_max")
      .eq("id", candidature.groupe_inscription_id)
      .single();

    if (groupe) {
      // Compter les élèves dans ce groupe
      const { count } = await supabaseAdmin
        .from("candidatures")
        .select("id", { count: "exact", head: true })
        .eq("groupe_inscription_id", groupe.id)
        .in("statut", ["validee", "acceptee", "place_proposee", "inscrit"]);

      groupeAssigne = {
        ...groupe,
        placesOccupees: count ?? 0,
      };
    }
  }

  // ── Notes direction ───────────────────────────────────────────────────────
  const { data: notesDiriData } = await supabase
    .from("notes_direction")
    .select("id, contenu, type, created_at, auteur:profiles!auteur_id(prenom, nom)")
    .eq("candidature_id", id)
    .order("created_at", { ascending: true });

  const notesDiri = (notesDiriData ?? []).map((n: any) => ({
    id: n.id,
    contenu: n.contenu,
    type: n.type ?? "note",
    created_at: n.created_at,
    auteur_prenom: n.auteur?.prenom ?? "Direction",
    auteur_nom: n.auteur?.nom ?? "",
  }));

  // ── Rang dans le parcours ─────────────────────────────────────────────────
  const { data: allSameParcours } = await supabase
    .from("candidatures")
    .select("id, created_at")
    .eq("parcours", candidature.parcours)
    .order("created_at", { ascending: true });

  const rang = (allSameParcours ?? []).findIndex(c => c.id === candidature.id) + 1;

  return (
    <CandidatureDetailClient
      candidature={candidature}
      hasAccount={hasAccount}
      rang={rang}
      totalParcours={(allSameParcours ?? []).length}
      notesDiri={notesDiri}
      groupeAssigne={groupeAssigne}
      currentUserPrenom={profile?.prenom ?? "Direction"}
      currentUserNom={profile?.nom ?? ""}
    />
  );
}