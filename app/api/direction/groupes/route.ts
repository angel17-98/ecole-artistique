// app/api/direction/groupes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

// ── Vérification direction ────────────────────────────────────────────────────
async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction") return null;
  return user;
}

// ── POST — Créer un groupe ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { nom, parcours, places_max, annee_id, jour_semaine, heure_debut, heure_fin } =
    await req.json();

  if (!nom?.trim() || !parcours || !places_max || !annee_id) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("groupes_inscription")
    .insert({
      nom: nom.trim(),
      parcours,
      places_max: parseInt(places_max),
      annee_id,
      jour_semaine: jour_semaine || null,
      heure_debut: heure_debut || null,
      heure_fin: heure_fin || null,
    })
    .select("id, nom, parcours, places_max, annee_id, annee_scolaire, note, jour_semaine, heure_debut, heure_fin")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, groupe: data });
}

// ── PATCH — Renommer / modifier un groupe ─────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, nom, places_max, jour_semaine, heure_debut, heure_fin } = await req.json();

  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const updates: Record<string, any> = {};
  if (nom !== undefined)          updates.nom = nom.trim();
  if (places_max !== undefined)   updates.places_max = parseInt(places_max);
  if (jour_semaine !== undefined) updates.jour_semaine = jour_semaine || null;
  if (heure_debut !== undefined)  updates.heure_debut = heure_debut || null;
  if (heure_fin !== undefined)    updates.heure_fin = heure_fin || null;

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("groupes_inscription")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// ── DELETE — Supprimer un groupe (avec garde-fous) ────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  // Garde-fou : vérifier que le groupe est vide
  const { count } = await supabaseAdmin
    .from("candidatures")
    .select("id", { count: "exact", head: true })
    .eq("groupe_inscription_id", id)
    .in("statut", ["validee", "acceptee", "place_proposee", "inscrit"]);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${count} élève(s) dans ce groupe. Retirez-les d'abord.` },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin
    .from("groupes_inscription")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}