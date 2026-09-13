// app/plateforme/dashboard/DashboardClient.tsx
// FIX : statut "acceptee" supprimé — seul "validee" subsiste
"use client";

import Link from "next/link";
import {
  CalendarDays, Users, Star, FolderOpen, UserCircle, MessageSquare, ArrowRight,
} from "lucide-react";
import { STATUT_STYLE, statutAffiche, DisciplineIcon } from "../planning/CalendrierClient";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface CandidatureResume {
  id: string;
  parcours: string;
  statut: string;
  place_expire_at?: string | null;
}

interface Profile {
  prenom?: string | null;
  nom?: string | null;
}

interface CoursMini {
  id: string;
  discipline: string;
  date_heure_debut: string;
  date_heure_fin: string;
  statut: "planifie" | "annule" | "effectue";
}

interface ProchainCours {
  discipline: string;
  date_heure_debut: string;
  prof_prenom?: string;
  prof_nom?: string;
}

// ── BLOC SANS CANDIDATURE ─────────────────────────────────────────────────────
function BlocStatNonPremium({ candidaturesArrondies }: { candidaturesArrondies: number }) {
  const label =
    candidaturesArrondies > 0
      ? `+${candidaturesArrondies} candidats nous ont déjà fait confiance`
      : "Rejoins la prochaine promotion";

  const sousTitre =
    candidaturesArrondies > 0
      ? "Les places sont limitées à 15 élèves par groupe."
      : "Sois parmi les premiers à déposer ta candidature.";

  return (
    <Link
      href="/candidature"
      className="rounded-[20px] border border-[rgb(22,92,71)]/15 bg-[rgb(239,244,239)] p-5 flex items-center gap-5 hover:border-[rgb(22,92,71)]/30 hover:bg-[rgb(229,240,234)] transition-all group"
    >
      <div className="shrink-0 text-center min-w-[56px]">
        {candidaturesArrondies > 0 ? (
          <>
            <p className="text-2xl font-bold" style={{ color: "rgb(22,92,71)" }}>+{candidaturesArrondies}</p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-black/35">candidats</p>
          </>
        ) : (
          <span className="text-3xl">🎓</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-black leading-snug">{label}</p>
        <p className="text-xs text-black/50 mt-1">{sousTitre}</p>
      </div>
      <ArrowRight size={16} className="shrink-0 text-black/25 group-hover:text-[rgb(22,92,71)] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// ── BLOC STATUT CANDIDATURE ────────────────────────────────────────────────────
function BlocStatutCandidature({
  candidature, candidaturesArrondies,
}: {
  candidature: CandidatureResume | null;
  candidaturesArrondies: number;
}) {
  if (!candidature) return <BlocStatNonPremium candidaturesArrondies={candidaturesArrondies} />;

  const joursRestants = candidature.place_expire_at
    ? Math.max(0, Math.ceil((new Date(candidature.place_expire_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const configs: Record<string, {
    icon: string; titre: string; message: string; border: string; bg: string;
    urgent?: boolean; cta?: string; ctaHref?: string;
  } | undefined> = {
    en_attente: {
      icon: "⏳", titre: "Candidature en cours d'examen",
      message: "La direction étudie ton dossier — tu seras prévenu·e par email dès qu'il y a du nouveau.",
      border: "border-black/6", bg: "bg-white",
    },
    info_complementaire: {
      icon: "✉️", titre: "Information complémentaire demandée",
      message: "La direction a besoin d'un détail en plus pour continuer à traiter ta candidature.",
      border: "border-amber-200", bg: "bg-amber-50", cta: "Voir la demande →", ctaHref: "/plateforme/messages",
    },
    validee: {
      icon: "✅", titre: "Candidature validée",
      message: "Ton dossier est validé — la direction te recontactera pour la suite (place disponible ou liste d'attente).",
      border: "border-emerald-200", bg: "bg-emerald-50",
    },
    liste_attente: {
      icon: "🕓", titre: "Sur liste d'attente",
      message: "Ton dossier est validé mais toutes les places sont prises pour l'instant — tu seras contacté·e si une place se libère.",
      border: "border-black/6", bg: "bg-white",
    },
    place_proposee: {
      icon: "🎉", titre: "Une place t'est proposée !",
      message: "Confirme rapidement pour la garantir.",
      border: "border-red-200", bg: "bg-red-50", urgent: true, cta: "Confirmer ma place →", ctaHref: "/plateforme/messages",
    },
    inscrit: {
      icon: "🌟", titre: "Inscription confirmée",
      message: "Bienvenue dans le parcours ! Ton compte est maintenant premium.",
      border: "border-[rgb(22,92,71)]/20", bg: "bg-[rgb(239,244,239)]",
    },
    refusee: undefined,
    expiree: {
      icon: "⌛", titre: "Ta place proposée a expiré",
      message: "Le délai de confirmation est passé. Tu peux repostuler lors d'une prochaine ouverture.",
      cta: "Repostuler →", ctaHref: "/candidature", border: "border-black/6", bg: "bg-white",
    },
    sans_reponse: undefined,
  };

  const config = configs[candidature.statut];
  if (!config) return <BlocStatNonPremium candidaturesArrondies={candidaturesArrondies} />;

  return (
    <div
      className={`rounded-[20px] border ${config.border} ${config.bg} p-5 ${
        config.urgent ? "shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-black leading-snug">{config.titre}</p>
          <p className="text-xs text-black/60 mt-1.5 leading-5">{config.message}</p>

          {candidature.statut === "place_proposee" && joursRestants !== null && (
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-red-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-all"
                  style={{ width: `${Math.min(100, (joursRestants / 5) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-red-600 font-semibold mt-1">
                {joursRestants === 0 ? "Expire aujourd'hui" : `${joursRestants}j restants`}
              </p>
            </div>
          )}

          {config.cta && config.ctaHref && (
            <Link
              href={config.ctaHref}
              className={`mt-3 inline-flex items-center text-xs font-bold px-4 py-2 rounded-full transition ${
                config.urgent
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[rgb(22,92,71)] text-white hover:bg-[rgb(18,76,58)]"
              }`}
            >
              {config.cta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SECTION LABEL ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: "rgba(0,0,0,0.3)" }}>
      {children}
    </p>
  );
}

function formatDateCourt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}
function formatHeure(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

// ── MINI-WIDGET PLANNING ───────────────────────────────────────────────────────
// Remplace l'ancienne tuile "Planning" (juste un lien) — aperçu réel de la
// semaine avec les mêmes couleurs de statut que la page Planning, + le
// prochain cours en détail, + un bouton vers le Planning complet.
function MiniPlanningWidget({ coursSemaine, prochainCours }: { coursSemaine: CoursMini[]; prochainCours: ProchainCours | null }) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Les 7 prochains jours à partir d'aujourd'hui, pas la semaine civile
  // (lundi-dimanche n'a aucun sens un dimanche : on verrait déjà 6 jours
  // passés). Décision d'Angélie le 13/09/2026.
  const jours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return d;
  });

  function coursOfDay(d: Date) {
    return coursSemaine.filter((c) => {
      const cd = new Date(c.date_heure_debut);
      return cd.toDateString() === d.toDateString();
    });
  }

  return (
    <Link
      href="/plateforme/planning"
      className="group rounded-[20px] border border-black/6 bg-white p-5 flex flex-col gap-4 transition-all hover:-translate-y-px hover:shadow-md"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)" }}>
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-black group-hover:text-[rgb(22,92,71)] transition-colors">Planning</p>
            <p className="text-xs text-black/40">Cette semaine</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-black/25 group-hover:text-[rgb(22,92,71)] group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Mini semaine — 7 pastilles, mêmes couleurs que le calendrier Planning */}
      <div className="grid grid-cols-7 gap-1.5">
        {jours.map((d, i) => {
          const dc = coursOfDay(d);
          const isToday = d.toDateString() === now.toDateString();
          const principal = dc[0];
          const label = isToday ? "Auj." : d.toLocaleDateString("fr-BE", { weekday: "short" }).replace(".", "");
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className={`text-[9px] font-semibold uppercase ${isToday ? "text-[rgb(22,92,71)]" : "text-black/30"}`}>
                {label}
              </span>
              {principal ? (
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: STATUT_STYLE[statutAffiche(principal as any)].dot }}
                >
                  <DisciplineIcon discipline={principal.discipline} size={13} className="text-white" />
                </span>
              ) : (
                <span className={`h-6 w-6 rounded-full border ${isToday ? "border-[rgb(22,92,71)]/30" : "border-black/8"}`} />
              )}
              {dc.length > 1 && <span className="text-[8px] font-bold text-black/30">+{dc.length - 1}</span>}
            </div>
          );
        })}
      </div>

      {/* Prochain cours */}
      <div className="rounded-[12px] px-3.5 py-2.5" style={{ background: "rgb(249,250,249)" }}>
        {prochainCours ? (
          <p className="text-xs text-black/60">
            <span className="font-semibold text-black">Prochain cours</span> · {prochainCours.discipline}
            {" "}· {formatDateCourt(prochainCours.date_heure_debut)} à {formatHeure(prochainCours.date_heure_debut)}
            {(prochainCours.prof_prenom || prochainCours.prof_nom) && ` · ${prochainCours.prof_prenom ?? ""} ${prochainCours.prof_nom ?? ""}`.trim()}
          </p>
        ) : (
          <p className="text-xs text-black/40">Aucun cours prévu prochainement.</p>
        )}
      </div>
    </Link>
  );
}

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardClient({
  profile, nbEleves, nbPremium, candidature, candidaturesArrondies, coursSemaine, prochainCours,
}: {
  profile: Profile | null;
  nbEleves: number;
  nbPremium: number;
  candidature: CandidatureResume | null;
  candidaturesArrondies: number;
  coursSemaine: CoursMini[];
  prochainCours: ProchainCours | null;
}) {
  const heure = new Date().getHours();
  const salutation = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";
  const todayFull = new Date().toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <div className="px-10 lg:px-14"
        style={{
          paddingTop: "calc(96px + 0px)",
          minHeight: "280px",
          background: "linear-gradient(135deg, rgb(8,20,14) 0%, rgb(12,40,28) 60%, rgb(18,55,38) 100%)",
        }}>
        <div className="relative flex items-end justify-between py-8 gap-6">

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, rgb(185,151,83) 0%, transparent 70%)" }} />
            <div className="absolute right-40 bottom-0 w-48 h-48 rounded-full opacity-5"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          </div>

          <div className="flex-1 min-w-0 mt-10">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(185,151,83,0.7)", marginBottom: 8 }}>
              {todayFull}
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: "white", margin: "0 0 4px", lineHeight: 1.2 }}>
              {salutation}{profile?.prenom ? `, ${profile.prenom}` : ""} 👋
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
              Espace élève · {nbEleves} élève{nbEleves > 1 ? "s" : ""} dans le foyer
            </p>

            {/* Stats clés */}
            <div className="flex items-end gap-10 flex-wrap">
              {[
                { value: nbEleves, label: nbEleves > 1 ? "élèves" : "élève", icon: <Users size={13} /> },
                { value: nbPremium, label: "en parcours premium", icon: <Star size={13} /> },
                { value: prochainCours ? formatDateCourt(prochainCours.date_heure_debut) : "—", label: "prochaine séance", icon: <CalendarDays size={13} /> },
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
        </div>
      </div>

      {/* ══ GRILLE PRINCIPALE ════════════════════════════════════════════════ */}
      <div className="flex-1 px-10 lg:px-14 py-6 space-y-6">

        {/* Statut candidature */}
        <section>
          <SectionLabel>Ma candidature</SectionLabel>
          <BlocStatutCandidature candidature={candidature} candidaturesArrondies={candidaturesArrondies} />
        </section>

        {/* Planning — widget dédié, plus riche qu'une simple tuile */}
        <section>
          <SectionLabel>Planning</SectionLabel>
          <MiniPlanningWidget coursSemaine={coursSemaine} prochainCours={prochainCours} />
        </section>

        {/* Modules restants */}
        <section>
          <SectionLabel>Espace élève</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: "/plateforme/dossier", icon: <FolderOpen size={20} />, label: "Dossier", sub: "Notes & progression" },
              { href: "/plateforme/mon-compte", icon: <UserCircle size={20} />, label: "Mon compte", sub: "Foyer & élèves" },
              { href: "/plateforme/messages", icon: <MessageSquare size={20} />, label: "Messages", sub: "Profs & direction" },
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
      </div>
    </div>
  );
}