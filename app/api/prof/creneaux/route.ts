// app/api/prof/creneaux/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";

// ── Vérification prof ─────────────────────────────────────────────────────────
async function checkProf() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!["prof_salarie", "prof_independant", "direction"].includes(profile?.role ?? "")) return null;
  return user;
}

// ── Algorithme de rareté : trouver la salle la moins rare disponible ──────────
async function attribuerSalle(discipline: string, debut: Date, fin: Date): Promise<string | null> {
  // 1. Salles compatibles avec cette discipline, triées par score de rareté ASC
  //    (score faible = moins rare = à utiliser en priorité)
  const { data: compatibles } = await supabaseAdmin
    .from("disciplines_salles")
    .select("salle_id, score_rarete")
    .eq("discipline", discipline)
    .order("score_rarete", { ascending: true });

  if (!compatibles || compatibles.length === 0) return null;

  // 2. Pour chaque salle compatible (la moins rare en premier),
  //    vérifier si elle est libre sur ce créneau
  for (const { salle_id } of compatibles) {
    const { count } = await supabaseAdmin
      .from("creneaux")
      .select("id", { count: "exact", head: true })
      .eq("salle_id", salle_id)
      .eq("statut", "reserve")
      .lt("debut", fin.toISOString())
      .gt("fin_blocage", debut.toISOString());

    if ((count ?? 0) === 0) return salle_id;
  }

  // Toutes les salles compatibles sont occupées → pas de salle possible
  return null;
}

// ── POST — créer un intervalle et générer les slots ───────────────────────────
export async function POST(req: Request) {
  const user = await checkProf();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const {
    prof_id, discipline, heure_debut, heure_fin,
    recurrence, date_unique, jour_semaine, recurrence_fin,
    deadline_annulation, abonnement_possible,
  } = await req.json();

  if (!prof_id || !discipline || !heure_debut || !heure_fin) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  // 1. Créer l'intervalle
  const { data: intervalle, error: ivErr } = await supabaseAdmin
    .from("intervalles_prof")
    .insert({
      prof_id, discipline,
      heure_debut, heure_fin,
      recurrence: recurrence ?? "aucune",
      date_unique: date_unique ?? null,
      jour_semaine: jour_semaine ?? null,
      recurrence_fin: recurrence_fin ?? null,
      deadline_annulation: deadline_annulation ?? "24h",
      abonnement_possible: abonnement_possible ?? false,
      actif: true,
    })
    .select().single();

  if (ivErr || !intervalle) {
    return NextResponse.json({ error: ivErr?.message ?? "Erreur création intervalle" }, { status: 500 });
  }

  // 2. Calculer les dates à générer
  const dates: Date[] = [];
  const now = new Date();

  const [dh, dm] = heure_debut.split(":").map(Number);
  const [fh, fm] = heure_fin.split(":").map(Number);

  if (recurrence === "aucune" && date_unique) {
    // Date unique
    const d = new Date(date_unique);
    if (d >= now) dates.push(d);
  } else if (recurrence === "hebdomadaire" && jour_semaine) {
    // Générer sur 3 mois glissants (ou jusqu'à recurrence_fin)
    const limite = recurrence_fin
      ? new Date(recurrence_fin)
      : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 mois

    const cursor = new Date(now);
    // Avancer au prochain jour de la semaine souhaité
    while (cursor.getDay() !== ((jour_semaine % 7))) {
      cursor.setDate(cursor.getDate() + 1);
    }

    while (cursor <= limite) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
  }

  // 3. Pour chaque date, générer les slots de 30 min
  //    Chaque slot = début du cours possible (cours dure 45min, bloque 60min)
  const creneauxACreer: any[] = [];

  for (const date of dates) {
    // Début de la plage horaire ce jour
    let slotDebut = new Date(date);
    slotDebut.setHours(dh, dm, 0, 0);

    // Fin de la plage horaire ce jour
    const plafond = new Date(date);
    plafond.setHours(fh, fm, 0, 0);

    // Générer un slot toutes les 30min, tant que slot + 60min <= fin de plage
    while (true) {
      const slotFin = new Date(slotDebut.getTime() + 60 * 60 * 1000); // + 1h blocage
      if (slotFin > plafond) break;
      if (slotDebut > now) {
        creneauxACreer.push({ debut: new Date(slotDebut), fin: new Date(slotFin) });
      }
      slotDebut = new Date(slotDebut.getTime() + 30 * 60 * 1000); // + 30min
    }
  }

  if (creneauxACreer.length === 0) {
    // Intervalle créé mais aucun slot — pas d'erreur, c'est possible si dates passées
    return NextResponse.json({ success: true, creneaux_crees: 0, intervalle_id: intervalle.id });
  }

  // 4. Pour chaque slot, tenter d'attribuer une salle et créer le créneau
  let creneauxCrees = 0;
  const insertions: any[] = [];

  for (const { debut, fin } of creneauxACreer) {
    // Vérifier que le prof est libre sur ce slot
    const { count: profOccupe } = await supabaseAdmin
      .from("creneaux")
      .select("id", { count: "exact", head: true })
      .eq("prof_id", prof_id)
      .neq("statut", "annule")
      .neq("statut", "indisponible")
      .lt("debut", fin.toISOString())
      .gt("fin_blocage", debut.toISOString());

    if ((profOccupe ?? 0) > 0) continue; // Prof déjà occupé → skip

    // Vérifier aussi les cours collectifs
    const { count: coursOccupe } = await supabaseAdmin
      .from("cours")
      .select("id", { count: "exact", head: true })
      .eq("prof_id", prof_id)
      .neq("statut", "annule")
      .lt("date_heure_debut", fin.toISOString())
      .gt("date_heure_fin", debut.toISOString());

    if ((coursOccupe ?? 0) > 0) continue; // Cours collectif → skip

    // Vérifier salle disponible (pas obligatoire — salle attribuée à la réservation)
    // On crée le créneau sans salle — elle sera attribuée lors de la réservation élève
    // Mais on vérifie qu'au moins UNE salle compatible existe
    const { data: sallesCompatibles } = await supabaseAdmin
      .from("disciplines_salles")
      .select("salle_id")
      .eq("discipline", discipline)
      .limit(1);

    // Si aucune salle configurée pour cette discipline → créer quand même
    // (la direction pourra configurer les salles après)
    insertions.push({
      intervalle_id: intervalle.id,
      prof_id,
      discipline,
      debut: debut.toISOString(),
      fin_blocage: fin.toISOString(),
      statut: "disponible",
      salle_id: null, // attribuée à la réservation
      abonnement_possible: abonnement_possible ?? false,
      deadline_annulation: deadline_annulation ?? "24h",
    });
  }

  // 5. Insérer tous les créneaux en batch
  if (insertions.length > 0) {
    const { error: insertErr } = await supabaseAdmin
      .from("creneaux")
      .insert(insertions);

    if (insertErr) {
      console.error("Erreur insertion créneaux:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
    creneauxCrees = insertions.length;
  }

  return NextResponse.json({
    success: true,
    creneaux_crees: creneauxCrees,
    creneaux_ignores: creneauxACreer.length - creneauxCrees,
    intervalle_id: intervalle.id,
  });
}

// ── PATCH — modifier un intervalle et régénérer ses créneaux futurs non réservés ──
export async function PATCH(req: Request) {
  const user = await checkProf();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
 
  const {
    intervalle_id, prof_id, discipline, heure_debut, heure_fin,
    recurrence, date_unique, jour_semaine, recurrence_fin,
    deadline_annulation, abonnement_possible,
  } = await req.json();
 
  if (!intervalle_id || !prof_id || !discipline || !heure_debut || !heure_fin) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
 
  // 1. Vérifier qu'aucun créneau futur de cet intervalle n'est déjà réservé
  //    avant de toucher aux horaires — on ne veut jamais supprimer une
  //    réservation existante silencieusement.
  const { count: nbReserves } = await supabaseAdmin
    .from("creneaux")
    .select("id", { count: "exact", head: true })
    .eq("intervalle_id", intervalle_id)
    .eq("statut", "reserve")
    .gte("debut", new Date().toISOString());
 
  if ((nbReserves ?? 0) > 0) {
    return NextResponse.json({
      error: `Impossible de modifier cet intervalle : ${nbReserves} créneau(x) déjà réservé(s) sur les horaires actuels. Annule ou attends la fin de ces réservations, ou crée un nouvel intervalle à la place.`,
    }, { status: 409 });
  }
 
  // 2. Mettre à jour l'intervalle
  const { error: updateErr } = await supabaseAdmin
    .from("intervalles_prof")
    .update({
      discipline, heure_debut, heure_fin,
      recurrence: recurrence ?? "aucune",
      date_unique: date_unique ?? null,
      jour_semaine: jour_semaine ?? null,
      recurrence_fin: recurrence_fin ?? null,
      deadline_annulation: deadline_annulation ?? "24h",
      abonnement_possible: abonnement_possible ?? false,
    })
    .eq("id", intervalle_id);
 
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }
 
  // 3. Supprimer les créneaux futurs non réservés existants pour cet intervalle
  //    (les mêmes garde-fous que le DELETE existant : jamais de créneau réservé touché)
  await supabaseAdmin
    .from("creneaux")
    .delete()
    .eq("intervalle_id", intervalle_id)
    .eq("statut", "disponible")
    .gte("debut", new Date().toISOString());
 
  // 4. Régénérer les créneaux avec les nouveaux horaires
  //    (même algorithme que le POST — dates puis slots de 30min/1h de blocage)
  const dates: Date[] = [];
  const now = new Date();
  const [dh, dm] = heure_debut.split(":").map(Number);
  const [fh, fm] = heure_fin.split(":").map(Number);
 
  if (recurrence === "aucune" && date_unique) {
    const d = new Date(date_unique);
    if (d >= now) dates.push(d);
  } else if (recurrence === "hebdomadaire" && jour_semaine) {
    const limite = recurrence_fin
      ? new Date(recurrence_fin)
      : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
 
    const cursor = new Date(now);
    while (cursor.getDay() !== (jour_semaine % 7)) {
      cursor.setDate(cursor.getDate() + 1);
    }
    while (cursor <= limite) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
  }
 
  const creneauxACreer: { debut: Date; fin: Date }[] = [];
  for (const date of dates) {
    let slotDebut = new Date(date);
    slotDebut.setHours(dh, dm, 0, 0);
    const plafond = new Date(date);
    plafond.setHours(fh, fm, 0, 0);
 
    while (true) {
      const slotFin = new Date(slotDebut.getTime() + 60 * 60 * 1000);
      if (slotFin > plafond) break;
      if (slotDebut > now) creneauxACreer.push({ debut: new Date(slotDebut), fin: new Date(slotFin) });
      slotDebut = new Date(slotDebut.getTime() + 30 * 60 * 1000);
    }
  }
 
  let creneauxCrees = 0;
  const insertions: any[] = [];
 
  for (const { debut, fin } of creneauxACreer) {
    const { count: profOccupe } = await supabaseAdmin
      .from("creneaux")
      .select("id", { count: "exact", head: true })
      .eq("prof_id", prof_id)
      .neq("statut", "annule")
      .neq("statut", "indisponible")
      .lt("debut", fin.toISOString())
      .gt("fin_blocage", debut.toISOString());
    if ((profOccupe ?? 0) > 0) continue;
 
    const { count: coursOccupe } = await supabaseAdmin
      .from("cours")
      .select("id", { count: "exact", head: true })
      .eq("prof_id", prof_id)
      .neq("statut", "annule")
      .lt("date_heure_debut", fin.toISOString())
      .gt("date_heure_fin", debut.toISOString());
    if ((coursOccupe ?? 0) > 0) continue;
 
    insertions.push({
      intervalle_id,
      prof_id,
      discipline,
      debut: debut.toISOString(),
      fin_blocage: fin.toISOString(),
      statut: "disponible",
      salle_id: null,
      abonnement_possible: abonnement_possible ?? false,
      deadline_annulation: deadline_annulation ?? "24h",
    });
  }
 
  if (insertions.length > 0) {
    const { error: insertErr } = await supabaseAdmin.from("creneaux").insert(insertions);
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
    creneauxCrees = insertions.length;
  }
 
  return NextResponse.json({
    success: true,
    creneaux_crees: creneauxCrees,
    intervalle_id,
  });
}

// ── DELETE — supprimer un intervalle (+créneaux futurs non réservés) OU un créneau individuel ──
export async function DELETE(req: Request) {
  const user = await checkProf();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
 
  const { searchParams } = new URL(req.url);
  const creneauId = searchParams.get("creneau_id");
  const intervalleId = searchParams.get("intervalle_id");
 
  // ── Suppression d'UNE occurrence précise (une date de la récurrence) ─────
  if (creneauId) {
    const { data: creneau, error: fetchErr } = await supabaseAdmin
      .from("creneaux")
      .select("id, statut")
      .eq("id", creneauId)
      .maybeSingle();
 
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    if (!creneau) return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
 
    if (creneau.statut === "reserve") {
      return NextResponse.json({
        error: "Ce créneau est réservé — il ne peut pas être supprimé directement depuis cette action.",
      }, { status: 409 });
    }
 
    const { error } = await supabaseAdmin
      .from("creneaux")
      .delete()
      .eq("id", creneauId);
 
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
 
  // ── Suppression d'un intervalle complet (comportement existant, inchangé) ──
  if (!intervalleId) return NextResponse.json({ error: "intervalle_id ou creneau_id manquant" }, { status: 400 });
 
  // Supprimer les créneaux futurs non réservés
  await supabaseAdmin
    .from("creneaux")
    .delete()
    .eq("intervalle_id", intervalleId)
    .eq("statut", "disponible")
    .gte("debut", new Date().toISOString());
 
  // Désactiver l'intervalle (pas de suppression si des créneaux réservés existent)
  const { error } = await supabaseAdmin
    .from("intervalles_prof")
    .update({ actif: false })
    .eq("id", intervalleId);
 
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
 
  return NextResponse.json({ success: true });
}
 