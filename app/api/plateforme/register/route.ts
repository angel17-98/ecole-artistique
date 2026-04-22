import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, telephone, nomFamille, ville, prenomEleve, nomEleve, dateNaissance } =
      await req.json();

    console.log("Register API appelée avec userId:", userId);
    console.log("nomFamille:", nomFamille);

    if (!userId || !nomFamille || !prenomEleve || !nomEleve) {
      console.log("Paramètres manquants");
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // 1. Mettre à jour le profil
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ telephone: telephone || null })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json({ error: "Erreur profil : " + profileError.message }, { status: 500 });
    }

    // 2. Créer le foyer
    const { data: foyerData, error: foyerError } = await supabaseAdmin
      .from("foyers")
      .insert({
        user_id: userId,
        nom_famille: nomFamille,
        telephone: telephone || null,
        ville: ville || null,
      })
      .select("id")
      .single();

    if (foyerError || !foyerData) {
      return NextResponse.json({ error: "Erreur foyer : " + foyerError?.message }, { status: 500 });
    }

    // 3. Créer le premier élève
    const { error: eleveError } = await supabaseAdmin
      .from("eleves")
      .insert({
        foyer_id: foyerData.id,
        prenom: prenomEleve,
        nom: nomEleve,
        date_naissance: dateNaissance || null,
      });

    if (eleveError) {
      return NextResponse.json({ error: "Erreur élève : " + eleveError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}