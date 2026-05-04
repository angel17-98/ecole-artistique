// app/plateforme/direction/DirectionDashboardClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

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
  return `Il y a ${diff} jours`;
}

function formatDeadline(dateStr?: string) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const diff = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `En retard de ${Math.abs(diff)}j`, urgent: true };
  if (diff === 0) return { label: "Aujourd'hui", urgent: true };
  if (diff <= 3) return { label: `Dans ${diff}j`, urgent: true };
  return { label: date.toLocaleDateString("fr-BE", { day: "numeric", month: "short" }), urgent: false };
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical": "Éveil musical",
};

const CATS = [
  { id: "tous", label: "Tout" },
  { id: "candidatures", label: "Candidatures" },
  { id: "messages", label: "Messages" },
  { id: "todos", label: "To-dos" },
  { id: "famille", label: "Liens famille" },
];

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
  const [cat, setCat] = useState("tous");
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
  const today = new Date().toLocaleDateString("fr-BE", {
    weekday: "long", day: "numeric", month: "long",
  });

  // Construire la liste unifiée
  const allItems = [
    ...candidatures.map(c => ({ type: "candidature" as const, id: c.id, data: c })),
    ...liens.map(l => ({ type: "lien" as const, id: l.id, data: l })),
    ...todos.map(t => ({ type: "todo" as const, id: t.id, data: t })),
  ];

  const filtered = cat === "tous"
    ? allItems
    : allItems.filter(i => {
        if (cat === "candidatures") return i.type === "candidature";
        if (cat === "famille") return i.type === "lien";
        if (cat === "todos") return i.type === "todo";
        return true;
      });

  const counts = {
    tous: allItems.length,
    candidatures: candidatures.length,
    messages: stats.messagesNonLus,
    todos: todos.length,
    famille: liens.length,
  };

  return (
    <div className="min-h-screen bg-[rgb(239,244,239)]">

      {/* ── HERO DIRECTION ── */}
      <div className="relative overflow-hidden">
        {/* Fond dégradé vert profond → doré */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(12,38,28)_0%,rgb(22,92,71)_45%,rgb(185,151,83)_100%)]" />
        {/* Texture lumineuse */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,white,transparent_60%)]" />
        {/* Pattern géométrique subtil */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "24px 24px" }} />

        <div className="relative px-6 pt-10 pb-8 lg:px-10">
          {/* Navigation direction */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {[
              { label: "Tableau de bord", href: "/plateforme/direction" },
              { label: "Candidatures", href: "/plateforme/direction/candidatures" },
              { label: "Groupes", href: "/plateforme/direction/groupes" },
              { label: "Profs", href: "/plateforme/direction/profs" },
              { label: "Élèves", href: "/plateforme/direction/eleves" },
              { label: "Communication", href: "/plateforme/direction/communication" },
            ].map(nav => (
              <Link
                key={nav.href}
                href={nav.href}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
              >
                {nav.label}
              </Link>
            ))}
          </div>

          {/* Salutation */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50 mb-2">
              Espace direction
            </p>
            <h1 className="text-3xl font-semibold text-white mb-1">
              {salutation}, {profile?.prenom} 👋
            </h1>
            <p className="text-sm text-white/50 capitalize">{today}</p>
          </div>

          {/* Stats cards dans le hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Candidatures",
                value: stats.totalCandidatures,
                sub: `${stats.candidaturesAttente} en attente`,
                urgent: stats.candidaturesAttente > 0,
                href: "/plateforme/direction/candidatures",
              },
              {
                label: "Élèves actifs",
                value: stats.totalEleves,
                sub: "tous parcours",
                urgent: false,
                href: "/plateforme/direction/eleves",
              },
              {
                label: "Professeurs",
                value: stats.totalProfs,
                sub: "actifs",
                urgent: false,
                href: "/plateforme/direction/profs",
              },
              {
                label: "To-dos ouverts",
                value: stats.todosOuverts,
                sub: stats.todosEnRetard > 0 ? `${stats.todosEnRetard} en retard` : "à jour",
                urgent: stats.todosEnRetard > 0,
                href: "#todos",
              },
            ].map(s => (
              <Link
                key={s.label}
                href={s.href}
                className="group rounded-[16px] border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-4 transition hover:bg-white/20"
              >
                <p className="text-xs text-white/50 mb-1">{s.label}</p>
                <p className="text-3xl font-semibold text-white mb-1">{s.value}</p>
                <p className={`text-xs font-medium ${s.urgent ? "text-[rgb(250,199,117)]" : "text-white/40"}`}>
                  {s.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── ALERTES RAPIDES (messages non lus + liens famille) ── */}
      {(stats.messagesNonLus > 0 || stats.liensAttente > 0) && (
        <div className="px-6 lg:px-10 -mt-2 mb-2">
          <div className="flex gap-3 flex-wrap">
            {stats.messagesNonLus > 0 && (
              <Link
                href="/plateforme/direction/messages"
                className="flex items-center gap-2 rounded-full bg-[rgb(185,151,83)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(185,151,83,0.35)] transition hover:brightness-105"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {stats.messagesNonLus} message{stats.messagesNonLus > 1 ? "s" : ""} non lu{stats.messagesNonLus > 1 ? "s" : ""}
              </Link>
            )}
            {stats.liensAttente > 0 && (
              <Link
                href="/plateforme/direction/eleves?tab=liens"
                className="flex items-center gap-2 rounded-full bg-white border border-black/10 px-4 py-2 text-sm font-semibold text-black/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition hover:border-[rgb(22,92,71)]/30"
              >
                {stats.liensAttente} lien{stats.liensAttente > 1 ? "s" : ""} famille à valider
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="px-6 lg:px-10 py-6 max-w-5xl">

        {/* Filtres catégories */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CATS.map(c => {
            const count = counts[c.id as keyof typeof counts] ?? 0;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  cat === c.id
                    ? "bg-[rgb(22,92,71)] text-white shadow-[0_2px_8px_rgba(22,92,71,0.25)]"
                    : "bg-white border border-black/8 text-black/60 hover:border-[rgb(22,92,71)]/30"
                }`}
              >
                {c.label}
                {count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    cat === c.id ? "bg-white/20 text-white" : "bg-black/8 text-black/50"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Bouton ajouter todo */}
          <button
            onClick={() => {/* TODO: ouvrir modal */}}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-[rgb(185,151,83)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            + To-do
          </button>
        </div>

        {/* Liste des items */}
        <div className="space-y-2" id="todos">
          {filtered.length === 0 && (
            <div className="rounded-[20px] bg-white border border-black/6 p-10 text-center">
              <p className="text-sm text-black/40">Aucun élément dans cette catégorie.</p>
            </div>
          )}

          {filtered.map(item => {
            // ── CANDIDATURE ──
            if (item.type === "candidature") {
              const c = item.data as Candidature;
              const jours = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = jours >= 3;
              return (
                <Link
                  key={item.id}
                  href={`/plateforme/direction/candidatures/${c.id}`}
                  className="flex items-center gap-4 rounded-[16px] bg-white border border-black/6 px-5 py-4 transition hover:border-[rgb(22,92,71)]/20 hover:shadow-[0_2px_12px_rgba(22,92,71,0.08)] group"
                >
                  {/* Barre colorée gauche */}
                  <div className={`w-1 h-10 rounded-full flex-shrink-0 ${isUrgent ? "bg-red-400" : "bg-[rgb(185,151,83)]"}`} />
                  {/* Avatar initiales */}
                  <div className="w-9 h-9 rounded-full bg-[rgb(239,244,239)] flex items-center justify-center text-xs font-semibold text-[rgb(22,92,71)] flex-shrink-0">
                    {c.prenom[0]}{c.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-black/45 mt-0.5">{PARCOURS_LABELS[c.parcours] ?? c.parcours} · {joursDepuis(c.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isUrgent
                        ? "bg-red-50 text-red-600"
                        : "bg-[rgb(185,151,83)]/10 text-[rgb(185,151,83)]"
                    }`}>
                      {isUrgent ? "Urgent" : "En attente"}
                    </span>
                    <span className="text-black/25 group-hover:text-[rgb(22,92,71)] transition text-lg">›</span>
                  </div>
                </Link>
              );
            }

            // ── LIEN FAMILLE ──
            if (item.type === "lien") {
              const l = item.data as Lien;
              return (
                <Link
                  key={item.id}
                  href="/plateforme/direction/eleves?tab=liens"
                  className="flex items-center gap-4 rounded-[16px] bg-white border border-black/6 px-5 py-4 transition hover:border-[rgb(22,92,71)]/20 hover:shadow-[0_2px_12px_rgba(22,92,71,0.08)] group"
                >
                  <div className="w-1 h-10 rounded-full flex-shrink-0 bg-amber-400" />
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-xs font-semibold text-amber-700 flex-shrink-0">
                    {l.foyer?.nom_famille?.[0] ?? "F"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">Lien famille — {l.foyer?.nom_famille}</p>
                    <p className="text-xs text-black/45 mt-0.5">Élève : {l.eleve?.prenom} {l.eleve?.nom} · Preuve à vérifier</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-600">
                      À valider
                    </span>
                    <span className="text-black/25 group-hover:text-[rgb(22,92,71)] transition text-lg">›</span>
                  </div>
                </Link>
              );
            }

            // ── TODO ──
            if (item.type === "todo") {
              const t = item.data as Todo;
              const dl = formatDeadline(t.deadline);
              const isChecked = checkedTodos.has(t.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 rounded-[16px] bg-white border px-5 py-4 transition ${
                    isChecked ? "opacity-50 border-black/4" : "border-black/6 hover:border-[rgb(22,92,71)]/20 hover:shadow-[0_2px_12px_rgba(22,92,71,0.08)]"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(t.id)}
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition ${
                      isChecked
                        ? "bg-[rgb(22,92,71)] border-[rgb(22,92,71)]"
                        : dl?.urgent
                          ? "border-red-300 hover:border-red-400"
                          : "border-black/20 hover:border-[rgb(22,92,71)]"
                    }`}
                  >
                    {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isChecked ? "line-through text-black/30" : "text-black"}`}>
                      {t.titre}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.assignee_prenom && (
                        <span className="text-xs text-black/40">→ {t.assignee_prenom}</span>
                      )}
                      {t.categorie && (
                        <span className="rounded-full bg-[rgb(239,244,239)] px-2 py-0.5 text-[10px] font-medium text-[rgb(22,92,71)]">
                          {t.categorie}
                        </span>
                      )}
                    </div>
                  </div>

                  {dl && (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${
                      dl.urgent ? "bg-red-50 text-red-600" : "bg-[rgb(239,244,239)] text-black/50"
                    }`}>
                      {dl.label}
                    </span>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}