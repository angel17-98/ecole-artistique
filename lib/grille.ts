export type ParcoursAnnuel = "comedie-musicale" | "full-artist";
export type Tranche = "12-15" | "16-18" | "19-24" | "25+";

export const PARCOURS_ANNUELS: { id: ParcoursAnnuel; label: string; accroche: string }[] = [
  {
    id: "comedie-musicale",
    label: "Comédie musicale",
    accroche: "Tu crées ta comédie musicale : le texte, l'histoire, la mise en scène, puis l'interprétation.",
  },
  {
    id: "full-artist",
    label: "Full Artist",
    accroche: "Tu crées ton identité d'artiste : ta musique, tes chansons, ta façon d'être sur scène.",
  },
];

export const PARCOURS_LABELS: Record<string, string> = {
  "comedie-musicale": "Comédie musicale",
  "full-artist": "Full Artist",
  "eveil-musical": "Éveil musical",
  "initiation": "Initiation 8–12 ans",
};

export const TRANCHES: { id: Tranche; label: string; min: number; max: number | null; horaire: string }[] = [
  { id: "12-15", label: "12 à 15 ans",    min: 12, max: 15,   horaire: "17h – 19h" },
  { id: "16-18", label: "16 à 18 ans",    min: 16, max: 18,   horaire: "17h – 19h" },
  { id: "19-24", label: "19 à 24 ans",    min: 19, max: 24,   horaire: "19h – 21h" },
  { id: "25+",   label: "25 ans et plus", min: 25, max: null, horaire: "19h – 21h" },
];

export const JOURS_PARCOURS: Record<ParcoursAnnuel, { id: string; label: string }[]> = {
  "comedie-musicale": [
    { id: "lundi", label: "Lundi" },
    { id: "jeudi", label: "Jeudi" },
  ],
  "full-artist": [
    { id: "mardi",    label: "Mardi" },
    { id: "vendredi", label: "Vendredi" },
  ],
};

// Auto-évaluation : disciplines demandées selon le parcours (ajusté le 10/11).
// Le CM ne demande pas l'écriture ni le studio, qui sont propres au Full Artist.
// Les clés correspondent aux colonnes eval_* de la table candidatures.
export type EvalKey = "eval_chant" | "eval_danse" | "eval_theatre" | "eval_ecriture" | "eval_scenique" | "eval_studio";

export const EVALS_PAR_PARCOURS: Record<ParcoursAnnuel, EvalKey[]> = {
  "comedie-musicale": ["eval_chant", "eval_danse", "eval_theatre", "eval_scenique"],
  "full-artist": ["eval_chant", "eval_danse", "eval_theatre", "eval_ecriture", "eval_scenique", "eval_studio"],
};

// Année de la rentrée pour laquelle on prend les inscriptions.
export const ANNEE_RENTREE = 2027;

// Date à laquelle on calcule l'âge pour conseiller une tranche.
// ⚠️ QUESTION OUVERTE (journal du 10/11) : 1er septembre ou 31 décembre ?
// Il suffit de changer cette ligne le jour où c'est tranché.
export const DATE_REFERENCE_AGE = new Date(ANNEE_RENTREE, 8, 1); // 1er septembre (mois 8 = septembre)

export function estParcoursAnnuel(p: unknown): p is ParcoursAnnuel {
  return p === "comedie-musicale" || p === "full-artist";
}

export function estTranche(t: unknown): t is Tranche {
  return TRANCHES.some((x) => x.id === t);
}

/** Âge à la date de référence, à partir d'une date "AAAA-MM-JJ". */
export function ageAu(dateNaissance: string, reference: Date = DATE_REFERENCE_AGE): number | null {
  const [a, m, j] = dateNaissance.split("-").map(Number);
  if (!a || !m || !j) return null;
  let age = reference.getFullYear() - a;
  const anniversairePasse =
    reference.getMonth() + 1 > m || (reference.getMonth() + 1 === m && reference.getDate() >= j);
  if (!anniversairePasse) age -= 1;
  return age >= 0 && age < 120 ? age : null;
}

/** Tranche conseillée pour un âge. Null sous 12 ans (éveil ou initiation). */
export function trancheConseillee(age: number | null): Tranche | null {
  if (age === null || age < 12) return null;
  const t = TRANCHES.find((x) => age >= x.min && (x.max === null || age <= x.max));
  return t?.id ?? null;
}

export function horaireDeTranche(t: Tranche): string {
  return TRANCHES.find((x) => x.id === t)?.horaire ?? "";
}