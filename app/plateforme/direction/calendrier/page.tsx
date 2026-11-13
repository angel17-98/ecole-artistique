// // // app/plateforme/direction/calendrier/page.tsx
// // // Espace direction → Calendrier : modifier la semaine type et l'année (11/11/2026).
// // // L'accès est déjà réservé à la direction par app/plateforme/direction/layout.tsx.

// // import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// // import type { CreneauPlanning, EvenementCalendrier } from "@/lib/calendrier";
// // import CalendrierDirectionClient from "./CalendrierDirectionClient";

// // export const dynamic = "force-dynamic";

// // export default async function CalendrierDirectionPage() {
// //   const [{ data: creneaux }, { data: evenements }] = await Promise.all([
// //     supabaseAdmin
// //       .from("planning_creneaux")
// //       .select("id, jour, heure_debut, heure_fin, titre, sous_titre, categorie, frequence, note, ordre, visible"),
// //     supabaseAdmin
// //       .from("calendrier_evenements")
// //       .select("id, titre, type, date_debut, date_fin, description, visible")
// //       .order("date_debut"),
// //   ]);

// //   return (
// //     <CalendrierDirectionClient
// //       creneaux={(creneaux ?? []) as CreneauPlanning[]}
// //       evenements={(evenements ?? []) as EvenementCalendrier[]}
// //     />
// //   );
// // }

// // app/plateforme/direction/calendrier/page.tsx
// // Espace direction → Calendrier : modifier la semaine type et l'année (11/11/2026).
// // L'accès est déjà réservé à la direction par app/plateforme/direction/layout.tsx.

// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import type { CreneauPlanning, EvenementCalendrier } from "@/lib/calendrier";
// import CalendrierDirectionClient from "./CalendrierDirectionClient";

// export const dynamic = "force-dynamic";

// export default async function CalendrierDirectionPage() {
//   const [{ data: creneaux }, { data: evenements }] = await Promise.all([
//     supabaseAdmin
//       .from("planning_creneaux")
//       .select("id, jour, heure_debut, heure_fin, titre, sous_titre, categorie, frequence, note, ordre, visible, seances_max"),
//     supabaseAdmin
//       .from("calendrier_evenements")
//       .select("id, titre, type, date_debut, date_fin, description, visible")
//       .order("date_debut"),
//   ]);

//   return (
//     <CalendrierDirectionClient
//       creneaux={(creneaux ?? []) as CreneauPlanning[]}
//       evenements={(evenements ?? []) as EvenementCalendrier[]}
//     />
//   );
// }

// app/plateforme/direction/calendrier/page.tsx
// Espace direction → Calendrier : modifier la semaine type et l'année (11/11/2026).
// L'accès est déjà réservé à la direction par app/plateforme/direction/layout.tsx.

import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import type { CreneauPlanning, EvenementCalendrier } from "@/lib/calendrier";
import CalendrierDirectionClient from "./CalendrierDirectionClient";

export const dynamic = "force-dynamic";

export default async function CalendrierDirectionPage() {
  const [{ data: creneaux }, { data: evenements }] = await Promise.all([
    supabaseAdmin
      .from("planning_creneaux")
      .select("id, jour, heure_debut, heure_fin, titre, sous_titre, categorie, frequence, note, ordre, visible, seances_max, date_debut, date_fin, libelle_reserve"),
    supabaseAdmin
      .from("calendrier_evenements")
      .select("id, titre, type, date_debut, date_fin, description, visible")
      .order("date_debut"),
  ]);

  return (
    <CalendrierDirectionClient
      creneaux={(creneaux ?? []) as CreneauPlanning[]}
      evenements={(evenements ?? []) as EvenementCalendrier[]}
    />
  );
}