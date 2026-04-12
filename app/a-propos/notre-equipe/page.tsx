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
      <section className="px-4 pb-8 pt-2 md:px-6">
        <div className="site-shell">
          <div className="relative overflow-hidden rounded-[34px] border border-black/6 bg-surface shadow-[0_25px_90px_rgba(16,16,16,0.08)]">
            <div className="relative h-[40svh] min-h-[280px] w-full sm:h-[48svh] lg:h-[58svh]">
              <Image
                src="/equipe/hero-equipe-test.jpg"
                alt="L’équipe CREA'STAR"
                fill
                priority
                unoptimized
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,244,238,0.10),rgba(247,244,238,0.62))]" />
            </div>

            <div className="relative z-10 px-6 pb-10 pt-8 md:px-10 lg:px-14 lg:pb-14">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  À propos • Notre équipe
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Une équipe engagée au service de la création et de l’accompagnement artistique
                </h1>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Direction
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Les deux figures fondatrices du projet
              </h2>
            </div>
          </Reveal>

          <div className="mt-16 space-y-16">
            <Reveal>
              <article className="grid gap-10 lg:grid-cols-[380px_1fr] lg:items-center">
                <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[30px] border border-black/6 bg-white/80 shadow-[0_16px_50px_rgba(16,16,16,0.06)]">
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src="/equipe/lisman-angelie.jpg"
                      alt="Lisman Angélie"
                      fill
                      unoptimized
                      className="object-cover object-center"
                      sizes="340px"
                    />
                  </div>
                </div>

                <div className="rounded-[30px] border border-black/6 bg-white/82 p-8 shadow-[0_18px_60px_rgba(16,16,16,0.06)] backdrop-blur-sm sm:p-10">
                  <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                    Direction générale • Fondatrice
                  </p>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Lisman Angélie
                  </h2>

                  <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                    Depuis toujours animée par une sensibilité artistique forte, elle développe très jeune une pratique créative autodidacte qui façonne progressivement sa vision de l&apos;apprentissage artistique.
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
              <article className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
                <div className="rounded-[30px] border border-black/6 bg-white/82 p-8 shadow-[0_18px_60px_rgba(16,16,16,0.06)] backdrop-blur-sm sm:p-10">
                  <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
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

                <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[30px] border border-black/6 bg-white/80 shadow-[0_16px_50px_rgba(16,16,16,0.06)]">
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src="/equipe/delvaux-melissa.jpg"
                      alt="Delvaux Mélissa"
                      fill
                      unoptimized
                      className="object-cover object-center"
                      sizes="340px"
                    />
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <Reveal>
            <div className="mx-auto max-w-4xl rounded-[32px] border border-primary/12 bg-[linear-gradient(135deg,rgba(22,92,71,0.92),rgba(15,75,57,0.96))] p-8 text-white shadow-[0_20px_60px_rgba(16,16,16,0.12)] sm:p-10 lg:p-12 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-white/72">
                Pédagogie
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl text-balance">
                Une équipe qui accompagne autant la progression que l’émergence artistique
              </h2>
              <p className="mt-6 text-base leading-8 text-white/82 sm:text-lg">
                L&apos;équipe pédagogique de Crea&apos;Star réunit des intervenants issus de disciplines complémentaires, au service d&apos;une formation vivante, pluridisciplinaire et profondément humaine.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="site-shell">
          <Reveal>
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Équipe pédagogique
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Les intervenants du centre
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {pedagogicalTeam.map((member, index) => (
              <Reveal key={member.name + member.role} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <article className="group overflow-hidden rounded-[28px] border border-black/6 bg-white/80 shadow-[0_10px_30px_rgba(16,16,16,0.05)] transition hover:-translate-y-1 hover:border-primary/18">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={`${member.name} — ${member.role}`}
                      fill
                      unoptimized
                      className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(247,244,238,0.88)] via-[rgba(247,244,238,0.16)] to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="text-lg font-semibold text-black">
                        {member.name}
                      </h3>

                      <p className="mt-1 text-sm text-black/68">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}