// app/plateforme/direction/DirectionDashboardClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/client";
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, Layers,
  Megaphone, MessageSquare, LogOut, ChevronRight,
  AlertCircle, Clock, CheckCircle2, Circle, Plus,
  TrendingUp, Calendar, FileText, Bell, Star, Home
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Stats {
  totalCandidatures: number;
  candidaturesAttente: number;
  totalEleves: number;
  totalProfs: number;
  todosOuverts: number;
  todosEnRetard: number;
  messagesNonLus: number;
  liensAttente: number;
}

interface Todo {
  id: string;
  titre: string;
  categorie: string;
  deadline?: string;
  assignee_prenom?: string;
  statut: string;
}

interface Candidature {
  id: string;
  prenom: string;
  nom: string;
  parcours: string;
  created_at: string;
  statut: string;
}

interface Lien {
  id: string;
  foyer: { nom_famille: string };
  eleve: { prenom: string; nom: string };
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function joursDepuis(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return `Il y a ${diff}j`;
}

function formatDeadline(dateStr?: string) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const diff = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `${Math.abs(diff)}j de retard`, urgent: true };
  if (diff === 0) return { label: "Aujourd'hui", urgent: true };
  if (diff <= 3) return { label: `Dans ${diff}j`, urgent: true };
  return { label: date.toLocaleDateString("fr-BE", { day: "numeric", month: "short" }), urgent: false };
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical": "Éveil musical",
};

// ─── MAPPING PHOTO PAR PRENOM ─────────────────────────────────────────────────
// Utilise les photos de la page équipe si pas de photo_url dans Supabase
function getProfilePhoto(prenom: string | null, photoUrl: string | null): string | null {
  if (photoUrl) return photoUrl;
  if (!prenom) return null;
  const map: Record<string, string> = {
    "Angélie": "/equipe/lisman-angelie.jpg",
    "Angelie": "/equipe/lisman-angelie.jpg",
    "Mélissa": "/equipe/delvaux-melissa.jpg",
    "Melissa": "/equipe/delvaux-melissa.jpg",
  };
  return map[prenom] ?? null;
}

// ─── NAV SIDEBAR ─────────────────────────────────────────────────────────────
const NAV = [
  { href: "/plateforme/direction", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/plateforme/direction/candidatures", icon: FileText, label: "Candidatures", alertKey: "candidaturesAttente" },
  { href: "/plateforme/direction/eleves", icon: Users, label: "Élèves" },
  { href: "/plateforme/direction/profs", icon: GraduationCap, label: "Profs" },
  { href: "/plateforme/direction/groupes", icon: Layers, label: "Groupes" },
  { href: "/plateforme/direction/communication", icon: Megaphone, label: "Communication" },
  { href: "/plateforme/messages", icon: MessageSquare, label: "Messages", alertKey: "messagesNonLus" },
];

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ stats, profile, photoSrc }: { stats: Stats; profile: any; photoSrc: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/plateforme/login");
  };

  return (
    <aside
      className="fixed left-0 z-30 w-[72px] flex flex-col items-center py-5 gap-0"
      style={{
        background: "rgb(8, 20, 14)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        top: "88px",
        bottom: 0,
      }}
    >
      {/* Logo CS */}
      <Link href="/" className="mb-5 flex items-center justify-center w-10 h-10 rounded-[12px]"
        style={{ background: "linear-gradient(135deg, rgb(22,92,71) 0%, rgb(30,115,88) 100%)" }}>
        <span className="text-[10px] font-black tracking-wider text-white">CS</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV.map(item => {
          const isActive = pathname === item.href || (item.href !== "/plateforme/direction" && pathname.startsWith(item.href));
          const alertCount = item.alertKey ? stats[item.alertKey as keyof Stats] as number : 0;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="group relative flex flex-col items-center justify-center w-full h-[52px] rounded-[12px] transition-all duration-200"
              style={{
                background: isActive ? "rgba(22,92,71,0.55)" : "transparent",
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? "rgb(185,151,83)" : "rgba(255,255,255,0.35)" }}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className="text-[8px] mt-1 font-medium tracking-wide"
                style={{ color: isActive ? "rgba(185,151,83,0.8)" : "rgba(255,255,255,0.25)" }}
              >
                {item.label.slice(0, 6)}
              </span>

              {/* Badge alerte */}
              {alertCount > 0 && (
                <span
                  className="absolute top-2 right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: "rgb(185,151,83)", color: "white" }}
                >
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}

              {/* Tooltip */}
              <span
                className="pointer-events-none absolute left-full ml-2 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ background: "rgb(8,20,14)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {item.label}
                {alertCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[8px]"
                    style={{ background: "rgb(185,151,83)" }}>
                    {alertCount}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Séparateur */}
      <div className="w-8 h-px mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Avatar utilisateur */}
      <div className="flex flex-col items-center gap-2 px-2 mb-2">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: "1.5px solid rgba(185,151,83,0.4)" }}>
          {photoSrc ? (
            <img src={photoSrc} alt={profile?.prenom ?? ""} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "rgba(22,92,71,0.5)", color: "rgb(185,151,83)" }}>
              {(profile?.prenom?.[0] ?? "") + (profile?.nom?.[0] ?? "")}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Déconnexion"
          className="flex items-center justify-center w-8 h-8 rounded-[10px] transition-all hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DirectionDashboardClient({
  profile, stats, todos, candidatures, liens,
}: {
  profile: any;
  stats: Stats;
  todos: Todo[];
  candidatures: Candidature[];
  liens: Lien[];
}) {
  const [checkedTodos, setCheckedTodos] = useState<Set<string>>(new Set());

  const toggleTodo = (id: string) => {
    setCheckedTodos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const heure = new Date().getHours();
  const salutation = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";
  const todayFull = new Date().toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  const photoSrc = getProfilePhoto(profile?.prenom, profile?.photo_url ?? null);

  const urgences = [
    stats.candidaturesAttente > 0 && {
      label: `${stats.candidaturesAttente} candidature${stats.candidaturesAttente > 1 ? "s" : ""} en attente`,
      href: "/plateforme/direction/candidatures",
      color: "amber",
    },
    stats.liensAttente > 0 && {
      label: `${stats.liensAttente} lien${stats.liensAttente > 1 ? "s" : ""} famille à valider`,
      href: "/plateforme/direction/eleves?tab=liens",
      color: "blue",
    },
    stats.todosEnRetard > 0 && {
      label: `${stats.todosEnRetard} to-do${stats.todosEnRetard > 1 ? "s" : ""} en retard`,
      href: "#todos",
      color: "red",
    },
  ].filter(Boolean) as { label: string; href: string; color: string }[];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "rgb(239,244,239)" }}>

      <div className="flex-1 flex flex-col min-w-0">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgb(8,20,14) 0%, rgb(14,50,34) 40%, rgb(22,72,52) 70%, rgb(185,151,83) 140%)",
            minHeight: "340px",
            paddingTop: "88px",
          }}
        >
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

          {/* Fade bas vers la page */}
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: "linear-gradient(0deg, rgb(239,244,239), transparent)" }} />

          {/* Contenu hero */}
          <div className="relative flex items-stretch px-10 lg:px-14 pt-8 pb-10">

            {/* ── Gauche : texte ── */}
            <div className="flex-1 flex flex-col justify-between pr-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.38em] mb-3"
                  style={{ color: "rgb(185,151,83)" }}>
                  Espace direction · Crea'Star
                </p>
                <h1 className="text-4xl lg:text-5xl font-semibold text-white leading-tight mb-1">
                  {salutation},<br />{profile?.prenom}
                </h1>
                <p className="text-sm capitalize mt-2" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {todayFull}
                </p>
                <p className="text-sm mt-1 font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {profile?.role === "direction" ? (
                    profile?.prenom === "Angélie" || profile?.prenom === "Angelie"
                      ? "Direction générale & pédagogique"
                      : "Direction artistique"
                  ) : "Direction"}
                </p>
              </div>

              {/* Stats clés sous la salutation */}
              <div className="flex items-end gap-10 mt-8">
                {[
                  { value: stats.totalEleves, label: "élèves actifs", icon: <Users size={13} /> },
                  { value: stats.totalProfs, label: "professeurs", icon: <GraduationCap size={13} /> },
                  { value: stats.totalCandidatures, label: "candidatures", icon: <FileText size={13} /> },
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

            {/* ── Droite : photo avec fond vert dégradé ── */}
            {photoSrc && (
              <div className="relative flex-shrink-0 self-end">
                {/* Cercle décoratif derrière la photo */}
                <div
                  className="absolute -bottom-2 -right-2 rounded-full"
                  style={{
                    width: "220px",
                    height: "220px",
                    background: "linear-gradient(135deg, rgba(185,151,83,0.3) 0%, rgba(22,92,71,0.2) 100%)",
                    border: "1px solid rgba(185,151,83,0.2)",
                  }}
                />
                {/* Cercle intérieur */}
                <div
                  className="absolute -bottom-1 -right-1 rounded-full"
                  style={{
                    width: "200px",
                    height: "200px",
                    background: "linear-gradient(135deg, rgba(14,50,34,0.8) 0%, transparent 70%)",
                  }}
                />
                {/* Photo */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    width: "190px",
                    height: "220px",
                    borderRadius: "100px 100px 80px 80px",
                    border: "2px solid rgba(185,151,83,0.25)",
                  }}
                >
                  <img
                    src={photoSrc}
                    alt={profile?.prenom ?? "Direction"}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center top" }}
                  />
                  {/* Overlay dégradé bas pour fondre dans la page */}
                  <div className="absolute bottom-0 left-0 right-0 h-12"
                    style={{ background: "linear-gradient(0deg, rgba(8,20,14,0.6), transparent)" }} />
                </div>

                {/* Badge rôle sur la photo */}
                <div
                  className="absolute -left-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: "rgba(8,20,14,0.85)",
                    border: "1px solid rgba(185,151,83,0.3)",
                    color: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {profile?.prenom === "Angélie" || profile?.prenom === "Angelie" ? "DG" : "DA"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ BANNIÈRES URGENCES ═══════════════════════════════════════════ */}
        {urgences.length > 0 && (
          <div className="px-10 lg:px-14 pt-5 flex gap-3 flex-wrap">
            {urgences.map(u => (
              <Link
                key={u.label}
                href={u.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-medium transition hover:-translate-y-px"
                style={{
                  background: "white",
                  border: `1px solid ${u.color === "amber" ? "rgba(185,151,83,0.3)" : u.color === "red" ? "rgba(220,38,38,0.2)" : "rgba(0,0,0,0.08)"}`,
                  color: u.color === "amber" ? "rgb(185,151,83)" : u.color === "red" ? "rgb(220,38,38)" : "rgba(0,0,0,0.6)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <AlertCircle size={14} />
                {u.label}
                <ChevronRight size={13} className="ml-1 opacity-50" />
              </Link>
            ))}
          </div>
        )}

        {/* ══ GRILLE PRINCIPALE ════════════════════════════════════════════ */}
        <div className="flex-1 px-10 lg:px-14 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── COLONNE PRINCIPALE ── */}
          <div className="space-y-6">

            {/* MODULES — cards de navigation */}
            <section>
              <SectionLabel>Modules</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    href: "/plateforme/direction/candidatures",
                    icon: <FileText size={20} />,
                    label: "Candidatures",
                    sub: stats.candidaturesAttente > 0
                      ? `${stats.candidaturesAttente} en attente · action requise`
                      : `${stats.totalCandidatures} au total`,
                    accent: stats.candidaturesAttente > 0,
                    dark: stats.candidaturesAttente > 0,
                  },
                  {
                    href: "/plateforme/direction/eleves",
                    icon: <Users size={20} />,
                    label: "Élèves",
                    sub: `${stats.totalEleves} inscrit${stats.totalEleves > 1 ? "s" : ""}`,
                    accent: false,
                    dark: false,
                  },
                  {
                    href: "/plateforme/direction/profs",
                    icon: <GraduationCap size={20} />,
                    label: "Professeurs",
                    sub: `${stats.totalProfs} actif${stats.totalProfs > 1 ? "s" : ""}`,
                    accent: false,
                    dark: false,
                  },
                  {
                    href: "/plateforme/direction/groupes",
                    icon: <Layers size={20} />,
                    label: "Groupes & Parcours",
                    sub: "Planifier · Organiser",
                    accent: false,
                    dark: false,
                  },
                  {
                    href: "/plateforme/direction/communication",
                    icon: <Megaphone size={20} />,
                    label: "Communication",
                    sub: "Annonces · Emails",
                    accent: false,
                    dark: false,
                  },
                  {
                    href: "/plateforme/messages",
                    icon: <MessageSquare size={20} />,
                    label: "Messages",
                    sub: stats.messagesNonLus > 0
                      ? `${stats.messagesNonLus} non lu${stats.messagesNonLus > 1 ? "s" : ""}`
                      : "Boîte de réception",
                    accent: stats.messagesNonLus > 0,
                    dark: stats.messagesNonLus > 0,
                    gold: stats.messagesNonLus > 0,
                  },
                ].map((m, i) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="group flex flex-col justify-between rounded-[20px] px-5 py-5 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      minHeight: "130px",
                      background: m.gold
                        ? "linear-gradient(135deg, rgb(150,118,55) 0%, rgb(185,151,83) 100%)"
                        : m.dark
                        ? "linear-gradient(135deg, rgb(8,20,14) 0%, rgb(18,65,45) 100%)"
                        : "white",
                      border: m.dark || m.gold ? "none" : "1px solid rgba(0,0,0,0.07)",
                      boxShadow: m.dark || m.gold
                        ? "0 4px 20px rgba(0,0,0,0.15)"
                        : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span style={{ color: m.gold ? "rgba(255,255,255,0.75)" : m.dark ? "rgba(185,151,83,0.8)" : "rgb(22,92,71)" }}>
                        {m.icon}
                      </span>
                      {m.accent && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ background: m.gold ? "rgba(255,255,255,0.6)" : "rgb(185,151,83)" }} />
                          <span className="relative inline-flex rounded-full h-2 w-2"
                            style={{ background: m.gold ? "white" : "rgb(185,151,83)" }} />
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold"
                        style={{ color: m.dark || m.gold ? "white" : "rgb(8,20,14)" }}>
                        {m.label}
                      </p>
                      <p className="text-[11px] mt-0.5"
                        style={{ color: m.dark || m.gold ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>
                        {m.sub}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* CANDIDATURES EN ATTENTE */}
            {candidatures.length > 0 && (
              <section>
                <SectionLabel href="/plateforme/direction/candidatures" hrefLabel="Tout voir">
                  Candidatures en attente
                </SectionLabel>
                <div className="rounded-[20px] overflow-hidden bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  {candidatures.slice(0, 5).map((c, i) => {
                    const jours = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = jours >= 3;
                    return (
                      <Link
                        key={c.id}
                        href={`/plateforme/direction/candidatures/${c.id}`}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgb(239,244,239)] group"
                        style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                      >
                        <div className="w-1 h-9 rounded-full flex-shrink-0"
                          style={{ background: isUrgent ? "rgb(220,38,38)" : "rgb(185,151,83)" }} />

                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)" }}
                        >
                          {c.prenom[0]}{c.nom[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black">{c.prenom} {c.nom}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                            {PARCOURS_LABELS[c.parcours] ?? c.parcours}
                          </p>
                        </div>

                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                          isUrgent ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                        }`}>
                          {joursDepuis(c.created_at)}
                        </span>

                        <ChevronRight size={15} className="text-black/20 group-hover:text-black/50 transition-colors flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* LIENS FAMILLE */}
            {liens.length > 0 && (
              <section>
                <SectionLabel href="/plateforme/direction/eleves?tab=liens" hrefLabel="Valider">
                  Liens famille à valider
                </SectionLabel>
                <div className="rounded-[20px] overflow-hidden bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  {liens.map((l, i) => (
                    <Link
                      key={l.id}
                      href="/plateforme/direction/eleves?tab=liens"
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgb(239,244,239)] group"
                      style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(185,151,83,0.1)" }}>
                        <UserCheck size={15} style={{ color: "rgb(185,151,83)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black">{l.eleve.prenom} {l.eleve.nom}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,0,0,0.4)" }}>Foyer {l.foyer.nom_famille}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
                        En attente
                      </span>
                      <ChevronRight size={15} className="text-black/20 group-hover:text-black/50 transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ── COLONNE DROITE ── */}
          <div className="space-y-5" id="todos">

            {/* TO-DOS */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel noMargin>To-dos</SectionLabel>
                <button
                  className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full transition hover:brightness-110"
                  style={{ background: "rgb(185,151,83)", color: "white" }}
                >
                  <Plus size={11} />
                  Ajouter
                </button>
              </div>

              <div
                className="rounded-[20px] overflow-hidden bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                {todos.length === 0 ? (
                  <div className="p-8 flex flex-col items-center gap-2">
                    <CheckCircle2 size={24} style={{ color: "rgb(22,92,71)" }} />
                    <p className="text-sm font-medium text-black/50">Tout est à jour</p>
                  </div>
                ) : (
                  todos.map((t, i) => {
                    const dl = formatDeadline(t.deadline);
                    const done = checkedTodos.has(t.id);
                    return (
                      <div
                        key={t.id}
                        className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-[rgb(239,244,239)]"
                        style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                        onClick={() => toggleTodo(t.id)}
                      >
                        <button
                          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all"
                          style={{
                            borderColor: done ? "rgb(22,92,71)" : dl?.urgent ? "rgba(220,38,38,0.4)" : "rgba(0,0,0,0.15)",
                            background: done ? "rgb(22,92,71)" : "transparent",
                          }}
                        >
                          {done && <CheckCircle2 size={10} style={{ color: "white" }} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-medium leading-snug transition-all ${done ? "line-through" : ""}`}
                            style={{ color: done ? "rgba(0,0,0,0.3)" : "black" }}>
                            {t.titre}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {t.categorie && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: "rgba(22,92,71,0.08)", color: "rgb(22,92,71)" }}>
                                {t.categorie}
                              </span>
                            )}
                            {dl && (
                              <span className="flex items-center gap-1 text-[10px] font-medium"
                                style={{ color: dl.urgent ? "rgb(220,38,38)" : "rgba(0,0,0,0.35)" }}>
                                <Clock size={9} />
                                {dl.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* RACCOURCIS */}
            <section>
              <SectionLabel noMargin>Actions rapides</SectionLabel>
              <div className="space-y-2 mt-3">
                {[
                  { label: "Créer un professeur", href: "/plateforme/direction/profs/nouveau", icon: <Plus size={14} /> },
                  { label: "Nouvelle annonce", href: "/plateforme/direction/communication", icon: <Megaphone size={14} /> },
                  { label: "Voir le planning", href: "/plateforme/direction/groupes", icon: <Calendar size={14} /> },
                  { label: "Valider liens famille", href: "/plateforme/direction/eleves?tab=liens", icon: <UserCheck size={14} /> },
                ].map(a => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all hover:-translate-y-px group bg-white"
                    style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                  >
                    <span style={{ color: "rgb(22,92,71)" }}>{a.icon}</span>
                    <span className="text-sm font-medium flex-1 text-black/70 group-hover:text-black transition-colors">
                      {a.label}
                    </span>
                    <ChevronRight size={14} className="text-black/20 group-hover:text-black/50 transition-colors" />
                  </Link>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION LABEL ─────────────────────────────────────────────────────────────
function SectionLabel({
  children, href, hrefLabel, noMargin
}: {
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