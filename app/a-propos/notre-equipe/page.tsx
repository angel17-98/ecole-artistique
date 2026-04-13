import Image from "next/image";
import Reveal from "../../components/Reveal";

const pedagogicalTeam = [
  {
    name: "Nom Prénom1",
    role: "Chant • Interprétation",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom2",
    role: "Danse • Expression corporelle",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom3",
    role: "Théâtre • Jeu scénique",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom4",
    role: "Coaching vocal",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom5",
    role: "Studio • Enregistrement",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom6",
    role: "Création artistique",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom7",
    role: "Danse • Expression corporelle",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom8",
    role: "Théâtre • Jeu scénique",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom9",
    role: "Coaching vocal",
    image: "/equipe/avatar.jpg",
  },
  {
    name: "Nom Prénom10",
    role: "Studio • Enregistrement",
    image: "/equipe/avatar.jpg",
  },
];

export default function NotreEquipePage() {
  return (
    <main className="min-h-screen text-foreground">
      {/* HERO FULL WIDTH */}
      <section className="relative -mt-24 min-h-[78vh] overflow-hidden pt-24 lg:min-h-[74svh]">
        <div className="absolute inset-0">
          <Image
            src="/equipe/hero-equipe-test.jpg"
            alt="L’équipe CREA'STAR"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.70)_0%,rgba(10,10,10,0.44)_34%,rgba(10,10,10,0.14)_68%,rgba(10,10,10,0.05)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_24%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.10),transparent_26%)]" />
        </div>

        <div className="relative z-10 flex min-h-[78svh] items-end lg:min-h-[74svh]">
          <div className="site-shell-wide w-full px-6 pb-16 pt-36 md:px-10 lg:px-14 lg:pb-24 lg:pt-40">
            <div className="max-w-4xl">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                  À propos • Notre équipe
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                  Une équipe engagée au service de la création et de l’accompagnement artistique
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-8 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                  Derrière Crea&apos;Star, une équipe qui relie pédagogie, écoute,
                  exigence artistique et accompagnement humain pour faire émerger
                  des parcours complets et profondément incarnés.
                </p>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(247,244,238,0.12))]" />
      </section>

      {/* DIRECTION */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <div className="mt-16 space-y-14">
            <Reveal>
              <article className="grid gap-8 rounded-[32px] border border-black/6 bg-white/80 p-5 shadow-[0_16px_50px_rgba(16,16,16,0.06)] backdrop-blur-sm sm:p-6 lg:grid-cols-[360px_1fr] lg:gap-10 lg:p-8">
                <div className="overflow-hidden rounded-[26px]">
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src="/equipe/lisman-angelie.jpg"
                      alt="Lisman Angélie"
                      fill
                      unoptimized
                      className="object-cover object-center"
                      sizes="(min-width: 1024px) 360px, 100vw"
                    />
                  </div>
                </div>

                <div className="py-1">
                  <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                    Direction générale • Fondatrice
                  </p>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Lisman Angélie
                  </h2>

                  <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                    Depuis toujours animée par une sensibilité artistique forte, Angélie développe très jeune une pratique créative autodidacte qui façonne progressivement sa vision de l&apos;apprentissage artistique.
                  </p>

                  <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                    Sa participation à The Voice Belgique en 2017, au sein de l&apos;équipe de BJ Scott, lui permet de vivre une expérience médiatique et scénique marquante, renforçant sa conviction que l&apos;expression artistique ne se limite pas à la technique, mais s&apos;enracine avant tout dans la création et l&apos;identité personnelle.
                  </p>

                  <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                    À travers Crea&apos;Star, elle porte une vision claire : placer la création au cœur du processus d&apos;apprentissage et accompagner l&apos;émergence d&apos;une nouvelle génération d&apos;artistes complets, capables d&apos;explorer, d&apos;inventer et de construire leur propre univers artistique.
                  </p>
                </div>
              </article>
            </Reveal>

            <Reveal delay={1}>
              <article className="grid gap-8 rounded-[32px] border border-black/6 bg-white/80 p-5 shadow-[0_16px_50px_rgba(16,16,16,0.06)] backdrop-blur-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:gap-10 lg:p-8">
                <div className="py-1">
                  <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                    Direction artistique
                  </p>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Delvaux Mélissa
                  </h2>

                  <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                    Mélissa accompagne les artistes avec une sensibilité profondément humaine et une expérience de la mise en scène de spectacle.
                  </p>

                  <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                    Après un parcours dans le domaine du soin et de l&apos;accompagnement, elle développe une approche pédagogique attentive, bienveillante et centrée sur l&apos;épanouissement des personnes.
                  </p>

                  <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                    Parallèlement, elle évolue depuis plus de 20 ans dans l&apos;univers du spectacle, au sein d&apos;une troupe de cabaret dont elle a repris la direction artistique. Cette longue expérience de la scène nourrit aujourd&apos;hui son travail au sein de Crea&apos;Star, où elle supervise notamment les ateliers d&apos;éveil musical et accompagne les élèves tout au long de leur parcours artistique.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[26px]">
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src="/equipe/delvaux-melissa.jpg"
                      alt="Delvaux Mélissa"
                      fill
                      unoptimized
                      className="object-cover object-center"
                      sizes="(min-width: 1024px) 360px, 100vw"
                    />
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* VISION PEDAGOGIQUE */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-l uppercase tracking-[0.24em] text-primary/82">
                Pédagogie
              </p>
              <h2 className="mt-4 max-w-8xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Une équipe qui accompagne autant la progression que l’émergence artistique
              </h2>
              <p className="mt-6 max-w-8xl text-base leading-8 text-black/66 sm:text-lg">
                L&apos;équipe pédagogique de Crea&apos;Star réunit des intervenants issus de
                disciplines complémentaires, au service d&apos;une formation vivante,
                pluridisciplinaire et humaine.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <Reveal delay={1}>
              <div className="rounded-[28px] border border-black/6 bg-white/80 p-7 shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                  Écouter
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  Accueillir chaque élève dans son rythme
                </h3>
                <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                  L’accompagnement commence par l’attention portée à la personne, à son
                  niveau, à sa sensibilité et à son évolution.
                </p>
              </div>
            </Reveal>

            <Reveal delay={2}>
              <div className="rounded-[28px] border border-black/6 bg-white/80 p-7 shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                  Structurer
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  Faire progresser avec exigence et cohérence
                </h3>
                <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                  La progression artistique s’inscrit dans un cadre clair, stimulant et
                  construit, qui permet de développer des bases solides.
                </p>
              </div>
            </Reveal>

            <Reveal delay={3}>
              <div className="rounded-[28px] border border-black/6 bg-white/80 p-7 shadow-[0_10px_30px_rgba(16,16,16,0.05)]">
                <p className="text-sm uppercase tracking-[0.22em] text-primary/76">
                  Faire émerger
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  Relier la technique à l’identité artistique
                </h3>
                <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                  L’objectif n’est pas seulement d’apprendre, mais de permettre à chacun
                  d’affirmer sa voix, sa présence et son univers.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* EQUIPE PEDAGOGIQUE */}
      <section className="relative bg-[rgb(239,244,239)] text-foreground">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell px-6 py-20 md:px-8 lg:py-24">
          <Reveal>
            <div className="max-w-8xl">
              <p className="text-xl uppercase tracking-[0.24em] text-primary/82">
                Équipe pédagogique
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Les intervenants du centre
              </h2>
              <p className="mt-6 max-w-8xl text-base leading-8 text-black/64 sm:text-lg">
                Des intervenants complémentaires réunis autour d’une même intention :
                faire grandir l’artiste, enrichir son parcours et nourrir la création.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {pedagogicalTeam.map((member, index) => (
              <Reveal key={member.name + member.role} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <article className="group overflow-hidden rounded-[26px] border border-black/6 bg-white/80 shadow-[0_10px_30px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={`${member.name} — ${member.role}`}
                      fill
                      unoptimized
                      className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.54)] via-[rgba(247,244,238,0.08)] to-transparent" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-black/66">
                      {member.role}
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
                    L’esprit d’équipe
                  </p>

                  <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                    Une équipe pensée comme un cadre d’exigence, de confiance et d’élan créatif
                  </h2>

                  <p className="mt-6 max-w-3xl text-base leading-8 text-black/66 sm:text-lg">
                    À Crea&apos;Star, l’équipe ne transmet pas seulement des compétences.
                    Elle construit un environnement artistique vivant, où l’écoute,
                    la progression, la scène et la création avancent ensemble.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[24px] border border-black/6 bg-white/76 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.18em] text-primary/74">
                      Approche
                    </p>
                    <p className="mt-3 text-base font-medium leading-7 text-black/78">
                      Humaine, exigeante et attentive
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-black/6 bg-white/76 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.18em] text-primary/74">
                      Mission
                    </p>
                    <p className="mt-3 text-base font-medium leading-7 text-black/78">
                      Faire progresser sans dissocier technique et identité
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-black/6 bg-white/76 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.18em] text-primary/74">
                      Vision
                    </p>
                    <p className="mt-3 text-base font-medium leading-7 text-black/78">
                      Accompagner des artistes complets, sensibles et incarnés
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