"use client";
// app/plateforme/inscription/InscriptionClient.tsx
// v4 — hero flush sous le header, bento 3 cartes avec vraies photos du site,
// typographie grande comme les autres pages, pas de badge ?, CTA clair

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OngletParcours from "./OngletParcours";
import OngletEveil from "./OngletEveil";
import OngletCoursIndividuels from "./OngletCoursIndividuels";

type Onglet = "parcours" | "eveil" | "cours";

interface Props {
  ongletInitial: string;
  user: { id: string; email: string } | null;
  profile: any | null;
  candidature: any | null;
  foyer: any | null;
  eleves: any[];
  groupesEveil: any[];
  creneauxIndividuels: any[];
  carteFidelite: any | null;
  disciplinesADecouvrir: { discipline: string; prochainCreneau: any | null }[];
  profs: any[];
}

function toOnglet(s: string): Onglet {
  if (s === "eveil" || s === "cours") return s;
  return "parcours";
}

// Vraies photos du site
const OFFRES: {
  id: Onglet;
  label: string;
  sublabel: string;
  tag: string;
  desc: string;
  // photos : soit une string (1 photo) soit 2 strings (split horizontal)
  photos: string[];
  alts: string[];
  prix: string;
  cta: string;
}[] = [
  {
    id: "parcours",
    label: "Parcours annuels",
    sublabel: "Full Artist · Comédie musicale",
    tag: "Dès 8 ans",
    desc: "Une année sur scène — chant, danse, théâtre, studio.",
    photos: ["/programmes/full-artist.jpg", "/programmes/comedie-musicale.jpg"],
    alts: ["Parcours Full Artist", "Parcours Comédie musicale"],
    prix: "Dès 1 450 € / an",
    cta: "Candidater",
  },
  {
    id: "eveil",
    label: "Éveil musical",
    sublabel: "3 à 8 ans",
    tag: "Les petits",
    desc: "La musique par le jeu, sans solfège, sans pression.",
    photos: ["/offres/eveil-musical.jpg"],
    alts: ["Éveil musical pour enfants"],
    prix: "Inscription directe",
    cta: "S'inscrire",
  },
  {
    id: "cours",
    label: "Cours individuels",
    sublabel: "À la séance",
    tag: "Tous niveaux",
    desc: "Réserve un créneau avec un intervenant validé.",
    photos: ["/offres/cours-individuels.jpg"],
    alts: ["Cours individuel Crea'Star"],
    prix: "Au cours · Carte fidélité",
    cta: "Réserver",
  },
];

export default function InscriptionClient({
  ongletInitial, user, profile, candidature, foyer, eleves,
  groupesEveil, creneauxIndividuels, carteFidelite, disciplinesADecouvrir, profs,
}: Props) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>(toOnglet(ongletInitial));

  const handleOnglet = (o: Onglet) => {
    setOnglet(o);
    router.replace(`/plateforme/inscription?onglet=${o}`, { scroll: false });
    setTimeout(() => {
      document.getElementById("ins-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const active = OFFRES.find(o => o.id === onglet)!;

  return (
    <main className="min-h-screen text-foreground">
      <style>{`
        @keyframes ins-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ins-fade { from { opacity: 0; } to { opacity: 1; } }
        .ins-h    { animation: ins-up   0.9s ease 0.3s  both; }
        .ins-sub  { animation: ins-up   0.8s ease 0.6s  both; }
        .ins-bent { animation: ins-up   0.8s ease 0.75s both; }
        .ins-fade { animation: ins-fade 0.4s ease both; }

        .carte { transition: transform 0.3s ease; cursor: pointer; }
        .carte:hover { transform: translateY(-4px); }
        .carte img { transition: transform 0.5s ease; }
        .carte:hover img, .carte.active img { transform: scale(1.05); }
        .carte .hover-hint {
          transition: opacity 0.2s ease, transform 0.2s ease;
          opacity: 0; transform: translateY(4px);
        }
        .carte:hover .hover-hint, .carte.active .hover-hint {
          opacity: 1; transform: translateY(0);
        }
      `}</style>

      {/* ══ HERO — flush sous le header (-mt-[88px] = hauteur exacte du header) ══ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "rgb(8,30,22)",
          marginTop: "-88px",          /* remonte sous le header transparent */
          paddingTop: "88px",          /* compense pour le contenu */
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* Fond déco */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.4),transparent_55%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)]" />

        <div className="relative site-shell-wide px-6 md:px-10 lg:px-14 pb-0 pt-12 md:pt-16">

          {/* Eyebrow */}
          <p className="ins-h text-sm font-semibold uppercase tracking-[0.28em] text-white/40 mb-5">
            Crea'Star · Rejoins-nous
          </p>

          {/* Titre — taille des autres pages */}
          <h1 className="ins-h max-w-7xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem] text-balance">
            Un projet artistique, une place t'attend.
          </h1>

          {/* Sous-titre */}
          <p className="ins-sub mt-6 max-w-7xl text-base leading-8 text-white/58 sm:text-lg sm:leading-9">
            Parcours annuels, éveil musical pour les plus jeunes, cours individuels à la séance —
            choisis ta formule et clique pour en savoir plus.
          </p>

          {/* ── BENTO 3 CARTES ── */}
          <div className="ins-bent mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {OFFRES.map((offre) => {
              const isActive = onglet === offre.id;
              return (
                <button
                  key={offre.id}
                  onClick={() => handleOnglet(offre.id)}
                  className={`carte relative overflow-hidden rounded-t-[22px] text-left border-0 p-0 bg-transparent ${isActive ? "active" : ""}`}
                  style={{
                    height: "320px",
                    outline: isActive ? "2.5px solid rgb(185,151,83)" : "2.5px solid rgba(255,255,255,0.08)",
                    outlineOffset: "0",
                    borderRadius: "22px 22px 0 0",
                  }}
                  aria-pressed={isActive}
                  aria-label={`Voir ${offre.label}`}
                >
                  {/* Photo(s) */}
                  {offre.photos.length === 2 ? (
                    // Double photo côte à côte pour les parcours annuels
                    <div className="absolute inset-0 flex">
                      <div className="relative flex-1 overflow-hidden">
                        <img src={offre.photos[0]} alt={offre.alts[0]}
                          className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      {/* Séparateur doré */}
                      <div className="w-px bg-[rgba(185,151,83,0.6)] shrink-0 z-10" />
                      <div className="relative flex-1 overflow-hidden">
                        <img src={offre.photos[1]} alt={offre.alts[1]}
                          className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <img src={offre.photos[0]} alt={offre.alts[0]}
                      className="absolute inset-0 w-full h-full object-cover" />
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: isActive
                        ? "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.88) 100%)"
                        : "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.78) 65%, rgba(0,0,0,0.92) 100%)",
                    }}
                  />

                  {/* Barre dorée en haut si actif */}
                  {isActive && (
                    <div className="absolute top-0 inset-x-0 h-1"
                      style={{ background: "rgb(185,151,83)" }} />
                  )}

                  {/* Tag haut droite */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.45)",
                        color: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}>
                      {offre.tag}
                    </span>
                  </div>

                  {/* Contenu bas */}
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-1">
                      {offre.sublabel}
                    </p>
                    <p className="text-lg font-semibold text-white leading-tight mb-1.5">
                      {offre.label}
                    </p>
                    <p className="text-xs text-white/50 leading-[1.4] mb-3">
                      {offre.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: "rgb(185,151,83)" }}>
                        {offre.prix}
                      </span>
                      <span className="hover-hint text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{
                          background: isActive ? "rgb(185,151,83)" : "rgba(255,255,255,0.15)",
                          color: "white",
                          backdropFilter: "blur(6px)",
                        }}>
                        {isActive ? "✓ Sélectionné" : `${offre.cta} →`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CONTENU ONGLET ═══════════════════════════════════════════════════ */}
      <section id="ins-content" style={{ background: "rgb(242,246,242)" }}>
        <div className="absolute-line" style={{
          height: "2px",
          background: "linear-gradient(90deg,transparent,rgba(185,151,83,0.35),transparent)",
        }} />

        {/* Bandeau contexte */}
        <div className="site-shell-wide px-6 md:px-10 lg:px-14 pt-8 pb-2">
          <div className="flex items-center gap-2 text-sm text-black/40">
            <span>Inscriptions</span>
            <span className="text-black/20">/</span>
            <span className="font-semibold" style={{ color: "rgb(22,92,71)" }}>{active.label}</span>
          </div>
        </div>

        <div className="site-shell-wide px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12 ins-fade" key={onglet}>
          {onglet === "parcours" && (
            <OngletParcours user={user} candidature={candidature} eleves={eleves} />
          )}
          {onglet === "eveil" && (
            <OngletEveil user={user} eleves={eleves} groupes={groupesEveil} />
          )}
          {onglet === "cours" && (
            <OngletCoursIndividuels user={user} profs={profs} creneaux={creneauxIndividuels} carteFidelite={carteFidelite} eleves={eleves} disciplinesADecouvrir={disciplinesADecouvrir}/>
          )}
        </div>
      </section>
    </main>
  );
}