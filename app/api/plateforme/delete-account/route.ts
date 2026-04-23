import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { createClient } from "@/lib/plateforme/supabase/server";

export async function DELETE(req: NextRequest) {
  try {
    // Vérifier l'utilisateur connecté
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const userId = user.id;

    // 1. Récupérer le foyer
    const { data: foyer } = await supabaseAdmin
      .from("foyers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (foyer) {
      // 2. Supprimer les élèves et leurs liens famille
      const { data: eleves } = await supabaseAdmin
        .from("eleves")
        .select("id")
        .eq("foyer_id", foyer.id);

      if (eleves && eleves.length > 0) {
        const eleveIds = eleves.map(e => e.id);
        await supabaseAdmin.from("liens_famille").delete().in("eleve_id", eleveIds);
        await supabaseAdmin.from("eleves").delete().eq("foyer_id", foyer.id);
      }

      // 3. Supprimer les cartes fidélité
      await supabaseAdmin.from("fidelite").delete().eq("foyer_id", foyer.id);

      // 4. Supprimer le foyer
      await supabaseAdmin.from("foyers").delete().eq("id", foyer.id);
    }

    // 5. Supprimer le profil
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 6. Supprimer le compte auth (nécessite service role)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: err.message ?? "Erreur serveur" }, { status: 500 });
  }
}