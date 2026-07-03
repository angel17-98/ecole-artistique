// app/api/prof/preferences/route.ts
// Permet à un prof connecté de gérer ses propres préférences
// (aujourd'hui : acceptation des cours duo/trio — le tarif reste fixé par la direction)

import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

async function checkProf() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "prof" ? user : null;
}

// ── GET — Récupérer les préférences actuelles ─────────────────────────────────
export async function GET() {
  const user = await checkProf();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { data: prof, error } = await supabaseAdmin
    .from("profs")
    .select("accepte_duo, accepte_trio")
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: prof });
}

// ── PATCH — Mettre à jour les préférences ──────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const user = await checkProf();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const { accepte_duo, accepte_trio } = body;

  const updatePayload: Record<string, boolean> = {};
  if (typeof accepte_duo === "boolean") updatePayload.accepte_duo = accepte_duo;
  if (typeof accepte_trio === "boolean") updatePayload.accepte_trio = accepte_trio;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Aucune préférence valide fournie" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("profs")
    .update(updatePayload)
    .eq("user_id", user.id)
    .select("accepte_duo, accepte_trio")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, preferences: data });
}