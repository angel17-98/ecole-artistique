import Image from "next/image";
import Link from "next/link";
import Reveal from "../../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const experienceCards = [
  {
    eyebrow: "Créer",
    title: "Un projet artistique personnel",
    text: "Chaque élève propose un projet à la direction selon son niveau — solo, duo ou collectif — et le concrétise tout au long de l'année jusqu'à la scène.",
  },
  {
    eyebrow: "Évoluer",
    title: "Dans un groupe qui avance ensemble",
    text: "L'année est pensée pour apprendre en collectif : s'entraider, partager les disciplines et construire une vraie dynamique de groupe.",
  },
  {
    eyebrow: "Enregistrer",
    title: "Un hymne commun chaque année",
    text: "Chaque groupe enregistre une chanson collective en studio — l'hymne de l'année — et les niveaux avancés explorent leurs propres maquettes et compositions.",
  },
  {
    eyebrow: "Performer",
    title: "Sur une vraie scène, devant le public",
    text: "Le parcours aboutit à un spectacle public dans une vraie salle. Pas une répétition ouverte — une vraie représentation, avec tout ce que ça implique.",
  },
];

const levels = [
  {
    number: "01",
    title: "Fondations",
    objective:
      "Premiers repères techniques dans chaque discipline, découverte de la création et approche du travail de studio en groupe.",
    studio: "Enregistrement de l'hymne collectif de l'année",
  },
  {
    number: "02",
    title: "Identité artistique",
    objective:
      "Affiner son univers, interpréter avec plus de cohérence, développer un répertoire personnel et renforcer sa musicalité.",
    studio: "Hymne collectif + premières maquettes personnelles",
  },
  {
    number: "03",
    title: "Production & Performance",
    objective:
      "Structurer son projet, renforcer la présence scénique et approfondir le travail studio avec des compositions plus abouties.",
    studio: "Hymne collectif + compositions et maquettes avancées",
  },
  {
    number: "04",
    title: "Autonomie",
    objective:
      "Concrétiser une démarche mature, créer ses propres contenus, performer avec assurance et affiner son identité artistique.",
    studio: "Hymne collectif + projet studio personnel complet",
  },
];

const disciplines = [
  { name: "Chant", desc: "Technique vocale, interprétation, mise en voix" },
  { name: "Danse", desc: "Expression corporelle, chorégraphie, énergie scénique" },
  { name: "Théâtre & Impro", desc: "Jeu, présence, réactivité et liberté d'expression" },
  { name: "Écriture & Composition", desc: "Créer ses propres textes, mélodies et univers" },
  { name: "Expression scénique", desc: "Présence, regard, intention et puissance sur scène" },
  { name: "Studio d'enregistrement", desc: "Technique, prise de son, écoute critique" },
];

const premiumBenefits = [
  { value: "30%", text: "sur la location des salles et studio" },
  { value: "15%", text: "sur les cours individuels" },
  { value: "10%", text: "pour les membres de la famille", note: "preuve exigée" },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function FullArtistPage() {
  return (
    <main className="min-h-screen text-foreground">

      {/* ── HERO FULL WIDTH — cohérent avec Notre École & Notre Équipe ── */}
      <section className="relative -mt-24 min-h-[68vh] overflow-hidden pt-24 lg:min-h-[64svh]">
        <div className="absolute inset-0">
          <Image
            src="/programmes/full-artist.jpg"
            alt="Parcours Full Artist — performance scénique CREA'STAR"
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
                  Nos cours • Parcours annuel
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                  Parcours{" "}
                  <span className="text-[rgb(var(--accent))]">Full Artist</span>
                  {" "}
                  <br />
                  Devenir un artiste complet
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-8 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                  Le parcours Full Artist réunit chant, danse, théâtre, écriture, composition, expréssion scénique
                  et studio dans une seule expérience annuelle — pensée pour ceux
                  qui veulent créer, pas seulement interpréter.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/inscriptions"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-[rgb(var(--background-soft))]"
                  >
                    S'inscrire
                  </Link>
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
                  <span>Spectacle public en fin d'année</span>
                  <span>•</span>
                  <span>Studio d'enregistrement inclus</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(247,244,238,0.12))]" />
      </section>

      {/* ── ACCROCHE — ce que c'est vraiment ── */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Reveal>
              <div>
                <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                  Le concept
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                  Une année entière pour créer, progresser et monter sur scène
                </h2>
                <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                  Le Full Artist n'est pas un cours de chant ou de danse parmi d'autres.
                  C'est un parcours pluridisciplinaire où chaque élève construit, tout au long
                  de l'année, un projet artistique personnel — encadré, structuré et défendu
                  jusqu'à la scène.
                </p>
                <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                  Deux heures par semaine, en groupe de 10 à 15 élèves maximum, avec
                  un fil conducteur annuel qui relie tous les projets autour d'un thème commun —
                  et un spectacle public en fin d'année pour concrétiser ce travail collectif.
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

      {/* ── CE QUE ÇA IMPLIQUE CONCRÈTEMENT ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                L'expérience
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Concrètement, une année Full Artist c'est quoi ?
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {experienceCards.map((card, index) => (
              <Reveal key={card.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="soft-card relative overflow-hidden rounded-[26px] p-8 h-full">
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

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="max-w-10xl">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                Programme
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                6 disciplines, une seule intention : faire de toi un artiste complet
              </h2>
              <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                Les 60 heures annuelles sont réparties entre 6 disciplines complémentaires,
                organisées selon le niveau et les besoins du projet de chaque groupe.
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

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                Progression
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                4 niveaux pour grandir à ton rythme
              </h2>
              <p className="mt-6 text-base leading-8 text-black/66 sm:text-lg">
                Le parcours peut s'étendre sur 4 années. L'objectif n'est pas d'être parfait
                dès le départ — c'est de progresser réellement, année après année.
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
                        <span className="mt-0.5 text-primary/70">♪</span>
                        <p className="text-sm leading-6 text-primary/78">
                          {level.studio}
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

      {/* ── POUR QUI ── */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
            <Reveal>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Pour qui ?
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                  Pour ceux qui veulent créer, partager son univers
                </h2>
                <div className="mt-8 space-y-4 text-base leading-8 text-black/68 sm:text-lg">
                  <p>
                    Le parcours Full Artist est ouvert{" "}
                    <strong className="text-primary">à partir de 8 ans</strong>, sans
                    limite d'âge. Les groupes sont constitués principalement selon
                    l'âge et le niveau, pour une progression cohérente et un vrai
                    esprit de groupe.
                  </p>
                  <p>
                    Aucune expérience préalable n'est requise pour le niveau 1.
                    Ce qui compte, c'est l'envie de créer, d'explorer et de s'investir
                    dans un projet collectif.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="space-y-4">
                {[
                  { label: "Âge d'entrée", value: "Dès 8 ans" },
                  { label: "Taille des groupes", value: "10 à 15 élèves max." },
                  { label: "Rythme", value: "2h / semaine" },
                  { label: "Durée du parcours", value: "1 à 4 ans" },
                  { label: "Expérience requise", value: "Motivation uniquement" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[20px] border border-black/6 bg-white/80 px-6 py-4 shadow-[0_6px_20px_rgba(16,16,16,0.04)]"
                  >
                    <span className="text-sm text-black/60">{item.label}</span>
                    <span className="text-sm font-semibold text-primary">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── TARIF & PREMIUM ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                Tarif
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Un tarif tout inclus, avec des avantages Premium
              </h2>
              <p className="mt-6 text-base leading-8 text-black/66 sm:text-lg">
                Toute inscription au parcours Full Artist inclut automatiquement
                le <strong className="text-primary">statut Premium</strong> —
                avec des réductions sur l'ensemble des services du centre.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-14 overflow-hidden rounded-[32px] border border-black/6 bg-white/82 shadow-[0_18px_60px_rgba(16,16,16,0.06)]">
              {/* Tarif principal */}
              <div className="grid gap-0 divide-y divide-black/6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  { label: "Durée", value: "60h", sub: "par année scolaire" },
                  { label: "Tarif", value: "1 650 €", sub: "tout inclus, studio compris" },
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

              {/* Avantages Premium */}
              <div className="border-t border-black/6 bg-[rgb(var(--background-soft))/0.4] px-8 py-10 sm:px-10">
                <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
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
                          <span className="block text-xs text-black/44 mt-1">
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
                  src="/programmes/full-artist-2.jpg"
                  alt="Rejoindre le parcours Full Artist CREA'STAR"
                  fill
                  unoptimized
                  className="object-cover object-[82%_center]"
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
                    Prêt à créer ton univers artistique ?
                  </h2>
                </Reveal>

                <Reveal delay={2}>
                  <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
                    Les inscriptions pour l'année 2027 sont ouvertes. Rejoins le parcours
                    Full Artist et commence à construire l'artiste que tu veux devenir.
                  </p>
                </Reveal>

                <Reveal delay={3}>
                  <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                      href="/inscriptions"
                      className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                    >
                      S'inscrire au parcours
                    </Link>
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