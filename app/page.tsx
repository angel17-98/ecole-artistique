"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import Reveal from "./components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const featuredPrograms = [
  {
    href: "/cours/full-artist",
    image: "/programmes/full-artist.jpg",
    alt: "Performance scénique — Programme Full Artist",
    eyebrow: "Parcours annuel",
    titleMain: "Full",
    titleAccent: "Artist",
    text: "Chant, danse, théâtre, écriture et studio réunis dans un seul parcours — pour ceux qui veulent créer leur univers, pas seulement bien interpréter.",
    tags: ["Identité artistique", "Création & interprétation", "Studio d'enregistrement"],
  },
  {
    href: "/cours/comedie-musicale",
    image: "/programmes/comedie-musicale.jpg",
    alt: "Comédie musicale — chant, danse et théâtre",
    eyebrow: "Parcours annuel",
    titleMain: "Comédie",
    titleAccent: "Musicale",
    text: "Chant, danse et théâtre au service d'un projet collectif fort — pour apprendre à occuper la scène, à jouer avec les autres et à faire vivre un personnage.",
    tags: ["Projet collectif", "Interprétation", "Scène"],
  },
];

const secondaryOffers = [
  {
    href: "/cours/eveil-musical",
    image: "/offres/eveil-musical.jpg",
    alt: "Éveil musical pour enfants",
    title: "Éveil musical",
    text: "Une première rencontre avec la musique et le rythme, ludique et sensorielle, pensée pour les plus jeunes.",
  },
  {
    href: "/cours/cours-individuels",
    image: "/offres/cours-individuels.jpg",
    alt: "Cours artistiques individuels",
    title: "Cours individuels",
    text: "Un accompagnement sur-mesure en chant, musique ou expression artistique, calé sur tes objectifs et ton rythme.",
  },
  {
    href: "/locations",
    image: "/offres/studio.jpg",
    alt: "Location de salles et studio d'enregistrement",
    title: "Location de salles & studio",
    text: "Des espaces professionnels ouverts aux artistes, groupes et compagnies — pour répéter, créer et enregistrer.",
  },
];

const carouselOffers = [
  {
    href: "/cours/full-artist",
    number: "01",
    tag: "Cœur de Crea'Star",
    title: "Parcours\nFull Artist",
    text: "Un parcours annuel pluridisciplinaire — chant, danse, théâtre, écriture et studio — pour créer son univers et monter sur scène.",
    bg: "rgb(22,92,71)",
    titleColor: "#ffffff",
    tagColor: "rgba(255, 255, 255, 0.39)",
    bodyColor: "rgba(255,255,255,0.70)",
    linkColor: "rgb(185,151,83)",
    numberColor: "rgba(255, 255, 255, 0.32)",
  },
  {
    href: "/cours/comedie-musicale",
    number: "02",
    tag: "Cœur de Crea'Star",
    title: "Parcours \nComédie Musicale",
    text: "Chant, danse et théâtre réunis dans un projet collectif fort, du premier cours jusqu'au spectacle public de fin d'année.",
    bg: "rgb(185,151,83)",
    titleColor: "#ffffff",
    tagColor: "rgba(255,255,255,0.50)",
    bodyColor: "rgba(255,255,255,0.75)",
    linkColor: "#ffffff",
    numberColor: "rgba(255,255,255,0.32)",
  },
  {
    href: "/cours/eveil-musical",
    number: "03",
    tag: "Dès 4 ans",
    title: "Éveil\nMusical",
    text: "Une première rencontre sensorielle et ludique avec la musique, le rythme et l'expression artistique pour les plus jeunes.",
    bg: "rgb(228,236,228)",
    titleColosr: "rgb(16,16,16)",
    tagColor: "rgba(16,16,16,0.38)",
    bodyColor: "rgba(16,16,16,0.62)",
    linkColor: "rgb(22,92,71)",
    numberColor: "rgba(16,16,16,0.32)",
  },
  {
    href: "/cours/cours-individuels",
    number: "04",
    tag: "Sur mesure",
    title: "Cours\nIndividuels",
    text: "Un accompagnement personnalisé en chant, musique ou expression artistique, adapté à ton niveau et à tes objectifs.",
    bg: "rgb(248,244,236)",
    titleColor: "rgb(16,16,16)",
    tagColor: "rgba(16,16,16,0.38)",
    bodyColor: "rgba(16,16,16,0.62)",
    linkColor: "rgb(22,92,71)",
    numberColor: "rgba(16,16,16,0.32)",
  },
  {
    href: "/stages",
    number: "05",
    tag: "Événements",
    title: "Stages &\nWorkshops",
    text: "Des formats courts et intensifs — stages, masterclasses, workshops et concours — pour s'immerger, progresser et rencontrer.",
    bg: "rgb(12,50,38)",
    titleColor: "#ffffff",
    tagColor: "rgba(255,255,255,0.44)",
    bodyColor: "rgba(255,255,255,0.66)",
    linkColor: "rgb(185,151,83)",
    numberColor: "rgba(255,255,255,0.32)",
  },
  {
    href: "/locations",
    number: "06",
    tag: "Artistes & groupes",
    title: "Location\nEspaces",
    text: "Salle de danse, scène polyvalente, salles individuelles et studio d'enregistrement disponibles à la location.",
    bg: "rgb(228,236,228)",
    titleColor: "rgb(16,16,16)",
    tagColor: "rgba(16,16,16,0.38)",
    bodyColor: "rgba(16,16,16,0.62)",
    linkColor: "rgb(22,92,71)",
    numberColor: "rgba(16,16,16,0.32)",
  },
];

const values = [
  {
    number: "01",
    title: "La création comme moteur",
    text: "Ici, on n'apprend pas la technique pour la technique. Chaque exercice, chaque cours, chaque projet sert à construire quelque chose — un univers, une présence, une voix singulière.",
  },
  {
    number: "02",
    title: "Exigence et bienveillance",
    text: "Se dépasser demande un cadre solide et un climat de confiance. On pousse les élèves loin — mais jamais sans eux. L'exigence est au service de l'épanouissement, pas contre lui.",
  },
  {
    number: "03",
    title: "Le collectif comme force",
    text: "Sur scène, on est rarement seul. Apprendre à créer avec les autres, à tenir sa place dans un groupe, à faire grandir un projet commun — c'est une compétence à part entière.",
  },
  {
    number: "04",
    title: "Un accompagnement qui dure",
    text: "Chaque élève évolue à son rythme. La direction suit la progression de chacun sur le long terme — pas pour noter, mais pour accompagner, ajuster et faire émerger ce qui est propre à chacun.",
  },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, carouselOffers.length - 1));
    setActiveIndex(clamped);
    const card = trackRef.current?.children[clamped] as HTMLElement;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <main className="min-h-screen text-foreground">

      {/* ── HERO ── */}
      <style>{`
        @keyframes cs-zoom {
          from { transform: scale(1.06); }
          to   { transform: scale(1); }
        }
        @keyframes cs-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cs-line {
          from { width: 0; opacity: 0; }
          to   { width: 3rem; opacity: 1; }
        }
        .cs-img     { animation: cs-zoom    9s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .cs-eyebrow { animation: cs-fade-up 0.8s ease 0.3s  both; }
        .cs-line    { animation: cs-line    0.7s ease 0.55s  both; }
        .cs-h1      { animation: cs-fade-up 1.1s ease 0.65s  both; }
        .cs-sub     { animation: cs-fade-up 0.9s ease 1.05s  both; }
        .cs-cta     { animation: cs-fade-up 0.9s ease 1.25s  both; }
        .cs-tags    { animation: cs-fade-up 0.8s ease 1.50s  both; }
        .carousel-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .carousel-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <section className="relative -mt-24 h-[100svh] min-h-[640px] max-h-[1080px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/home-page-2.jpg"
            alt="Hall principal du centre CREA'STAR"
            fill
            priority
            unoptimized
            className="object-cover object-center cs-img"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,4,4,0.82)_0%,rgba(4,4,4,0.52)_42%,rgba(4,4,4,0.12)_72%,rgba(4,4,4,0.04)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.16)_0%,transparent_30%,rgba(4,4,4,0.42)_80%,rgba(4,4,4,0.72)_100%)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="site-shell-wide px-6 pb-14 md:px-10 lg:px-14 lg:pb-20">
            <p className="cs-eyebrow text-xs uppercase tracking-[0.28em] text-white/54">
              Centre de formation artistique musical · Brabant Wallon
            </p>
            <div className="cs-line mt-5 mb-5 h-px bg-[rgb(185,151,83)]" style={{ width: 0 }} />
            <h1 className="cs-h1 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              La création au cœur de l'apprentissage
            </h1>
            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <p className="cs-sub max-w-xl text-base leading-8 text-white/62 sm:text-lg">
                Crea'Star réunit en un seul lieu tout ce dont un artiste a besoin —
                scène, studio, formation complète et spectacle public chaque année.
              </p>
              <div className="cs-cta flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/inscriptions"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                >
                  Rejoindre Crea'Star
                </Link>
                <Link
                  href="/a-propos/notre-ecole"
                  className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/50 px-8 py-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/40"
                >
                  Découvrir le centre
                </Link>
              </div>
            </div>
            <div className="cs-tags mt-7 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.22em] text-white/32">
              <span>Parcours annuels</span><span>·</span>
              <span>Scène & studio</span><span>·</span>
              <span>Stages & événements</span><span>·</span>
              <span>Location d'espaces</span><span>·</span>
              <span>Waterloo, Brabant Wallon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRÉSENTATION + CARROUSEL CENTRÉ ── */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">

            {/* Gauche — texte fixe */}
            <Reveal>
              <div>
                <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                  Présentation
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                  Un centre dédié à l'artiste complet
                </h2>
                <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                  Crea'Star est un centre artistique musical implanté dans le Brabant Wallon,
                  dédié à la formation d'artistes qui créent autant qu'ils interprètent.
                  Le cœur de l'offre, ce sont deux parcours annuels pluridisciplinaires
                  où chaque élève construit un projet personnel ou collectif qui prend vie sur scène.
                </p>
                <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                  En complément : éveil musical, cours individuels, stages, workshops,
                  masterclasses et location de salles & studio.
                </p>
                <div className="mt-8">
                  <Link
                    href="/a-propos/notre-ecole"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3"
                  >
                    Découvrir notre école <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Droite — carrousel 1 carte visible + aperçus gauche/droite */}
            <Reveal delay={1}>
              <div className="relative">

                {/* Zone de scroll — overflow visible pour voir les cartes voisines */}
                <div
                  ref={trackRef}
                  className="carousel-scroll flex gap-4 overflow-x-auto"
                  style={{
                    scrollSnapType: "x mandatory",
                    /* Padding latéral pour centrer la carte active et révéler les voisines */
                    paddingLeft: "15%",
                    paddingRight: "15%",
                  }}
                >
                  {carouselOffers.map((offer, i) => (
                    <button
                      key={offer.number}
                      onClick={() => goTo(i)}
                      className="relative shrink-0 cursor-pointer overflow-hidden rounded-[28px] text-left transition-all duration-500"
                      style={{
                        scrollSnapAlign: "center",
                        width: "100%",
                        minHeight: "360px",
                        background: offer.bg,
                        opacity: i === activeIndex ? 1 : 0.55,
                        transform: i === activeIndex ? "scale(1)" : "scale(0.94)",
                      }}
                    >
                      {/* Numéro filigrane */}
                      <span
                        className="absolute right-5 top-4 text-8xl font-semibold leading-none tracking-tight"
                        style={{ color: offer.numberColor }}
                      >
                        {offer.number}
                      </span>

                      <div className="relative z-10 flex h-full flex-col justify-between p-7">
                        <div>
                          <p
                            className="text-xs uppercase tracking-[0.22em]"
                            style={{ color: offer.tagColor }}
                          >
                            {offer.tag}
                          </p>
                          <h3
                            className="mt-4 whitespace-pre-line text-3xl font-semibold leading-tight tracking-tight"
                            style={{ color: offer.titleColor }}
                          >
                            {offer.title}
                          </h3>
                          <p
                            className="mt-5 text-xl leading-7"
                            style={{ color: offer.bodyColor }}
                          >
                            {offer.text}
                          </p>
                        </div>

                        <Link
                          href={offer.href}
                          className="mt-8 inline-flex items-center gap-2 text-m font-medium transition hover:gap-3"
                          style={{ color: offer.linkColor }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          En savoir plus <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Flèches de navigation */}
                <div className="mt-6 flex items-center justify-between">
                  {/* Indicateurs points */}
                  <div className="flex gap-1.5">
                    {carouselOffers.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === activeIndex ? "1.5rem" : "0.375rem",
                          background: i === activeIndex ? "rgb(22,92,71)" : "rgba(22,92,71,0.25)",
                        }}
                        aria-label={`Offre ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Boutons ← → */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => goTo(activeIndex - 1)}
                      disabled={activeIndex === 0}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm text-black/60 transition hover:bg-white hover:text-black disabled:opacity-30"
                      aria-label="Précédent"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => goTo(activeIndex + 1)}
                      disabled={activeIndex === carouselOffers.length - 1}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm text-black/60 transition hover:bg-white hover:text-black disabled:opacity-30"
                      aria-label="Suivant"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── PARCOURS ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mx-auto max-w-7xl text-center">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                Nos parcours
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Deux programmes annuels jusqu'à la scène
              </h2>
              <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                Chaque parcours suit une progression structurée — de la technique
                à la création, jusqu'au spectacle de fin d'année.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 xl:gap-10">
            {featuredPrograms.map((program, index) => (
              <Reveal key={program.href} delay={(index + 1) as 1 | 2 | 3}>
                <Link
                  href={program.href}
                  className="group grid items-center gap-6 rounded-[30px] border border-black/6 bg-white/74 p-4 shadow-[0_12px_38px_rgba(16,16,16,0.05)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-primary/20 sm:p-5 md:grid-cols-[280px_1fr] md:gap-7 lg:grid-cols-[340px_1fr] lg:p-6 xl:grid-cols-[420px_1fr] xl:gap-10"
                >
                  <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[22px] md:aspect-[4/3]">
                    <Image
                      src={program.image}
                      alt={program.alt}
                      fill
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1280px) 420px, (min-width: 1024px) 340px, (min-width: 768px) 280px, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.42)] via-[rgba(247,244,238,0.08)] to-transparent" />
                  </div>
                  <div className="relative py-1 lg:pr-4">
                    <p className="text-sm uppercase tracking-[0.22em] text-black/52">{program.eyebrow}</p>
                    <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                      <span className="text-black">{program.titleMain}</span>{" "}
                      <span className="text-accent">{program.titleAccent}</span>
                    </h3>
                    <p className="mt-5 max-w-4xl text-base leading-8 text-black/68 sm:text-lg">{program.text}</p>
                    <div className="mt-8 flex flex-wrap gap-x-3 gap-y-2 text-sm text-black/56">
                      {program.tags.map((tag, i) => (
                        <span key={tag}>{tag}{i < program.tags.length - 1 ? " •" : ""}</span>
                      ))}
                    </div>
                    <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3">
                      Découvrir le parcours <span aria-hidden>→</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTRES OFFRES ── */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mx-auto max-w-6xl text-center">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">Autres offres</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                D'autres façons de pratiquer et de créer
              </h2>
              <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                En complément des parcours phares, Crea'Star propose d'autres formats
                pour découvrir, approfondir ou louer un espace de création.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryOffers.map((offer, index) => (
              <Reveal key={offer.href} delay={(index + 1) as 1 | 2 | 3}>
                <Link
                  href={offer.href}
                  className="group overflow-hidden rounded-[26px] border border-black/6 bg-white/80 shadow-[0_10px_30px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={offer.image}
                      alt={offer.alt}
                      fill
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.54)] via-[rgba(247,244,238,0.08)] to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{offer.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-black/66">{offer.text}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3">
                      Plus d'infos <span aria-hidden>→</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-28">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">Ce qui nous guide</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Une approche artistique exigeante, humaine et collective
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 divide-y divide-black/8">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="grid gap-4 py-10 lg:grid-cols-[64px_1fr_2fr] lg:gap-14 lg:py-6">
                  <span className="text-5xl font-semibold tracking-tight text-primary/12 lg:text-6xl">
                    {value.number}
                  </span>
                  <h3 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl lg:pt-1">
                    {value.title}
                  </h3>
                  <p className="text-base leading-8 text-black/62 sm:text-lg lg:pt-1">
                    {value.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative px-6 py-12 md:px-10 lg:px-14 lg:py-16">
        <div className="site-shell-wide">
          <div className="relative overflow-hidden rounded-[34px] border border-black/6 shadow-[0_25px_90px_rgba(16,16,16,0.08)]">
            <div className="absolute inset-0">
              <Image
                src="/home-page-2.jpg"
                alt="Scène de spectacle — création collective CREA'STAR"
                fill
                unoptimized
                className="object-cover object-center"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.14),rgba(10,10,10,0.52))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(185,151,83,0.10),transparent_52%)]" />
            </div>

            <div className="relative z-10 px-6 py-24 text-center md:px-10 lg:px-14 lg:py-28">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.24em] text-white/72">Expérience scénique</p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl text-balance">
                  Tout ce travail prend vie sur scène, devant le public, à la fin de chaque année
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
                  Rejoins Crea'Star et vis une expérience artistique complète —
                  de la première heure de cours jusqu'aux applaudissements.
                </p>
              </Reveal>
              <Reveal delay={3}>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/inscriptions"
                    className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                  >
                    S'inscrire
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/50 px-10 py-4 text-base font-medium text-white transition hover:bg-white/40"
                  >
                    Nous contacter
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}