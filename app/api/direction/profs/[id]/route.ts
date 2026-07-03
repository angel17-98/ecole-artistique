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

// ── PATCH — Éditer les informations du professeur ────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id: profId } = await params;
  const body = await req.json();

  const {
    prenom, nom, telephone,           // → profiles
    bio, tarif_horaire, disciplines, deadline_defaut, abonnement_possible_defaut, // → profs
  } = body;

  // Récupérer le user_id lié à ce prof pour mettre à jour profiles
  const { data: prof, error: profFetchError } = await supabaseAdmin
    .from("profs")
    .select("user_id")
    .eq("id", profId)
    .single();

  if (profFetchError || !prof) {
    return NextResponse.json({ error: "Professeur introuvable" }, { status: 404 });
  }

  // ── Mise à jour profiles (identité) ────────────────────────────────────────
  const profileUpdates: Record<string, any> = {};
  if (prenom !== undefined) profileUpdates.prenom = prenom;
  if (nom !== undefined) profileUpdates.nom = nom;
  if (telephone !== undefined) profileUpdates.telephone = telephone || null;

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdates)
      .eq("id", prof.user_id);

    if (error) {
      console.error("Erreur update profiles:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // ── Mise à jour profs (infos métier) ───────────────────────────────────────
  const profUpdates: Record<string, any> = {};
  if (bio !== undefined) profUpdates.bio = bio || null;
  if (tarif_horaire !== undefined) profUpdates.tarif_horaire = tarif_horaire ? parseFloat(tarif_horaire) : null;
  if (disciplines !== undefined) profUpdates.disciplines = disciplines;
  if (deadline_defaut !== undefined) profUpdates.deadline_defaut = deadline_defaut;
  if (abonnement_possible_defaut !== undefined) profUpdates.abonnement_possible_defaut = abonnement_possible_defaut;

  if (Object.keys(profUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from("profs")
      .update(profUpdates)
      .eq("id", profId);

    if (error) {
      console.error("Erreur update profs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// ── DELETE — Supprimer définitivement un professeur ─────────────────────────
// ⚠️ Suppression dure : à réserver aux profs de test / créés par erreur.
// Pour un vrai départ de professeur, préférer la désactivation (profs.actif = false)
// qui conserve l'historique de contrats, cours et rémunérations (utile côté compta).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkDirection();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const { id: profId } = await params;
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const { data: prof, error: profFetchError } = await supabaseAdmin
      .from("profs")
      .select("id, user_id")
      .eq("id", profId)
      .single();

    if (profFetchError) {
      console.error("Erreur lecture prof:", profFetchError);
      return NextResponse.json({ error: `Lecture du professeur impossible : ${profFetchError.message}` }, { status: 500 });
    }
    if (!prof) return NextResponse.json({ error: "Professeur introuvable" }, { status: 404 });

    const userId = prof.user_id;
    const now = new Date().toISOString();

    const { count: creneauxReserves, error: crErr } = await supabaseAdmin
      .from("creneaux")
      .select("id", { count: "exact", head: true })
      .eq("prof_id", profId)
      .eq("statut", "reserve")
      .gte("debut", now);
    if (crErr) console.error("Erreur lecture créneaux:", crErr);

    const { count: coursFuturs, error: cfErr } = await supabaseAdmin
      .from("cours")
      .select("id", { count: "exact", head: true })
      .eq("prof_id", profId)
      .gte("date_heure_debut", now)
      .neq("statut", "annule");
    if (cfErr) console.error("Erreur lecture cours:", cfErr);

    if (!force && ((creneauxReserves ?? 0) > 0 || (coursFuturs ?? 0) > 0)) {
      return NextResponse.json({
        error: `Impossible de supprimer : ${creneauxReserves ?? 0} créneau(x) réservé(s) et ${coursFuturs ?? 0} cours futur(s) lié(s) à ce professeur. Annule/réassigne-les d'abord, ou force la suppression.`,
        creneauxReserves: creneauxReserves ?? 0,
        coursFuturs: coursFuturs ?? 0,
      }, { status: 409 });
    }

    const warnings: string[] = [];

    const { error: e1 } = await supabaseAdmin.from("remuneration_mensuelle").delete().eq("prof_id", profId);
    if (e1) { console.error("Erreur remuneration_mensuelle:", e1); warnings.push(`remuneration_mensuelle: ${e1.message}`); }

    const { error: e2 } = await supabaseAdmin.from("contrats").delete().eq("prof_id", profId);
    if (e2) { console.error("Erreur contrats:", e2); warnings.push(`contrats: ${e2.message}`); }

    const { error: e3 } = await supabaseAdmin.from("creneaux").delete().eq("prof_id", profId);
    if (e3) { console.error("Erreur creneaux:", e3); warnings.push(`creneaux: ${e3.message}`); }

    const { error: e4 } = await supabaseAdmin.from("intervalles_prof").delete().eq("prof_id", profId);
    if (e4) { console.error("Erreur intervalles_prof:", e4); warnings.push(`intervalles_prof: ${e4.message}`); }

    const { error: e5 } = await supabaseAdmin.from("cours").delete().eq("prof_id", profId);
    if (e5) { console.error("Erreur cours:", e5); warnings.push(`cours: ${e5.message}`); }

    const { error: eDocs } = await supabaseAdmin.from("documents_profs").delete().eq("prof_id", profId);
    if (eDocs) { console.error("Erreur documents_profs:", eDocs); warnings.push(`documents_profs: ${eDocs.message}`); }

    const { data: convs, error: convFetchErr } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .contains("participants", [userId]);
    if (convFetchErr) { console.error("Erreur lecture conversations:", convFetchErr); warnings.push(`conversations (lecture): ${convFetchErr.message}`); }

    const convIds = (convs ?? []).map((c) => c.id);
    if (convIds.length > 0) {
      const { error: e6 } = await supabaseAdmin.from("messages").delete().in("conversation_id", convIds);
      if (e6) { console.error("Erreur messages:", e6); warnings.push(`messages: ${e6.message}`); }

      const { error: e7 } = await supabaseAdmin.from("conversations").delete().in("id", convIds);
      if (e7) { console.error("Erreur conversations:", e7); warnings.push(`conversations: ${e7.message}`); }
    }

    const { error: e8 } = await supabaseAdmin.from("notifications").delete().eq("user_id", userId);
    if (e8) { console.error("Erreur notifications:", e8); warnings.push(`notifications: ${e8.message}`); }

    const { error: profDeleteError } = await supabaseAdmin
      .from("profs")
      .delete()
      .eq("id", profId);

    if (profDeleteError) {
      console.error("Erreur suppression profs:", profDeleteError);
      return NextResponse.json({ error: `Suppression profs échouée : ${profDeleteError.message}`, warnings }, { status: 500 });
    }

    const { error: profileDeleteError } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (profileDeleteError) {
      console.error("Erreur suppression profiles:", profileDeleteError);
      return NextResponse.json({ error: `Suppression profil échouée : ${profileDeleteError.message}`, warnings }, { status: 500 });
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Erreur suppression Auth:", authError);
      return NextResponse.json({ success: true, authWarning: authError.message, warnings });
    }

    return NextResponse.json({ success: true, warnings: warnings.length ? warnings : undefined });

  } catch (err: any) {
    console.error("Exception non gérée dans DELETE /api/direction/profs/[id]:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur serveur inattendue lors de la suppression." },
      { status: 500 }
    );
  }
}