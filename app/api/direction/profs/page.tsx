// app/plateforme/direction/profs/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus, Users, UserCheck, UserX, FileWarning } from "lucide-react";

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

  // ── Répartition actifs / inactifs ─────────────────────────────────────────
  const profsActifs = (profs ?? []).filter(p => p.actif);
  const profsInactifs = (profs ?? []).filter(p => !p.actif);
  const sansContrat = (profs ?? []).filter(p => p.actif && !contratParProf[p.id]);
  const salaries = (profs ?? []).filter(p => contratParProf[p.id]?.type === "salarie");
  const independants = (profs ?? []).filter(p => contratParProf[p.id]?.type === "independant");

  const stats = [
    { label: "Total profs", value: profs?.length ?? 0, icon: <Users size={14} /> },
    { label: "Actifs", value: profsActifs.length, icon: <UserCheck size={14} /> },
    { label: "Salariés", value: salaries.length, icon: <Users size={14} /> },
    { label: "Indépendants", value: independants.length, icon: <Users size={14} /> },
    { label: "Sans contrat", value: sansContrat.length, icon: <FileWarning size={14} />, warn: sansContrat.length > 0 },
  ];

  // ── Carte prof réutilisable ───────────────────────────────────────────────
  const ProfCard = ({ prof, compact }: { prof: NonNullable<typeof profs>[number]; compact?: boolean }) => {
    const p = prof.profile as any;
    const contrat = contratParProf[prof.id];
    const initiales = `${p?.prenom?.[0] ?? ""}${p?.nom?.[0] ?? ""}`.toUpperCase();

    return (
      <Link
        href={`/plateforme/direction/profs/${prof.id}`}
        className="group flex items-center gap-4 rounded-[18px] border border-black/6 bg-white px-5 py-3.5 transition-all hover:-translate-y-px hover:shadow-md"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: prof.actif ? "rgba(22,92,71,0.1)" : "rgba(0,0,0,0.06)",
            color: prof.actif ? "rgb(22,92,71)" : "rgba(0,0,0,0.35)",
          }}
        >
          {initiales || "?"}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-black truncate">
              {p?.prenom} {p?.nom}
            </p>
            {contrat ? (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)" }}
              >
                {typeLabel(contrat.type)}
              </span>
            ) : (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(185,151,83,0.12)", color: "rgb(146,95,14)" }}
              >
                Sans contrat
              </span>
            )}
          </div>
          <p className="text-xs text-black/40 mt-0.5 truncate">
            {prof.disciplines?.join(", ") || "Aucune discipline"}
            {!compact && p?.telephone ? ` · ${p.telephone}` : ""}
          </p>
        </div>

        {/* Infos contrat à droite — masqué en mode compact (colonne inactifs) */}
        {!compact && (
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
        )}

        <ChevronRight
          size={16}
          className="text-black/20 group-hover:text-black/50 transition-colors flex-shrink-0"
        />
      </Link>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>
      <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 40 }}>

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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
            className="inline-flex items-center gap-2 rounded-full text-sm font-semibold !text-white transition hover:bg-[rgb(18,75,58)]"
            style={{ background: "rgb(22,92,71)", padding: "12px 24px" }}
          >
            <Plus size={14} /> Ajouter un prof
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[16px] border border-black/6 bg-white px-4 py-3.5"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-1.5 mb-1"
                style={{ color: s.warn ? "rgb(185,151,83)" : "rgba(0,0,0,0.3)" }}>
                {s.icon}
                <span className="text-[9px] uppercase tracking-[0.14em] font-semibold">{s.label}</span>
              </div>
              <p className="text-xl font-semibold" style={{ color: s.warn ? "rgb(146,95,14)" : "rgb(8,20,14)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {(!profs || profs.length === 0) ? (
          <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center text-sm text-black/40">
            Aucun professeur pour l'instant. Commence par en ajouter un.
          </div>
        ) : (
          /* ── Split Actifs (large) / Inactifs (colonne latérale) ── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ACTIFS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck size={14} style={{ color: "rgb(22,92,71)" }} />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgb(22,92,71)" }}>
                  Actifs — {profsActifs.length}
                </p>
              </div>
              {profsActifs.length === 0 ? (
                <div className="rounded-[18px] border border-black/6 bg-white p-8 text-center text-sm text-black/35">
                  Aucun professeur actif.
                </div>
              ) : (
                <div className="space-y-2">
                  {profsActifs.map((prof) => (
                    <ProfCard key={prof.id} prof={prof} />
                  ))}
                </div>
              )}
            </div>

            {/* INACTIFS — colonne latérale, scrollable si longue */}
            <div
              className="rounded-[20px] border border-black/6 bg-white/60 p-4"
              style={{
                position: "sticky",
                top: 24,
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
              }}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <UserX size={14} style={{ color: "rgba(0,0,0,0.35)" }} />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(0,0,0,0.35)" }}>
                  Inactifs — {profsInactifs.length}
                </p>
              </div>
              {profsInactifs.length === 0 ? (
                <p className="text-xs text-black/30 px-1 py-4 text-center">Aucun professeur inactif.</p>
              ) : (
                <div className="space-y-2">
                  {profsInactifs.map((prof) => (
                    <ProfCard key={prof.id} prof={prof} compact />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}