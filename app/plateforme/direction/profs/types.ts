// app/plateforme/direction/profs/types.ts

export interface ProfRow {
  id: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  disciplines: string[];
  actif: boolean;
  typeContratLabel: string | null;
  salaireFixe: number | null;
  tarifCoursIndiv: number | null;
  coursPlanifiesSemaine: number;
  creneauxOuvertsSemaine: number;
  onboardingEnAttente: boolean;
}