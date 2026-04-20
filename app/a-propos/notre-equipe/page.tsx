"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Reveal from "../../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const founders = [
  {
    name: "Lisman Angélie",
    role: "Direction générale & pédagogique",
    tag: "Fondatrice",
    tagline: "Placer la création au cœur du processus d'apprentissage.",
    bio: [
      "Angélie porte la vision qui a donné naissance à Crea'Star — celle d'un lieu où chant, danse, théâtre et studio ne sont pas des cours séparés, mais les facettes d'un même parcours artistique.",
      "Sa participation à The Voice Belgique en 2017 lui a permis de vivre de l'intérieur ce que signifie construire une identité artistique sous pression. Cette expérience a ancré sa conviction : l'expression artistique ne se limite pas à la technique — elle s'enracine dans la création et la singularité de chaque personne.",
      "À travers Crea'Star, elle accompagne l'émergence d'une nouvelle génération d'artistes complets, capables d'explorer, d'inventer et de construire leur propre univers.",
    ],
    image: "/equipe/lisman-angelie.jpg",
    disciplines: ["Direction générale", "Chant", "Vision artistique"],
  },
  {
    name: "Delvaux Mélissa",
    role: "Direction artistique",
    tag: "Fondatrice",
    tagline: "Accompagner l'artiste dans ses choix, son univers.",
    bio: [
      "Mélissa apporte à Crea'Star une double expérience — celle du soin et de l'accompagnement humain d'un côté, celle de la scène de l'autre. Deux univers qui, chez elle, forment une pédagogie attentive, bienveillante et centrée sur l'épanouissement.",
      "Depuis plus de 20 ans, elle évolue dans l'univers du spectacle au sein d'une troupe de cabaret dont elle a repris la direction artistique. Cette longue présence sur scène nourrit son travail au quotidien au sein de Crea'Star.",
      "Elle supervise les ateliers d'éveil musical et accompagne les élèves tout au long de leur parcours — avec l'œil de quelqu'un qui sait ce que ça demande d'être sur scène.",
    ],
    image: "/equipe/delvaux-melissa.jpg",
    disciplines: ["Direction artistique", "Éveil musical", "Mise en scène"],
  },
];

const disciplines = ["Tous", "Chant", "Danse", "Théâtre", "Studio", "Coaching vocal", "Création"];

const pedagogicalTeam = [
  { name: "Nom Prénom 1", discipline: "Chant", detail: "Technique vocale · Interprétation", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 2", discipline: "Danse", detail: "Expression corporelle · Chorégraphie", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 3", discipline: "Théâtre", detail: "Jeu scénique · Improvisation", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 4", discipline: "Coaching vocal", detail: "Voix · Présence · Performance", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 5", discipline: "Studio", detail: "Enregistrement · Production", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 6", discipline: "Création", detail: "Écriture · Composition", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 7", discipline: "Danse", detail: "Mouvement · Énergie scénique", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 8", discipline: "Théâtre", detail: "Présence · Émotion · Jeu", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 9", discipline: "Coaching vocal", detail: "Technique · Souffle · Justesse", image: "/equipe/avatar.jpg" },
  { name: "Nom Prénom 10", discipline: "Chant", detail: "Interprétation · Style · Authenticité", image: "/equipe/avatar.jpg" },
];

const principles = [
  {
    number: "01",
    title: "Écouter d'abord",
    text: "Chaque élève arrive avec son histoire, son niveau, sa sensibilité. L'accompagnement commence toujours par là.",
  },
  {
    number: "02",
    title: "Exiger avec bienveillance",
    text: "Progresser demande un cadre solide et un climat de confiance. On pousse loin — mais jamais sans l'élève.",
  },
  {
    number: "03",
    title: "Relier technique et identité",
    text: "L'objectif n'est pas de bien reproduire. C'est d'aider chacun à affirmer sa voix, sa présence et son univers.",
  },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function NotreEquipePage() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filtered = activeFilter === "Tous"
    ? pedagogicalTeam
    : pedagogicalTeam.filter((m) => m.discipline === activeFilter);

  return (
    <main className="min-h-screen text-foreground">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative -mt-24 min-h-[78svh] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src="/equipe/hero-equipe-test.jpg"
            alt="L'équipe Crea'Star — formateurs et fondatrices"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,4,4,0.90)_0%,rgba(4,4,4,0.65)_42%,rgba(4,4,4,0.20)_72%,rgba(4,4,4,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_28%,rgba(4,4,4,0.70)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.09),transparent_30%)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="site-shell-wide px-6 pb-14 md:px-10 lg:px-14 lg:pb-20">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">
                À propos · Notre équipe
              </p>
            </Reveal>
            <Reveal delay={1}>
              <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
            </Reveal>
            <Reveal delay={1}>
              <h1 className="max-w-8xl text-4xl font-semibold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-[3.6rem]">
                Des artistes qui enseignent ce qu'ils vivent
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-5 max-w-8xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
                L'équipe de Crea'Star est composée de praticiens — des personnes qui continuent à créer, à se produire et à apprendre.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 2. LES FONDATRICES ═══════════════════════════════════════════════ */}
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-16">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                À l'origine
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Deux fondatrices, une vision commune
              </h2>
            </div>
          </Reveal>

          <div className="space-y-8">
            {founders.map((f, i) => (
              <Reveal key={f.name} delay={(i % 2) as 0 | 1}>
                <article className="group relative overflow-hidden rounded-[32px] border border-black/6 bg-white shadow-[0_16px_56px_rgba(16,16,16,0.06)] transition hover:shadow-[0_24px_72px_rgba(16,16,16,0.10)]">
                  <div className={`grid lg:grid-cols-[1fr_380px] ${i % 2 === 1 ? "lg:grid-cols-[380px_1fr]" : ""}`}>

                    {/* Texte — toujours en premier dans le DOM pour l'accessibilité */}
                    <div className={`flex flex-col justify-center p-8 lg:p-12 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                      {/* Tag + discipline */}
                      <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[rgb(22,92,71)] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.20em] text-white">
                          {f.tag}
                        </span>
                        {f.disciplines.map((d) => (
                          <span key={d} className="rounded-full border border-black/8 bg-[rgb(239,244,239)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-black/54">
                            {d}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {f.name}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-primary/82">
                        {f.role}
                      </p>

                      {/* Phrase signature */}
                      <blockquote className="mt-5 border-l-2 border-[rgb(185,151,83)] pl-4">
                        <p className="text-base font-medium italic leading-7 text-black/70 sm:text-lg">
                          &ldquo;{f.tagline}&rdquo;
                        </p>
                      </blockquote>

                      {/* Bio */}
                      <div className="mt-6 space-y-4">
                        {f.bio.map((para, j) => (
                          <p key={j} className="text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Photo */}
                    <div className={`relative min-h-[320px] overflow-hidden lg:min-h-[520px] ${i % 2 === 1 ? "lg:order-1 rounded-t-[32px] lg:rounded-l-[32px] lg:rounded-tr-none" : "rounded-t-[32px] lg:rounded-r-[32px] lg:rounded-tl-none"}`}>
                      <Image
                        src={f.image}
                        alt={f.name}
                        fill
                        unoptimized
                        className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
                        sizes="(min-width: 1024px) 380px, 100vw"
                      />
                      {/* Overlay subtil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>

                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. PHILOSOPHIE PÉDAGOGIQUE — vert émeraude ══════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ background: "rgb(22,92,71)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.14),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,75,57,0.65),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-14">
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">
                Notre pédagogie
              </p>
              <h2 className="mt-4 max-w-6xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Trois principes qui guident chaque intervenant
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px bg-white/10 overflow-hidden rounded-[24px] sm:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.number} delay={(i % 3) as 0 | 1 | 2}>
                <div className="flex flex-col gap-4 bg-white/5 p-8 lg:p-10">
                  <span className="text-5xl font-semibold tracking-tight text-white/12 lg:text-6xl">
                    {p.number}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug sm:text-xl">
                    {p.title}
                  </h3>
                  <p className="text-sm leading-7 text-white/65">
                    {p.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. ÉQUIPE PÉDAGOGIQUE — grille avec filtre ═══════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                Formateurs
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                L'équipe pédagogique
              </h2>
              <p className="mt-4 max-w-8xl text-sm leading-7 text-black/58 sm:text-base">
                Des intervenants actifs dans leur discipline, qui apportent à chaque cours
                une expérience de terrain et une exigence artistique réelle.
              </p>
            </div>
          </Reveal>

          {/* Filtres par discipline */}
          <div className="mb-8 flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => setActiveFilter(d)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === d
                    ? "bg-[rgb(22,92,71)] text-white"
                    : "border border-black/10 bg-white text-black/60 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Grille formateurs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {filtered.map((member, index) => (
              <Reveal key={member.name + member.discipline} delay={(index % 3) as 0 | 1 | 2}>
                <article className="group overflow-hidden rounded-[24px] border border-black/6 bg-white shadow-[0_6px_24px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_14px_40px_rgba(22,92,71,0.08)]">
                  {/* Photo portrait */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={`${member.name} — ${member.discipline}`}
                      fill
                      unoptimized
                      className="object-cover object-center transition duration-700 group-hover:scale-[1.04]"
                      sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    {/* Tag discipline flottant */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-block rounded-full border border-white/20 bg-black/52 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        {member.discipline}
                      </span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-semibold leading-snug">{member.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-black/50">{member.detail}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Note "en cours de recrutement" */}
          <Reveal>
            <div className="mt-10 rounded-[18px] border border-primary/12 bg-white/60 px-6 py-5">
              <p className="text-sm leading-6 text-black/56">
                <span className="font-semibold text-primary">L'équipe continue de se construire.</span>{" "}
                Crea'Star recrute des intervenants passionnés et actifs dans leur discipline pour compléter l'équipe à l'ouverture en 2028.{" "}
                <Link href="/contact" className="font-medium text-primary underline underline-offset-2 hover:no-underline">
                  Contactez-nous →
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 5. CTA REJOINDRE ═════════════════════════════════════════════════ */}
      <section className="relative bg-background overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.06),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-10">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-black/6 bg-[linear-gradient(135deg,rgb(255,253,249)_0%,rgb(237,244,237)_100%)] px-8 py-12 shadow-[0_20px_64px_rgba(16,16,16,0.07)] lg:px-14 lg:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_28%),radial-gradient(circle_at_right_bottom,rgba(22,92,71,0.08),transparent_30%)]" />

              <div className="relative grid gap-0 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
                    Rejoindre l'aventure
                  </p>
                  <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl lg:text-4xl">
                    Tu veux faire partie de l'équipe ?
                  </h2>
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-black/60 sm:text-base">
                    Crea'Star cherche des artistes-formateurs pour rejoindre le projet à l'ouverture en 2028. Si tu as une pratique active et l'envie d'accompagner des élèves, parle-nous de toi.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
                  >
                    Nous écrire →
                  </Link>
                  <Link
                    href="/a-propos/notre-ecole"
                    className="inline-flex items-center justify-center rounded-full border border-black/12 px-7 py-3.5 text-sm font-medium text-black/70 transition hover:border-black/24 hover:text-black"
                  >
                    Notre école
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}