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

import { createMollieClient } from "@mollie/api-client";

if (!process.env.MOLLIE_API_KEY) {
  console.warn(
    "[mollie] MOLLIE_API_KEY n'est pas définie — les appels à l'API Mollie " +
    "échoueront. À renseigner dans les variables d'environnement."
  );
}

export const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY ?? "",
});