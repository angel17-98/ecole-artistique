import Image from "next/image";

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
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO IMAGE SEULE */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="h-20" />

        <div className="relative h-[38vh] min-h-[260px] w-full sm:h-[46vh] lg:h-[56vh]">
          <Image
            src="/equipe/hero-equipe-test.jpg"
            alt="L’équipe CREA'STAR"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-background/10 to-transparent" />
        </div>
      </section>

        {/* DEUX PERSONNES PRINCIPALES */}
        <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-28">

            {/* Titre */}
            <div className="mx-auto max-w-3xl text-center">
            <h2 className="relative inline-block text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                NOTRE EQUIPE
                <span
                aria-hidden
                className="absolute left-1/2 top-full mt-4 h-px w-[130%] -translate-x-1/2 bg-accent/70"
                />
            </h2>
            </div>

            <div className="mt-20 space-y-20">

            {/* PERSONNE 1 */}
            <article className="grid gap-10 lg:grid-cols-[420px_1fr] lg:items-center">

                {/* Photo */}
                <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg">
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

                {/* Texte */}
                <div>
                <p className="text-sm uppercase tracking-[0.22em] text-accent/80">
                    Direction générale • Fondatrice
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Lisman Angélie
                </h2>

                <p className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
                    Depuis toujours animée par une sensibilité artistique forte, elle développe très jeune une pratique créative autodidacte qui façonne
                    progressivement sa vision de l'apprentissage artistique.
                </p>

                <p className="mt-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                    Sa participation à The Voice Belgique en 2017, au sein de l'équipe de BJ Scott, lui permet de vivre
                    une expérience médiatique et scénique marquante, renforçant sa conviction que l'expression artistique
                    ne se limite pas à la technique, mais s'enracine avant tout dans la création et l'identité personnelle.
                </p>

                <p className="mt-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                    A travers Crea'Star, elle porte une vision claire: placer la création au coeur du processus d'apprentissage et
                    accompagner l'émergence d'une nouvelle génération d'artistes complets, capables d'explorer, d'inventer et de 
                    construire leur propre univers artistique.
                </p>
                </div>

            </article>

            {/* PERSONNE 2 */}
            <article className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">

                {/* Texte */}
                <div>
                <p className="text-sm uppercase tracking-[0.22em] text-accent/80">
                    Direction artistique
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Delvaux Mélissa
                </h2>

                <p className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
                    Mélissa accompagne les artistes avec une sensibilité profondément humaine et une expérience de la mise en scène de spectacle.
                </p>

                <p className="mt-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                    Après un parcours dans le domaine du soin et de l'accompagnement - dont les plus petits - elle développe
                    une approche pédagogique attentive, bienveillante et centrée sur l'épanouissement des personnes.
                </p>

                <p className="mt-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                    Parllèlement, elle évolue depuis plus de 20 ans dans l'univers du spectacle, au sein d'une troupe de cabaret dont elle a 
                    reprit la direction artistique. Cette longue expérience de la scène nourrit aujourd'hui son travail au sein de Crea'Star, 
                    où elle supervise notamment les ateliers d'éveil musical et accompagne les élèves tout au long de leur parcours artistique.
                </p>
                </div>

                {/* Photo */}
                <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg">
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

            </div>

        </div>
        </section>
      {/* SÉPARATEUR DORÉ */}
      <section className="bg-background">
        <div className="mx-auto max-w-10xl px-6">
          <div className="h-px w-full bg-accent/50" />
        </div>
      </section>

      {/* ÉQUIPE PÉDAGOGIQUE */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
          <div className="mx-auto max-w-6xl text-left">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-3xl">
              L'EQUIPE PEDAGOGIQUE
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {pedagogicalTeam.map((member) => (
              <article
                key={member.name + member.role}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-background/40 transition hover:border-accent/40"
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={member.image}
                    alt={`${member.name} — ${member.role}`}
                    fill
                    unoptimized
                    className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-background/88 via-background/20 to-transparent" />

                  {/* Texte superposé */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-xl font-semibold text-foreground">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-sm text-foreground/80">
                      {member.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-background text-foreground">
        {/* Ligne signature */}
        <div className="h-px w-full bg-accent/50" />

        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Haut du footer */}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">

            {/* LOGO + slogan */}
            <div>
                <img
                src="/Logo-footer.png"
                alt="Logo CREA'STAR"
                className="block w-[180px] h-auto"
                />

                <p className="mt-4 max-w-[260px] font-bold text-xl leading-relaxed text-foreground/80">
                La création au cœur<br />
                de l'apprentissage
                </p>
            </div>


            {/* Navigation */}
            <div className="grid grid-cols-2 gap-10">
                
                {/* À propos */}
                <div>
                <p className="text-sm font-semibold text-foreground">À propos</p>

                <ul className="mt-4 space-y-1 text-sm text-foreground/70">
                    <li>
                    <a href="/a-propos/notre-ecole" className="transition hover:text-foreground">
                        Notre école
                    </a>
                    </li>
                    <li>
                    <a href="/a-propos/notre-equipe" className="transition hover:text-foreground">
                        Notre équipe
                    </a>
                    </li>
                    <li>
                    <a href="/actualites" className="transition hover:text-foreground">
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

                {/* Notre offre */}
                <div>
                <p className="text-sm font-semibold text-foreground">Notre offre</p>

                <ul className="mt-4 space-y-1 text-sm text-foreground/70">
                    <li>
                    <a href="/cours/full-artist" className="transition hover:text-foreground">
                        Full Artist
                    </a>
                    </li>
                    <li>
                    <a href="/cours/comedie-musicale" className="transition hover:text-foreground">
                        Comédie musicale
                    </a>
                    </li>
                    <li>
                    <a href="/cours/eveil-musical" className="transition hover:text-foreground">
                        Éveil musical
                    </a>
                    </li>
                    <li>
                    <a href="/cours/cours-individuels" className="transition hover:text-foreground">
                        Cours individuels
                    </a>
                    </li>
                    <li>
                    <a href="/locations" className="transition hover:text-foreground">
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
          {/* Bas du footer */}
          <div className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-6 text-xs text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
            {/* Gauche : copyright + slogan */}
            <div className="leading-relaxed">
              <p>© {new Date().getFullYear()} CREA’STAR</p>
            </div>

            {/* Droite : liens légaux */}
            <div className="flex gap-6 sm:justify-end">
              <a href="/confidentialite" className="transition hover:text-foreground">
                Confidentialité
              </a>
              <a href="/mentions-legales" className="transition hover:text-foreground">
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}