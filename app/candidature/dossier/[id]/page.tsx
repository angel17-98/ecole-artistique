// app/candidature/dossier/[id]/page.tsx
// Inscription en deux temps — TEMPS 2 (18/11/2026) : compléter le dossier.
// Réservé au compte qui a fait la demande. Sans connexion → page /connexion,
// qui renvoie ici une fois connecté·e.

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { COLONNES_DOSSIER } from "@/lib/dossier";
import DossierCandidatureClient from "./DossierCandidatureClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compléter le dossier — Crea'Star",
};

export default async function DossierCandidaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(`/candidature/dossier/${id}`)}`);

  const { data: c } = await supabaseAdmin
    .from("candidatures")
    .select(`id, user_id, statut, prenom, nom, telephone, tranche, jours_possibles, pack_studio_artistes, ${COLONNES_DOSSIER}`)
    .eq("id", id)
    .maybeSingle();

  if (!c || c.user_id !== user.id) notFound();

  return (
    <DossierCandidatureClient
      candidature={{
        id: c.id,
        statut: c.statut,
        prenom: c.prenom,
        nom: c.nom,
        email: user.email ?? "",
        telephone: c.telephone ?? "",
        tranche: c.tranche ?? null,
        jours: c.jours_possibles ?? [],
        pack: !!c.pack_studio_artistes,
        dossier: {
          parcours: c.parcours,
          pourquoi: c.pourquoi, projet: c.projet, esprit_creastar: c.esprit_creastar,
          eval_chant: c.eval_chant, eval_danse: c.eval_danse, eval_theatre: c.eval_theatre,
          eval_ecriture: c.eval_ecriture, eval_scenique: c.eval_scenique, eval_studio: c.eval_studio,
          video_url: c.video_url, video_link: c.video_link,
          droit_image: c.droit_image, infos_sante: c.infos_sante,
          reduction_menage_demandee: c.reduction_menage_demandee,
          justificatif_menage_path: c.justificatif_menage_path,
        },
      }}
    />
  );
}