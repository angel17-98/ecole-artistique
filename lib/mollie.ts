// // lib/mollie.ts
// // Client Mollie partagé — utilisé par les routes de paiement et le webhook.
// //
// // MOLLIE_API_KEY doit être définie dans les variables d'environnement.
// // Pour l'instant : clé de TEST (préfixe "test_...") — aucun paiement réel
// // n'est débité, tout est simulé côté Mollie. Le jour où Crea'Star passe en
// // production, il suffira de remplacer cette variable par la clé live
// // (préfixe "live_...") dans les variables d'environnement — aucun changement
// // de code nécessaire ici ni ailleurs.
// //
// // Nécessite le package "@mollie/api-client" (npm install @mollie/api-client).

// import { createMollieClient } from "@mollie/api-client";

// if (!process.env.MOLLIE_API_KEY) {
//   console.warn(
//     "[mollie] MOLLIE_API_KEY n'est pas définie — les appels à l'API Mollie " +
//     "échoueront. À renseigner dans les variables d'environnement."
//   );
// }

// export const mollieClient = createMollieClient({
//   apiKey: process.env.MOLLIE_API_KEY ?? "",
// });

// lib/mollie.ts
// Client Mollie partagé — utilisé par les routes de paiement et le webhook.
//
// MOLLIE_API_KEY doit être définie dans les variables d'environnement.
// Pour l'instant : clé de TEST (préfixe "test_...") — aucun paiement réel
// n'est débité, tout est simulé côté Mollie. Le jour où Crea'Star passe en
// production, il suffira de remplacer cette variable par la clé live
// (préfixe "live_...") dans les variables d'environnement — aucun changement
// de code nécessaire ici ni ailleurs.
//
// Nécessite le package "@mollie/api-client" (npm install @mollie/api-client).
//
// ⚠️ Le client est créé PARESSEUSEMENT (à la première utilisation), jamais au
// chargement du module. `createMollieClient` lève une exception immédiate si
// la clé est une chaîne vide — et Next.js exécute le code de niveau module de
// chaque route pendant l'étape de build "Collecting page data", même sans
// variable d'environnement disponible à ce moment-là. Une création "eager"
// (comme dans une première version de ce fichier) fait donc planter le build
// entier sur Vercel, avant même d'avoir pu déployer quoi que ce soit — bug
// rencontré et corrigé le 21/08/2026 (erreur de build : "Parameter apiKey is
// an empty string"). Avec l'approche paresseuse, une clé manquante ne fait
// échouer que l'appel de paiement lui-même, à l'exécution — jamais le build.

import { createMollieClient, type MollieClient } from "@mollie/api-client";

let _mollieClient: MollieClient | null = null;

export function getMollieClient(): MollieClient {
  if (_mollieClient) return _mollieClient;

  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOLLIE_API_KEY n'est pas définie. Vérifie les variables d'environnement " +
      "(Vercel → Settings → Environment Variables), puis redéploie."
    );
  }

  _mollieClient = createMollieClient({ apiKey });
  return _mollieClient;
}