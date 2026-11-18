// lib/navigation.ts
// Liens du menu du site public (18/11/2026), lus par Header.tsx ET Footer.tsx.
//
// Pour ajouter, retirer ou renommer un lien : c'est ici, et nulle part ailleurs.
// Un lien marqué `pret: false` est caché partout (menu, mobile, pied de page)
// tant que sa page n'existe pas : il suffit de passer `pret: true` le jour où
// la page est en ligne. Ça évite les liens morts.

export interface LienNav {
  href: string;
  label: string;
  /** Petite ligne sous le lien dans les menus déroulants (facultatif) */
  description?: string;
  /** false = page pas encore créée → lien caché */
  pret: boolean;
}

export interface GroupeNav {
  /** Titre de la rubrique dans le menu déroulant (facultatif) */
  titre?: string;
  liens: LienNav[];
}

// ─── À PROPOS ────────────────────────────────────────────────────────────────

export const A_PROPOS: GroupeNav[] = [
  {
    liens: [
      { href: "/a-propos/notre-ecole",  label: "Notre école",  pret: true },
      { href: "/a-propos/notre-equipe", label: "Notre équipe", pret: true },
      { href: "/bourse",                label: "La Bourse Crea'Star", description: "Soutenir les talents motivés", pret: false },
      { href: "/partenaires",           label: "Partenaires",  pret: false },
      { href: "/actualites",            label: "Actualités",   pret: true },
      { href: "/faq",                   label: "FAQ",          pret: true },
      { href: "/contact",               label: "Contact",      pret: true },
    ],
  },
];

// ─── COURS COLLECTIFS ────────────────────────────────────────────────────────
// Les cours annuels peuvent changer d'une année à l'autre : on modifie
// simplement la liste du groupe « Cours annuels ».

export const COURS_COLLECTIFS: GroupeNav[] = [
  {
    liens: [
      // Page unique des deux parcours (comparatif, 18/11). Les anciennes pages séparées
      // restent en ligne mais ne sont plus dans le menu.
      { href: "/cours/parcours",         label: "Les parcours Crea'Star", description: "Full Artist et Comédie musicale", pret: true },
      { href: "/cours/full-artist",      label: "Parcours Full Artist",      description: "Chant, écriture, studio", pret: false },
      { href: "/cours/comedie-musicale", label: "Parcours Comédie musicale", description: "Chant, danse, théâtre",  pret: false },
    ],
  },
  {
    titre: "Cours annuels",
    liens: [
      { href: "/cours/eveil-musical", label: "Éveil musical",       description: "4 à 8 ans",  pret: true },
      { href: "/cours/initiation",    label: "Initiation aux parcours", description: "8 à 12 ans", pret: false },
    ],
  },
  {
    liens: [
      { href: "/cours/calendrier", label: "Calendrier de l'année", description: "Horaires, congés, spectacle", pret: true },
    ],
  },
];

// ─── ENTRÉES DIRECTES DU MENU ────────────────────────────────────────────────

export const LIENS_DIRECTS: LienNav[] = [
  { href: "/cours/cours-individuels", label: "Cours individuels",  pret: true },
  { href: "/stages",                  label: "Stages & Workshops", pret: true },
  { href: "/locations",               label: "Location",           pret: false },
];

/** Bouton « S'inscrire » toujours visible */
export const LIEN_INSCRIPTION = { href: "/candidature", label: "S'inscrire" };

// ─── PIED DE PAGE : LIENS LÉGAUX ─────────────────────────────────────────────

export const LIENS_LEGAUX: LienNav[] = [
  { href: "/confidentialite",  label: "Confidentialité",  pret: false },
  { href: "/mentions-legales", label: "Mentions légales", pret: false },
];

// ─── OUTILS ──────────────────────────────────────────────────────────────────

/** Ne garde que les liens prêts, et retire les groupes devenus vides */
export function groupesPrets(groupes: GroupeNav[]): GroupeNav[] {
  return groupes
    .map((g) => ({ ...g, liens: g.liens.filter((l) => l.pret) }))
    .filter((g) => g.liens.length > 0);
}

export function liensPrets(liens: LienNav[]): LienNav[] {
  return liens.filter((l) => l.pret);
}

/** Le lien correspond-il à la page affichée ? (pour le surligner) */
export function estActif(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}