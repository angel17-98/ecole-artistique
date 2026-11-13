// app/api/direction/offres/route.ts
// Offres de la page Stages & Workshops et demandes reçues (13/11/2026).
// Réservé à la direction.
//
//   POST { action: "enregistrer_offre", offre: {...} }   (avec id = mise à jour)
//   POST { action: "supprimer_offre",   id }
//   POST { action: "marquer_demande",   id, traite }
//   POST { action: "supprimer_demande", id }

import { NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

const TYPES = ["stage", "masterclass", "workshop", "module"];
const ETATS = ["bientot", "ouvertes", "complet"];

async function checkDirection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "direction" ? user : null;
}

const erreur = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const dateValide = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
const nombre = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : Number(v));

export async function POST(req: Request) {
  const user = await checkDirection();
  if (!user) return erreur("Non autorisé", 403);

  const body = await req.json().catch(() => ({}));

  switch (body.action) {
    case "enregistrer_offre": {
      const o = body.offre ?? {};
      const titre = texte(o.titre);
      const debut = texte(o.date_debut);
      const fin = texte(o.date_fin);
      const prix = nombre(o.prix);
      const places = nombre(o.places_restantes);
      const lien = texte(o.lien_inscription);
      const image = texte(o.image_url);

      if (!TYPES.includes(o.type)) return erreur("Type invalide");
      if (!titre) return erreur("Le titre est obligatoire");
      if (!dateValide(debut)) return erreur("Date de début invalide");
      if (fin && !dateValide(fin)) return erreur("Date de fin invalide");
      if (fin && fin < debut) return erreur("La date de fin doit être après la date de début");
      if (prix !== null && (!Number.isFinite(prix) || prix < 0)) return erreur("Prix invalide");
      if (places !== null && (!Number.isInteger(places) || places < 0)) return erreur("Nombre de places invalide");
      if (!ETATS.includes(o.inscriptions)) return erreur("État des inscriptions invalide");
      if (lien && !/^https?:\/\/\S+$/.test(lien)) return erreur("Le lien d'inscription doit commencer par https://");
      if (image && !/^https?:\/\/\S+$/.test(image)) return erreur("Adresse de photo invalide");

      const ligne = {
        type: o.type, titre,
        description: texte(o.description) || null,
        public_vise: texte(o.public_vise) || null,
        date_debut: debut,
        date_fin: fin && fin !== debut ? fin : null,
        horaires: texte(o.horaires) || null,
        prix: prix === null ? null : Math.round(prix * 100) / 100,
        places_restantes: places,
        inscriptions: o.inscriptions,
        lien_inscription: lien || null,
        image_url: image || null,
        visible: o.visible !== false,
        updated_at: new Date().toISOString(),
      };

      const requete = o.id
        ? supabaseAdmin.from("offres").update(ligne).eq("id", o.id).select().single()
        : supabaseAdmin.from("offres").insert(ligne).select().single();
      const { data, error } = await requete;
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true, offre: data });
    }

    case "supprimer_offre": {
      if (!body.id) return erreur("id manquant");
      // Les demandes liées sont conservées (offre_id passe à vide, le titre reste)
      const { error } = await supabaseAdmin.from("offres").delete().eq("id", body.id);
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true });
    }

    case "marquer_demande": {
      if (!body.id) return erreur("id manquant");
      const { error } = await supabaseAdmin.from("interets").update({ traite: body.traite === true }).eq("id", body.id);
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true });
    }

    case "supprimer_demande": {
      if (!body.id) return erreur("id manquant");
      const { error } = await supabaseAdmin.from("interets").delete().eq("id", body.id);
      if (error) return erreur(error.message, 500);
      return NextResponse.json({ ok: true });
    }

    default:
      return erreur("Action inconnue");
  }
}