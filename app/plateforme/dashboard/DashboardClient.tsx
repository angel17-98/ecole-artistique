"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── TYPES ───────────────────────────────────────────────────
interface Profile { id: string; role: string; prenom: string | null; nom: string | null; }
interface Eleve { id: string; prenom: string; nom: string; statut_premium: boolean; }
interface Foyer { id: string; nom_famille: string; }
interface Fidelite { id: string; type_carte: string; compteur: number; total_offerts: number; }
interface Props { profile: Profile; foyer: Foyer; eleves: Eleve[]; fidelite: Fidelite[]; }

// ─── NAV ITEMS ───────────────────────────────────────────────
const navItems = [
  { href: "/plateforme/dashboard", label: "Accueil", icon: "⌂" },
  { href: "/plateforme/planning", label: "Planning", icon: "◈" },
  { href: "/plateforme/dossier", label: "Mon dossier", icon: "◉" },
  { href: "/plateforme/medias", label: "Médias", icon: "◆" },
  { href: "/plateforme/mon-compte", label: "Mon compte", icon: "◎" },
];

// ─── CARTE FIDÉLITÉ ──────────────────────────────────────────
function CarteFidelite({ carte, label, icon, href }: {
  carte: Fidelite | undefined;
  label: string;
  icon: string;
  href: string;
}) {
  const compteur = carte?.compteur ?? 0;
  const total = 10;
  const isFull = compteur >= total;

  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
            Carte fidélité
          </p>
          <p className="mt-0.5 text-sm font-semibold text-black">{label}</p>
        </div>
        <span className="text-lg text-[rgb(22,92,71)]">{icon}</span>
      </div>

      {/* Tampons */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-7 rounded-[8px] flex items-center justify-center text-xs font-bold transition-all ${
            i < compteur ? "bg-[rgb(22,92,71)] text-white" : "bg-black/4 text-black/15"
          }`}>
            {i < compteur ? "★" : "·"}
          </div>
        ))}
      </div>

      {/* Statut */}
      <p className="text-xs text-black/40 mb-4">
        {isFull
          ? "🎉 Séance gratuite disponible !"
          : `${total - compteur} séance${total - compteur > 1 ? "s" : ""} avant la gratuite`}
      </p>

      {/* CTA */}
      <div className="mt-auto">
        <Link
          href={href}
          className={`flex items-center justify-center bg-primary/40 gap-1.5 w-full rounded-full py-2.5 text-xs font-semibold transition ${
            isFull
              ? "bg-[rgb(185,151,83)] text-white hover:bg-[rgb(165,131,63)]"
              : "border border-[rgb(22,92,71)]/20 text-[rgb(22,92,71)] hover:bg-[rgb(22,92,71)]/5"
          }`}
        >
          {isFull ? "Utiliser mon créneau gratuit →" : "Réserver →"}
        </Link>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────
function Sidebar({ active }: { active: string }) {
  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0">
      <nav className="sticky top-28 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[rgb(22,92,71)] !text-white"
                  : "text-black/60 hover:bg-black/4 hover:text-black"
              }`}
            >
              <span className={`text-base ${isActive ? "text-white" : "text-[rgb(22,92,71)]"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── BOTTOM NAV MOBILE ───────────────────────────────────────
function BottomNav({ active }: { active: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-black/6 shadow-[0_-4px_20px_rgba(16,16,16,0.06)]">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition relative ${
                isActive ? "text-[rgb(22,92,71)]" : "text-black/40"
              }`}
            >
              <span className={`text-lg leading-none ${isActive ? "text-[rgb(22,92,71)]" : "text-black/30"}`}>
                {item.icon}
              </span>
              <span className="leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[rgb(22,92,71)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── DASHBOARD PRINCIPAL ─────────────────────────────────────
export default function DashboardClient({ profile, foyer, eleves, fidelite }: Props) {
  const [activeEleveId, setActiveEleveId] = useState<string>(eleves[0]?.id ?? "");
  const activeEleve = eleves.find(e => e.id === activeEleveId) ?? eleves[0];
  const isPremium = activeEleve?.statut_premium ?? false;
  const carteCours = fidelite.find(f => f.type_carte === "cours_individuels");
  const carteLocation = fidelite.find(f => f.type_carte === "location_salles");
  const active = "/plateforme/dashboard";

  return (
    <div className="min-h-screen bg-[rgb(247,249,247)]">

      {/* ── LAYOUT ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-28 lg:pb-10">
        <div className="flex gap-8 xl:gap-12">

          {/* Sidebar desktop */}
          <Sidebar active={active} />

          {/* Contenu principal */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* ── 1. BARRE CONTEXTE ── */}
            <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">
                    Foyer {foyer?.nom_famille}
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-black">
                    Bonjour{profile?.prenom ? `, ${profile.prenom}` : ""} 👋
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sélecteur élève si plusieurs */}
                  {eleves.length > 1 && eleves.map(e => (
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

                  {/* Badge statut */}
                  <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    isPremium
                      ? "bg-[rgb(22,92,71)] text-white"
                      : "bg-black/6 text-black/40"
                  }`}>
                    {isPremium ? "★ Premium" : "Sans parcours"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 2. PROCHAIN COURS ── */}
            <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30 mb-4">
                Prochain cours
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[rgb(239,244,239)] text-xl">
                  {isPremium ? "📅" : "🎓"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    {isPremium
                      ? "Disponible dès l'ouverture de l'école"
                      : "Aucun parcours en cours"}
                  </p>
                  <p className="text-xs text-black/40 mt-0.5">
                    {isPremium
                      ? "Le planning sera visible ici dès que les cours seront planifiés."
                      : "Inscris-toi à un parcours pour voir ton planning ici."}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 3. INCENTIVE CANDIDATURE (non premium) ── */}
            {!isPremium && (
              <div className="rounded-[20px] overflow-hidden border border-black/6 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">

                {/* Photos côte à côte */}
                <div className="grid grid-cols-2 h-44 sm:h-52">
                  <div className="relative overflow-hidden">
                    <Image
                      src="/programmes/full-artist.jpg"
                      alt="Parcours Full Artist"
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        Full Artist
                      </span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden border-l border-white/10">
                    <Image
                      src="/programmes/comedie-musicale.jpg"
                      alt="Parcours Comédie Musicale"
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        Comédie Musicale
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-[rgb(22,92,71)] px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgb(185,151,83)] mb-1">
                        Prochaine édition — 2028
                      </p>
                      <p className="text-sm font-semibold text-white">
                        Ta place chez Crea'Star t'attend.
                      </p>
                      <p className="text-xs text-white/55 mt-0.5 leading-5">
                        Dépose ta candidature maintenant pour être contacté en priorité.
                      </p>
                    </div>
                    <Link
                      href="/candidature"
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[rgb(185,151,83)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(165,131,63)]"
                    >
                      Dépose ta candidature →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. DERNIÈRE NOTE DE PROF (premium) ── */}
            {isPremium && (
              <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">
                    Dernière note de prof
                  </p>
                  <Link href="/plateforme/dossier" className="text-xs text-[rgb(22,92,71)] font-medium hover:underline">
                    Voir tout →
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[rgb(239,244,239)] text-xl">
                    📝
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Aucune note pour le moment</p>
                    <p className="text-xs text-black/40 mt-0.5">Les notes de tes professeurs apparaîtront ici après chaque cours.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. CARTES FIDÉLITÉ ── */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30 mb-3">
                Mes cartes fidélité
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CarteFidelite
                  carte={carteCours}
                  label="Cours individuels"
                  icon="◎"
                  href="/plateforme/cours-individuels"
                />
                <CarteFidelite
                  carte={carteLocation}
                  label="Location de salles"
                  icon="◈"
                  href="/plateforme/locations"
                />
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Bottom nav mobile */}
      <BottomNav active={active} />

    </div>
  );
}