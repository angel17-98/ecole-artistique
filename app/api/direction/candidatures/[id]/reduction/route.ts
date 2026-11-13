// app/api/direction/candidatures/[id]/reduction/route.ts
// Réductions d'une candidature, depuis la fiche direction (10/11/2026).
//
//   GET  → lien temporaire vers le justificatif de ménage + liste des réductions
//   POST → { action: "valider_menage" }
//          { action: "refuser_menage" }
//          { action: "ajouter_remise", type, mode, valeur, motif }
//          { action: "supprimer_remise", remiseId }
//
// Les montants finaux ne sont PAS calculés ici : la facture (chantier
// paiements) partira du tarif du parcours et appliquera ces réductions.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

const BUCKET_JUSTIFICATIFS = "justificatifs";
const POURCENTAGE_MENAGE_DEFAUT = 10;

async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "direction" ? user : null;
}

async function pourcentageMenage(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("parametres").select("valeur").eq("cle", "reduction_menage_pourcentage").maybeSingle();
  const n = Number(data?.valeur);
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : POURCENTAGE_MENAGE_DEFAUT;
}

// Trace dans l'historique de la fiche (non bloquant si la table refuse)
async function noter(candidatureId: string, auteurId: string, contenu: string) {
  const { error } = await supabaseAdmin
    .from("notes_direction")
    .insert({ candidature_id: candidatureId, auteur_id: auteurId, contenu, type: "action" });
  if (error) console.error("Note direction (réduction) error:", error);
}

async function etat(candidatureId: string) {
  const { data: candidature } = await supabaseAdmin
    .from("candidatures")
    .select("id, reduction_menage_demandee, reduction_menage_statut, justificatif_menage_path")
    .eq("id", candidatureId)
    .maybeSingle();
  if (!candidature) return null;

  let justificatifUrl: string | null = null;
  if (candidature.justificatif_menage_path) {
    const { data } = await supabaseAdmin.storage
      .from(BUCKET_JUSTIFICATIFS)
      .createSignedUrl(candidature.justificatif_menage_path, 60 * 10); // lien valable 10 minutes
    justificatifUrl = data?.signedUrl ?? null;
  }

  const { data: remises } = await supabaseAdmin
    .from("remises")
    .select("id, type, mode, valeur, motif, created_at")
    .eq("candidature_id", candidatureId)
    .order("created_at", { ascending: true });

  return {
    menageDemandee: !!candidature.reduction_menage_demandee,
    menageStatut: (candidature.reduction_menage_statut as string | null) ?? null,
    justificatifUrl,
    remises: remises ?? [],
    pourcentageMenage: await pourcentageMenage(),
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  const data = await etat(id);
  if (!data) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkDirection();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const { data: candidature } = await supabaseAdmin
    .from("candidatures").select("id").eq("id", id).maybeSingle();
  if (!candidature) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });

  switch (body.action) {
    // ── Valider la réduction ménage ──────────────────────────────────────────
    case "valider_menage": {
      const pct = await pourcentageMenage();
      // Remplace une éventuelle réduction ménage existante (une seule par candidature)
      await supabaseAdmin.from("remises").delete().eq("candidature_id", id).eq("type", "menage");
      const { error: e1 } = await supabaseAdmin.from("remises").insert({
        candidature_id: id, type: "menage", mode: "pourcentage", valeur: pct,
        motif: "Membres du ménage — composition de ménage validée", cree_par: user.id,
      });
      if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
      const { error: e2 } = await supabaseAdmin
        .from("candidatures").update({ reduction_menage_statut: "validee" }).eq("id", id);
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
      await noter(id, user.id, `Réduction ménage validée (−${pct} %)`);
      break;
    }

    // ── Refuser la réduction ménage ──────────────────────────────────────────
    case "refuser_menage": {
      await supabaseAdmin.from("remises").delete().eq("candidature_id", id).eq("type", "menage");
      const { error } = await supabaseAdmin
        .from("candidatures").update({ reduction_menage_statut: "refusee" }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await noter(id, user.id, "Réduction ménage refusée");
      break;
    }

    // ── Ajouter une réduction libre (geste commercial, autre) ────────────────
    case "ajouter_remise": {
      const type = body.type === "autre" ? "autre" : "geste_commercial";
      const mode = body.mode === "montant" ? "montant" : "pourcentage";
      const valeur = Math.round(Number(body.valeur) * 100) / 100;
      const motif = typeof body.motif === "string" ? body.motif.trim() : "";
      if (!Number.isFinite(valeur) || valeur <= 0) {
        return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
      }
      if (mode === "pourcentage" && valeur > 100) {
        return NextResponse.json({ error: "Un pourcentage ne peut pas dépasser 100" }, { status: 400 });
      }
      if (!motif) return NextResponse.json({ error: "Indique un motif" }, { status: 400 });

      const { error } = await supabaseAdmin.from("remises").insert({
        candidature_id: id, type, mode, valeur, motif, cree_par: user.id,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await noter(id, user.id, `Réduction ajoutée : −${valeur}${mode === "pourcentage" ? " %" : " €"} (${motif})`);
      break;
    }

    // ── Supprimer une réduction libre ────────────────────────────────────────
    case "supprimer_remise": {
      const { data: remise } = await supabaseAdmin
        .from("remises").select("id, type, mode, valeur, motif")
        .eq("id", body.remiseId).eq("candidature_id", id).maybeSingle();
      if (!remise) return NextResponse.json({ error: "Réduction introuvable" }, { status: 404 });
      if (remise.type === "menage") {
        return NextResponse.json({ error: "Utilise « Refuser » pour retirer la réduction ménage" }, { status: 400 });
      }
      const { error } = await supabaseAdmin.from("remises").delete().eq("id", remise.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await noter(id, user.id, `Réduction retirée : −${remise.valeur}${remise.mode === "pourcentage" ? " %" : " €"} (${remise.motif ?? ""})`);
      break;
    }

    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }

  return NextResponse.json(await etat(id));
}