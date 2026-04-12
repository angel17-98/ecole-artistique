import Image from "next/image";
import Reveal from "../../components/Reveal";

const spaces = [
  {
    title: "Salle de danse",
    description:
      "Un grand espace de mouvement, de chorégraphie et de travail collectif, pensé pour explorer le corps, l’énergie scénique et la création en groupe.",
    image: "/espaces/salle-danse.jpg",
    alt: "Salle de danse de 100 m²",
  },
  {
    title: "Salle polyvalente",
    description:
      "Un lieu dédié à la présence scénique, aux répétitions, aux présentations et à la mise en situation artistique dans des conditions concrètes.",
    image: "/espaces/scene.jpg",
    alt: "Salle polyvalente avec scène",
  },
  {
    title: "3 salles individuelles",
    description:
      "Des espaces plus intimistes pour les cours personnalisés, le coaching, le travail vocal, instrumental ou l’accompagnement ciblé.",
    image: "/espaces/salle-individuel.jpg",
    alt: "Trois salles individuelles",
  },
  {
    title: "Studio d’enregistrement",
    description:
      "Un espace pour poser la voix, enregistrer, expérimenter, affiner une interprétation et découvrir le travail de création en studio.",
    image: "/espaces/studio-salle.jpg",
    alt: "Studio d’enregistrement",
  },
  {
    title: "Espace accueil & repos",
    description:
      "Un lieu de respiration, d’échange et de pause pour les élèves, pensé comme un espace vivant au cœur du centre.",
    image: "/espaces/accueil.jpg",
    alt: "Espace accueil et repos",
  },
];

export default function NotreEcolePage() {
  return (
    <main className="min-h-screen text-foreground">
      <section className="px-4 pb-8 pt-2 md:px-6">
        <div className="site-shell">
          <div className="relative overflow-hidden rounded-[34px] border border-black/6 bg-surface shadow-[0_25px_90px_rgba(16,16,16,0.08)]">
            <div className="absolute inset-0 hero-fade-soft" />

            <div className="grid min-h-[72svh] items-end lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative z-10 px-6 py-12 md:px-10 md:py-16 lg:px-14 lg:py-20">
                <Reveal>
                  <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                    À propos • Notre école
                  </p>
                </Reveal>

                <Reveal delay={1}>
                  <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                    Un lieu dédié à la création, à l’expression et à l’artiste complet
                  </h1>
                </Reveal>

                <Reveal delay={2}>
                  <p className="mt-8 max-w-3xl text-base leading-8 text-black/68 sm:text-lg">
                    Crea&apos;Star est un centre artistique musical pensé comme un lieu
                    vivant, où les artistes apprennent, créent, expérimentent et
                    grandissent ensemble dans une dynamique profondément humaine.
                  </p>
                </Reveal>
              </div>

              <div className="relative min-h-[340px] lg:min-h-full">
                <Image
                  src="/espaces/tilia.jpg"
                  alt="Univers artistique CREA'STAR"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-center"
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
                Histoire
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Notre histoire
              </h2>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="mx-auto mt-12 max-w-5xl space-y-6 text-base leading-8 text-black/68 sm:text-lg">
              <p>
                Crea&apos;Star a été créée en 2027 avec une intention simple mais forte :
                dédier un lieu aux artistes, un lieu où l’on ne forme pas seulement par
                la technique ou l’interprétation, mais avant tout par la création.
              </p>

              <p>
                L’idée de départ était profondément humaine : offrir un espace où
                chacun puisse chercher, essayer, construire, se révéler et créer
                librement, sans être enfermé dans une seule manière d’apprendre ou de
                s’exprimer.
              </p>

              <p>
                À travers cette vision, Crea&apos;Star accompagne l’émergence d’une
                nouvelle génération d’artistes, plus pluridisciplinaires, plus
                autonomes, plus ouverts à la collaboration et à la création
                collective.
              </p>

              <p>
                Nous avons voulu imaginer un centre vivant, où les artistes puissent
                non seulement apprendre, mais aussi se rencontrer, travailler ensemble
                et faire naître des projets dans un cadre inspirant, exigeant et
                profondément bienveillant.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <Reveal>
              <div className="overflow-hidden rounded-[30px] border border-black/6 bg-white/80 shadow-[0_16px_50px_rgba(16,16,16,0.06)]">
                <div className="relative aspect-[5/4] w-full">
                  <Image
                    src="/espaces/scene.jpg"
                    alt="Vision artistique du centre"
                    fill
                    unoptimized
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,244,238,0.06),rgba(247,244,238,0.22))]" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="rounded-[30px] border border-black/6 bg-white/82 p-8 shadow-[0_18px_60px_rgba(16,16,16,0.06)] backdrop-blur-sm sm:p-10">
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Vision
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl text-balance">
                  Un centre pensé comme un espace de création, de rencontre et d’élan artistique
                </h2>
                <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                  Crea&apos;Star a été imaginé comme un lieu complet, où la pédagogie,
                  la scène, le studio, le collectif et l’accompagnement humain
                  s’entrelacent pour former une expérience artistique cohérente.
                </p>
                <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                  L’objectif n’est pas seulement d’apprendre, mais de donner à chacun
                  un cadre inspirant pour expérimenter, collaborer, construire son
                  univers et grandir dans sa pratique artistique.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Les espaces
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Les espaces du centre
              </h2>

              <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                Crea&apos;Star a été pensé comme un lieu complet, avec différents espaces
                dédiés au mouvement, à la scène, au travail individuel, à
                l’enregistrement et aux temps de respiration.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space, index) => (
              <Reveal key={space.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <article className="group overflow-hidden rounded-[28px] border border-black/6 bg-white/80 shadow-[0_10px_30px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={space.image}
                      alt={space.alt}
                      fill
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.82)] via-[rgba(247,244,238,0.18)] to-transparent" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{space.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-black/66">
                      {space.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <Reveal>
            <div className="overflow-hidden rounded-[32px] border border-primary/12 bg-[linear-gradient(135deg,rgba(22,92,71,0.92),rgba(15,75,57,0.96))] p-8 text-white shadow-[0_20px_60px_rgba(16,16,16,0.12)] sm:p-10 lg:p-12">
              <p className="text-sm uppercase tracking-[0.24em] text-white/72">
                L’esprit du lieu
              </p>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl text-balance">
                Un centre vivant, pensé pour apprendre, créer et faire émerger des projets
              </h2>

              <p className="mt-6 max-w-4xl text-base leading-8 text-white/82 sm:text-lg">
                Chaque espace de Crea&apos;Star participe à une même vision :
                offrir un cadre inspirant, structuré et chaleureux, où les artistes
                peuvent évoluer avec exigence, confiance et liberté créative.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}