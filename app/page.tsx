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
    tags: ["Identité artistique", "Studio", "Scène & Performance", "Écriture / Composition"],
    titleMain: "Full",
    titleAccent: "Artist",
    text: "Chant, danse, théâtre, écriture et studio — pour créer son univers et monter sur scène.",
    overlay: "bg-[linear-gradient(180deg,rgba(8,24,18,0.30)_0%,rgba(8,24,18,0.55)_40%,rgba(8,24,18,0.92)_100%)]",
    overlayAccent: "bg-[linear-gradient(90deg,rgba(22,92,71,0.18),transparent_60%)]",
  },
  {
    href: "/cours/comedie-musicale",
    image: "/programmes/comedie-musicale.jpg",
    alt: "Parcours Comédie Musicale — CREA'STAR",
    tags: ["Projet collectif", "Mise en scène", "Écriture"],
    titleMain: "Comédie",
    titleAccent: "Musicale",
    text: "Chant, danse et théâtre au service d'un projet collectif fort — jusqu'à la construction d'un spectacle original.",
    overlay: "bg-[linear-gradient(180deg,rgba(20,14,4,0.28)_0%,rgba(20,14,4,0.52)_40%,rgba(20,14,4,0.92)_100%)]",
    overlayAccent: "bg-[linear-gradient(90deg,rgba(120,85,20,0.16),transparent_60%)]",
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
    tagColor: "rgba(255,255,255,0.39)",
    bodyColor: "rgba(255,255,255,0.70)",
    linkColor: "rgb(185,151,83)",
    numberColor: "rgba(255,255,255,0.14)",
  },
  {
    href: "/cours/comedie-musicale",
    number: "02",
    tag: "Cœur de Crea'Star",
    title: "Parcours\nComédie Musicale",
    text: "Chant, danse et théâtre réunis dans un projet collectif fort, du premier cours jusqu'au spectacle public de fin d'année.",
    bg: "rgb(185,151,83)",
    titleColor: "#ffffff",
    tagColor: "rgba(255,255,255,0.50)",
    bodyColor: "rgba(255,255,255,0.75)",
    linkColor: "#ffffff",
    numberColor: "rgba(255,255,255,0.14)",
  },
  {
    href: "/cours/eveil-musical",
    number: "03",
    tag: "Dès 4 ans",
    title: "Éveil\nMusical",
    text: "Une première rencontre sensorielle et ludique avec la musique, le rythme et l'expression artistique pour les plus jeunes.",
    bg: "rgb(228,236,228)",
    titleColor: "rgb(22,92,71)",
    tagColor: "rgba(16,16,16,0.38)",
    bodyColor: "rgba(16,16,16,0.62)",
    linkColor: "rgb(22,92,71)",
    numberColor: "rgba(16,16,16,0.12)",
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
    numberColor: "rgba(16,16,16,0.12)",
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
    numberColor: "rgba(255,255,255,0.12)",
  },
  {
    href: "/locations",
    number: "06",
    tag: "Artistes & groupes",
    title: "Location\nEspaces",
    text: "Salle de danse, salle de spectacle avec scène et studio d'enregistrement disponibles à la location.",
    bg: "rgb(228,236,228)",
    titleColor: "rgb(16,16,16)",
    tagColor: "rgba(16,16,16,0.38)",
    bodyColor: "rgba(16,16,16,0.62)",
    linkColor: "rgb(22,92,71)",
    numberColor: "rgba(16,16,16,0.12)",
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

      {/* ── STYLES GLOBAUX ── */}
      <style>{`
        @keyframes cs-zoom {
          from { transform: scale(1.06); }
          to   { transform: scale(1); }
        }
        @keyframes cs-fade-up {
          from { opacity: 0; transform: translateY(24px); }
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
        .carousel-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .carousel-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── HERO ── */}
      {/*
        📸 Remplace /home-page-2.jpg par la photo réelle du centre au lancement.
        Format idéal : 1920×1080px minimum, hall principal, cadrage large.
      */}
      <section className="relative -mt-24 h-[100svh] min-h-[580px] max-h-[1080px] overflow-hidden">
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
          <div className="site-shell-wide px-5 pb-10 md:px-10 lg:px-14 lg:pb-20">

            {/* Eyebrow */}
            <p className="cs-eyebrow text-[10px] uppercase tracking-[0.24em] text-white/54 sm:text-xs sm:tracking-[0.28em]">
              Ecole artistique de création musicale & scénique · Brabant Wallon
            </p>

            {/* Ligne dorée */}
            <div className="cs-line mt-4 mb-4 h-px bg-[rgb(185,151,83)] lg:mt-5 lg:mb-5" style={{ width: 0 }} />

            {/* FIX MOBILE : taille fluide avec clamp pour éviter le débordement */}
            <h1 className="cs-h1 max-w-4xl text-balance font-semibold leading-[1.02] tracking-tight text-white"
              style={{ fontSize: "clamp(2rem, 7vw, 5.5rem)" }}
            >
              La création au cœur de l'apprentissage
            </h1>

            {/* Sous-titre + CTA */}
            <div className="mt-6 flex flex-col gap-4 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
              <p className="cs-sub max-w-xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
                Crea'Star réunit en un seul lieu tout ce dont un artiste a besoin —
                scène, studio, formation complète et spectacle public chaque année.
              </p>

              {/* FIX MOBILE : boutons en colonne sur mobile, côte à côte dès sm */}
              <div className="cs-cta flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
                <Link
                  href="/inscriptions"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[rgb(var(--background-soft))] sm:px-8 sm:py-4"
                >
                  Rejoindre Crea'Star
                </Link>
                <Link
                  href="/a-propos/notre-ecole"
                  className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/50 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/40 sm:px-8 sm:py-4"
                >
                  Découvrir l'école
                </Link>
              </div>
            </div>

            {/* FIX MOBILE : tags cachés sur très petit écran, visibles dès sm */}
            <div className="cs-tags mt-5 hidden flex-wrap gap-x-4 gap-y-1.5 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.20em] text-white/32 sm:flex">
              <span>Parcours annuels</span><span>·</span>
              <span>Scène & studio</span><span>·</span>
              <span>Stages & événements</span><span>·</span>
              <span>Location d'espaces</span><span>·</span>
              <span>Braine l'Alleud, Brabant Wallon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRÉSENTATION + CARROUSEL ── */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-5 py-10 md:px-10 lg:px-14 lg:py-15">
          {/* FIX MOBILE : grid 1 col sur mobile, 2 col dès lg */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">

            {/* Texte gauche */}
            <Reveal>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Présentation
                </p>
                <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-5xl text-balance">
                  Une école dédié à l'artiste complet
                </h2>
                <p className="mt-5 text-sm leading-7 text-black/68 sm:text-base sm:leading-8">
                  Crea'Star est une école artistique de création musicale et scénique implanté dans le Brabant Wallon,
                  dédié à la formation d'artistes qui créent autant qu'ils interprètent.
                  Le cœur de l'offre, ce sont deux parcours annuels pluridisciplinaires
                  où chaque élève construit un projet personnel ou collectif qui prend vie sur scène.
                </p>
                <p className="mt-4 text-sm leading-7 text-black/68 sm:text-base sm:leading-8">
                  En complément : éveil musical, cours individuels, stages, workshops,
                  masterclasses et location de salles & studio.
                </p>
                <div className="mt-6">
                  <Link
                    href="/a-propos/notre-ecole"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3"
                  >
                    Découvrir notre école <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Carrousel droite */}
            <Reveal delay={1}>
              <div className="relative">
                {/*
                  FIX MOBILE : padding réduit sur mobile pour que la carte centrale
                  soit plus large et lisible. Sur desktop le 15% donne l'effet voulu.
                */}
                <div
                  ref={trackRef}
                  className="carousel-scroll flex gap-3 overflow-x-auto sm:gap-4"
                  style={{
                    scrollSnapType: "x mandatory",
                    paddingLeft: "clamp(1rem, 8%, 15%)",
                    paddingRight: "clamp(1rem, 8%, 15%)",
                  }}
                >
                  {carouselOffers.map((offer, i) => (
                    <button
                      key={offer.number}
                      onClick={() => goTo(i)}
                      className="relative shrink-0 cursor-pointer overflow-hidden rounded-[24px] text-left transition-all duration-500"
                      style={{
                        scrollSnapAlign: "center",
                        width: "100%",
                        /* FIX MOBILE : hauteur adaptative selon l'écran */
                        minHeight: "clamp(280px, 45vw, 380px)",
                        background: offer.bg,
                        opacity: i === activeIndex ? 1 : 0.52,
                        transform: i === activeIndex ? "scale(1)" : "scale(0.93)",
                      }}
                    >
                      {/* Numéro filigrane */}
                      <span
                        className="absolute right-4 top-3 text-6xl font-semibold leading-none tracking-tight sm:text-7xl sm:right-5 sm:top-4"
                        style={{ color: offer.numberColor }}
                      >
                        {offer.number}
                      </span>

                      <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] sm:text-xs" style={{ color: offer.tagColor }}>
                            {offer.tag}
                          </p>
                          {/* FIX MOBILE : titre plus petit sur mobile */}
                          <h3
                            className="mt-3 whitespace-pre-line text-2xl font-semibold leading-tight tracking-tight sm:mt-4 sm:text-3xl"
                            style={{ color: offer.titleColor }}
                          >
                            {offer.title}
                          </h3>
                          {/* FIX MOBILE : body text-sm au lieu de text-xl */}
                          <p className="mt-3 text-sm leading-6 sm:mt-5 sm:text-sm sm:leading-7" style={{ color: offer.bodyColor }}>
                            {offer.text}
                          </p>
                        </div>

                        <Link
                          href={offer.href}
                          className="mt-5 inline-flex items-center gap-2 text-xs font-medium transition hover:gap-3 sm:mt-8 sm:text-sm"
                          style={{ color: offer.linkColor }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          En savoir plus <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Contrôles */}
                <div className="mt-5 flex items-center justify-between">
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => goTo(activeIndex - 1)}
                      disabled={activeIndex === 0}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm text-black/60 transition hover:bg-white hover:text-black disabled:opacity-30 sm:h-10 sm:w-10"
                      aria-label="Précédent"
                    >←</button>
                    <button
                      onClick={() => goTo(activeIndex + 1)}
                      disabled={activeIndex === carouselOffers.length - 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm text-black/60 transition hover:bg-white hover:text-black disabled:opacity-30 sm:h-10 sm:w-10"
                      aria-label="Suivant"
                    >→</button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PARCOURS — deux grandes cartes immersives ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-5 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82 sm:text-base lg:text-lg lg:tracking-[0.28em]">
                Nos parcours Crea'Star
              </p>
            </div>
          </Reveal>

          {/*
            FIX MOBILE : cartes empilées sur mobile et tablette,
            côte à côte seulement dès md (768px) pour avoir assez d'espace
          */}
          <div className="grid gap-4 md:grid-cols-2">
            {featuredPrograms.map((program, index) => (
              <Reveal key={program.href} delay={(index + 1) as 1 | 2 | 3}>
                <Link
                  href={program.href}
                  className="group relative block overflow-hidden rounded-[26px] transition hover:-translate-y-1 md:rounded-[30px]"
                  style={{
                    /* FIX MOBILE : hauteur adaptive — plus courte sur mobile */
                    minHeight: "clamp(360px, 65vw, 560px)",
                  }}
                >
                  <Image
                    src={program.image}
                    alt={program.alt}
                    fill
                    unoptimized
                    className="object-cover object-center transition duration-700 group-hover:scale-[1.04]"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className={`absolute inset-0 ${program.overlay}`} />
                  <div className={`absolute inset-0 ${program.overlayAccent}`} />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 md:p-8">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/50">Parcours annuel</p>
                    <h3 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-white sm:mt-3 sm:text-4xl lg:text-5xl">
                      {program.titleMain}{" "}
                      <span className="text-[rgb(185,151,83)]">{program.titleAccent}</span>
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/68 sm:mt-4 sm:leading-7">
                      {program.text}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                      {program.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/18 px-2.5 py-0.5 text-xs text-white/60 sm:px-3 sm:py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[rgb(185,151,83)] transition group-hover:gap-3">
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

        <div className="site-shell-wide px-5 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mx-auto max-w-8xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">Autres offres</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-5xl text-balance">
                D'autres façons de pratiquer et de créer
              </h2>
              <p className="mt-5 text-sm leading-7 text-black/64 sm:text-base sm:leading-8">
                En complément des parcours phares, Crea'Star propose d'autres formats
                pour découvrir, approfondir ou louer un espace de création.
              </p>
            </div>
          </Reveal>

          {/* FIX MOBILE : 1 col mobile, 2 col sm, 3 col lg */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:mt-12">
            {secondaryOffers.map((offer, index) => (
              <Reveal key={offer.href} delay={(index + 1) as 1 | 2 | 3}>
                <Link
                  href={offer.href}
                  className="group overflow-hidden rounded-[22px] border border-black/6 bg-white/80 shadow-[0_10px_30px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18 sm:rounded-[26px]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={offer.image}
                      alt={offer.alt}
                      fill
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.54)] via-[rgba(247,244,238,0.08)] to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg font-semibold sm:text-xl">{offer.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/66 sm:mt-3 sm:leading-7">{offer.text}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3">
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

        <div className="site-shell-wide px-5 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">Ce qui nous guide</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-5xl text-balance">
                Une approche artistique exigeante, humaine et collective
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 divide-y divide-black/8 lg:mt-14">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                {/*
                  FIX MOBILE : empilé sur mobile, 3 colonnes dès lg.
                  Padding vertical réduit sur mobile.
                */}
                <div className="flex flex-col gap-2 py-6 sm:py-3 lg:grid lg:grid-cols-[64px_1fr_2fr] lg:gap-5 lg:py-5">
                  <span className="text-3xl font-semibold tracking-tight text-primary/14 sm:text-4xl lg:text-6xl">
                    {value.number}
                  </span>
                  <h3 className="text-base font-semibold leading-snug tracking-tight sm:text-lg lg:text-2xl lg:pt-1">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-7 text-black/62 sm:text-base sm:leading-8 lg:pt-1">
                    {value.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative px-5 py-8 md:px-10 lg:px-14 lg:py-16">
        <div className="site-shell-wide">
          <div className="relative overflow-hidden rounded-[26px] border border-black/6 shadow-[0_25px_90px_rgba(16,16,16,0.08)] lg:rounded-[34px]">
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

            {/* FIX MOBILE : padding réduit sur mobile */}
            <div className="relative z-10 px-5 py-14 text-center sm:px-8 sm:py-20 md:px-10 lg:px-14 lg:py-28">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.24em] text-white/72 sm:text-sm">Expérience scénique</p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mx-auto mt-4 max-w-4xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-5xl text-balance">
                  Tout ce travail prend vie sur scène, devant le public, à la fin de chaque année
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/76 sm:text-base sm:leading-8">
                  Rejoins Crea'Star et vis une expérience artistique complète —
                  de la première heure de cours jusqu'aux applaudissements.
                </p>
              </Reveal>
              <Reveal delay={3}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:mt-10">
                  <Link
                    href="/inscriptions"
                    className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-[rgb(var(--background-soft))] sm:w-auto sm:px-10 sm:py-4 sm:text-base"
                  >
                    S'inscrire
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/60 bg-white/50 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white/40 sm:w-auto sm:px-10 sm:py-4 sm:text-base"
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