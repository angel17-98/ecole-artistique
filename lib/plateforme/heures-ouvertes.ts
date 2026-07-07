// lib/plateforme/heures-ouvertes.ts
// Calcule les heures d'ouverture réelles déclarées par un prof à partir de ses
// INTERVALLES (heure_debut / heure_fin / récurrence) — jamais à partir du comptage
// des créneaux générés, qui se chevauchent par construction (un slot toutes les
// 30min, bloquant 1h) et ne représentent donc pas un volume d'heures fiable.

export interface IntervalleHeures {
  heure_debut: string;               // "HH:MM"
  heure_fin: string;                 // "HH:MM"
  recurrence: string;                // "hebdomadaire" | "aucune"
  date_unique?: string | null;
  jour_semaine?: number | null;      // 1 = Lundi ... 7 = Dimanche
  recurrence_fin?: string | null;
  actif?: boolean;
}

function dureeHeures(heureDebut: string, heureFin: string): number {
  const [dh, dm] = heureDebut.split(":").map(Number);
  const [fh, fm] = heureFin.split(":").map(Number);
  return Math.max(0, (fh * 60 + fm - (dh * 60 + dm)) / 60);
}

/**
 * Heures d'ouverture (disponibilités déclarées) sur une fenêtre [debut, fin].
 */
export function heuresOuvertes(
  intervalles: IntervalleHeures[],
  debut: Date,
  fin: Date
): number {
  let total = 0;

  for (const iv of intervalles) {
    if (iv.actif === false) continue;
    const duree = dureeHeures(iv.heure_debut, iv.heure_fin);
    if (duree <= 0) continue;

    if (iv.recurrence === "aucune") {
      if (!iv.date_unique) continue;
      const d = new Date(iv.date_unique);
      if (d >= debut && d <= fin) total += duree;
      continue;
    }

    if (iv.recurrence === "hebdomadaire" && iv.jour_semaine) {
      const limiteRecurrence = iv.recurrence_fin ? new Date(iv.recurrence_fin) : null;
      const fenetreFin = limiteRecurrence && limiteRecurrence < fin ? limiteRecurrence : fin;
      if (fenetreFin < debut) continue;

      const cursor = new Date(debut);
      cursor.setHours(0, 0, 0, 0);
      const cible = iv.jour_semaine % 7; // 7 (Dimanche) → 0

      // Reculer/avancer jusqu'au premier jour correspondant à partir de "debut"
      while (cursor.getDay() !== cible) {
        cursor.setDate(cursor.getDate() + 1);
      }

      while (cursor <= fenetreFin) {
        if (cursor >= debut) total += duree;
        cursor.setDate(cursor.getDate() + 7);
      }
    }
  }

  return Math.round(total * 10) / 10; // arrondi à 0.1h
}

/**
 * Ajoute une période d'engagement contractuelle ("3 mois", "6 mois", "1 an", "2 semaines"...)
 * à une date de début. Retombe sur 3 mois si le format n'est pas reconnu.
 */
export function finPeriodeEngagement(dateDebut: Date, periode: string | null | undefined): Date {
  const d = new Date(dateDebut);
  const match = periode?.match(/(\d+)\s*(mois|ans?|semaines?)/i);
  if (!match) {
    d.setMonth(d.getMonth() + 3);
    return d;
  }
  const n = parseInt(match[1], 10);
  const unite = match[2].toLowerCase();
  if (unite.startsWith("an")) d.setFullYear(d.getFullYear() + n);
  else if (unite.startsWith("mois")) d.setMonth(d.getMonth() + n);
  else if (unite.startsWith("semaine")) d.setDate(d.getDate() + n * 7);
  return d;
}

/**
 * Détermine la période d'engagement courante (celle dans laquelle on se trouve
 * aujourd'hui) à partir de la date de début du contrat et de sa périodicité.
 * Ex : contrat démarré en janvier, période "3 mois" → jan-mars, avr-juin, ...
 */
export function periodeEngagementCourante(
  dateDebutContrat: Date,
  periode: string | null | undefined
): { debut: Date; fin: Date } {
  let debut = new Date(dateDebutContrat);
  let fin = finPeriodeEngagement(debut, periode);
  const now = new Date();

  let garde = 0;
  while (fin < now && garde < 240) {
    debut = new Date(fin);
    fin = finPeriodeEngagement(debut, periode);
    garde++;
  }
  return { debut, fin };
}