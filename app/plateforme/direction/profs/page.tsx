// app/plateforme/direction/profs/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

export default async function DirectionProfsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction") redirect("/plateforme/direction");

  // Profs avec leur profil + contrat actif
  const { data: profs } = await supabaseAdmin
    .from("profs")
    .select(`
      id, type_contrat, disciplines, actif, created_at,
      profile:profiles!profs_user_id_fkey(prenom, nom, telephone, is_active)
    `)
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().split("T")[0];

  // Récupérer les contrats actifs pour tous les profs en une requête
  const profIds = (profs ?? []).map(p => p.id);
  const { data: contratsActifs } = profIds.length > 0
    ? await supabaseAdmin
        .from("contrats")
        .select("prof_id, type, salaire_fixe, tarif_cours_indiv, date_fin")
        .in("prof_id", profIds)
        .or(`date_fin.is.null,date_fin.gte.${today}`)
    : { data: [] };

  const contratParProf = Object.fromEntries(
    (contratsActifs ?? []).map(c => [c.prof_id, c])
  );

  const typeLabel = (t: string) =>
    t === "independant" ? "Indépendant"
    : t === "mixte" ? "Mixte"
    : "Salarié";

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>
      <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 24 }}>

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgb(185,151,83)", marginBottom: 6 }}>
              Direction · Professeurs
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 600, color: "rgb(8,20,14)", margin: "0 0 4px" }}>
              Professeurs
            </h1>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", margin: 0 }}>
              {profs?.length ?? 0} prof{(profs?.length ?? 0) > 1 ? "s" : ""} enregistré{(profs?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/plateforme/direction/profs/nouveau"
            className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)]"
            style={{ background: "rgb(22,92,71)", padding: "12px 24px" }}
          >
            <Plus size={14} /> Ajouter un prof
          </Link>
        </div>

        {/* Liste */}
        <div className="space-y-2 max-w-3xl">
          {(!profs || profs.length === 0) && (
            <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center text-sm text-black/40">
              Aucun professeur pour l'instant. Commence par en ajouter un.
            </div>
          )}

          {profs?.map((prof) => {
            const p = prof.profile as any;
            const contrat = contratParProf[prof.id];
            const initiales = `${p?.prenom?.[0] ?? ""}${p?.nom?.[0] ?? ""}`.toUpperCase();

            return (
              <Link
                key={prof.id}
                href={`/plateforme/direction/profs/${prof.id}`}
                className="group flex items-center gap-4 rounded-[18px] border border-black/6 bg-white px-6 py-4 transition-all hover:-translate-y-px hover:shadow-md"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)" }}
                >
                  {initiales || "?"}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-black">
                      {p?.prenom} {p?.nom}
                    </p>
                    {/* Badge type contrat */}
                    {contrat ? (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)" }}
                      >
                        {typeLabel(contrat.type)}
                      </span>
                    ) : (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(185,151,83,0.12)", color: "rgb(146,95,14)" }}
                      >
                        Sans contrat
                      </span>
                    )}
                    {/* Badge inactif */}
                    {!prof.actif && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(220,38,38,0.08)", color: "rgb(220,38,38)" }}
                      >
                        Inactif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-black/40 mt-0.5 truncate">
                    {prof.disciplines?.join(", ") || "Aucune discipline"}
                    {p?.telephone ? ` · ${p.telephone}` : ""}
                  </p>
                </div>

                {/* Infos contrat à droite */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  {contrat?.salaire_fixe != null && (
                    <p className="text-xs font-semibold text-black">{contrat.salaire_fixe} € / mois</p>
                  )}
                  {contrat?.tarif_cours_indiv != null && (
                    <p className="text-xs text-black/40">{contrat.tarif_cours_indiv} € / cours</p>
                  )}
                  {!contrat && (
                    <p className="text-xs text-[rgb(185,151,83)] font-semibold">Contrat à créer →</p>
                  )}
                </div>

                <ChevronRight
                  size={16}
                  className="text-black/20 group-hover:text-black/50 transition-colors flex-shrink-0"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}