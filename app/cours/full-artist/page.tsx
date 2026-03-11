import Image from "next/image";
import Link from "next/link";

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

export default function FullArtistPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden h-[680px]">
        <div aria-hidden className="h-20" />

        <div className="absolute inset-0 mt-20">
          <Image
            src="/programmes/full-artist-2.jpg"
            alt="Programme Full Artist"
            fill
            priority
            unoptimized
            className="object-cover object-[82%_center]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-background/55 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(218,180,90,0.07),transparent_55%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-32 sm:pt-28 sm:pb-36 lg:pt-36 lg:pb-44">
          <div className="max-w-5xl">
            <p className="text-sm uppercase tracking-[0.22em] text-foreground/70">
              Nos cours • Parcours annuel
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Parcours
              <span className="block text-accent">Full Artist</span>
            </h1>

            <p className="mt-8 max-w-3xl text-base leading-relaxed text-foreground/85 sm:text-lg">
              Un parcours complet pour les artistes qui souhaitent créer leur
              univers, explorer plusieurs disciplines et évoluer progressivement
              vers une expression plus libre, plus riche et plus personnelle.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/inscriptions"
                className="inline-flex items-center justify-center rounded-xl border border-accent/60 bg-primary px-6 py-3 text-sm font-medium text-foreground transition hover:border-accent"
              >
                S’inscrire
              </Link>

              <Link
                href="/a-propos/contact"
                className="inline-flex items-center justify-center rounded-xl border border-accent/60 px-6 py-3 text-sm font-medium text-foreground transition hover:border-accent"
              >
                Nous contacter
              </Link>

              <Link
                href="/cours/calendrier"
                className="inline-flex items-center justify-center rounded-xl border border-accent/60 px-6 py-3 text-sm font-medium text-foreground transition hover:border-accent"
              >
                Calendrier annuel
              </Link>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* L’EXPÉRIENCE FULL ARTIST */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-24 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="relative inline-block text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              L’expérience Full Artist
              <span
                aria-hidden
                className="absolute left-1/2 top-full mt-4 h-px w-[140%] -translate-x-1/2 bg-accent/70"
              />
            </h2>

            <p className="mt-10 text-base leading-relaxed text-foreground/80 sm:text-lg">
              Plus qu’un cours, le parcours Full Artist est une expérience
              collective et créative où l’on apprend, où l’on évolue ensemble,
              où l’on ose proposer, construire et mettre en scène un projet
              artistique.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
            <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-accent/5 p-8">
              <h3 className="text-xl font-semibold">Créer ensemble</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/78 sm:text-base">
                L’année est pensée pour apprendre et évoluer en groupe, en
                s’entraidant à travers l’ensemble des disciplines et en
                construisant une vraie dynamique collective.
              </p>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(218,180,90,0.08),transparent_60%)]" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-accent/10 p-8">
              <h3 className="text-xl font-semibold">Construire un projet</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/78 sm:text-base">
                Chaque année, les élèves proposent un projet à la direction et
                le mettent en scène à travers un spectacle. Ce projet peut être
                personnel, en duo ou collectif.
              </p>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(5,102,79,0.10),transparent_60%)]" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-accent/5 p-8">
              <h3 className="text-xl font-semibold">Un fil rouge annuel</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/78 sm:text-base">
                Un thème commun guide l’élaboration du spectacle
                du centre Crea'Star et permet de relier les projets de
                l’ensemble des élèves.
              </p>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(218,180,90,0.08),transparent_60%)]" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-accent/10 p-8">
              <h3 className="text-xl font-semibold">Scène & studio</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/78 sm:text-base">
                Le parcours mène à une vraie expérience de spectacle, mais aussi
                à une expérience studio progressive : enregistrement collectif,
                maquettes personnelles et découverte de la composition MAO.
              </p>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(5,102,79,0.10),transparent_60%)]" />
            </div>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
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

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="relative aspect-[5/4] w-full">
                <Image
                  src="/programmes/spectacle-fil-rouge.jpg"
                  alt="Création scénique et travail artistique"
                  fill
                  unoptimized
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* L’ORGANISATION DU PARCOURS */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-24 sm:pt-8 sm:pb-20 lg:pt-8 lg:pb-24">
          <div className="max-w-5xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              L’organisation du parcours
            </h2>

            <div className="mt-10 max-w-5xl space-y-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
              <p>
                Le parcours Full Artist s’adresse aux artistes qui souhaitent
                créer leur univers artistique et explorer l’ensemble de
                l’univers artistique musical dans une logique d’évolution
                globale.
              </p>

              <p>
                L’objectif n’est pas d’être parfait immédiatement dans chaque
                discipline, mais de progresser, de découvrir ses forces,
                d’expérimenter, de créer et de devenir un artiste plus complet
                au fil des années.
              </p>

              <p>
                Le parcours est organisé en{" "}
                <strong className="text-accent">4 niveaux de progression</strong>,
                pouvant s’étendre sur{" "}
                <strong className="text-accent">4 années possibles</strong>, afin
                de respecter le rythme de chacun et d’accompagner une évolution
                cohérente, progressive et durable.
              </p>
            </div>
          </div>

          {/* Niveaux */}
          <div className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="relative inline-block text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Les 4 niveaux de progression
                <span
                  aria-hidden
                  className="absolute left-1/2 top-full mt-4 h-px w-[140%] -translate-x-1/2 bg-accent/70"
                />
              </h3>

              <p className="mt-10 text-base leading-relaxed text-foreground/80 sm:text-lg">
                Une progression pensée sur plusieurs années, pour permettre à
                chaque artiste d’évoluer réellement et de construire son
                parcours.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {levels.map((level) => (
                <div
                  key={level.title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8"
                >
                  <h4 className="text-2xl font-semibold tracking-tight">
                    {level.title}
                  </h4>

                  <p className="mt-5 text-sm leading-relaxed text-foreground/75 sm:text-base">
                    {level.objective}
                  </p>

                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(218,180,90,0.06),transparent_60%)]" />
                </div>
              ))}
            </div>
          </div>

          {/* Disciplines */}
          <div className="mt-20">
            <div className="max-w-6xl">
              <h3 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Les disciplines du parcours
              </h3>

              <ul className="mt-6 list-disc space-y-4 pl-6 text-base leading-relaxed text-foreground/80 sm:text-lg marker:text-accent">
                <li>
                  <strong className="text-accent">60 heures</strong> de cours
                  par an, hors répétitions, filages et structuration du
                  spectacle.
                </li>
              </ul>

              <p className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
                Les heures de cours sont réparties entre{" "}
                <strong className="text-accent">
                  6 disciplines complémentaires
                </strong>
                , organisées selon l’année et le niveau de progression.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {disciplines.map((discipline) => (
                <div
                  key={discipline}
                  className="rounded-2xl border border-accent/40 bg-background/70 p-6 backdrop-blur-sm"
                >
                  <h4 className="text-center text-lg font-semibold">
                    {discipline}
                  </h4>
                </div>
              ))}
            </div>

            <div className="mt-10 max-w-6xl space-y-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
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
          </div>
        </div>
      </section>

      {/* POUR QUI ? */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-white/10 bg-primary p-8 sm:p-10 lg:p-12">
            <p className="text-sm uppercase tracking-[0.22em] text-accent/80">
              Pour qui ?
            </p>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Pour ceux qui veulent créer leur univers et devenir un artiste complet
            </h2>

            <ul className="mt-8 list-disc space-y-4 pl-6 text-base leading-relaxed text-foreground/80 sm:text-lg marker:text-accent">
              <li>
                Le parcours Full Artist est accessible{" "}
                <strong className="text-accent">à partir de 8 ans</strong>,
                sans limite d’âge.
              </li>

              <li>
                Les groupes sont formés principalement{" "}
                <strong className="text-accent">en fonction de l’âge</strong>,
                pour un même niveau.
              </li>

              <li>
                Chaque groupe accueille{" "}
                <strong className="text-accent">10 à 15 élèves maximum</strong>.
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
        </div>
      </section>

      {/* TARIF & AVANTAGES PREMIUM */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="relative inline-block text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Tarif & avantages Premium
              <span
                aria-hidden
                className="absolute left-1/2 top-full mt-4 h-px w-[130%] -translate-x-1/2 bg-accent/70"
              />
            </h2>

            <p className="mt-10 text-base leading-relaxed text-foreground/80 sm:text-lg">
              Toute inscription au parcours Full Artist inclut automatiquement
              le <strong className="text-accent">statut Premium</strong>.
            </p>
          </div>

          <div className="mt-14 rounded-3xl border border-accent/25 bg-accent/5 p-8 sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-accent/80">
                  Durée
                </p>
                <p className="mt-4 text-3xl font-semibold">60h / an</p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-accent/80">
                  Tarif
                </p>
                <p className="mt-4 text-3xl font-semibold">1650 €</p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-accent/80">
                  Paiement
                </p>
                <p className="mt-4 text-base leading-relaxed text-foreground/80 sm:text-lg">
                  Annuel, trimestriel ou mensuel
                </p>
              </div>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-3xl font-semibold text-accent">30%</p>
                <p className="mt-3 text-base leading-relaxed text-foreground/80">
                  de réduction sur la location des salles et studios
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-3xl font-semibold text-accent">15%</p>
                <p className="mt-3 text-base leading-relaxed text-foreground/80">
                  de réduction sur les cours individuels
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-3xl font-semibold text-accent">10%</p>
                <p className="mt-3 text-base leading-relaxed text-foreground/80">
                  pour les membres de la famille
                  <span className="block text-sm text-foreground/60">
                    preuve exigée
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-background text-foreground">
        <div className="h-px w-full bg-accent/50" />

        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
            {/* LOGO + slogan */}
            <div>
              <img
                src="/Logo-footer.png"
                alt="Logo CREA'STAR"
                className="block w-[180px] h-auto"
              />

              <p className="mt-4 max-w-[260px] font-bold text-xl leading-relaxed text-foreground/80">
                La création au cœur
                <br />
                de l&apos;apprentissage
              </p>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-sm font-semibold text-foreground">À propos</p>

                <ul className="mt-4 space-y-1 text-sm text-foreground/70">
                  <li>
                    <a
                      href="/a-propos/notre-ecole"
                      className="transition hover:text-foreground"
                    >
                      Notre école
                    </a>
                  </li>
                  <li>
                    <a
                      href="/a-propos/notre-equipe"
                      className="transition hover:text-foreground"
                    >
                      Notre équipe
                    </a>
                  </li>
                  <li>
                    <a
                      href="/actualites"
                      className="transition hover:text-foreground"
                    >
                      Actualités
                    </a>
                  </li>
                  <li>
                    <a href="/FAQ" className="transition hover:text-foreground">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Notre offre
                </p>

                <ul className="mt-4 space-y-1 text-sm text-foreground/70">
                  <li>
                    <a
                      href="/cours/full-artist"
                      className="transition hover:text-foreground"
                    >
                      Full Artist
                    </a>
                  </li>
                  <li>
                    <a
                      href="/cours/comedie-musicale"
                      className="transition hover:text-foreground"
                    >
                      Comédie musicale
                    </a>
                  </li>
                  <li>
                    <a
                      href="/cours/eveil-musical"
                      className="transition hover:text-foreground"
                    >
                      Éveil musical
                    </a>
                  </li>
                  <li>
                    <a
                      href="/cours/cours-individuels"
                      className="transition hover:text-foreground"
                    >
                      Cours individuels
                    </a>
                  </li>
                  <li>
                    <a
                      href="/locations"
                      className="transition hover:text-foreground"
                    >
                      Location studio & salles
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="text-sm text-foreground/70 lg:text-right">
              <p className="font-semibold text-foreground">Coordonnées</p>

              <div className="mt-4 space-y-1">
                <p>Chaussée de Bruxelles, 258</p>
                <p>1410 Waterloo</p>
                <p className="pt-2">+32 (0) 471 01 61 81</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-6 text-xs text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
            <div className="leading-relaxed">
              <p>© {new Date().getFullYear()} CREA’STAR</p>
            </div>

            <div className="flex gap-6 sm:justify-end">
              <a
                href="/confidentialite"
                className="transition hover:text-foreground"
              >
                Confidentialité
              </a>
              <a
                href="/mentions-legales"
                className="transition hover:text-foreground"
              >
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}