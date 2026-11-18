// app/inscriptions/page.tsx
// L'adresse /inscriptions n'existait pas (lien mort du bouton « S'inscrire » de
// l'accueil et de l'ancien menu mobile). Elle mène maintenant à la page des
// parcours, d'où l'on choisit son parcours avant de s'inscrire (18/11/2026).

import { redirect } from "next/navigation";

export default function InscriptionsPage() {
  redirect("/cours/parcours");
}