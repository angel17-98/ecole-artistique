// app/cours/full-artist/page.tsx
// Ancienne page du parcours Full Artist (remplacée le 18/11/2026 par la page
// unique des parcours). On redirige pour ne casser aucun lien déjà partagé.
// L'ancienne version reste dans l'historique GitHub si besoin.

import { redirect } from "next/navigation";

export default function FullArtistPage() {
  redirect("/cours/parcours?p=full-artist");
}