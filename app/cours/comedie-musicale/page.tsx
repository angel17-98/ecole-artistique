"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Reveal from "../../components/Reveal";
import InscriptionModal from "../../components/InscriptionModal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const experienceCards = [
  {
    eyebrow: "Interpréter",
    title: "Un personnage qui te dépasse",
    text: "La comédie musicale, c'est habiter quelqu'un d'autre — avec ta voix, ton corps, ton regard. On travaille l'incarnation du personnage à travers les trois disciplines : chant, danse et jeu.",
  },
  {
    eyebrow: "Construire",
    title: "Un spectacle collectif de A à Z",
    text: "Le groupe ne joue pas un spectacle existant — il en construit un ensemble. Choix du répertoire, mise en scène, chorégraphies, rôles : chaque décision est collective et assumée.",
  },
  {
    eyebrow: "Répéter",
    title: "Dans les conditions du spectacle",
    text: "Les répétitions s'intensifient au fil de l'année. On travaille en conditions réelles — lumières, placement, costumes — pour que le soir de la première, la scène soit déjà familière.",
  },
  {
    eyebrow: "Performer",
    title: "Devant un public, en costume, sur scène",
    text: "La première, c'est la finalité de toute l'année. Un spectacle complet, avec lumières, costumes et une salle remplie. Pas un aperçu — une vraie représentation de comédie musicale.",
  },
];

const levels = [
  {
    number: "01",
    title: "Fondations",
    objective:
      "Premiers repères en chant, danse et jeu dramatique. Découverte du travail d'ensemble, apprentissage des codes de la comédie musicale et constitution progressive du groupe.",
    spectacle: "Présentation interne d'extraits du répertoire travaillé",
  },
  {
    number: "02",
    title: "Interprétation",
    objective:
      "Approfondir la technique dans chaque discipline, renforcer la cohésion du groupe et commencer à construire des personnages. L'accent est mis sur la justesse et la présence.",
    spectacle: "Présentation publique courte — extraits du spectacle en préparation",
  },
  {
    number: "03",
    title: "Mise en scène",
    objective:
      "Structurer le spectacle complet — dramaturgie, chorégraphies, scènes dialoguées. Le groupe entre dans la phase de production et défend des choix artistiques collectifs.",
    spectacle: "Spectacle complet avec mise en scène partielle",
  },
  {
    number: "04",
    title: "Performance",
    objective:
      "Affiner chaque détail, renforcer l'endurance scénique et préparer la première. L'objectif est de tenir le spectacle entier devant un public avec l'exigence professionnelle qui va avec.",
    spectacle: "Première complète — spectacle entier, public, lumières, costumes",
  },
];

const disciplines = [
  { name: "Chant", desc: "Technique vocale, justesse, interprétation de répertoire et chant choral" },
  { name: "Danse", desc: "Chorégraphie narrative, synchronisation collective, style et énergie scénique" },
  { name: "Théâtre & jeu", desc: "Construction du personnage, texte, dialogue, réactions et présence" },
  { name: "Ecriture & Mise en scène", desc: "Ecriture de texte, dramaturgie, placement scénique, direction d'acteurs et cohérence visuelle" },
  { name: "Expression scénique", desc: "Regard, intention, transitions, costumes et habiter l'espace" },
];

const premiumBenefits = [
  { value: "30%", text: "sur la location des salles et studio" },
  { value: "15%", text: "sur les cours individuels" },
  { value: "10%", text: "pour les membres de la famille", note: "preuve exigée" },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function ComedieMusicale() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen text-foreground">

      {/* Modale d'inscription */}
      {modalOpen && (
        <InscriptionModal
          parcours="comedie-musicale"
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── HERO ── */}
      <section className="relative -mt-24 min-h-[68vh] overflow-hidden pt-24 lg:min-h-[64svh]">
        <div className="absolute inset-0">
          <Image
            src="/programmes/comedie-musicale.jpg"
            alt="Parcours Comédie Musicale — CREA'STAR"
            fill
            priority
            unoptimized
            className="object-cover object-[72%_top]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.80)_0%,rgba(10,10,10,0.54)_34%,rgba(10,10,10,0.18)_68%,rgba(10,10,10,0.06)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.10),transparent_24%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.12),transparent_26%)]" />
        </div>

        <div className="relative z-10 flex min-h-[68svh] items-end lg:min-h-[64svh]">
          <div className="site-shell-wide w-full px-6 pb-16 pt-36 md:px-10 lg:px-14 lg:pb-24 lg:pt-40">
            <div className="max-w-5xl">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                  Nos cours · Parcours annuel
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                  Parcours{" "}
                  <span className="text-[rgb(var(--accent))]">Comédie Musicale</span>
                  <br />
                  Construire un spectacle, ensemble
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-8 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                  Le parcours Comédie Musicale réunit chant, danse et théâtre au service
                  d'un projet collectif ambitieux — la création d'un spectacle original,
                  de la première répétition jusqu'à la première devant le public.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-[rgb(var(--background-soft))]"
                  >
                    Rejoindre le parcours
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white/60 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/40"
                  >
                    Poser une question
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-sm text-white/80">
                  <span>2h de cours par semaine</span>
                  <span>•</span>
                  <span>60h sur l'année</span>
                  <span>•</span>
                  <span>Spectacle original en fin d'année</span>
                  <span>•</span>
                  <span>Studio d'enregistrement inclus</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(247,244,238,0.12))]" />
      </section>

      {/* ── ACCROCHE ── */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Reveal>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Le concept
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                  Une année pour construire un vrai spectacle, de zéro
                </h2>
                <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                  Le parcours Comédie Musicale n'est pas un atelier où l'on reproduit des extraits de comédies musicales connues. C'est un projet collectif où le groupe construit son propre spectacle — choisit le répertoire, conçoit la mise en scène, travaille les personnages et défend le tout devant un public.
                </p>
                <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                  Deux heures par semaine, en groupe de 10 à 15 élèves maximum, avec
                  un fil dramaturgique qui relie l'ensemble des disciplines vers un seul
                  objectif : une première digne de ce nom, en fin d'année.
                </p>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "2h", label: "par semaine de cours" },
                  { value: "60h", label: "de formation sur l'année" },
                  { value: "≤ 15", label: "élèves par groupe" },
                  { value: "4", label: "niveaux de progression" },
                ].map((stat) => (
                  <div
                    key={stat.value}
                    className="rounded-[24px] border border-black/6 bg-white/80 p-6 shadow-[0_10px_30px_rgba(16,16,16,0.05)] text-center"
                  >
                    <p className="text-4xl font-semibold tracking-tight text-primary">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/62">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── L'EXPÉRIENCE ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                L'expérience
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Concrètement, une année Comédie Musicale c'est quoi ?
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {experienceCards.map((card, index) => (
              <Reveal key={card.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="soft-card relative h-full overflow-hidden rounded-[26px] p-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/76">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                    {card.text}
                  </p>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(22,92,71,0.06),transparent_65%)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCIPLINES ── */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Programme
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                5 disciplines au service d'un seul spectacle
              </h2>
              <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                Les 60 heures annuelles sont réparties entre 5 disciplines complémentaires —
                toutes orientées vers la production du spectacle de fin d'année.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {disciplines.map((discipline, index) => (
              <Reveal key={discipline.name} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="rounded-[24px] border border-black/6 bg-white/82 p-7 shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                  <div className="flex items-start gap-4">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <div>
                      <h3 className="text-base font-semibold">{discipline.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-black/62">
                        {discipline.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LES 4 NIVEAUX ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mx-auto max-w-8xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Progression
              </p>
              <h2 className="mt-4 text-8xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                4 niveaux pour aller jusqu'à la première
              </h2>
              <p className="mt-6 text-base leading-8 text-black/66 sm:text-lg">
                Le parcours peut s'étendre sur 4 années. Chaque niveau prépare au suivant —
                avec une exigence artistique croissante et une autonomie collective grandissante.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {levels.map((level, index) => (
              <Reveal key={level.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="soft-card relative overflow-hidden rounded-[26px] p-8">
                  <div className="flex items-start gap-5">
                    <span className="text-4xl font-semibold tracking-tight text-black/10">
                      {level.number}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">{level.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-black/66 sm:text-base">
                        {level.objective}
                      </p>
                      <div className="mt-5 flex items-start gap-2 rounded-[16px] border border-primary/10 bg-[rgb(var(--background-soft))/0.6] px-4 py-3">
                        <span className="mt-0.5 text-primary/70">★</span>
                        <p className="text-sm leading-6 text-primary/78">
                          {level.spectacle}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(22,92,71,0.05),transparent_65%)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── POUR QUI + CANDIDATURE ── */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-20">
            <Reveal>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Pour qui ?
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                  Pour ceux qui veulent jouer, chanter et danser ensemble
                </h2>
                <div className="mt-6 space-y-4 text-base leading-8 text-black/68 sm:text-lg">
                  <p>
                    Le parcours Comédie Musicale est ouvert{" "}
                    <strong className="text-primary">à partir de 8 ans</strong>,
                    sans limite d'âge. Les groupes sont constitués selon l'âge et le niveau
                    pour garantir une cohésion réelle et un projet collectif ambitieux.
                  </p>
                  <p>
                    Aucune expérience préalable n'est requise. Ce qui compte,
                    c'est l'envie de jouer le jeu collectif — d'apprendre, de s'investir
                    et de défendre quelque chose ensemble.
                  </p>
                </div>

                {/* Bloc candidature */}
                <div className="mt-8 rounded-[20px] border border-primary/14 bg-white/80 p-6 shadow-[0_8px_24px_rgba(16,16,16,0.05)]">
                  <p className="text-sm font-semibold text-black">
                    Comment s'inscrire ?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/62">
                    L'accès au parcours se fait par candidature — pas d'audition,
                    pas de niveau requis. Une lettre d'intention et une courte vidéo
                    suffisent pour nous permettre de te connaître.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3"
                  >
                    Voir comment ça se passe <span aria-hidden>→</span>
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="space-y-3 lg:mt-[4.5rem]">
                {[
                  { label: "Âge d'entrée", value: "Dès [âge à confirmer]" },
                  { label: "Taille des groupes", value: "10 à 15 élèves max." },
                  { label: "Rythme", value: "2h / semaine minimum" },
                  { label: "Durée du parcours", value: "1 à 4 ans" },
                  { label: "Expérience requise", value: "Aucune" },
                  { label: "Accès", value: "Sur candidature" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[18px] border border-black/6 bg-white/80 px-5 py-3.5 shadow-[0_4px_16px_rgba(16,16,16,0.04)]"
                  >
                    <span className="text-sm text-black/56">{item.label}</span>
                    <span className="text-sm font-semibold text-primary">{item.value}</span>
                  </div>
                ))}

                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-2 w-full inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-strong"
                >
                  Déposer ma candidature
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── TARIF & PREMIUM ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Tarif
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Un tarif tout inclus, avec des avantages Premium
              </h2>
              <p className="mt-6 text-base leading-8 text-black/66 sm:text-lg">
                Toute inscription au parcours Comédie Musicale inclut automatiquement
                le <strong className="text-primary">statut Premium</strong> —
                avec des réductions sur l'ensemble des services du centre.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-14 overflow-hidden rounded-[32px] border border-black/6 bg-white/82 shadow-[0_18px_60px_rgba(16,16,16,0.06)]">
              <div className="grid gap-0 divide-y divide-black/6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  { label: "Durée", value: "60h", sub: "par année scolaire" },
                  { label: "Tarif", value: "1 450 €", sub: "tout inclus, hors studio" },
                  { label: "Paiement", value: "Flexible", sub: "annuel, trimestriel ou mensuel" },
                ].map((item) => (
                  <div key={item.label} className="px-8 py-10 text-center sm:py-12">
                    <p className="text-xs uppercase tracking-[0.22em] text-primary/76">
                      {item.label}
                    </p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-black/56">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/6 bg-[rgb(var(--background-soft))/0.4] px-8 py-10 sm:px-10">
                <p className="text-xs uppercase tracking-[0.22em] text-primary/76">
                  Avantages inclus — Statut Premium
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {premiumBenefits.map((benefit) => (
                    <div
                      key={benefit.value}
                      className="rounded-[20px] border border-black/6 bg-white/76 px-6 py-5 text-center"
                    >
                      <p className="text-3xl font-semibold text-primary">{benefit.value}</p>
                      <p className="mt-2 text-sm leading-6 text-black/66">
                        {benefit.text}
                        {benefit.note && (
                          <span className="block mt-1 text-xs text-black/44">
                            {benefit.note}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative px-6 py-12 md:px-10 lg:px-14 lg:py-16">
        <div className="site-shell-wide">
          <Reveal>
            <div className="relative overflow-hidden rounded-[34px] border border-black/6 shadow-[0_25px_90px_rgba(16,16,16,0.08)]">
              <div className="absolute inset-0">
                <Image
                  src="/programmes/comedie-musicale.jpg"
                  alt="Rejoindre le parcours Comédie Musicale CREA'STAR"
                  fill
                  unoptimized
                  className="object-cover object-center"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.18),rgba(10,10,10,0.52))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(185,151,83,0.10),transparent_52%)]" />
              </div>

              <div className="relative z-10 px-6 py-24 text-center md:px-10 lg:px-14 lg:py-28">
                <Reveal>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/72">
                    Rejoindre le parcours
                  </p>
                </Reveal>

                <Reveal delay={1}>
                  <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl text-balance">
                    Prêt à monter sur scène avec ton groupe ?
                  </h2>
                </Reveal>

                <Reveal delay={2}>
                  <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
                    Les inscriptions pour l'année 2028 sont ouvertes. Dépose ta candidature
                    et rejoins un groupe qui va construire quelque chose de grand ensemble.
                  </p>
                </Reveal>

                <Reveal delay={3}>
                  <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                    >
                      Déposer ma candidature
                    </button>
                    <Link
                      href="/cours/calendrier"
                      className="inline-flex items-center justify-center rounded-full border border-white/24 bg-white/50 px-10 py-4 text-base font-medium text-white transition hover:bg-white/40"
                    >
                      Voir le calendrier
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}