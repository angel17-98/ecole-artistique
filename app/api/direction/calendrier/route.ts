
// app/api/direction/calendrier/route.ts
// Modification de la semaine type et du calendrier de l'année (11/11/2026).
// Réservé à la direction.
//
//   POST { action: "enregistrer_creneau",   creneau: {...} }   (avec id = mise à jour, sans id = création)
//   POST { action: "supprimer_creneau",     id }
//   POST { action: "enregistrer_evenement", evenement: {...} }
//   POST { action: "supprimer_evenement",   id }

import { NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

const CATEGORIES = ["comedie-musicale", "full-artist", "eveil", "initiation", "session", "cours-specifique", "individuel", "autre"];
const FREQUENCES = ["hebdo", "semaine_a", "semaine_b"];
const TYPES = ["debut_cours", "fin_cours", "conge", "ferie", "essai", "spectacle", "stage", "masterclass", "inscriptions", "evenement"];

async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "direction" ? user : null;
}

const erreur = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const heureValide = (h: string) => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(h);
const dateValide = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));

export async function POST(req: Request) {
  const user = await checkDirection();
  if (!user) return erreur("Non autorisé", 403);

  const body = await req.json().catch(() => ({}));

  switch (body.action) {
    // ── Semaine type ───────────────────────────────────────────────────────
    case "enregistrer_creneau": {
      const c = body.creneau ?? {};
      const jour = Number(c.jour);
      const debut = texte(c.heure_debut);
      const fin = texte(c.heure_fin);
      const titre = texte(c.titre);

      if (!Number.isInteger(jour) || jour < 1 || jour > 7) return erreur("Jour invalide");
      if (!heureValide(debut) || !heureValide(fin)) return erreur("Heure invalide");
      if (fin.slice(0, 5) <= debut.slice(0, 5)) return erreur("L'heure de fin doit être après l'heure de début");
      if (!titre) return erreur("Le titre est obligatoire");
      if (!CATEGORIES.includes(c.categorie)) return erreur("Catégorie invalide");
      if (!FREQUENCES.includes(c.frequence)) return erreur("Fréquence invalide");

      // Nombre maximum de séances comptées sur l'année (vide = pas de limite)
      const max = c.seances_max === null || c.seances_max === undefined || c.seances_max === "" ? null : Number(c.seances_max);
      if (max !== null && (!Number.isInteger(max) || max < 1 || max > 60)) return erreur("Séances max : un nombre entre 1 et 60");

      // Dates propres au créneau (vides = toute l'année)
      const dDebut = texte(c.date_debut) || null;
      const dFin = texte(c.date_fin) || null;
      if (dDebut && !dateValide(dDebut)) return erreur("Date de début du créneau invalide");
      if (dFin && !dateValide(dFin)) return erreur("Date de fin du créneau invalide");
      if (dDebut && dFin && dFin < dDebut) return erreur("La date de fin du créneau doit être après sa date de début");

      const ligne = {
        jour, heure_debut: debut, heure_fin: fin, titre,
        sous_titre: texte(c.sous_titre) || null,
        categorie: c.categorie,
        frequence: c.frequence,
        note: texte(c.note) || null,
        ordre: Number.isFinite(Number(c.ordre)) ? Math.round(Number(c.ordre)) : 0,
        visible: c.visible !== false,
        seances_max: max,
        date_debut: dDebut,
        date_fin: dFin,
        libelle_reserve: texte(c.libelle_reserve) || null,
        updated_at: new Date().toISOString(),
      };

      const requete = c.id
        ? supabaseAdmin.from("planning_creneaux").update(ligne).eq("id", c.id).select().single()
        : supabaseAdmin.from("planning_creneaux").insert(ligne).select().single();
      const { data, error } = await requete;
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true, creneau: data });
    }

    case "supprimer_creneau": {
      if (!body.id) return erreur("id manquant");
      const { error } = await supabaseAdmin.from("planning_creneaux").delete().eq("id", body.id);
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true });
    }

    // ── Calendrier de l'année ──────────────────────────────────────────────
    case "enregistrer_evenement": {
      const e = body.evenement ?? {};
      const titre = texte(e.titre);
      const debut = texte(e.date_debut);
      const fin = texte(e.date_fin);

      if (!titre) return erreur("Le titre est obligatoire");
      if (!TYPES.includes(e.type)) return erreur("Type invalide");
      if (!dateValide(debut)) return erreur("Date de début invalide");
      if (fin && !dateValide(fin)) return erreur("Date de fin invalide");
      if (fin && fin < debut) return erreur("La date de fin doit être après la date de début");

      const ligne = {
        titre, type: e.type,
        date_debut: debut,
        date_fin: fin && fin !== debut ? fin : null,
        description: texte(e.description) || null,
        visible: e.visible !== false,
        updated_at: new Date().toISOString(),
      };

      const requete = e.id
        ? supabaseAdmin.from("calendrier_evenements").update(ligne).eq("id", e.id).select().single()
        : supabaseAdmin.from("calendrier_evenements").insert(ligne).select().single();
      const { data, error } = await requete;
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true, evenement: data });
    }

    case "supprimer_evenement": {
      if (!body.id) return erreur("id manquant");
      const { error } = await supabaseAdmin.from("calendrier_evenements").delete().eq("id", body.id);
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true });
    }

    default:
      return erreur("Action inconnue");
  }
}