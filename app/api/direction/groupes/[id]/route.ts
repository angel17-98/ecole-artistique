import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json();
  const updates: Record<string, any> = {};

  if ("note" in body)          updates.note          = body.note;
  if ("jour_semaine" in body)  updates.jour_semaine  = body.jour_semaine;
  if ("heure_debut" in body)   updates.heure_debut   = body.heure_debut;
  if ("heure_fin" in body)     updates.heure_fin     = body.heure_fin;

  const { error } = await supabaseAdmin
    .from("groupes_inscription")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}