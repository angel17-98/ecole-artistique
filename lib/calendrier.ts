// lib/calendrier.ts
// Semaine type + calendrier annuel (11/11/2026).
// Les données viennent des tables planning_creneaux et calendrier_evenements,
// modifiables par la direction. Tout le reste (semaines de cours, semaines
// A/B, périodes, nombre de séances) est CALCULÉ ici : il suffit de changer
// une date de congé pour que toute la page se mette à jour.
//
// Les dates sont manipulées en "AAAA-MM-JJ" et en UTC pour éviter les
// décalages d'une heure aux changements d'heure.

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CategorieCreneau =
  | "comedie-musicale" | "full-artist" | "eveil" | "initiation"
  | "session" | "cours-specifique" | "individuel" | "autre";

/** hebdo = chaque semaine · semaine_a / semaine_b = une semaine sur deux, en alternance */
export type Frequence = "hebdo" | "semaine_a" | "semaine_b";

export const FREQUENCES: Record<Frequence, { label: string; court: string }> = {
  hebdo:     { label: "Chaque semaine", court: "" },
  semaine_a: { label: "Semaine A (groupes du lundi et du mardi)", court: "Sem. A" },
  semaine_b: { label: "Semaine B (groupes du jeudi et du vendredi)", court: "Sem. B" },
};

export interface CreneauPlanning {
  id: string;
  jour: number;          // 1 = lundi … 7 = dimanche
  heure_debut: string;   // "HH:MM" ou "HH:MM:SS"
  heure_fin: string;
  titre: string;
  sous_titre: string | null;
  categorie: CategorieCreneau;
  frequence: Frequence;
  note: string | null;
  ordre: number;
  visible: boolean;
  /** Nombre maximum de séances comptées sur l'année (ex. 30). Au-delà : séances de réserve. Null = pas de limite. */
  seances_max: number | null;
  /** Dates propres au créneau (ex. module d'une seule période). Null = toute l'année de cours. */
  date_debut: string | null;
  date_fin: string | null;
  /** Nom des séances au-delà du maximum (ex. « Studio · finalisation de la maquette »). Null = « Séance de réserve ». */
  libelle_reserve: string | null;
}

export type TypeEvenement =
  | "debut_cours" | "fin_cours" | "conge" | "ferie" | "essai"
  | "spectacle" | "stage" | "masterclass" | "inscriptions" | "evenement";

/**
 * Types proposés dans le calendrier de l'année. Stage et masterclass existent
 * encore en base (migration v2) mais vivent désormais dans la page
 * Stages & Workshops (table offres) : ils ne sont plus affichés ici.
 */
export const TYPES_CALENDRIER: TypeEvenement[] = [
  "debut_cours", "fin_cours", "conge", "ferie", "essai", "spectacle", "inscriptions", "evenement",
];

export const estTypeCalendrier = (t: TypeEvenement) => TYPES_CALENDRIER.includes(t);

export interface EvenementCalendrier {
  id: string;
  titre: string;
  type: TypeEvenement;
  date_debut: string;    // "AAAA-MM-JJ"
  date_fin: string | null;
  description: string | null;
  visible: boolean;
}

// ─── LIBELLÉS & COULEURS ─────────────────────────────────────────────────────

export const CATEGORIES: Record<CategorieCreneau, { label: string; fond: string; trait: string; texte: string }> = {
  "comedie-musicale": { label: "Comédie musicale", fond: "rgba(22,92,71,0.10)",   trait: "rgb(22,92,71)",   texte: "rgb(15,66,51)" },
  "full-artist":      { label: "Full Artist",      fond: "rgba(185,151,83,0.16)", trait: "rgb(185,151,83)", texte: "rgb(120,90,30)" },
  "eveil":            { label: "Éveil musical",    fond: "rgba(84,132,170,0.13)", trait: "rgb(84,132,170)", texte: "rgb(42,82,115)" },
  "initiation":       { label: "Initiation 8–12",  fond: "rgba(132,104,168,0.13)",trait: "rgb(132,104,168)",texte: "rgb(86,62,118)" },
  "session":          { label: "Session collective", fond: "rgb(12,50,38)",       trait: "rgb(185,151,83)", texte: "rgb(255,255,255)" },
  "cours-specifique": { label: "Cours spécifique", fond: "rgba(190,110,80,0.13)", trait: "rgb(190,110,80)", texte: "rgb(125,62,40)" },
  "individuel":       { label: "Cours individuels & locations", fond: "rgba(0,0,0,0.035)", trait: "rgba(0,0,0,0.18)", texte: "rgba(0,0,0,0.5)" },
  "autre":            { label: "Autre",            fond: "rgba(0,0,0,0.06)",      trait: "rgba(0,0,0,0.35)", texte: "rgba(0,0,0,0.7)" },
};

export const TYPES_EVENEMENT: Record<TypeEvenement, { label: string; couleur: string }> = {
  debut_cours:  { label: "Début des cours",  couleur: "rgb(22,92,71)" },
  fin_cours:    { label: "Fin des cours",    couleur: "rgb(22,92,71)" },
  conge:        { label: "Congé",            couleur: "rgb(196,180,150)" },
  ferie:        { label: "Jour férié",       couleur: "rgb(200,80,60)" },
  essai:        { label: "Mois d'essai",     couleur: "rgb(84,132,170)" },
  spectacle:    { label: "Spectacle",        couleur: "rgb(185,151,83)" },
  stage:        { label: "Stage",            couleur: "rgb(190,110,80)" },
  masterclass:  { label: "Masterclass",      couleur: "rgb(132,104,168)" },
  inscriptions: { label: "Inscriptions",     couleur: "rgb(84,132,170)" },
  evenement:    { label: "Événement",        couleur: "rgb(12,50,38)" },
};

export const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const JOURS_COURTS = ["L", "M", "M", "J", "V", "S", "D"];
export const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// ─── DATES ────────────────────────────────────────────────────────────────────

export function versDate(s: string): Date {
  const [a, m, j] = s.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j));
}

export function versTexte(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ajouterJours(s: string, n: number): string {
  const d = versDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return versTexte(d);
}

/** 1 = lundi … 7 = dimanche */
export function jourSemaine(s: string): number {
  const j = versDate(s).getUTCDay();
  return j === 0 ? 7 : j;
}

export function lundiDe(s: string): string {
  return ajouterJours(s, 1 - jourSemaine(s));
}

export function dateLongue(s: string, avecJour = true): string {
  const d = versDate(s);
  const jour = avecJour ? `${JOURS[jourSemaine(s) - 1].toLowerCase()} ` : "";
  return `${jour}${d.getUTCDate()} ${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function dateCourte(s: string): string {
  const d = versDate(s);
  return `${d.getUTCDate()} ${MOIS_COURTS[d.getUTCMonth()]}`;
}

export function periodeTexte(debut: string, fin: string | null): string {
  if (!fin || fin === debut) return dateLongue(debut);
  return `du ${dateLongue(debut, false)} au ${dateLongue(fin, false)}`;
}

export function heureCourte(h: string): string {
  const [hh, mm] = h.split(":");
  return mm === "00" ? `${Number(hh)}h` : `${Number(hh)}h${mm}`;
}

export function enMinutes(h: string): number {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
}

// ─── CALCUL DE L'ANNÉE ────────────────────────────────────────────────────────

export interface Semaine {
  lundi: string;
  numero: number;        // 1, 2, 3… (semaines de cours uniquement)
  lettre: "A" | "B";
  periode: number;
}

export interface Periode {
  numero: number;
  debut: string;         // premier jour de cours
  fin: string;           // dernier jour de cours
  nbSemaines: number;
}

export type StatutJour = "hors" | "cours" | "ferme" | "libre";

export interface InfoJour {
  statut: StatutJour;
  semaine: Semaine | null;
  session: boolean;
  evenements: EvenementCalendrier[];
}

export interface Annee {
  debut: string;
  fin: string;
  semaines: Semaine[];
  periodes: Periode[];
  /** Dates des sessions de travail collectif (toutes catégories "session") */
  datesSessions: string[];
  /**
   * Séances d'un créneau sur l'année. Si le créneau a un maximum (seances_max),
   * les séances au-delà sont des séances de réserve (les dernières de l'année).
   */
  seances: (c: CreneauCompte) => { comptees: number; reserve: number; total: number };
  /** Rang de la séance d'un créneau à cette date (1 = première), ou null s'il n'y a pas cours */
  rangSeance: (c: CreneauCompte, date: string) => number | null;
  infoJour: (date: string) => InfoJour;
  /** Mois à afficher, du mois du début au mois de la fin : [année, mois 0-11] */
  mois: [number, number][];
}

export type CreneauCompte = Pick<CreneauPlanning, "jour" | "frequence"> & {
  seances_max?: number | null;
  date_debut?: string | null;
  date_fin?: string | null;
};

/** Nom affiché d'une séance au-delà du maximum */
export function libelleReserve(c: Pick<CreneauPlanning, "libelle_reserve">): string {
  return c.libelle_reserve?.trim() || "Séance de réserve";
}

/** « du 13 mars au 28 avril », ou null si le créneau suit toute l'année */
export function datesPropres(c: Pick<CreneauPlanning, "date_debut" | "date_fin">): string | null {
  if (!c.date_debut && !c.date_fin) return null;
  if (c.date_debut && c.date_fin) return `du ${dateCourte(c.date_debut)} au ${dateCourte(c.date_fin)}`;
  if (c.date_debut) return `à partir du ${dateCourte(c.date_debut)}`;
  return `jusqu'au ${dateCourte(c.date_fin!)}`;
}

/** Vrai si la séance à ce rang dépasse le maximum du créneau */
export function estReserve(c: CreneauCompte, rang: number | null): boolean {
  return rang !== null && !!c.seances_max && rang > c.seances_max;
}

const couvre = (e: EvenementCalendrier, d: string) => d >= e.date_debut && d <= (e.date_fin ?? e.date_debut);

/**
 * Construit l'année à partir des événements. Renvoie null tant qu'il manque
 * un « Début des cours » ou une « Fin des cours ».
 */
export function construireAnnee(
  evenements: EvenementCalendrier[],
  creneaux: (CreneauCompte & Pick<CreneauPlanning, "categorie" | "visible">)[]
): Annee | null {
  const visibles = evenements.filter((e) => e.visible && estTypeCalendrier(e.type));
  const debuts = visibles.filter((e) => e.type === "debut_cours").map((e) => e.date_debut).sort();
  if (debuts.length === 0) return null;
  const debut = debuts[debuts.length - 1]; // l'année la plus récente
  const fin = visibles
    .filter((e) => e.type === "fin_cours" && e.date_debut > debut)
    .map((e) => e.date_debut)
    .sort()[0];
  if (!fin) return null;

  const fermetures = visibles.filter((e) => e.type === "conge" || e.type === "ferie");
  const estFerme = (d: string) => fermetures.some((e) => couvre(e, d));
  const dansAnnee = (d: string) => d >= debut && d <= fin;

  // ── Semaines de cours : au moins un jour du lundi au vendredi ouvert ──
  const semaines: Semaine[] = [];
  const periodes: Periode[] = [];
  let numero = 0;
  let lundiPrecedent: string | null = null;

  for (let lundi = lundiDe(debut); lundi <= fin; lundi = ajouterJours(lundi, 7)) {
    const ouverts = [0, 1, 2, 3, 4].map((i) => ajouterJours(lundi, i)).filter((d) => dansAnnee(d) && !estFerme(d));
    if (ouverts.length === 0) continue;

    numero += 1;
    const enchaine = lundiPrecedent !== null && ajouterJours(lundiPrecedent, 7) === lundi;
    if (!enchaine) {
      periodes.push({ numero: periodes.length + 1, debut: ouverts[0], fin: ouverts[ouverts.length - 1], nbSemaines: 0 });
    }
    const p = periodes[periodes.length - 1];
    p.fin = ouverts[ouverts.length - 1];
    p.nbSemaines += 1;

    semaines.push({ lundi, numero, lettre: numero % 2 === 1 ? "A" : "B", periode: p.numero });
    lundiPrecedent = lundi;
  }

  const semaineDuLundi = new Map(semaines.map((s) => [s.lundi, s]));

  // Dates réelles d'un créneau sur l'année
  const datesCreneau = (c: CreneauCompte): string[] =>
    semaines
      .filter((s) => c.frequence === "hebdo" || (c.frequence === "semaine_a" ? s.lettre === "A" : s.lettre === "B"))
      .map((s) => ajouterJours(s.lundi, c.jour - 1))
      .filter((d) => dansAnnee(d) && !estFerme(d))
      .filter((d) => (!c.date_debut || d >= c.date_debut) && (!c.date_fin || d <= c.date_fin));

  const sessions = new Set<string>();
  for (const c of creneaux) {
    if (c.visible && c.categorie === "session") datesCreneau(c).forEach((d) => sessions.add(d));
  }

  const infoJour = (date: string): InfoJour => {
    const evts = visibles.filter((e) => couvre(e, date));
    if (!dansAnnee(date)) return { statut: "hors", semaine: null, session: false, evenements: evts };
    const semaine = semaineDuLundi.get(lundiDe(date)) ?? null;
    if (estFerme(date)) return { statut: "ferme", semaine, session: false, evenements: evts };
    const js = jourSemaine(date);
    const statut: StatutJour = semaine && js <= 5 ? "cours" : "libre";
    return { statut, semaine, session: sessions.has(date), evenements: evts };
  };

  const mois: [number, number][] = [];
  const d0 = versDate(debut);
  const d1 = versDate(fin);
  for (let a = d0.getUTCFullYear(), m = d0.getUTCMonth(); a < d1.getUTCFullYear() || (a === d1.getUTCFullYear() && m <= d1.getUTCMonth()); ) {
    mois.push([a, m]);
    m += 1;
    if (m === 12) { m = 0; a += 1; }
  }

  return {
    debut, fin, semaines, periodes,
    datesSessions: [...sessions].sort(),
    seances: (c) => {
      const total = datesCreneau(c).length;
      const comptees = c.seances_max ? Math.min(total, c.seances_max) : total;
      return { comptees, reserve: total - comptees, total };
    },
    rangSeance: (c, date) => {
      const i = datesCreneau(c).indexOf(date);
      return i === -1 ? null : i + 1;
    },
    infoJour,
    mois,
  };
}

/** Tri des créneaux : par jour, puis heure, puis ordre */
export function trierCreneaux<T extends Pick<CreneauPlanning, "jour" | "heure_debut" | "ordre">>(liste: T[]): T[] {
  return [...liste].sort((a, b) =>
    a.jour - b.jour || enMinutes(a.heure_debut) - enMinutes(b.heure_debut) || a.ordre - b.ordre
  );
}

/** Libellé de l'année scolaire, ex. "2027–2028" */
export function libelleAnnee(annee: Pick<Annee, "debut" | "fin">): string {
  return `${annee.debut.slice(0, 4)}–${annee.fin.slice(0, 4)}`;
}