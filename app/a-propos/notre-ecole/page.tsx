"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Reveal from "../../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const differentiators = [
  {
    icon: "◈",
    title: "Créer, pas reproduire",
    body: "La plupart des écoles forment des interprètes. Ici, chaque élève construit un projet personnel — de l'écriture à la scène. La technique est au service de l'identité artistique, jamais l'inverse.",
    contrast: "Ailleurs : reproduire les classiques, passer les examens.",
  },
  {
    icon: "◉",
    title: "10 à 15 élèves. Pas plus.",
    body: "Ce n'est pas un argument marketing. C'est une condition. Au-delà de 15, le suivi individuel disparaît. Ici, chaque élève est connu, challengé et accompagné nommément — par la direction et les formateurs.",
    contrast: "Ailleurs : des classes de 20, 25, 30 élèves.",
  },
  {
    icon: "◆",
    title: "Tout sous un même toit",
    body: "Scène, studio d'enregistrement, salle de danse, coaching vocal — au même endroit, dans une même progression. Pas de logistique entre plusieurs prestataires. Une expérience cohérente du premier cours au spectacle.",
    contrast: "Ailleurs : chant ici, danse là-bas, studio en option.",
  },
];

const journeySteps = [
  {
    phase: "Septembre",
    title: "Premier cours",
    text: "Tu intègres un groupe de 10 à 15 élèves. Chant, danse, théâtre et studio s'imbriquent dès la première semaine. Pas de mise à niveau — on démarre ensemble.",
    accent: "rgb(22,92,71)",
  },
  {
    phase: "Octobre – Janvier",
    title: "Le projet prend forme",
    text: "Chaque élève commence à définir sa direction artistique. Les formateurs challengent, ajustent, poussent. L'identité se construit — pas en suivant un modèle, en le cherchant.",
    accent: "rgb(185,151,83)",
  },
  {
    phase: "Février – Avril",
    title: "Répétitions & studio",
    text: "Le projet collectif s'affine. Le groupe entre en studio pour l'hymne annuel. Les répétitions scéniques commencent. Le spectacle final n'est plus une échéance — c'est une évidence.",
    accent: "rgb(22,92,71)",
  },
  {
    phase: "Mai – Juin",
    title: "La première",
    text: "Un vrai spectacle, devant un vrai public, dans une vraie salle. Pas une démonstration de fin de trimestre. Une première — construite, défendue et vécue par ceux qui l'ont imaginée.",
    accent: "rgb(185,151,83)",
  },
];

const spaces = [
  {
    id: "scene",
    label: "Scène",
    title: "Scène & salle polyvalente",
    description: "Une scène intégrée pour répéter en conditions réelles, se mettre en situation et défendre un projet devant un regard extérieur. C'est ici que les idées quittent la tête et prennent corps — et que le trac se transforme en présence.",
    image: "/espaces/scene.jpg",
    tag: "Spectacles · Répétitions · Présentations",
  },
  {
    id: "danse",
    label: "Danse",
    title: "Salle de danse",
    description: "Un grand espace lumineux avec le sol, les miroirs et la hauteur qu'il faut pour vraiment habiter le mouvement. Conçu pour la chorégraphie, l'énergie de groupe et l'exploration corporelle sans compromis.",
    image: "/espaces/salle-danse.jpg",
    tag: "Chorégraphie · Mouvement · Énergie",
  },
  {
    id: "studio",
    label: "Studio",
    title: "Studio d'enregistrement",
    description: "Un vrai studio pour poser la voix, s'entendre dans un casque et découvrir ce que ça change. C'est ici que l'hymne annuel de chaque groupe prend vie — et que les niveaux avancés explorent leurs propres compositions.",
    image: "/espaces/studio-salle.jpg",
    tag: "Enregistrement · Composition · Écoute",
  },
  {
    id: "coaching",
    label: "Coaching",
    title: "3 salles individuelles",
    description: "Des espaces intimes pour les cours personnalisés, le coaching vocal et le travail en profondeur — sans le regard du groupe, avec toute l'attention d'un formateur dédié. L'endroit où les progrès les plus importants se font.",
    image: "/espaces/salle-individuel.jpg",
    tag: "Coaching · Technique vocale · Suivi",
  },
];

const values = [
  {
    number: "01",
    title: "La création comme moteur",
    text: "Ici, on n'apprend pas la technique pour la technique. Chaque exercice, chaque projet sert à construire quelque chose qui appartient vraiment à l'élève — un univers, une présence, une voix singulière.",
  },
  {
    number: "02",
    title: "Exigence et bienveillance",
    text: "Se dépasser demande un cadre solide et un climat de confiance. On pousse les élèves loin — mais jamais sans eux. L'exigence est au service de l'épanouissement, pas contre lui.",
  },
  {
    number: "03",
    title: "Le collectif comme force",
    text: "Sur scène, on est rarement seul. Apprendre à créer avec les autres, à tenir sa place dans un groupe, à faire grandir un projet commun — c'est une compétence artistique à part entière.",
  },
  {
    number: "04",
    title: "Un accompagnement qui dure",
    text: "Chaque élève évolue à son rythme. La direction suit la progression de chacun sur le long terme — pas pour noter, mais pour accompagner, ajuster et faire émerger ce qui est propre à chacun.",
  },
];

// ─── COUNTDOWN ──────────────────────────────────────────────────────────────

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.max(0, Math.floor(diff / 86400000));
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
  return { days: d, hours: h, minutes: m };
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function NotreEcolePage() {
  const [activeSpace, setActiveSpace] = useState(0);
  const opening = new Date("2028-09-01T00:00:00");
  const countdown = useCountdown(opening);

  return (
    <main className="min-h-screen text-foreground">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative -mt-24 min-h-[92svh] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/espaces/tilia.jpg"
            alt="Centre artistique Crea'Star — Brabant Wallon"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          {/* Gradient gauche pour le texte */}
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,4,4,0.92)_0%,rgba(4,4,4,0.70)_40%,rgba(4,4,4,0.20)_72%,rgba(4,4,4,0.40)_100%)]" />
          {/* Gradient bas */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(4,4,4,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.10),transparent_32%)]" />
        </div>

        {/* Contenu ancré en bas */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="site-shell-wide px-6 pb-14 md:px-10 lg:px-14 lg:pb-20">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-0">

              {/* Gauche */}
              <div>
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">
                    À propos · Notre école
                  </p>
                </Reveal>
                <Reveal delay={1}>
                  <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
                </Reveal>
                <Reveal delay={1}>
                  <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-[3.8rem]">
                    Un lieu pensé pour ceux qui veulent créer, pas seulement apprendre
                  </h1>
                </Reveal>
                <Reveal delay={2}>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
                    Crea'Star ouvre en 2028 dans le Brabant Wallon — un école artistique de création musicale où scène, studio, formation et création sont réunis sous un même toit.
                  </p>
                </Reveal>
                <Reveal delay={3}>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/inscriptions"
                      className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                    >
                      Pré-inscription 2028
                    </Link>
                    <Link
                      href="/cours"
                      className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/50 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/60"
                    >
                      Découvrir les cours →
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Droite — stats glassmorphism */}
              <Reveal delay={2}>
                <div className="rounded-[22px] border border-white/10 bg-white/20 p-2 backdrop-blur-md mb-20">
                  <div className="grid grid-cols-2 divide-x divide-white/10">
                    <div className="divide-y divide-white/10">
                      {[
                        { label: "Ouverture", value: "2028" },
                        { label: "Groupes", value: "≤ 15 élèves" },
                        { label: "Disciplines", value: "6" },
                      ].map((s) => (
                        <div key={s.label} className="px-5 py-4">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">{s.label}</p>
                          <p className="mt-1 text-xl font-semibold text-white">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="divide-y divide-white/10">
                      {[
                        { label: "Scène finale", value: "1×/an" },
                        { label: "Studio", value: "Inclus" },
                        { label: "Lieu", value: "Braine l'Alleud" },
                      ].map((s) => (
                        <div key={s.label} className="px-5 py-4">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">{s.label}</p>
                          <p className="mt-1 text-xl font-semibold text-white">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. MANIFESTE ═════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "rgb(22,92,71)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.14),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,75,57,0.60),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-10 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">
              Notre conviction
            </p>
          </Reveal>
          <Reveal delay={1}>
            <p
              className="mt-6 max-w-8xl font-semibold leading-[1.18] tracking-tight text-white text-balance"
              style={{ fontSize: "clamp(1.75rem, 3.8vw, 3rem)" }}
            >
              Les meilleures choses qu'un artiste apprend ne s'enseignent pas — elles se vivent.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <div className="mt-7 h-px max-w-[3rem] bg-[rgb(185,151,83)]" />
            <p className="mt-6 max-w-8xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Notre rôle : créer les conditions pour que ça arrive — chaque semaine, tout au long de l'année.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ 3. NOTRE DIFFÉRENCE ══════════════════════════════════════════════ */}
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-15 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-14">
              <p className="text-l uppercase tracking-[0.28em] text-primary/80">
                Ce qui nous distingue
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Pas juste une autre école d'arts
              </h2>
              <p className="mt-4 max-w-5xl text-sm leading-7 text-black/58 sm:text-base sm:leading-8">
                Il existe des cours de chant, des cours de danse, des cours de théâtre. Ce qui n'existait pas — c'est ça.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {differentiators.map((d, i) => (
              <Reveal key={d.title} delay={(i % 3) as 0 | 1 | 2}>
                <div className="group relative overflow-hidden rounded-[26px] border border-black/6 bg-white p-7 shadow-[0_8px_32px_rgba(16,16,16,0.04)] transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_16px_48px_rgba(22,92,71,0.08)]">
                  <div className="mb-4 text-2xl text-primary/60">{d.icon}</div>
                  <h3 className="text-lg font-semibold leading-snug tracking-tight">
                    {d.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-black/62">
                    {d.body}
                  </p>
                  <div className="mt-5 rounded-[12px] bg-[rgb(239,244,239)] px-4 py-2.5">
                    <p className="text-xs leading-5 text-black/44">
                      {d.contrast}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. LE PARCOURS D'UNE ANNÉE ═══════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-15 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-14">
              <p className="text-l uppercase tracking-[0.28em] text-primary/80">
                Une année chez Crea'Star
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Du premier cours à la première représentation
              </h2>
            </div>
          </Reveal>

          {/* Timeline horizontale sur desktop, verticale sur mobile */}
          <div className="relative">
            {/* Ligne de connexion desktop */}
            <div className="absolute top-[2.1rem] left-0 right-0 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.18)_8%,rgba(22,92,71,0.18)_92%,transparent)] lg:block" />

            <div className="grid gap-8 lg:grid-cols-4 lg:gap-6">
              {journeySteps.map((step, i) => (
                <Reveal key={step.phase} delay={(i % 4) as 0 | 1 | 2}>
                  <div className="relative flex flex-col">
                    {/* Point de timeline */}
                    <div className="relative mb-5 flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                      <div
                        className="relative z-10 flex h-[1.1rem] w-[1.1rem] shrink-0 items-center justify-center rounded-full border-2 border-white shadow-[0_0_0_3px_rgba(22,92,71,0.14)]"
                        style={{ background: step.accent }}
                      />
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.22em] lg:mt-1"
                        style={{ color: step.accent }}
                      >
                        {step.phase}
                      </p>
                    </div>
                    {/* Contenu */}
                    <div className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_4px_24px_rgba(16,16,16,0.04)]">
                      <h3 className="text-lg font-semibold leading-snug">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-black/60">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 5. LES ESPACES — onglets interactifs ════════════════════════════ */}
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.06),transparent)]" />

        <div className="site-shell-wide px-6 py-15 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                Les espaces
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Tout ce qu'un artiste a besoin, au même endroit
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-black/58 sm:text-base">
                Scène, studio, mouvement, coaching — une seule adresse, un seul parcours.
              </p>
            </div>
          </Reveal>

          {/* Onglets */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {spaces.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveSpace(i)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition ${
                  activeSpace === i
                    ? "bg-[rgb(22,92,71)] text-white"
                    : "border border-black/10 text-black/60 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Panneau actif */}
          <div className="overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_12px_48px_rgba(16,16,16,0.06)]">
            <div className="grid lg:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[400px]">
                <Image
                  key={spaces[activeSpace].id}
                  src={spaces[activeSpace].image}
                  alt={spaces[activeSpace].title}
                  fill
                  unoptimized
                  className="object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
              </div>

              {/* Texte */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <p className="text-xs uppercase tracking-[0.22em] text-primary/72">
                  {spaces[activeSpace].tag}
                </p>
                <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-tight lg:text-3xl">
                  {spaces[activeSpace].title}
                </h3>
                <p className="mt-4 text-base leading-8 text-black/62">
                  {spaces[activeSpace].description}
                </p>
                <div className="mt-8 flex gap-2">
                  {spaces.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSpace(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeSpace === i
                          ? "w-8 bg-[rgb(22,92,71)]"
                          : "w-1.5 bg-black/20 hover:bg-black/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. NOS VALEURS ═══════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-15 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-12">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                Ce qui nous guide
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Une approche artistique exigeante et humaine
              </h2>
            </div>
          </Reveal>

          <div className="divide-y divide-black/6 border-t border-black/6">
            {values.map((v, i) => (
              <Reveal key={v.number} delay={(i % 2) as 0 | 1}>
                <div className="grid gap-2 py-3 lg:grid-cols-[72px_1fr_2fr] lg:gap-5 lg:py-4">
                  <span className="text-5xl font-semibold tracking-tight text-primary/10 lg:text-6xl">
                    {v.number}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl lg:pt-1">
                    {v.title}
                  </h3>
                  <p className="text-sm leading-7 text-black/60 sm:text-base sm:leading-8 lg:pt-1">
                    {v.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. COMPTE À REBOURS + CTA ════════════════════════════════════════ */}
      <section className="relative text-white overflow-hidden" style={{ background: "rgb(22,92,71)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(185,151,83,0.16),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(15,75,57,0.70),transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative site-shell-wide px-10 py-15 md:px-10 lg:px-20 lg:py-15">
          <div className="grid gap-0 lg:grid-cols-2 lg:items-center lg:gap-0">

            {/* Gauche — texte */}
            <div>
              <Reveal>
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                  Ouverture · Septembre 2028
                </p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  Les premières inscriptions sont ouvertes
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                  Crea'Star ouvre ses portes en septembre 2028 dans le Brabant Wallon. Les groupes sont limités à 15 élèves — les candidatures seront traitées par ordre d'arrivée.
                </p>
              </Reveal>
              <Reveal delay={3}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/inscriptions"
                    className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold !text-[rgb(22,92,71)] transition hover:bg-white/90"
                  >
                    Pré-inscription →
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/50 hover:text-white"
                  >
                    Poser une question
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Droite — compte à rebours */}
            <Reveal delay={2}>
              <div className="rounded-[28px] border border-white/15 bg-white/10 p-8 backdrop-blur-sm lg:p-10">
                <p className="mb-6 text-xs uppercase tracking-[0.24em] text-white/55">
                  Ouverture dans
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: countdown.days, label: "jours" },
                    { value: countdown.hours, label: "heures" },
                    { value: countdown.minutes, label: "minutes" },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="rounded-[18px] border border-white/15 bg-white/12 px-4 py-5 text-center"
                    >
                      <p className="text-4xl font-semibold tabular-nums tracking-tight lg:text-5xl">
                        {String(unit.value).padStart(2, "0")}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-[16px] border border-[rgba(185,151,83,0.35)] bg-[rgba(185,151,83,0.12)] px-5 py-4">
                  <p className="text-sm leading-6 text-white/90">
                    <span className="font-semibold text-[rgb(230,196,120)]">Places limitées.</span>{" "}
                    Les groupes ne dépasseront jamais 15 élèves. Les premières candidatures seront traitées en priorité.
                  </p>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

    </main>
  );
}