// lib/dossier.ts
// Inscription en deux temps (18/11/2026) : ce qui compose le dossier d'une
// candidature et comment savoir s'il est complet. Utilisé à la fois par la
// page « Compléter le dossier » (navigateur) et par la route API (serveur),
// pour que les deux appliquent exactement les mêmes règles.

import { EVALS_PAR_PARCOURS, estParcoursAnnuel, type EvalKey } from "@/lib/grille";

export const STATUT_DOSSIER_INCOMPLET = "dossier_incomplet";

export const MIN_POURQUOI = 80;
export const MIN_PROJET = 40;
export const MIN_ESPRIT = 40;

export const VIDEO_MAX = 200 * 1024 * 1024;
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo"];
export const JUSTIF_MAX = 10 * 1024 * 1024;
export const JUSTIF_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export const DISCIPLINES: { id: EvalKey; name: string; levels: string[] }[] = [
  { id: "eval_chant",    name: "Chant",                   levels: ["Dans ma douche", "J'apprends seul·e", "Cours depuis peu", "Scène associative", "Concerts & projets"] },
  { id: "eval_danse",    name: "Danse",                   levels: ["Jamais pratiqué", "J'explore", "Cours réguliers", "Spectacles", "Formations pro"] },
  { id: "eval_theatre",  name: "Théâtre & Impro",         levels: ["Jamais monté", "Timide sur scène", "Impro & ateliers", "Pièces & rôles", "Formations & planches"] },
  { id: "eval_ecriture", name: "Écriture & Composition",  levels: ["Je n'écris pas", "Quelques textes", "Compositions perso", "Projets aboutis", "Publications & scènes"] },
  { id: "eval_scenique", name: "Expression scénique",     levels: ["Inconnu pour moi", "Je découvre", "Je travaille ça", "À l'aise sur scène", "Présence affirmée"] },
  { id: "eval_studio",   name: "Studio d'enregistrement", levels: ["Jamais enregistré", "Enregistrements maison", "Sessions studio", "Productions perso", "Projets professionnels"] },
];

export type SectionDossier = "motivation" | "niveau" | "video" | "infos";

export const SECTIONS: { id: SectionDossier; titre: string; description: string }[] = [
  { id: "motivation", titre: "Ta motivation",        description: "Trois questions, avec tes mots." },
  { id: "niveau",     titre: "Ton niveau",           description: "Où tu en es aujourd'hui, discipline par discipline." },
  { id: "video",      titre: "Ta vidéo",             description: "Une courte vidéo pour faire connaissance." },
  { id: "infos",      titre: "Infos pratiques",      description: "Santé, droit à l'image, réduction ménage." },
];

/** Les champs de la table candidatures utiles au dossier */
export interface DonneesDossier {
  parcours: string;
  pourquoi: string | null;
  projet: string | null;
  esprit_creastar: string | null;
  eval_chant: number | null;
  eval_danse: number | null;
  eval_theatre: number | null;
  eval_ecriture: number | null;
  eval_scenique: number | null;
  eval_studio: number | null;
  video_url: string | null;
  video_link: string | null;
  droit_image: boolean | null;
  infos_sante: string | null;
  reduction_menage_demandee: boolean | null;
  justificatif_menage_path: string | null;
}

export const COLONNES_DOSSIER =
  "parcours, pourquoi, projet, esprit_creastar, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, video_url, video_link, droit_image, infos_sante, reduction_menage_demandee, justificatif_menage_path";

const long = (s: string | null, min: number) => (s ?? "").trim().length >= min;

export function disciplinesDuParcours(parcours: string) {
  if (!estParcoursAnnuel(parcours)) return DISCIPLINES;
  return DISCIPLINES.filter((d) => EVALS_PAR_PARCOURS[parcours].includes(d.id));
}

/** Chaque section est-elle complète ? */
export function etatDossier(d: DonneesDossier): Record<SectionDossier, boolean> {
  return {
    motivation: long(d.pourquoi, MIN_POURQUOI) && long(d.projet, MIN_PROJET) && long(d.esprit_creastar, MIN_ESPRIT),
    niveau: disciplinesDuParcours(d.parcours).every((x) => {
      const v = d[x.id];
      return typeof v === "number" && v >= 1 && v <= 5;
    }),
    video: !!(d.video_url || d.video_link),
    infos: typeof d.droit_image === "boolean" && (!d.reduction_menage_demandee || !!d.justificatif_menage_path),
  };
}

export function dossierComplet(d: DonneesDossier): boolean {
  return Object.values(etatDossier(d)).every(Boolean);
}

export function nbSectionsCompletes(d: DonneesDossier): number {
  return Object.values(etatDossier(d)).filter(Boolean).length;
}

export const LIEN_VIDEO_VALIDE = /^https?:\/\/\S{6,}$/;