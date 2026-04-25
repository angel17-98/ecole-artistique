"use client";

import { useState } from "react";
import Link from "next/link";
import PlatformShell, { ShellProfile, ShellEleve, BadgePremium, Avatar } from "@/app/components/plateforme/PlatformShell";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface NoteCours {
  id: string;
  cours_id: string;
  contenu: string;
  created_at: string;
  visible_eleve: boolean;
  cours?: {
    discipline: string;
    date_heure_debut: string;
    parcours_nom?: string;
  };
  prof?: {
    prenom: string;
    nom: string;
  };
}

interface Progression {
  id: string;
  parcours_id: string;
  parcours_nom?: string;
  objectifs: string[];
  commentaires: Array<{ date: string; contenu: string; prof_prenom?: string; prof_nom?: string }>;
  updated_at: string;
}

interface Media {
  id: string;
  url: string;
  type: "photo" | "video";
  nom: string;
  date: string;
  discipline?: string;
}

interface Fidelite {
  id: string;
  type_carte: string;
  compteur: number;
  total_offerts: number;
}

interface DossierProps {
  profile: ShellProfile;
  eleves: ShellEleve[];
  notes: NoteCours[];
  progressions: Progression[];
  medias: Media[];
  fidelite: Fidelite[];
  activeEleveId: string;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const DISCIPLINE_COLORS: Record<string, string> = {
  "Chant": "text-emerald-600",
  "Danse": "text-violet-600",
  "Théâtre": "text-amber-600",
  "Comédie musicale": "text-rose-600",
  "Studio": "text-cyan-600",
  "default": "text-[rgb(22,92,71)]",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateCourt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" });
}

// ─── ONGLETS ──────────────────────────────────────────────────────────────────
type Onglet = "notes" | "progression" | "fidelite" | "medias";

const ONGLETS: { id: Onglet; label: string; icon: string }[] = [
  { id: "notes",       label: "Notes profs",   icon: "📝" },
  { id: "progression", label: "Progression",   icon: "📈" },
  { id: "fidelite",   label: "Fidélité",       icon: "★" },
  { id: "medias",      label: "Médias",         icon: "🖼" },
];

// ─── NOTES PROFS ──────────────────────────────────────────────────────────────
function SectionNotes({ notes }: { notes: NoteCours[] }) {
  const [filter, setFilter] = useState<string>("Toutes");
  const disciplines = ["Toutes", ...Array.from(new Set(notes.map(n => n.cours?.discipline ?? "Autre")))];

  const filtered = filter === "Toutes" ? notes : notes.filter(n => (n.cours?.discipline ?? "Autre") === filter);

  if (notes.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
        <p className="text-3xl mb-3">📝</p>
        <p className="text-sm font-medium text-black/60 mb-1">Aucune note pour l'instant</p>
        <p className="text-xs text-black/35 leading-5">
          Les commentaires de vos professeurs après chaque cours apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres disciplines */}
      {disciplines.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {disciplines.map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                filter === d
                  ? "bg-[rgb(22,92,71)] text-white"
                  : "border border-black/10 text-black/50 hover:border-[rgb(22,92,71)]/30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-3">
        {filtered
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map(note => (
            <div key={note.id} className="rounded-[18px] border border-black/6 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {note.prof && (
                  <Avatar prenom={note.prof.prenom} nom={note.prof.nom} size="sm" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {note.prof && (
                      <p className="text-xs font-semibold text-black">
                        {note.prof.prenom} {note.prof.nom}
                      </p>
                    )}
                    <span className="text-[10px] text-black/30">·</span>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${DISCIPLINE_COLORS[note.cours?.discipline ?? "default"]}`}>
                      {note.cours?.discipline ?? "Cours"}
                    </p>
                  </div>
                  <p className="text-[10px] text-black/35 mt-0.5">
                    {note.cours?.date_heure_debut ? formatDate(note.cours.date_heure_debut) : formatDate(note.created_at)}
                  </p>
                </div>
              </div>

              {/* Contenu */}
              <div className="rounded-[12px] bg-[rgb(247,249,247)] px-4 py-3 border-l-2 border-[rgb(22,92,71)]/30">
                <p className="text-sm text-black/75 leading-6">{note.contenu}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── PROGRESSION ─────────────────────────────────────────────────────────────
function SectionProgression({ progressions }: { progressions: Progression[] }) {
  if (progressions.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
        <p className="text-3xl mb-3">📈</p>
        <p className="text-sm font-medium text-black/60 mb-1">Dossier de progression vide</p>
        <p className="text-xs text-black/35 leading-5">
          La direction et vos professeurs construiront ici votre dossier de suivi au fil de l'année.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {progressions.map(prog => (
        <div key={prog.id} className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          {/* Parcours */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[rgb(239,244,239)] text-base">🎓</div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">Parcours</p>
              <p className="text-sm font-semibold text-black">{prog.parcours_nom ?? "Parcours annuel"}</p>
            </div>
            <p className="ml-auto text-[10px] text-black/30">
              Mis à jour le {formatDateCourt(prog.updated_at)}
            </p>
          </div>

          {/* Objectifs */}
          {prog.objectifs.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35 mb-2">Objectifs de l'année</p>
              <ul className="space-y-1.5">
                {prog.objectifs.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-black/70">
                    <span className="mt-0.5 text-[rgb(22,92,71)] shrink-0">◆</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Historique commentaires */}
          {prog.commentaires.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35 mb-3">Suivi de progression</p>
              <div className="relative pl-4 border-l-2 border-[rgb(22,92,71)]/20 space-y-4">
                {prog.commentaires
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((c, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full bg-[rgb(22,92,71)]/30 border-2 border-[rgb(22,92,71)]" />
                      <p className="text-[10px] text-black/35 mb-1">
                        {formatDate(c.date)}{c.prof_prenom && ` · ${c.prof_prenom} ${c.prof_nom ?? ""}`}
                      </p>
                      <p className="text-sm text-black/70 leading-6">{c.contenu}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── FIDÉLITÉ ─────────────────────────────────────────────────────────────────
function SectionFidelite({ fidelite }: { fidelite: Fidelite[] }) {
  const carteCours = fidelite.find(f => f.type_carte === "cours_individuels");
  const carteLocation = fidelite.find(f => f.type_carte === "location_salles");

  function CarteFideliteDetail({ carte, label, description, icon }: {
    carte: Fidelite | undefined;
    label: string;
    description: string;
    icon: string;
  }) {
    const compteur = carte?.compteur ?? 0;
    const totalOfferts = carte?.total_offerts ?? 0;
    const total = 10;
    const isFull = compteur >= total;
    const pct = Math.min((compteur / total) * 100, 100);

    return (
      <div className={`rounded-[20px] border-2 p-6 transition-all ${
        isFull
          ? "border-[rgb(185,151,83)] bg-[rgb(185,151,83)]/5 shadow-[0_4px_20px_rgba(185,151,83,0.15)]"
          : "border-black/6 bg-white shadow-[0_2px_12px_rgba(16,16,16,0.04)]"
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35 mb-1">Carte fidélité</p>
            <p className="text-sm font-semibold text-black">{label}</p>
            <p className="text-xs text-black/40 mt-0.5">{description}</p>
          </div>
          <span className={`text-2xl ${isFull ? "animate-bounce" : ""}`}>{icon}</span>
        </div>

        {/* MATURITÉ — Célébration */}
        {isFull && (
          <div className="mb-5 rounded-[16px] bg-[rgb(185,151,83)] p-4 text-center">
            <p className="text-lg font-bold text-white mb-1">🎉 Séance gratuite disponible !</p>
            <p className="text-xs text-white/80 leading-4 mb-3">
              Vous avez atteint 10 séances. Votre prochaine séance est offerte.
            </p>
            <Link
              href="/cours/cours-individuels"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-[rgb(185,151,83)] transition hover:bg-white/90"
            >
              Réserver ma séance gratuite →
            </Link>
          </div>
        )}

        {/* Tampons visuels */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-9 rounded-[10px] flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < compteur
                  ? isFull
                    ? "bg-[rgb(185,151,83)] text-white shadow-[0_2px_8px_rgba(185,151,83,0.3)]"
                    : "bg-[rgb(22,92,71)] text-white shadow-[0_2px_8px_rgba(22,92,71,0.2)]"
                  : "bg-black/4 text-black/15"
              }`}
            >
              {i < compteur ? "★" : "·"}
            </div>
          ))}
        </div>

        {/* Barre de progression */}
        <div className="h-1.5 rounded-full bg-black/6 mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isFull ? "bg-[rgb(185,151,83)]" : "bg-[rgb(22,92,71)]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-black/45">
            {isFull ? "Compteur à 10 !" : `${compteur} / ${total} séances`}
          </p>
          <p className="text-xs text-black/35">
            {totalOfferts > 0 && `${totalOfferts} offerte${totalOfferts > 1 ? "s" : ""} au total`}
          </p>
        </div>

        {/* CTA si pas à maturité */}
        {!isFull && (
          <div className="mt-4 pt-4 border-t border-black/5">
            <p className="text-xs text-black/40">
              {total - compteur} séance{total - compteur > 1 ? "s" : ""} encore avant votre prochaine récompense.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CarteFideliteDetail
        carte={carteCours}
        label="Cours individuels"
        description="10 cours payés = 1 cours offert"
        icon="🎵"
      />
      <CarteFideliteDetail
        carte={carteLocation}
        label="Location de salles"
        description="10 locations payées = 1 location offerte"
        icon="🏠"
      />

      {/* Règles */}
      <div className="rounded-[16px] border border-black/5 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30 mb-2">Fonctionnement</p>
        <ul className="space-y-1.5 text-xs text-black/50 leading-5">
          <li>◆ Le compteur est remis à zéro après chaque séance gratuite obtenue</li>
          <li>◆ La séance gratuite est utilisable sur n'importe quelle discipline disponible</li>
          <li>◆ Le suivi est automatique — aucune carte physique nécessaire</li>
          <li>◆ Les deux cartes sont indépendantes (cours vs location)</li>
        </ul>
      </div>
    </div>
  );
}

// ─── MÉDIAS ───────────────────────────────────────────────────────────────────
function SectionMedias({ medias }: { medias: Media[] }) {
  const [selected, setSelected] = useState<Media | null>(null);

  if (medias.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
        <p className="text-3xl mb-3">🖼</p>
        <p className="text-sm font-medium text-black/60 mb-1">Aucun média pour l'instant</p>
        <p className="text-xs text-black/35 leading-5">
          Les photos et vidéos prises lors de vos cours et spectacles seront disponibles ici.
        </p>
      </div>
    );
  }

  const photos = medias.filter(m => m.type === "photo");
  const videos = medias.filter(m => m.type === "video");

  return (
    <>
      {/* Modale lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm"
            >
              ✕ Fermer
            </button>
            {selected.type === "photo" ? (
              <img src={selected.url} alt={selected.nom} className="w-full rounded-[16px] object-contain max-h-[80vh]" />
            ) : (
              <video src={selected.url} controls className="w-full rounded-[16px] max-h-[80vh]" />
            )}
            <p className="text-white/60 text-xs mt-3 text-center">{selected.nom} · {formatDateCourt(selected.date)}</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Photos */}
        {photos.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30 mb-3">Photos ({photos.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className="relative aspect-square rounded-[14px] overflow-hidden bg-black/5 group"
                >
                  <img src={m.url} alt={m.nom} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end">
                    <p className="text-[10px] text-white font-medium px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                      {m.discipline ?? m.nom}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vidéos */}
        {videos.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30 mb-3">Vidéos ({videos.length})</p>
            <div className="space-y-2">
              {videos.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className="w-full flex items-center gap-3 rounded-[14px] border border-black/6 bg-white p-3.5 text-left hover:bg-black/2 transition"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[rgb(239,244,239)] text-lg">▶</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">{m.nom}</p>
                    <p className="text-xs text-black/35 mt-0.5">{formatDateCourt(m.date)}{m.discipline && ` · ${m.discipline}`}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DossierClient({
  profile,
  eleves,
  notes,
  progressions,
  medias,
  fidelite,
  activeEleveId: initialEleveId,
}: DossierProps) {
  const [activeEleveId, setActiveEleveId] = useState(initialEleveId);
  const [onglet, setOnglet] = useState<Onglet>("notes");

  const activeEleve = eleves.find(e => e.id === activeEleveId) ?? eleves[0];
  const isPremium = activeEleve?.statut_premium ?? false;

  // Badges count
  const unreadNotes = notes.filter(n => n.visible_eleve).length;
  const fideliteFull = fidelite.filter(f => f.compteur >= 10).length;

  return (
    <PlatformShell profile={profile} eleves={eleves}>
      <div className="space-y-5">

        {/* ── EN-TÊTE ── */}
        <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Espace élève</p>
              <h1 className="mt-0.5 text-base font-semibold text-black flex items-center gap-2">
                Mon dossier
                {isPremium && <BadgePremium mini />}
              </h1>
            </div>

            {/* Sélecteur élève */}
            {eleves.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {eleves.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setActiveEleveId(e.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      activeEleveId === e.id
                        ? "bg-[rgb(22,92,71)] text-white"
                        : "border border-black/10 text-black/50 hover:border-[rgb(22,92,71)]/30"
                    }`}
                  >
                    {e.prenom}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ONGLETS ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ONGLETS.map(o => (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                onglet === o.id
                  ? "bg-[rgb(22,92,71)] text-white"
                  : "bg-white border border-black/10 text-black/55 hover:border-[rgb(22,92,71)]/30 hover:text-[rgb(22,92,71)]"
              }`}
            >
              <span>{o.icon}</span>
              {o.label}
              {/* Badges */}
              {o.id === "fidelite" && fideliteFull > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(185,151,83)] text-[8px] font-bold text-white">
                  {fideliteFull}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── CONTENU ONGLET ── */}
        {onglet === "notes" && <SectionNotes notes={notes.filter(n => n.visible_eleve)} />}
        {onglet === "progression" && <SectionProgression progressions={progressions} />}
        {onglet === "fidelite" && <SectionFidelite fidelite={fidelite} />}
        {onglet === "medias" && <SectionMedias medias={medias} />}
      </div>
    </PlatformShell>
  );
}