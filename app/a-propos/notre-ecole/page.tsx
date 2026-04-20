import Image from "next/image";
import Link from "next/link";
import Reveal from "../../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const visionSteps = [
  {
    number: "1",
    title: "Un manque réel, une réponse concrète",
    text: "Il existait des cours de chant, de danse, de théâtre. Mais pas de lieu qui réunissait tout ça dans une seule expérience cohérente — pensée pour former des artistes complets, capables de créer leur propre univers. Crea'Star est né de cette absence.",
  },
  {
    number: "2",
    title: "Créer avant d'interpréter",
    text: "On ne forme pas des élèves à bien reproduire. Chant, danse, théâtre, écriture, présence scénique et studio avancent ensemble — au service d'un seul objectif : aider chaque élève à construire quelque chose qui lui appartient vraiment.",
  },
  {
    number: "3",
    title: "Des groupes, pas des classes",
    text: "10 à 15 élèves maximum par groupe — pas pour faire bien sur le papier, mais parce qu'un vrai suivi personnalisé est impossible au-delà. Chaque élève est connu, accompagné et challengé individuellement.",
  },
  {
    number: "4",
    title: "Une vraie première, chaque année",
    text: "En fin d'année, les élèves montent sur une vraie scène, devant un vrai public, avec un spectacle qu'ils ont eux-mêmes imaginé et construit. Pas une démonstration de fin de trimestre — une expérience artistique complète.",
  },
];

const spaces = [
  {
    title: "Salle de danse",
    description: "Un grand espace lumineux avec le sol, les miroirs et la hauteur qu'il faut pour vraiment habiter le mouvement. Conçu pour la chorégraphie, l'énergie de groupe et l'exploration corporelle.",
    image: "/espaces/salle-danse.jpg",
    alt: "Salle de danse Crea'Star",
  },
  {
    title: "Scène & salle polyvalente",
    description: "Une scène intégrée pour répéter, se mettre en situation et défendre un projet devant un regard extérieur. L'endroit où les idées quittent la tête et prennent corps.",
    image: "/espaces/scene.jpg",
    alt: "Salle polyvalente avec scène",
  },
  {
    title: "Studio d'enregistrement",
    description: "Un vrai studio pour poser la voix, s'entendre dans un casque et découvrir ce que ça change. C'est ici que l'hymne annuel de chaque groupe prend vie — et que les niveaux avancés explorent leurs propres compositions.",
    image: "/espaces/studio-salle.jpg",
    alt: "Studio d'enregistrement",
  },
  {
    title: "3 salles individuelles",
    description: "Des espaces intimes pour les cours personnalisés, le coaching vocal et le travail en profondeur — sans le regard du groupe, avec toute l'attention d'un intervenant dédié.",
    image: "/espaces/salle-individuel.jpg",
    alt: "Salles individuelles",
  },
  {
    title: "Espace accueil & détente",
    description: "Un lieu de pause entre les cours — pour souffler, échanger, traîner un peu. Parce qu'un centre artistique vivant, c'est aussi un endroit où les liens se créent en dehors des salles.",
    image: "/espaces/accueil.jpg",
    alt: "Espace accueil",
  },
];

const allOffers = [
  { label: "Parcours Full Artist", tag: "Annuel · Cœur de l'offre", href: "/cours/full-artist" },
  { label: "Comédie Musicale", tag: "Annuel · Cœur de l'offre", href: "/cours/comedie-musicale" },
  { label: "Éveil musical", tag: "Dès 4 ans", href: "/cours/eveil-musical" },
  { label: "Cours individuels", tag: "Sur mesure", href: "/cours/cours-individuels" },
  { label: "Stages & workshops", tag: "Événements", href: "/stages" },
  { label: "Location de salles & studio", tag: "Artistes & groupes", href: "/locations" },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function NotreEcolePage() {
  return (
    <main className="min-h-screen text-foreground">

      {/* ── HERO ÉTENDU — titre gauche + facts droite superposés ── */}
      <section className="relative -mt-24 min-h-[90vh] overflow-hidden pt-24 lg:min-h-[88svh]">
        <div className="absolute inset-0">
          <Image
            src="/espaces/tilia.jpg"
            alt="Hall principal du centre artistique CREA'STAR"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          {/* Gradient principal — gauche sombre pour le texte */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,6,6,0.88)_0%,rgba(6,6,6,0.62)_38%,rgba(6,6,6,0.30)_62%,rgba(6,6,6,0.50)_100%)]" />
          {/* Gradient vertical — assombrit le bas pour lisibilité */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.18)_0%,transparent_30%,rgba(6,6,6,0.55)_72%,rgba(6,6,6,0.85)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_28%)]" />
        </div>

        {/* Contenu ancré en bas */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="site-shell-wide px-6 pb-12 md:px-10 lg:px-14 lg:pb-16">

            {/* Layout deux colonnes bas */}
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">

              {/* Gauche — titre + accroche */}
              <div>
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/54">
                    À propos · Notre école
                  </p>
                </Reveal>

                {/* Ligne dorée */}
                <Reveal delay={1}>
                  <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
                </Reveal>

                <Reveal delay={1}>
                  <h1 className="text-4xl font-semibold leading-[1.04] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                    Un lieu pensé pour ceux qui veulent créer,
                    pas seulement apprendre
                  </h1>
                </Reveal>

                <Reveal delay={2}>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/64 sm:text-base sm:leading-8">
                    Crea'Star ouvre en 2028 dans le Brabant Wallon — un centre
                    artistique musical où scène, studio, formation et création
                    sont réunis sous un même toit.
                  </p>
                </Reveal>

                <Reveal delay={3}>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/inscriptions"
                      className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                    >
                      Inscriptions
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Droite — facts en grille glassmorphism */}
              <Reveal delay={2}>
                <div className="rounded-[24px] border border-white/12 bg-black/30 p-1 backdrop-blur-md mb-20">
                  <div className="grid grid-cols-2 divide-x divide-white/10">

                    {/* Col gauche */}
                    <div className="divide-y divide-white/10">
                      {[
                        { label: "Ouverture", value: "2028" },
                        { label: "Groupes", value: "≤ 15 élèves" },
                        { label: "Disciplines", value: "6 au total" },
                      ].map((fact) => (
                        <div key={fact.label} className="px-5 py-4">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                            {fact.label}
                          </p>
                          <p className="mt-1.5 text-base font-semibold text-white">
                            {fact.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Col droite */}
                    <div className="divide-y divide-white/10">
                      {[
                        { label: "Lieu", value: "Waterloo" },
                        { label: "Spectacle", value: "Public annuel" },
                        { label: "Studio", value: "Inclus" },
                      ].map((fact) => (
                        <div key={fact.label} className="px-5 py-4">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                            {fact.label}
                          </p>
                          <p className="mt-1.5 text-base font-semibold text-white">
                            {fact.value}
                          </p>
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

      {/* ── VISION — timeline texte pure ── */}
      <section className="relative bg-background overflow-hidden mt-2 mb-2">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-28">
          <Reveal>
            <div className="mb-16 max-w-6xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Notre vision
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Pourquoi construire un centre Crea'Star?
              </h2>
            </div>
          </Reveal>

          {/* Timeline texte — ligne verticale + blocs alternés */}
          <div className="relative">
            {/* Ligne verticale — desktop */}
            <div className="absolute left-[2.25rem] top-0 hidden h-full w-px bg-[linear-gradient(180deg,transparent,rgba(22,92,71,0.20)_8%,rgba(22,92,71,0.20)_92%,transparent)] lg:block" />

            <div className="space-y-0 divide-y divide-black/6">
              {visionSteps.map((step, index) => (
                <Reveal key={step.number} delay={(index % 2) as 0 | 1}>
                  <div className="grid gap-5 py-5 lg:grid-cols-[5rem_1fr_1fr] lg:gap-2 lg:py-7">

                    {/* Numéro + point timeline */}
                    <div className="flex items-start gap-4 lg:flex-col lg:gap-3">
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 lg:h-9 lg:w-9">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </div>
                      <span className="text-4xl font-semibold leading-none tracking-tight text-black/8 lg:text-5xl lg:pl-1">
                        {step.number}
                      </span>
                    </div>

                    {/* Titre */}
                    <h3 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl lg:pt-1.5">
                      {step.title}
                    </h3>

                    {/* Texte */}
                    <p className="text-base leading-8 text-black/60 sm:text-lg lg:pt-1.5">
                      {step.text}
                    </p>

                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ESPACES — grille photo pure ── */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mb-12 max-w-8xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Les espaces
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Tout ce dont un artiste a besoin, au même endroit
              </h2>
              <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                Scène, studio, salles de mouvement, espaces individuels et lieu de
                vie — rien ne manque entre le premier cours et le soir du spectacle.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space, index) => (
              <Reveal key={space.title} delay={(index % 3) as 0 | 1 | 2}>
                <article className="group overflow-hidden rounded-[26px] border border-black/6 bg-white/80 shadow-[0_10px_30px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={space.image}
                      alt={space.alt}
                      fill
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.54)] via-[rgba(247,244,238,0.08)] to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{space.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-black/62">
                      {space.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOUTE L'OFFRE — liste éditoriale ── */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Notre offre
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl text-balance">
                  Un centre, plusieurs façons d'en faire partie
                </h2>
              </div>
              <Link
                href="/inscriptions"
                className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3"
              >
                Voir les inscriptions <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>

          <div className="divide-y divide-black/8 border-t border-black/8 mb-2">
            {allOffers.map((offer, index) => (
              <Reveal key={offer.label} delay={(index % 3) as 0 | 1 | 2}>
                <Link
                  href={offer.href}
                  className="group flex items-baseline justify-between gap-6 py-5 transition hover:text-primary"
                >
                  <div className="flex items-baseline gap-5 min-w-0">
                    <span className="shrink-0 text-xs text-black/28 tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                      {offer.label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="hidden text-xs uppercase tracking-[0.16em] text-black/34 sm:block">
                      {offer.tag}
                    </span>
                    <span className="text-black/22 transition duration-200 group-hover:translate-x-1 group-hover:text-primary">
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}