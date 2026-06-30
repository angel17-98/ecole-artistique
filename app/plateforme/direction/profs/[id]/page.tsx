// app/plateforme/direction/profs/[id]/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfFicheClient from "./ProfFicheClient";

export default async function DirectionProfFichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") redirect("/plateforme/direction");

  // Données du prof
  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select(`
      id, user_id, type_contrat, disciplines, actif,
      bio, tarif_horaire, deadline_defaut, abonnement_possible_defaut,
      created_at,
      profile:profiles!profs_user_id_fkey(
        id, prenom, nom, telephone, photo_url, is_active, created_at
      )
    `)
    .eq("id", id)
    .single();

  if (!prof) redirect("/plateforme/direction/profs");

  // Historique des contrats
  const { data: contrats } = await supabaseAdmin
    .from("contrats")
    .select("*")
    .eq("prof_id", id)
    .order("date_debut", { ascending: false });

  // Contrat actif
  const today = new Date().toISOString().split("T")[0];
  const contratActif = (contrats ?? []).find(
    (c) => !c.date_fin || c.date_fin >= today
  ) ?? null;

  // Stats du prof
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const { count: coursEffectuesMois } = await supabaseAdmin
    .from("creneaux")
    .select("id", { count: "exact", head: true })
    .eq("prof_id", id)
    .eq("statut", "effectue")
    .gte("debut", debutMois.toISOString());

  const { count: creneauxTotal } = await supabaseAdmin
    .from("creneaux")
    .select("id", { count: "exact", head: true })
    .eq("prof_id", id)
    .eq("statut", "disponible")
    .gte("debut", new Date().toISOString());

  // Rémunération mois courant
  const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
  const { data: remunMois } = await supabaseAdmin
    .from("remuneration_mensuelle")
    .select("montant_calcule, ajustement, statut, date_virement")
    .eq("prof_id", id)
    .eq("mois", moisCourant)
    .maybeSingle();

  return (
    <ProfFicheClient
      prof={prof}
      contratActif={contratActif}
      contrats={contrats ?? []}
      stats={{
        coursEffectuesMois: coursEffectuesMois ?? 0,
        creneauxDisponibles: creneauxTotal ?? 0,
        montantMois: remunMois
          ? (remunMois.montant_calcule ?? 0) + (remunMois.ajustement ?? 0)
          : null,
        statutPaiement: remunMois?.statut ?? null,
      }}
    />
  );
}