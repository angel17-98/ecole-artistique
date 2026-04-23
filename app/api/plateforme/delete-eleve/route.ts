import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { createClient } from "@/lib/plateforme/supabase/server";

export async function DELETE(req: NextRequest) {
  try {
    const { eleveId } = await req.json();

    if (!eleveId) {
      return NextResponse.json({ error: "eleveId manquant" }, { status: 400 });
    }

    // Vérifier que l'élève appartient bien au foyer de l'utilisateur connecté
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: foyer } = await supabase
      .from("foyers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!foyer) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

    // Vérifier que l'élève appartient à ce foyer
    const { data: eleve } = await supabaseAdmin
      .from("eleves")
      .select("id, foyer_id")
      .eq("id", eleveId)
      .single();

    if (!eleve || eleve.foyer_id !== foyer.id) {
      return NextResponse.json({ error: "Élève introuvable ou non autorisé" }, { status: 403 });
    }

    // Supprimer l'élève (les liens_famille en cascade si FK configurée, sinon on nettoie)
    await supabaseAdmin.from("liens_famille").delete().eq("eleve_id", eleveId);
    
    const { error } = await supabaseAdmin.from("eleves").delete().eq("id", eleveId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete eleve error:", err);
    return NextResponse.json({ error: err.message ?? "Erreur serveur" }, { status: 500 });
  }
}