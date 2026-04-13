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
      {/* HERO FULL WIDTH */}
      <section className="relative -mt-24 min-h-[82vh] overflow-hidden pt-24 lg:min-h-[78svh]">
        <div className="absolute inset-0">
          <Image
            src="/espaces/tilia.jpg"
            alt="Univers artistique CREA'STAR"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.74)_0%,rgba(10,10,10,0.50)_34%,rgba(10,10,10,0.16)_68%,rgba(10,10,10,0.06)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.10),transparent_24%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.12),transparent_26%)]" />
        </div>

        <div className="relative z-10 flex min-h-[82svh] items-end lg:min-h-[78svh]">
          <div className="site-shell-wide w-full px-6 pb-16 pt-36 md:px-10 lg:px-14 lg:pb-24 lg:pt-40">
            <div className="max-w-4xl">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                  À propos • Notre école
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                  Un lieu dédié à la création, à l’expression et à l’artiste complet
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-8 max-w-8xl text-base leading-8 text-white/78 sm:text-lg">
                  Crea&apos;Star est un centre artistique musical pensé comme un lieu
                  vivant, où les artistes apprennent, créent, expérimentent et
                  grandissent ensemble dans une dynamique profondément humaine.
                </p>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(247,244,238,0.12))]" />
      </section>

      {/* HISTOIRE + VISION */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="max-w-5xl">
              <p className="text-3xl uppercase font-semibold tracking-[0.24em] text-primary/82">
                Notre Histoire
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-10 max-w-8xl space-y-6 text-base leading-8 text-black/68 sm:text-lg">
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

          <Reveal delay={2}>
            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              <div className="rounded-[28px] border border-black/6 bg-white/80 p-7 shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                  Créer
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Faire de la création le centre du parcours
                </h3>
                <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                  Ici, l’apprentissage n’est pas séparé de l’élan artistique.
                  La technique, la scène, l’écriture et l’expérimentation avancent ensemble.
                </p>
              </div>

              <div className="rounded-[28px] border border-black/6 bg-white/80 p-7 shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                  Relier
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Créer un lieu de rencontre entre disciplines
                </h3>
                <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                  Le corps, la voix, le jeu, la présence scénique et le studio dialoguent
                  dans une approche plus ouverte, plus actuelle et plus complète.
                </p>
              </div>

              <div className="rounded-[28px] border border-black/6 bg-white/80 p-7 shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                  Faire émerger
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Accompagner une identité artistique vivante
                </h3>
                <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                  L’objectif n’est pas seulement d’enseigner, mais d’aider chacun à trouver
                  sa voix, sa sensibilité, sa manière de créer et d’exister sur scène.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ESPACES */}
      <section className="relative bg-background text-foreground">
        <div className="site-shell px-6 py-20 md:px-8 lg:py-24">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-3xl uppercase font-semibold tracking-[0.24em] text-primary/82">
                Les espaces du centre
              </p>
              <p className="mt-6 text-base leading-8 text-black/64 sm:text-lg">
                Crea&apos;Star a été pensé comme un lieu complet, avec différents espaces
                dédiés au mouvement, à la scène, au travail individuel et à
                l’enregistrement.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space, index) => (
              <Reveal key={space.title} delay={(index + 1) as 1 | 2 | 3}>
                <article className="group overflow-hidden rounded-[26px] border border-black/6 bg-white/80 shadow-[0_10px_30px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={space.image}
                      alt={space.alt}
                      fill
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.54)] via-[rgba(247,244,238,0.08)] to-transparent" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{space.title}</h3>
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

      {/* SIGNATURE FINALE */}
      <section className="relative px-6 py-12 md:px-10 lg:px-14 lg:py-16">
        <div className="site-shell-wide">
          <Reveal>
            <div className="relative overflow-hidden rounded-[34px] border border-black/6 bg-[linear-gradient(135deg,rgb(255,253,249)_0%,rgb(241,247,242)_100%)] shadow-[0_24px_70px_rgba(16,16,16,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.10),transparent_26%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.10),transparent_28%)]" />

              <div className="relative grid gap-10 px-8 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
                <div>
                  <p className="text-l uppercase tracking-[0.24em] text-primary/78">
                    L’esprit du lieu
                  </p>

                  <h2 className="mt-5 max-w-5xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                    Plus qu’un centre, un cadre de création pensé comme une expérience
                  </h2>

                  <p className="mt-6 max-w-3xl text-base leading-8 text-black/66 sm:text-lg">
                    Crea&apos;Star réunit dans un même lieu la pédagogie, la scène,
                    l’expérimentation, l’écoute et l’élan collectif. Chaque espace a été
                    imaginé pour nourrir une pratique artistique plus libre, plus incarnée
                    et plus complète.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[24px] border border-black/6 bg-white/76 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.18em] text-primary/74">
                      Atmosphère
                    </p>
                    <p className="mt-3 text-base font-medium leading-7 text-black/78">
                      Inspirante, chaleureuse et exigeante
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-black/6 bg-white/76 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.18em] text-primary/74">
                      Usage
                    </p>
                    <p className="mt-3 text-base font-medium leading-7 text-black/78">
                      Apprendre, répéter, créer, enregistrer
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-black/6 bg-white/76 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.18em] text-primary/74">
                      Intention
                    </p>
                    <p className="mt-3 text-base font-medium leading-7 text-black/78">
                      Faire émerger des artistes complets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}