// lib/offres.ts
// Offres de la page Stages & Workshops (13/11/2026) : stages, masterclass,
// workshops et modules à la carte. Données dans la table offres, gérées depuis
// Espace direction → Offres. Les demandes des visiteurs vont dans interets.

import { periodeTexte } from "@/lib/calendrier";

export type TypeOffre = "stage" | "masterclass" | "workshop" | "module";
export type EtatInscriptions = "bientot" | "ouvertes" | "complet";
export type TypeDemande = "interet" | "inscription" | "attente";

export interface Offre {
  id: string;
  type: TypeOffre;
  titre: string;
  description: string | null;
  public_vise: string | null;
  date_debut: string;
  date_fin: string | null;
  horaires: string | null;
  prix: number | null;
  places_restantes: number | null;
  inscriptions: EtatInscriptions;
  lien_inscription: string | null;
  image_url: string | null;
  visible: boolean;
}

export interface Demande {
  id: string;
  offre_id: string | null;
  offre_titre: string | null;
  type_demande: TypeDemande;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  age: string | null;
  message: string | null;
  traite: boolean;
  created_at: string;
}

export const TYPES_OFFRE: Record<TypeOffre, { label: string; pluriel: string; couleur: string }> = {
  stage:       { label: "Stage",             pluriel: "Stages",             couleur: "rgb(190,110,80)" },
  masterclass: { label: "Masterclass",       pluriel: "Masterclass",        couleur: "rgb(132,104,168)" },
  workshop:    { label: "Workshop",          pluriel: "Workshops",          couleur: "rgb(84,132,170)" },
  module:      { label: "Module à la carte", pluriel: "Modules à la carte", couleur: "rgb(185,151,83)" },
};

export const ETATS_INSCRIPTIONS: Record<EtatInscriptions, { label: string; fond: string; texte: string }> = {
  bientot:  { label: "Inscriptions bientôt", fond: "rgba(0,0,0,0.06)",     texte: "rgba(0,0,0,0.6)" },
  ouvertes: { label: "Inscriptions ouvertes", fond: "rgba(22,92,71,0.12)", texte: "rgb(22,92,71)" },
  complet:  { label: "Complet",              fond: "rgba(200,60,40,0.10)", texte: "rgb(170,50,35)" },
};

export const TYPES_DEMANDE: Record<TypeDemande, { label: string }> = {
  interet:     { label: "Intérêt" },
  inscription: { label: "Demande d'inscription" },
  attente:     { label: "Liste d'attente" },
};

/** Date du jour en "AAAA-MM-JJ" (heure de Bruxelles) */
export function aujourdhui(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Brussels" });
}

/** Une offre reste affichée jusqu'à son dernier jour inclus */
export function estAVenir(o: Pick<Offre, "date_debut" | "date_fin">, jour = aujourdhui()): boolean {
  return (o.date_fin ?? o.date_debut) >= jour;
}

export function datesOffre(o: Pick<Offre, "date_debut" | "date_fin">): string {
  return periodeTexte(o.date_debut, o.date_fin);
}

export function prixTexte(prix: number | null): string {
  if (prix === null || prix === undefined) return "Prix à venir";
  if (Number(prix) === 0) return "Gratuit";
  return `${Number(prix).toLocaleString("fr-BE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

/**
 * Ce que le bouton de l'offre propose selon l'état des inscriptions :
 *   bientôt  → être prévenu (liste d'intérêt)
 *   ouvertes → lien d'inscription s'il existe, sinon demande d'inscription
 *   complet  → liste d'attente
 */
export function actionOffre(o: Pick<Offre, "inscriptions" | "lien_inscription" | "places_restantes">): {
  libelle: string; demande: TypeDemande | null; lien: string | null;
} {
  const complet = o.inscriptions === "complet" || o.places_restantes === 0;
  if (complet) return { libelle: "Liste d'attente", demande: "attente", lien: null };
  if (o.inscriptions === "ouvertes") {
    return o.lien_inscription
      ? { libelle: "S'inscrire", demande: null, lien: o.lien_inscription }
      : { libelle: "Demander une inscription", demande: "inscription", lien: null };
  }
  return { libelle: "Me prévenir à l'ouverture", demande: "interet", lien: null };
}