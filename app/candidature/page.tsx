// app/candidature/page.tsx
// Nouvelle candidature aux parcours annuels (10/11/2026).
// La candidature se fait désormais DEPUIS UN COMPTE, pour un élève du foyer.
// Sans connexion → renvoi vers la connexion, puis retour ici.

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import CandidatureClient from "./CandidatureClient";

export const metadata = {
  title: "Candidature — Crea'Star",
  description: "Candidature aux parcours Comédie musicale et Full Artist.",
};

// Statuts qui ne bloquent pas une nouvelle candidature
const STATUTS_TERMINES = ["refusee", "sans_reponse", "expiree", "annulee"];

export default async function CandidaturePage({
  searchParams,
}: {
  searchParams: Promise<{ parcours?: string }>;
}) {
  const params = await searchParams;
  const parcoursParam = params?.parcours ?? null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const retour = `/candidature${parcoursParam ? `?parcours=${encodeURIComponent(parcoursParam)}` : ""}`;
    redirect(`/plateforme/login?redirect=${encodeURIComponent(retour)}`);
  }

  const { data: foyer } = await supabaseAdmin
    .from("foyers")
    .select("id, nom_famille, telephone, eleves(id, prenom, nom, date_naissance)")
    .eq("user_id", user.id)
    .maybeSingle();

  // Compte sans foyer (compte direction/prof, ou création de compte interrompue)
  if (!foyer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[rgb(239,244,239)] px-6">
        <div className="max-w-md rounded-[24px] border border-black/8 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-black">Aucun foyer lié à ce compte</h1>
          <p className="mt-3 text-sm leading-6 text-black/60">
            Pour déposer une candidature, ton compte doit être un compte famille ou élève.
            Contacte-nous si tu penses que c'est une erreur.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
          >
            Nous contacter
          </Link>
        </div>
      </main>
    );
  }

  // Candidatures en cours, pour empêcher un doublon (même élève, même parcours)
  const { data: enCours } = await supabaseAdmin
    .from("candidatures")
    .select("eleve_id, parcours, statut")
    .eq("user_id", user.id)
    .not("statut", "in", `(${STATUTS_TERMINES.map((s) => `"${s}"`).join(",")})`);

  const eleves = ((foyer as any).eleves ?? []).map((e: any) => ({
    id: e.id as string,
    prenom: e.prenom as string,
    nom: e.nom as string,
    date_naissance: (e.date_naissance as string | null) ?? null,
  }));

  return (
    <CandidatureClient
      email={user.email ?? ""}
      nomFamille={foyer.nom_famille ?? ""}
      telephoneFoyer={foyer.telephone ?? ""}
      eleves={eleves}
      candidaturesEnCours={(enCours ?? [])
        .filter((c) => c.eleve_id)
        .map((c) => ({ eleve_id: c.eleve_id as string, parcours: c.parcours as string }))}
      parcoursInitial={parcoursParam}
    />
  );
}