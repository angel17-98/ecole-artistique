// app/plateforme/direction/profs/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import Link from "next/link";

export default async function DirectionProfsPage() {
  const supabase = await createClient();

  // Récupérer tous les profs avec leur profil
  const { data: profs } = await supabase
    .from("profs")
    .select(`
      id,
      type_contrat,
      disciplines,
      actif,
      created_at,
      profile:profiles!profs_user_id_fkey(prenom, nom, telephone, is_active)
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[rgb(239,244,239)] px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
              Espace direction
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-black">
              Professeurs
            </h1>
            <p className="mt-1 text-sm text-black/50">
              {profs?.length ?? 0} prof{(profs?.length ?? 0) > 1 ? "s" : ""} enregistré{(profs?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/plateforme/direction/profs/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-[rgb(22,92,71)] px-6 py-3 text-sm font-semibold text-white hover:bg-[rgb(18,75,58)] transition"
          >
            + Ajouter un prof
          </Link>
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {profs?.length === 0 && (
            <div className="rounded-2xl border border-black/8 bg-white p-10 text-center text-sm text-black/40">
              Aucun professeur pour l'instant. Commence par en ajouter un.
            </div>
          )}

          {profs?.map((prof) => {
            const p = prof.profile as any;
            return (
              <div
                key={prof.id}
                className="rounded-2xl border border-black/8 bg-white px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar initiales */}
                  <div className="w-10 h-10 rounded-full bg-[rgb(22,92,71)]/10 flex items-center justify-center text-sm font-semibold text-[rgb(22,92,71)]">
                    {p?.prenom?.[0]}{p?.nom?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-black text-sm">
                      {p?.prenom} {p?.nom}
                    </p>
                    <p className="text-xs text-black/45 mt-0.5">
                      {prof.type_contrat === "independant" ? "Indépendant" : "Salarié"} · {prof.disciplines?.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    prof.actif
                      ? "bg-[rgb(22,92,71)]/10 text-[rgb(22,92,71)]"
                      : "bg-black/8 text-black/40"
                  }`}>
                    {prof.actif ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}