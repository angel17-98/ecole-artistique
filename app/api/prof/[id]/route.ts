// app/api/direction/profs/[id]/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// ── Vérification direction ────────────────────────────────────────────────────
async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "direction" ? user : null;
}

// ── DELETE — Supprimer définitivement un professeur ─────────────────────────
// ⚠️ Suppression dure : à réserver aux profs de test / créés par erreur.
// Pour un vrai départ de professeur, préférer la désactivation (profs.actif = false)
// qui conserve l'historique de contrats, cours et rémunérations (utile côté compta).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: profId } = await params;
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  // 1. Récupérer le prof et son user_id
  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select("id, user_id")
    .eq("id", profId)
    .single();

  if (!prof) return NextResponse.json({ error: "Professeur introuvable" }, { status: 404 });

  const userId = prof.user_id;
  const now = new Date().toISOString();

  // 2. Garde-fous — créneaux réservés et cours futurs non annulés
  const { count: creneauxReserves } = await supabaseAdmin
    .from("creneaux")
    .select("id", { count: "exact", head: true })
    .eq("prof_id", profId)
    .eq("statut", "reserve")
    .gte("debut", now);

  const { count: coursFuturs } = await supabaseAdmin
    .from("cours")
    .select("id", { count: "exact", head: true })
    .eq("prof_id", profId)
    .gte("date_heure_debut", now)
    .neq("statut", "annule");

  if (!force && ((creneauxReserves ?? 0) > 0 || (coursFuturs ?? 0) > 0)) {
    return NextResponse.json({
      error: `Impossible de supprimer : ${creneauxReserves ?? 0} créneau(x) réservé(s) et ${coursFuturs ?? 0} cours futur(s) lié(s) à ce professeur. Annule/réassigne-les d'abord, ou force la suppression.`,
      creneauxReserves: creneauxReserves ?? 0,
      coursFuturs: coursFuturs ?? 0,
    }, { status: 409 });
  }

  // 3. Cascade — nettoyage de tout ce qui référence ce prof
  await supabaseAdmin.from("remuneration_mensuelle").delete().eq("prof_id", profId);
  await supabaseAdmin.from("contrats").delete().eq("prof_id", profId);
  await supabaseAdmin.from("creneaux").delete().eq("prof_id", profId);
  await supabaseAdmin.from("intervalles_prof").delete().eq("prof_id", profId);
  await supabaseAdmin.from("cours").delete().eq("prof_id", profId);

  // 4. Messagerie — conversations où le prof est participant
  const { data: convs } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .contains("participants", [userId]);

  const convIds = (convs ?? []).map((c) => c.id);
  if (convIds.length > 0) {
    await supabaseAdmin.from("messages").delete().in("conversation_id", convIds);
    await supabaseAdmin.from("conversations").delete().in("id", convIds);
  }

  // 5. Notifications adressées à ce prof
  await supabaseAdmin.from("notifications").delete().eq("user_id", userId);

  // 6. Le prof, puis le profil, puis le compte auth
  const { error: profDeleteError } = await supabaseAdmin
    .from("profs")
    .delete()
    .eq("id", profId);

  if (profDeleteError) {
    console.error("Erreur suppression profs:", profDeleteError);
    return NextResponse.json({ error: profDeleteError.message }, { status: 500 });
  }

  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authError) {
    console.error("Erreur suppression Auth:", authError);
    return NextResponse.json({ success: true, authWarning: authError.message });
  }

  return NextResponse.json({ success: true });
}