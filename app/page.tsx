import Image from "next/image";
import Link from "next/link";
import Reveal from "./components/Reveal";

const featuredPrograms = [
  {
    href: "/cours/full-artist",
    image: "/programmes/full-artist.jpg",
    alt: "Performance scénique — Programme Full Artist",
    eyebrow: "Parcours annuel",
    titleMain: "Full",
    titleAccent: "Artist",
    text: "Performance scénique, création, écriture, interprétation et développement d’un univers artistique personnel.",
    tags: ["Identité artistique", "Création & interprétation", "Studio d'enregistrement"],
  },
  {
    href: "/cours/comedie-musicale",
    image: "/programmes/comedie-musicale.jpg",
    alt: "Comédie musicale — chant, danse et théâtre",
    eyebrow: "Parcours annuel",
    titleMain: "Comédie",
    titleAccent: "Musicale",
    text: "Chant, danse et théâtre pour créer des scènes, développer le jeu, la présence et l’énergie de groupe.",
    tags: ["Projet collectif", "Interprétation", "Scène"],
  },
];

const secondaryOffers = [
  {
    href: "/cours/eveil-musical",
    image: "/offres/eveil-musical.jpg",
    alt: "Éveil musical pour enfants",
    title: "Éveil musical",
    text: "Une approche ludique et sensorielle pour découvrir la musique et le rythme dès le plus jeune âge.",
  },
  {
    href: "/cours/cours-individuels",
    image: "/offres/cours-individuels.jpg",
    alt: "Cours artistiques individuels",
    title: "Cours individuels",
    text: "Un accompagnement personnalisé en chant, musique ou expression artistique, adapté aux objectifs de chacun.",
  },
  {
    href: "/locations",
    image: "/offres/studio.jpg",
    alt: "Location de salles et studio d’enregistrement",
    title: "Location de salles & studio",
    text: "Des espaces dédiés à la création, à la répétition et à l’enregistrement, accessibles aux artistes et aux groupes.",
  },
];

const values = [
  {
    title: "La création comme moteur",
    text: "L’apprentissage s’appuie sur des projets concrets, laissant une large place à l’expression, à l’imagination et à la création personnelle.",
  },
  {
    title: "Exigence et bienveillance",
    text: "Un cadre structuré, stimulant et respectueux, qui encourage le dépassement de soi dans un climat de confiance.",
  },
  {
    title: "L’apprentissage collectif",
    text: "Le groupe comme force créative : partager, construire ensemble et apprendre à évoluer sur scène avec les autres.",
  },
  {
    title: "Progressivité et accompagnement",
    text: "Chaque élève est suivi dans son évolution, avec une attention particulière portée à son rythme, à sa confiance et à son développement artistique.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-foreground">
      {/* HERO FULL WIDTH */}
      <section className="relative -mt-24 min-h-[85vh] overflow-hidden pt-24 lg:min-h-[80svh]">
        <div className="absolute inset-0">
          <Image
            src="/hero-studio-6.jpg"
            alt="Artiste en studio avec casque et micro"
            fill
            priority
            unoptimized
            className="object-cover object-[72%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.76)_0%,rgba(10,10,10,0.52)_34%,rgba(10,10,10,0.14)_68%,rgba(10,10,10,0.05)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.10),transparent_24%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.12),transparent_26%)]" />
        </div>

        <div className="relative z-10 flex min-h-[85svh] items-end lg:min-h-[80svh]">
          <div className="site-shell-wide w-full px-6 pb-16 pt-36 md:px-10 lg:px-14 lg:pb-24 lg:pt-40">
            <div className="max-w-4xl">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                  Centre de formation artistique musical • Brabant Wallon
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-tight text-white text-balance sm:text-5xl lg:text-7xl">
                  La création au cœur de l’apprentissage
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-8 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                  Un centre dédié à la formation d’artistes complets, à travers
                  des parcours pluridisciplinaires, structurés, créatifs et profondément humains.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/inscriptions"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-[rgb(var(--background-soft))]"
                  >
                    S&apos;inscrire
                  </Link>

                  <Link
                    href="/locations"
                    className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white/50 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/30"
                  >
                    Réserver une salle / studio
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-sm text-white/80">
                  <span>Parcours annuels progressifs</span>
                  <span>•</span>
                  <span>Projets & création scénique</span>
                  <span>•</span>
                  <span>Studio d’enregistrement</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(247,244,238,0.12))]" />
      </section>

      {/* PRESENTATION */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                Présentation
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Un centre dédié à la création et à l’accompagnement artistique
              </h2>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-10 max-w-8xl space-y-6 text-base leading-8 text-black/68 sm:text-lg">
              <p>
                Crea’Star est un centre artistique musical implanté dans le Brabant
                Wallon, dédié à la formation et à l’accompagnement d’artistes complets.
              </p>

              <p>
                Les parcours proposés s’articulent autour d’un apprentissage progressif,
                où la création occupe une place centrale. Tout au long de l’année, les
                élèves développent leurs compétences techniques, leur créativité et leur
                expression artistique à travers des projets collectifs, pensés comme de
                véritables espaces d’exploration et d’expérimentation artistique.
              </p>

              <p>
                Cette progression aboutit à la création d’un spectacle de fin d’année,
                conçu comme un temps fort du parcours : un moment de partage, de scène
                et d’expression, permettant à chaque élève de donner vie à ses idées,
                de construire son univers artistique et de vivre une expérience scénique forte.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PARCOURS */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />
        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-3xl uppercase font-semibold tracking-[0.24em] text-primary/82">
                Nos parcours
              </p>
              <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                Deux programmes annuels pensés pour développer la technique, la créativité
                et l’expression scénique avec une progression structurée vers la scène.
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
                    <p className="text-sm uppercase tracking-[0.22em] text-black/52">
                      {program.eyebrow}
                    </p>

                    <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                      <span className="text-black">{program.titleMain}</span>{" "}
                      <span className="text-accent">{program.titleAccent}</span>
                    </h3>

                    <p className="mt-5 max-w-4xl text-base leading-8 text-black/68 sm:text-lg">
                      {program.text}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-x-3 gap-y-2 text-sm text-black/56">
                      {program.tags.map((tag, i) => (
                        <span key={tag}>
                          {tag}
                          {i < program.tags.length - 1 ? " •" : ""}
                        </span>
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

      {/* AUTRES OFFRES */}
      <section className="relative bg-[rgb(239,244,239)] foreground">
        <div className="site-shell px-6 py-20 md:px-8 lg:py-24">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-3xl uppercase font-semibold tracking-[0.24em] text-primary/82">
                Autres offres & accompagnements
              </p>
              <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                En complément des parcours phares, Crea’Star propose d’autres formats pour
                découvrir, approfondir ou pratiquer la musique et les arts de la scène.
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
                    <p className="mt-3 text-sm leading-7 text-black/66">
                      {offer.text}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3">
                      Plus d’infos <span aria-hidden>→</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="relative bg-[rgb(243,246,243)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />
        <div className="site-shell px-6 py-20 md:px-8 lg:py-24">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                Valeurs
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Une approche artistique exigeante, humaine et collective
              </h2>
              <p className="mt-6 text-base leading-8 text-black/66 sm:text-lg">
                À Crea'Star, la formation artistique ne se limite pas à l’apprentissage
                de techniques. Elle s’inscrit dans un accompagnement global où la création,
                le collectif et l’épanouissement personnel occupent une place centrale.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="soft-card relative overflow-hidden rounded-[26px] p-8">
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                  <p className="mt-4 text-base leading-8 text-black/66">
                    {value.text}
                  </p>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(22,92,71,0.06),transparent_65%)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL EN CARTE */}
      <section className="relative px-6 py-12 md:px-10 lg:px-14 lg:py-16">
        <div className="site-shell-wide">
          <div className="relative overflow-hidden rounded-[34px] border border-black/6 shadow-[0_25px_90px_rgba(16,16,16,0.08)]">
            <div className="absolute inset-0">
              <Image
                src="/spectacles/salle-spectacle.jpg"
                alt="Scène de spectacle — création collective CREA’STAR"
                fill
                unoptimized
                className="object-cover object-center"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.14),rgba(10,10,10,0.44))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(185,151,83,0.10),transparent_52%)]" />
            </div>

            <div className="relative z-10 px-6 py-24 text-center md:px-10 lg:px-14 lg:py-28">
              <Reveal>
                <p className="text-l uppercase tracking-[0.24em] text-white/72">
                  Expérience scénique
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl text-balance">
                  Et tout cela prend vie à travers un spectacle imaginé et porté ensemble
                </h2>
              </Reveal>

              <Reveal delay={2}>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
                  Rejoignez Crea’Star et vivez une expérience artistique complète,
                  de l’apprentissage à la scène.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/inscriptions"
                    className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                  >
                    S’inscrire
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/24 bg-white/50 px-10 py-4 text-base font-medium text-white transition hover:bg-white/30"
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