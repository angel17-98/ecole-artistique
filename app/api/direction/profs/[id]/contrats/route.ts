// // app/api/direction/profs/[id]/contrats/route.ts
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { NextResponse } from "next/server";

// // ── Vérification direction ────────────────────────────────────────────────────
// async function checkDirection() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return null;
//   const { data: profile } = await supabase
//     .from("profiles").select("role").eq("id", user.id).single();
//   return profile?.role === "direction" ? user : null;
// }

// // ── POST — créer un contrat ───────────────────────────────────────────────────
// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const user = await checkDirection();
//   if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

//   const { id: profId } = await params;
//   const body = await req.json();

//   const {
//     type, salaire_fixe, tarif_cours_indiv, avantages,
//     heures_min_periode, periode_engagement, date_debut, date_fin,
//   } = body;

//   if (!type || !date_debut) {
//     return NextResponse.json({ error: "Type et date de début obligatoires" }, { status: 400 });
//   }

//   // Clôturer le contrat actif précédent si existant
//   const today = new Date().toISOString().split("T")[0];
//   await supabaseAdmin
//     .from("contrats")
//     .update({ date_fin: today })
//     .eq("prof_id", profId)
//     .or(`date_fin.is.null,date_fin.gte.${today}`);

//   // Créer le nouveau contrat
//   const { data, error } = await supabaseAdmin
//     .from("contrats")
//     .insert({
//       prof_id: profId,
//       type,
//       salaire_fixe: salaire_fixe ?? null,
//       tarif_cours_indiv: tarif_cours_indiv ?? null,
//       avantages: avantages ?? null,
//       heures_min_periode: heures_min_periode ?? null,
//       periode_engagement: periode_engagement ?? null,
//       date_debut,
//       date_fin: date_fin ?? null,
//     })
//     .select()
//     .single();

//   if (error) {
//     console.error("Erreur création contrat:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   // Mettre à jour le type_contrat dans profs pour cohérence
//   await supabaseAdmin
//     .from("profs")
//     .update({ type_contrat: type })
//     .eq("id", profId);

//   return NextResponse.json({ success: true, contrat: data });
// }

// // ── PATCH — clôturer un contrat ───────────────────────────────────────────────
// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const user = await checkDirection();
//   if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

//   const { id: profId } = await params;
//   const { id: contratId, date_fin } = await req.json();

//   if (!contratId) {
//     return NextResponse.json({ error: "ID contrat manquant" }, { status: 400 });
//   }

//   const { error } = await supabaseAdmin
//     .from("contrats")
//     .update({ date_fin: date_fin ?? new Date().toISOString().split("T")[0] })
//     .eq("id", contratId)
//     .eq("prof_id", profId);

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json({ success: true });
// }

// app/api/direction/profs/[id]/contrats/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";

// ── Vérification direction ────────────────────────────────────────────────────
async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "direction" ? user : null;
}

// ── POST — créer un contrat ───────────────────────────────────────────────────
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: profId } = await params;
  const body = await req.json();

  const {
    type, salaire_fixe, tarif_cours_indiv, tarif_duo, tarif_trio, avantages,
    heures_min_periode, periode_engagement, date_debut, date_fin,
  } = body;

  if (!type || !date_debut) {
    return NextResponse.json({ error: "Type et date de début obligatoires" }, { status: 400 });
  }

  // Clôturer le contrat actif précédent si existant
  const today = new Date().toISOString().split("T")[0];
  await supabaseAdmin
    .from("contrats")
    .update({ date_fin: today })
    .eq("prof_id", profId)
    .or(`date_fin.is.null,date_fin.gte.${today}`);

  // Créer le nouveau contrat
  const { data, error } = await supabaseAdmin
    .from("contrats")
    .insert({
      prof_id: profId,
      type,
      salaire_fixe: salaire_fixe ?? null,
      tarif_cours_indiv: tarif_cours_indiv ?? null,
      tarif_duo: tarif_duo ?? null,
      tarif_trio: tarif_trio ?? null,
      avantages: avantages ?? null,
      heures_min_periode: heures_min_periode ?? null,
      periode_engagement: periode_engagement ?? null,
      date_debut,
      date_fin: date_fin ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur création contrat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mettre à jour le type_contrat dans profs pour cohérence
  await supabaseAdmin
    .from("profs")
    .update({ type_contrat: type })
    .eq("id", profId);

  return NextResponse.json({ success: true, contrat: data });
}

// ── PATCH — clôturer un contrat ───────────────────────────────────────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: profId } = await params;
  const { id: contratId, date_fin } = await req.json();

  if (!contratId) {
    return NextResponse.json({ error: "ID contrat manquant" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contrats")
    .update({ date_fin: date_fin ?? new Date().toISOString().split("T")[0] })
    .eq("id", contratId)
    .eq("prof_id", profId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
