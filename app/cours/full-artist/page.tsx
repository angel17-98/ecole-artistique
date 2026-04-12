import Image from "next/image";
import Link from "next/link";
import Reveal from "../../components/Reveal";

const levels = [
  {
    title: "Niveau 1 — Fondations",
    objective:
      "Apprentissage des bases techniques, découverte de la création, premiers repères dans les différentes disciplines et première approche du studio.",
  },
  {
    title: "Niveau 2 — Identité artistique",
    objective:
      "Se découvrir, trouver son univers, interpréter de façon plus cohérente, développer son répertoire personnel et renforcer sa musicalité.",
  },
  {
    title: "Niveau 3 — Production & Performance",
    objective:
      "Structurer son projet, renforcer la présence scénique, approfondir l’expérience de création et développer un travail studio plus poussé.",
  },
  {
    title: "Niveau 4 — Autonomie",
    objective:
      "Concrétiser une démarche plus mature, développer son autonomie artistique, créer ses propres contenus et performer avec plus d’assurance.",
  },
];

const disciplines = [
  "Danse",
  "Chant",
  "Théâtre / Impro",
  "Expression scénique",
  "Écriture / composition",
  "Sessions de studio d’enregistrement",
];

const experienceCards = [
  {
    title: "Créer ensemble",
    text: "L’année est pensée pour apprendre et évoluer en groupe, en s’entraidant à travers l’ensemble des disciplines et en construisant une vraie dynamique collective.",
  },
  {
    title: "Construire un projet",
    text: "Chaque année, les élèves proposent un projet à la direction et le mettent en scène à travers un spectacle. Ce projet peut être personnel, en duo ou collectif.",
  },
  {
    title: "Un fil rouge annuel",
    text: "Un thème commun guide l’élaboration du spectacle du centre CREA'STAR et permet de relier les projets de l’ensemble des élèves.",
  },
  {
    title: "Scène & studio",
    text: "Le parcours mène à une vraie expérience de spectacle, mais aussi à une expérience studio progressive : enregistrement collectif, maquettes personnelles et découverte de la composition MAO.",
  },
];

const premiumBenefits = [
  {
    value: "30%",
    text: "de réduction sur la location des salles et studios",
  },
  {
    value: "15%",
    text: "de réduction sur les cours individuels",
  },
  {
    value: "10%",
    text: "pour les membres de la famille",
    note: "preuve exigée",
  },
];

export default function FullArtistPage() {
  return (
    <main className="min-h-screen text-foreground">
      <section className="px-4 pb-8 pt-2 md:px-6">
        <div className="site-shell">
          <div className="relative overflow-hidden rounded-[34px] border border-black/6 bg-surface shadow-[0_25px_90px_rgba(16,16,16,0.08)]">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative z-10 px-6 py-12 md:px-10 md:py-16 lg:px-14 lg:py-20">
                <Reveal>
                  <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                    Nos cours • Parcours annuel
                  </p>
                </Reveal>

                <Reveal delay={1}>
                  <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl text-balance">
                    Parcours <span className="text-accent">Full Artist</span>
                  </h1>
                </Reveal>

                <Reveal delay={2}>
                  <p className="mt-8 max-w-3xl text-base leading-8 text-black/68 sm:text-lg">
                    Un parcours complet pour les artistes qui souhaitent créer leur
                    univers, explorer plusieurs disciplines et évoluer progressivement
                    vers une expression plus libre, plus riche et plus personnelle.
                  </p>
                </Reveal>

                <Reveal delay={3}>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/inscriptions"
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-strong"
                    >
                      S’inscrire
                    </Link>

                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full border border-primary/18 bg-white/84 px-6 py-3 text-sm font-medium text-black/82 transition hover:border-primary/28 hover:text-primary"
                    >
                      Nous contacter
                    </Link>

                    <Link
                      href="/cours/calendrier"
                      className="inline-flex items-center justify-center rounded-full border border-primary/18 bg-white/84 px-6 py-3 text-sm font-medium text-black/82 transition hover:border-primary/28 hover:text-primary"
                    >
                      Calendrier annuel
                    </Link>
                  </div>
                </Reveal>
              </div>

              <div className="relative min-h-[360px] lg:min-h-full">
                <Image
                  src="/programmes/full-artist-2.jpg"
                  alt="Programme Full Artist"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-[82%_center]"
                />
                <div className="absolute inset-0 hero-fade" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-shell">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Expérience
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                L’expérience Full Artist
              </h2>
              <p className="mt-6 text-base leading-8 text-black/66 sm:text-lg">
                Plus qu’un cours, le parcours Full Artist est une expérience
                collective et créative où l’on apprend, où l’on évolue ensemble,
                où l’on ose proposer, construire et mettre en scène un projet artistique.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
            {experienceCards.map((card, index) => (
              <Reveal key={card.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="soft-card relative overflow-hidden rounded-[26px] p-8">
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                    {card.text}
                  </p>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(22,92,71,0.06),transparent_65%)]" />
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <Reveal>
              <div className="space-y-6 text-base leading-8 text-black/68 sm:text-lg">
                <p>
                  L’objectif du parcours est de permettre à chaque élève
                  d’apprendre à créer, à évoluer avec les autres, à défendre ses
                  idées et à les faire exister sur scène dans un cadre structuré
                  et bienveillant.
                </p>

                <p>
                  Le rôle de la direction est d’accompagner chaque projet dans le
                  respect du désir, de l’univers artistique et de la sensibilité
                  de l’élève, afin de l’aider à concrétiser son projet de l’année.
                </p>

                <p>
                  Selon les besoins du spectacle, cette mise en forme peut passer
                  par des tableaux collectifs mêlant chant, danse, interprétation
                  et création scénique avec d’autres artistes.
                </p>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="overflow-hidden rounded-[30px] border border-black/6 bg-white/80 shadow-[0_14px_45px_rgba(16,16,16,0.05)]">
                <div className="relative aspect-[5/4] w-full">
                  <Image
                    src="/programmes/spectacle-fil-rouge.jpg"
                    alt="Création scénique et travail artistique"
                    fill
                    unoptimized
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,244,238,0.08),rgba(247,244,238,0.22))]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <Reveal>
            <div className="max-w-5xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Organisation
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                L’organisation du parcours
              </h2>

              <div className="mt-8 max-w-5xl space-y-6 text-base leading-8 text-black/68 sm:text-lg">
                <p>
                  Le parcours Full Artist s’adresse aux artistes qui souhaitent
                  créer leur univers artistique et explorer l’ensemble de
                  l’univers artistique musical dans une logique d’évolution globale.
                </p>

                <p>
                  L’objectif n’est pas d’être parfait immédiatement dans chaque
                  discipline, mais de progresser, de découvrir ses forces,
                  d’expérimenter, de créer et de devenir un artiste plus complet
                  au fil des années.
                </p>

                <p>
                  Le parcours est organisé en <strong className="text-primary">4 niveaux de progression</strong>,
                  pouvant s’étendre sur <strong className="text-primary">4 années possibles</strong>,
                  afin de respecter le rythme de chacun et d’accompagner une évolution cohérente.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-16">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl text-balance">
                  Les 4 niveaux de progression
                </h3>
                <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                  Une progression pensée sur plusieurs années, pour permettre à
                  chaque artiste d’évoluer réellement et de construire son parcours.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {levels.map((level, index) => (
                <Reveal key={level.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                  <div className="soft-card rounded-[26px] p-8">
                    <h4 className="text-2xl font-semibold tracking-tight">{level.title}</h4>
                    <p className="mt-5 text-sm leading-7 text-black/66 sm:text-base">
                      {level.objective}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <Reveal>
              <div className="max-w-6xl">
                <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Les disciplines du parcours
                </h3>

                <ul className="mt-6 list-disc space-y-4 pl-6 text-base leading-8 text-black/68 sm:text-lg marker:text-accent">
                  <li>
                    <strong className="text-primary">60 heures</strong> de cours
                    par an, hors répétitions, filages et structuration du spectacle.
                  </li>
                </ul>

                <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                  Les heures de cours sont réparties entre{" "}
                  <strong className="text-primary">6 disciplines complémentaires</strong>,
                  organisées selon l’année et le niveau de progression.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {disciplines.map((discipline, index) => (
                <Reveal key={discipline} delay={(index % 3) as 0 | 1 | 2 | 3}>
                  <div className="rounded-[24px] border border-black/6 bg-white/82 p-6 text-center shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                    <h4 className="text-lg font-semibold">{discipline}</h4>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={1}>
              <div className="mt-10 max-w-6xl space-y-5 text-base leading-8 text-black/68 sm:text-lg">
                <p>
                  En complément des 60 heures, les élèves bénéficient d’un
                  accompagnement de la direction artistique tout au long du
                  parcours dans la réflexion autour du spectacle et dans la mise
                  en place du projet de l’année.
                </p>

                <p>
                  La direction veille à respecter le désir, la sensibilité et
                  l’univers artistique de chaque élève afin de l’aider à
                  concrétiser sa progression et son projet.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <Reveal>
            <div className="overflow-hidden rounded-[32px] border border-primary/12 bg-[linear-gradient(135deg,rgba(22,92,71,0.92),rgba(15,75,57,0.96))] p-8 text-white shadow-[0_20px_60px_rgba(16,16,16,0.12)] sm:p-10 lg:p-12">
              <p className="text-sm uppercase tracking-[0.24em] text-white/72">
                Pour qui ?
              </p>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl text-balance">
                Pour ceux qui veulent créer leur univers et devenir un artiste complet
              </h2>

              <ul className="mt-8 list-disc space-y-4 pl-6 text-base leading-8 text-white/82 sm:text-lg marker:text-[rgb(var(--accent))]">
                <li>
                  Le parcours Full Artist est accessible <strong className="text-[rgb(var(--accent))]">à partir de 8 ans</strong>,
                  sans limite d’âge.
                </li>

                <li>
                  Les groupes sont formés principalement <strong className="text-[rgb(var(--accent))]">en fonction de l’âge</strong>,
                  pour un même niveau.
                </li>

                <li>
                  Chaque groupe accueille <strong className="text-[rgb(var(--accent))]">10 à 15 élèves maximum</strong>.
                </li>

                <li>
                  Lors de l’inscription, il est possible d’indiquer le souhait
                  d’être dans le même groupe qu’un autre élève précis.
                </li>

                <li>
                  Le parcours est pensé pour respecter le niveau, le rythme et la
                  sensibilité de chacun.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Tarif
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Tarif & avantages Premium
              </h2>

              <p className="mt-6 text-base leading-8 text-black/66 sm:text-lg">
                Toute inscription au parcours Full Artist inclut automatiquement
                le <strong className="text-primary">statut Premium</strong>.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-14 rounded-[32px] border border-black/6 bg-white/82 p-8 shadow-[0_18px_60px_rgba(16,16,16,0.06)] backdrop-blur-sm sm:p-10 lg:p-12">
              <div className="grid gap-10 lg:grid-cols-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                    Durée
                  </p>
                  <p className="mt-4 text-3xl font-semibold">60h / an</p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                    Tarif
                  </p>
                  <p className="mt-4 text-3xl font-semibold">1650 €</p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                    Paiement
                  </p>
                  <p className="mt-4 text-base leading-8 text-black/68 sm:text-lg">
                    Annuel, trimestriel ou mensuel
                  </p>
                </div>
              </div>

              <div className="mt-14 grid gap-8 md:grid-cols-3">
                {premiumBenefits.map((benefit, index) => (
                  <Reveal key={benefit.value} delay={(index + 1) as 1 | 2 | 3}>
                    <div className="rounded-[24px] border border-black/6 bg-[rgb(var(--background-soft))/0.55] p-8 text-center">
                      <p className="text-3xl font-semibold text-primary">{benefit.value}</p>
                      <p className="mt-3 text-base leading-7 text-black/68">
                        {benefit.text}
                        {benefit.note ? (
                          <span className="block text-sm text-black/48">{benefit.note}</span>
                        ) : null}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}