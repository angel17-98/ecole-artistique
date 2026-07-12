import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";

const COURS_POUR_GRATUIT = 10;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { creneauId, eleveId, participants, mode, note } = await req.json();

  if (!creneauId || !eleveId || !participants || !mode) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (![1, 2, 3].includes(participants)) {
    return NextResponse.json({ error: "Participants invalide" }, { status: 400 });
  }

  if (!["seance", "annuel"].includes(mode)) {
    return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
  }

  // 1. Vérifier que l'élève appartient au foyer de l'utilisateur connecté
  const { data: foyer } = await supabase
    .from("foyers")
    .select("id, eleves(id)")
    .eq("user_id", user.id)
    .single();

  const eleveValide = foyer?.eleves?.some((e: any) => e.id === eleveId);
  if (!foyer || !eleveValide) {
    return NextResponse.json({ error: "Élève introuvable dans ton foyer" }, { status: 403 });
  }

  // 2. Récupérer le créneau
  const { data: creneau } = await supabaseAdmin
    .from("creneaux")
    .select("id, prof_id, statut, debut, abonnement_possible, discipline")
    .eq("id", creneauId)
    .maybeSingle();

  if (!creneau) return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
  if (creneau.statut !== "disponible") {
    return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
  }
  if (new Date(creneau.debut) <= new Date()) {
    return NextResponse.json({ error: "Ce créneau est déjà passé" }, { status: 409 });
  }
  if (mode === "annuel" && !creneau.abonnement_possible) {
    return NextResponse.json({ error: "Abonnement non proposé pour ce créneau" }, { status: 400 });
  }

  // 3. Vérifier que le prof accepte le duo/trio si besoin
  if (participants >= 2) {
    const { data: prof } = await supabaseAdmin
      .from("profs")
      .select("accepte_duo, accepte_trio")
      .eq("id", creneau.prof_id)
      .single();
    if (participants === 2 && !prof?.accepte_duo) {
      return NextResponse.json({ error: "Ce professeur n'accepte pas les cours duo" }, { status: 400 });
    }
    if (participants === 3 && !prof?.accepte_trio) {
      return NextResponse.json({ error: "Ce professeur n'accepte pas les cours trio" }, { status: 400 });
    }
  }

// 4. Tarif — contrat actif du prof
  const today = new Date().toISOString().split("T")[0];
  const { data: contrat } = await supabaseAdmin
    .from("contrats")
    .select("tarif_cours_indiv, tarif_duo, tarif_trio")
    .eq("prof_id", creneau.prof_id)
    .or(`date_fin.is.null,date_fin.gte.${today}`)
    .order("date_debut", { ascending: false })
    .limit(1)
    .maybeSingle();

  const tarifBase = participants === 3 ? (contrat?.tarif_trio ?? contrat?.tarif_cours_indiv ?? 0)
    : participants === 2 ? (contrat?.tarif_duo ?? contrat?.tarif_cours_indiv ?? 0)
    : (contrat?.tarif_cours_indiv ?? 0);

  let tarifFinal = mode === "annuel" ? Math.round(tarifBase * 36 * 0.9) : tarifBase * participants;
  let origineTarif: "decouverte" | "fidelite" | null = null;

  // 4bis. Réduction "premier cours" — scopée au foyer, via reservations_indiv
  if (mode === "seance") {
    const { data: creneauxDiscipline } = await supabaseAdmin
      .from("creneaux")
      .select("id")
      .eq("discipline", creneau.discipline);

    const creneauIdsDiscipline = (creneauxDiscipline ?? []).map((c) => c.id);

    const { count: dejaPrisDiscipline } = creneauIdsDiscipline.length > 0
      ? await supabaseAdmin
          .from("reservations_indiv")
          .select("id", { count: "exact", head: true })
          .in("eleve_id", foyer.eleves.map((e: any) => e.id))
          .in("creneau_id", creneauIdsDiscipline)
          .in("statut", ["confirmee", "effectuee"])
      : { count: 0 };

    if ((dejaPrisDiscipline ?? 0) === 0) {
      tarifFinal = Math.round(tarifFinal * 0.5 * 100) / 100;
      origineTarif = "decouverte";
    }
  }

  // 5. Carte fidélité — le compteur avance sur toute séance payante, y compris un cours
  //    découverte à -50%. Le cours gratuit, lui, ne se déclenche jamais en même temps
  //    qu'un tarif découverte (pas de cumul des deux réductions).
  let coursGratuit = false;
  if (mode === "seance") {
    const { data: carte } = await supabaseAdmin
      .from("fidelite")
      .select("id, compteur, total_offerts")
      .eq("foyer_id", foyer.id)
      .eq("type_carte", "cours_individuel")
      .maybeSingle();

    if (origineTarif !== "decouverte" && carte && carte.compteur >= COURS_POUR_GRATUIT) {
      coursGratuit = true;
      tarifFinal = 0;
      origineTarif = "fidelite";
      await supabaseAdmin
        .from("fidelite")
        .update({ compteur: 0, total_offerts: (carte.total_offerts ?? 0) + 1 })
        .eq("id", carte.id);
    } else if (carte) {
      await supabaseAdmin.from("fidelite").update({ compteur: carte.compteur + 1 }).eq("id", carte.id);
    } else {
      await supabaseAdmin.from("fidelite").insert({ foyer_id: foyer.id, type_carte: "cours_individuel", compteur: 1, total_offerts: 0 });
    }
  }

  // 6. Verrouiller le créneau — garde-fou anti double-réservation
  const { data: locked, error: lockErr } = await supabaseAdmin
    .from("creneaux")
    .update({ statut: "reserve" })
    .eq("id", creneauId)
    .eq("statut", "disponible")
    .select("id")
    .maybeSingle();

  if (lockErr) return NextResponse.json({ error: lockErr.message }, { status: 500 });
  if (!locked) {
    return NextResponse.json({ error: "Ce créneau vient d'être réservé par quelqu'un d'autre" }, { status: 409 });
  }

  // 7. Créer la réservation
  const { error: resErr } = await supabaseAdmin
    .from("reservations_indiv")
    .insert({
      creneau_id: creneauId,
      eleve_id: eleveId,
      type: mode,
      statut: "confirmee",
      participants,
      mode_reservation: mode,
      tarif_final: tarifFinal,
      origine_tarif: origineTarif,
      note_eleve: note ?? null,
    });

  if (resErr) {
    // Rollback : libérer le créneau si la réservation n'a pas pu être créée
    await supabaseAdmin.from("creneaux").update({ statut: "disponible" }).eq("id", creneauId);
    return NextResponse.json({ error: resErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, coursGratuit, tarifFinal });
}