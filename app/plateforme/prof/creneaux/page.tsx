// app/plateforme/prof/creneaux/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreneauxClient from "./CreneauxClient";

export default async function ProfCreneauxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (!profile || (profile.role !== "prof_salarie" && profile.role !== "prof_independant" && profile.role !== "direction")) {
    redirect("/plateforme/dashboard");
  }

  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select("id, disciplines, deadline_defaut, abonnement_possible_defaut")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!prof) redirect("/plateforme/prof");

  // Intervalles existants
  const { data: intervalles } = await supabaseAdmin
    .from("intervalles_prof")
    .select("*")
    .eq("prof_id", prof.id)
    .eq("actif", true)
    .order("created_at", { ascending: false });

  // Créneaux à venir groupés par intervalle
  const { data: creneaux } = await supabaseAdmin
    .from("creneaux")
    .select("id, debut, fin_blocage, statut, salle:salles(nom), intervalle_id")
    .eq("prof_id", prof.id)
    .gte("debut", new Date().toISOString())
    .order("debut", { ascending: true })
    .limit(50);

  // Salles disponibles (pour info)
  const { data: salles } = await supabaseAdmin
    .from("salles")
    .select("id, nom, capacite")
    .eq("actif", true)
    .order("nom");

  return (
    <CreneauxClient
      prof={prof}
      intervalles={intervalles ?? []}
      creneaux={creneaux ?? []}
      salles={salles ?? []}
    />
  );
}