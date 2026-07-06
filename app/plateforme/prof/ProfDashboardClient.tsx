// app/plateforme/prof/ProfDashboardClient.tsx
"use client";

import Link from "next/link";
import {
  CalendarDays, Clock, Users, Wallet,
  MessageSquare, UserCircle, ChevronRight, Plus, AlertCircle,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface ProfStats {
  coursEffectuesMois: number;
  creneauxDisponibles: number;
  montantEstime: number | null;
  nbDisciplines: number;
  messagesNonLus: number;
  heuresOuvertesPeriode?: number;
  joursRestantsPeriode?: number;
}

interface ProchainCours {
  id: string;
  type: "collectif" | "individuel";
  discipline: string;
  debut: string;
  fin: string;
  salle?: string;
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
// Note : la sidebar est maintenant rendue par app/plateforme/prof/layout.tsx
// (persistante sur toutes les pages), plus ici uniquement.
export default function ProfDashboardClient({
  profile,
  prof,
  contrat,
  stats,
  prochainsCours,
  photoSrc,
}: {
  profile: any;
  prof: any;
  contrat: any;
  stats: ProfStats;
  prochainsCours: ProchainCours[];
  photoSrc: string | null;
}) {
  const heure = new Date().getHours();
  const salutation = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";
  const todayFull = new Date().toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  const typeContratLabel = contrat?.type === "salarie" ? "Professeur salarié"
    : contrat?.type === "independant" ? "Professeur indépendant"
    : contrat?.type === "mixte" ? "Salarié & indépendant"
    : prof?.type_contrat === "salarie" ? "Professeur salarié"
    : prof?.type_contrat === "independant" ? "Professeur indépendant"
    : "Professeur";

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <div className="px-10 lg:px-14"
        style={{
          paddingTop: "calc(96px + 0px)",
          minHeight: "400px",
          background: "linear-gradient(135deg, rgb(8,20,14) 0%, rgb(12,40,28) 60%, rgb(18,55,38) 100%)",
          marginLeft: 0,
        }}>
        <div className="flex items-end justify-between py-8 gap-6">

          {/* Pattern géométrique décoratif */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, rgb(185,151,83) 0%, transparent 70%)" }} />
            <div className="absolute right-40 bottom-0 w-48 h-48 rounded-full opacity-5"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
            <div className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: "repeating-linear-gradient(60deg, white 0, white 1px, transparent 0, transparent 50%)",
                backgroundSize: "30px 30px",
              }} />
          </div>

          {/* Gauche : salutation + stats */}
          <div className="flex-1 min-w-0 mt-10">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(185,151,83,0.7)", marginBottom: 8 }}>
              {todayFull}
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: "white", margin: "0 0 4px", lineHeight: 1.2 }}>
              {salutation}, {profile?.prenom} 👋
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
              {typeContratLabel}
              {prof?.disciplines?.length ? ` · ${prof.disciplines.join(", ")}` : ""}
            </p>

            {/* Stats clés */}
            <div className="flex items-end gap-10">
              {[
                { value: stats.coursEffectuesMois, label: "cours ce mois", icon: <CalendarDays size={13} /> },
                { value: stats.creneauxDisponibles, label: "créneaux ouverts", icon: <Clock size={13} /> },
                { value: stats.montantEstime !== null ? `${stats.montantEstime} €` : "—", label: "revenus estimés", icon: <Wallet size={13} /> },
              ].map(s => (
                <div key={s.label} className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {s.icon}
                    <span className="text-[10px] uppercase tracking-[0.18em]">{s.label}</span>
                  </div>
                  <span className="text-3xl font-semibold text-white leading-none">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Droite : photo */}
          {photoSrc && (
            <div className="relative flex-shrink-0 self-end">
              <div className="absolute -bottom-2 -right-2 rounded-full"
                style={{ width: "220px", height: "220px", background: "linear-gradient(135deg, rgba(185,151,83,0.3) 0%, rgba(22,92,71,0.2) 100%)", border: "1px solid rgba(185,151,83,0.2)" }} />
              <div className="absolute -bottom-1 -right-1 rounded-full"
                style={{ width: "200px", height: "200px", background: "linear-gradient(135deg, rgba(14,50,34,0.8) 0%, transparent 70%)" }} />
              <div className="relative overflow-hidden"
                style={{ width: "190px", height: "220px", borderRadius: "100px 100px 80px 80px", border: "2px solid rgba(185,151,83,0.25)" }}>
                <img src={photoSrc} alt={profile?.prenom ?? ""} className="w-full h-full object-cover"
                  style={{ objectPosition: "center top" }} />
                <div className="absolute bottom-0 left-0 right-0 h-12"
                  style={{ background: "linear-gradient(0deg, rgba(8,20,14,0.6), transparent)" }} />
              </div>
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-[10px] font-semibold"
                style={{ background: "rgba(8,20,14,0.85)", border: "1px solid rgba(185,151,83,0.3)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>
                {typeContratLabel}
              </div>
            </div>
          )}

          {/* Placeholder avatar si pas de photo */}
          {!photoSrc && (
            <div className="flex-shrink-0 w-[120px] h-[120px] rounded-full flex items-center justify-center text-3xl font-bold mb-4"
              style={{ background: "rgba(22,92,71,0.4)", border: "2px solid rgba(185,151,83,0.25)", color: "rgb(185,151,83)" }}>
              {(profile?.prenom?.[0] ?? "") + (profile?.nom?.[0] ?? "")}
            </div>
          )}
        </div>
      </div>

      {/* ══ ALERTE PAS DE CONTRAT ════════════════════════════════════════════ */}
      {!contrat && (
        <div className="px-10 lg:px-14 pt-5">
          <div className="rounded-[16px] border px-5 py-4 flex items-center gap-3"
            style={{ background: "rgba(185,151,83,0.08)", borderColor: "rgba(185,151,83,0.3)" }}>
            <AlertCircle size={16} style={{ color: "rgb(185,151,83)", flexShrink: 0 }} />
            <p className="text-sm text-black/70">
              Aucun contrat actif trouvé. Contacte la direction pour régulariser ta situation.
            </p>
          </div>
        </div>
      )}

      {/* ══ GRILLE PRINCIPALE ════════════════════════════════════════════════ */}
      <div className="flex-1 px-10 lg:px-14 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── COLONNE PRINCIPALE ── */}
        <div className="space-y-6">

          {/* Modules */}
          <section>
            <SectionLabel>Modules</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { href: "/plateforme/prof/planning",     icon: <CalendarDays size={20} />, label: "Planning",      sub: "Tes cours collectifs & individuels" },
                { href: "/plateforme/prof/creneaux",     icon: <Clock size={20} />,        label: "Créneaux",      sub: stats.creneauxDisponibles > 0 ? `${stats.creneauxDisponibles} disponibles` : "Aucun ouvert" },
                { href: "/plateforme/prof/eleves",       icon: <Users size={20} />,        label: "Élèves",        sub: "Tes élèves & notes" },
                { href: "/plateforme/prof/remuneration", icon: <Wallet size={20} />,       label: "Rémunération",  sub: stats.montantEstime !== null ? `${stats.montantEstime} € estimés` : "À calculer" },
                { href: "/plateforme/messages",          icon: <MessageSquare size={20} />, label: "Messages",     sub: stats.messagesNonLus > 0 ? `${stats.messagesNonLus} non lu(s)` : "Aucun message" },
                { href: "/plateforme/prof/profil",       icon: <UserCircle size={20} />,   label: "Mon profil",    sub: "Profil, préférences & documents" },
              ].map(m => (
                <Link key={m.href} href={m.href}
                  className="group rounded-[18px] border border-black/6 bg-white p-5 flex flex-col gap-3 transition-all hover:-translate-y-px hover:shadow-md"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)" }}>
                    {m.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black group-hover:text-[rgb(22,92,71)] transition-colors">{m.label}</p>
                    <p className="text-xs text-black/40 mt-0.5 leading-4">{m.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Prochains cours */}
          <section>
            <SectionLabel href="/plateforme/prof/planning" hrefLabel="Voir tout">
              Prochains cours
            </SectionLabel>
            <div className="rounded-[18px] border border-black/6 bg-white overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {prochainsCours.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-2xl mb-3">📅</p>
                  <p className="text-sm font-medium text-black/50 mb-1">Aucun cours à venir</p>
                  <p className="text-xs text-black/35 leading-5 mb-4">
                    Crée des créneaux pour que tes élèves puissent réserver.
                  </p>
                  <Link href="/plateforme/prof/creneaux"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(22,92,71)] px-4 py-2 text-xs font-semibold !text-white transition hover:bg-[rgb(18,75,58)]">
                    <Plus size={12} /> Ouvrir des créneaux
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {prochainsCours.map((cours) => {
                    const debut = new Date(cours.debut);
                    const fin = new Date(cours.fin);
                    return (
                      <div key={cours.id} className="px-5 py-3.5 flex items-center gap-4">
                        <div className="w-10 shrink-0 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-black/30">
                            {debut.toLocaleDateString("fr-BE", { weekday: "short" })}
                          </p>
                          <p className="text-lg font-semibold text-black leading-none mt-0.5">{debut.getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-black truncate">{cours.discipline}</p>
                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                              style={{
                                background: cours.type === "collectif" ? "rgba(185,151,83,0.15)" : "rgba(22,92,71,0.1)",
                                color: cours.type === "collectif" ? "rgb(146,95,14)" : "rgb(22,92,71)",
                              }}>
                              {cours.type === "collectif" ? "Collectif" : "Individuel"}
                            </span>
                          </div>
                          <p className="text-xs text-black/40 mt-0.5">
                            {debut.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                            {" → "}
                            {fin.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                            {cours.salle ? ` · ${cours.salle}` : ""}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-black/20 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── COLONNE DROITE ── */}
        <div className="space-y-4">

          {/* Suivi heures minimum contractuelles */}
          {contrat?.heures_min_periode && (
            <section>
              <SectionLabel noMargin>Engagement contractuel</SectionLabel>
              <div className="mt-3 rounded-[16px] border border-black/6 bg-white p-4"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                {(() => {
                  const heuresFaites = stats.heuresOuvertesPeriode ?? 0;
                  const heuresMin = contrat.heures_min_periode;
                  const pct = Math.min(100, Math.round((heuresFaites / heuresMin) * 100));
                  const enRetard = pct < 100 && stats.joursRestantsPeriode !== undefined && stats.joursRestantsPeriode <= 7;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-black/40">
                          Créneaux ouverts / {contrat.periode_engagement ?? "3 mois"}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: pct >= 100 ? "rgb(22,92,71)" : enRetard ? "rgb(220,38,38)" : "rgb(8,20,14)" }}>
                          {heuresFaites}h / {heuresMin}h
                        </p>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${pct}%`,
                          background: pct >= 100 ? "rgb(22,92,71)" : enRetard ? "rgb(220,38,38)" : "rgb(185,151,83)",
                        }} />
                      </div>
                      {stats.joursRestantsPeriode !== undefined && (
                        <p className="text-[11px] text-black/35 mt-2">
                          {pct >= 100
                            ? "Objectif atteint pour cette période ✓"
                            : `${stats.joursRestantsPeriode} jour${stats.joursRestantsPeriode > 1 ? "s" : ""} restant${stats.joursRestantsPeriode > 1 ? "s" : ""}`}
                        </p>
                      )}
                      {enRetard && (
                        <Link href="/plateforme/prof/creneaux/nouveau"
                          className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[rgb(22,92,71)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(18,75,58)]">
                          <Plus size={12} /> Ouvrir des créneaux
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            </section>
          )}

          {/* Info contrat */}
          {contrat && (
            <section>
              <SectionLabel noMargin>Mon contrat</SectionLabel>
              <div className="mt-3 rounded-[16px] border border-black/6 bg-white p-4 space-y-3"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                {[
                  { label: "Type", value: typeContratLabel },
                  contrat.salaire_fixe ? { label: "Fixe mensuel", value: `${contrat.salaire_fixe} €` } : null,
                  contrat.tarif_cours_indiv ? { label: "Tarif / cours", value: `${contrat.tarif_cours_indiv} €` } : null,
                  { label: "Depuis", value: new Date(contrat.date_debut).toLocaleDateString("fr-BE", { month: "long", year: "numeric" }) },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <p className="text-xs text-black/40">{row.label}</p>
                    <p className="text-xs font-semibold text-black">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children, href, hrefLabel, noMargin }: {
  children: React.ReactNode; href?: string; hrefLabel?: string; noMargin?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${noMargin ? "" : "mb-3"}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(0,0,0,0.3)" }}>
        {children}
      </p>
      {href && hrefLabel && (
        <Link href={href} className="text-[11px] font-semibold transition-colors hover:underline"
          style={{ color: "rgb(22,92,71)" }}>
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}