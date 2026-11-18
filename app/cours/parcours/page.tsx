// app/cours/parcours/page.tsx
// Page unique des deux parcours annuels (18/11/2026) : Full Artist et Comédie musicale,
// avec un sélecteur et un comparatif. Adresse partageable par parcours :
//   /cours/parcours?p=full-artist   ou   /cours/parcours?p=comedie-musicale

import ParcoursClient from "./ParcoursClient";

export const metadata = {
  title: "Les parcours Crea'Star — Full Artist et Comédie musicale",
  description:
    "Deux parcours annuels de création, un même spectacle : le Full Artist pour créer son identité d'artiste (chant, écriture, studio), la Comédie musicale pour créer et jouer sa propre pièce (chant, danse, théâtre, mise en scène).",
};

export default async function ParcoursPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const params = await searchParams;
  const initial = params?.p === "comedie-musicale" ? "comedie-musicale" : "full-artist";
  return <ParcoursClient initial={initial} />;
}