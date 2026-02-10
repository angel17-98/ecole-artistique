import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden">
        {/* ESPACE STRUCTUREL POUR LE HEADER (pas du padding visuel) */}
        <div aria-hidden className="h-20" />

        {/* IMAGE DE FOND */}
        <div className="absolute inset-0">
          <Image
            src="/hero-studio.jpg"
            alt="Artiste en studio avec casque et micro"
            fill
            priority
            unoptimized
            className="object-cover object-[72%_center]"
          />

          {/* Dégradé léger pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-transparent" />

          {/* Matière très subtile */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(218,180,90,0.06),transparent_55%)]" />
        </div>

        {/* CONTENU (descendu et aéré) */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-28 pb-40 sm:pt-15 sm:pb-15 lg:pt-36 lg:pb-52">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.22em] uppercase text-foreground/70">
              École artistique musicale • Brabant Wallon
            </p>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              La création au cœur du parcours artistique
            </h1>

            <p className="mt-8 text-base leading-relaxed text-foreground/85 sm:text-lg">
              Une école dédiée à la formation d’artistes
              complets, à travers des parcours pluridisciplinaires, structurés et créatifs.
              
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/inscriptions"
                className="inline-flex items-center justify-center rounded-xl border border-accent/50 px-6 py-3 text-sm font-medium text-foreground/90 transition hover:border-accent"
              >
                S'inscrire
              </a>

              <a
                href="/cours/locations"
                className="inline-flex items-center justify-center rounded-xl border border-accent/50 px-6 py-3 text-sm font-medium text-foreground/90 transition hover:border-accent"
              >
                Réserver une salle / studio
              </a>

            </div>

            <div className="mt-10 flex flex-wrap gap-x-1 gap-y-2 text-sm text-foreground/70">
              <span>Parcours annuels progressifs  • </span>
              <span>Projets & création scénique  • </span>
              <span>Studio d’enregistrement</span>
            </div>
          </div>
        </div>

        {/* Transition douce vers la suite */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* PRÉSENTATION CREA’STAR */}
      <section className="relative bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 sm:pt-15 sm:pb-15 lg:pt-15 lg:pb-10">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Une école dédiée à la création et à l’accompagnement artistique
          </h2>

          <div className="mt-12 space-y-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
            <p>
              Crea’Star est une école artistique musicale implantée dans le Brabant
              Wallon, dédiée à la formation et à l’accompagnement d’artistes complets.
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
              de construire son univers artistique et de vivre une expérience scénique
              forte, au sein d’un cadre exigeant, bienveillant et profondément humain.
            </p>
          </div>
        </div>
      </section>

      {/* PROGRAMMES / PARCOURS */}
      <section className="relative bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-28 sm:pt-15 sm:pb-15 lg:pt-15 lg:pb-10">
          {/* Titre centré + ligne dorée */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="relative inline-block text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Nos parcours phares
              {/* Ligne dorée qui “intersecte” sous le texte */}
              <span
                aria-hidden
                className="absolute left-1/2 top-full mt-4 h-px w-[150%] -translate-x-1/2 bg-accent/70"
              />
            </h2>

            <p className="mt-10 text-base leading-relaxed text-foreground/80 sm:text-lg">
              Deux programmes annuels pensés pour développer la technique, la créativité et
              l’expression scénique — avec une progression structurée qui mène à la création
              d’un spectacle de fin d’année.
            </p>
          </div>

          {/* Cartes : 2 colonnes dès lg, sinon 1 colonne */}
          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            {/* CARD — Full Artist */}
            <a
              href="/cours/full-artist"
              className="group relative block overflow-hidden rounded-3xl border border-foreground/10 bg-background/30 backdrop-blur-sm transition hover:border-accent/50"
            >
              {/* Image */}
              <div className="relative aspect-[6/4] w-full">
                <Image
                  src="/programmes/full-artist.jpg"
                  alt="Performance scénique — Programme Full Artist"
                  fill
                  unoptimized
                  className="object-cover object-[70%_center] transition duration-700 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                {/* Dégradé bas pour lisibilité du texte */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              </div>

              {/* Contenu */}
              <div className="relative z-10 p-8 sm:p-10">
                <p className="text-sm tracking-[0.22em] uppercase text-foreground/65">
                  Parcours annuel
                </p>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  <span className="text-foreground">Full</span>{" "}
                  <span className="text-accent">Artist</span>
                </h3>

                <p className="mt-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                  Performance scénique, création, écriture, interprétation et développement
                  d’un univers artistique personnel.
                </p>

                <div className="mt-8 flex flex-wrap gap-x-1 gap-y-2 text-sm text-foreground/70">
                  <span>Identité artistique • </span>
                  <span>Création & interprétation • </span>
                  <span>Studio d'enregistrement</span>
                </div>

                <div className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-foreground/85 transition group-hover:text-foreground">
                  Découvrir le parcours <span aria-hidden>→</span>
                </div>

                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(218,180,90,0.10),transparent_55%)]" />
              </div>
            </a>

            {/* CARD — Comédie Musicale (même hover doré) */}
            <a
              href="/cours/comedie-musicale"
              className="group relative block overflow-hidden rounded-3xl border border-foreground/10 bg-background/30 backdrop-blur-sm transition hover:border-accent/50"
            >
              {/* Image */}
              <div className="relative aspect-[6/4] w-full">
                <Image
                  src="/programmes/comedie-musicale.jpg"
                  alt="Comédie musicale — chant, danse et théâtre"
                  fill
                  unoptimized
                  className="object-cover object-[50%_center] transition duration-700 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              </div>

              {/* Contenu */}
              <div className="relative z-10 p-8 sm:p-10">
                <p className="text-sm tracking-[0.22em] uppercase text-foreground/65">
                  Parcours annuel
                </p>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  <span className="text-foreground">Comédie</span>{" "}
                  <span className="text-accent">Musicale</span>
                </h3>

                <p className="mt-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                  Chant, danse et théâtre pour créer des scènes, développer le jeu, la
                  présence et l’énergie de groupe.
                </p>

                <div className="mt-8 flex flex-wrap gap-x-1 gap-y-2 text-sm text-foreground/70">
                  <span>Projet collectif • </span>
                  <span>Interprétation • </span>
                  <span>Scène</span>
                </div>

                <div className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-foreground/85 transition group-hover:text-foreground">
                  Découvrir le parcours <span aria-hidden>→</span>
                </div>

                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(218,180,90,0.08),transparent_55%)]" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* AUTRES OFFRES */}
      <section className="relative bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-24  sm:pt-15 sm:pb-15 lg:pt-20 lg:pb-15">
          {/* Titre */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="relative inline-block text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Autres offres & accompagnements
              {/* Ligne dorée */}
              <span
                aria-hidden
                className="absolute left-1/2 top-full mt-4 h-px w-[140%] -translate-x-1/2 bg-accent/70"
              />
            </h2>

            <p className="mt-10 text-base leading-relaxed text-foreground/80 sm:text-lg">
              En complément des parcours phares, Crea’Star propose d’autres formats pour
              découvrir, approfondir ou pratiquer la musique et les arts de la scène.
            </p>
          </div>

          {/* Grille des offres */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Éveil musical */}
            <a
              href="/cours/eveil-musical"
              className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/offres/eveil-musical.jpg"
                  alt="Éveil musical pour enfants"
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold">Éveil musical</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                  Une approche ludique et sensorielle pour découvrir la musique et le rythme
                  dès le plus jeune âge.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 transition group-hover:text-foreground">
                  Plus d’infos <span aria-hidden>→</span>
                </div>
              </div>
            </a>

            {/* Cours individuels */}
            <a
              href="/cours/cours-individuels"
              className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/offres/cours-individuels.jpg"
                  alt="Cours artistiques individuels"
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold">Cours individuels</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                  Un accompagnement personnalisé en chant, musique ou expression artistique,
                  adapté aux objectifs de chacun. (Sur demande pour les cours spécifiques)
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 transition group-hover:text-foreground">
                  Plus d’infos <span aria-hidden>→</span>
                </div>
              </div>
            </a>

            {/* Location */}
            <a
              href="/locations"
              className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/offres/studio.jpg"
                  alt="Location de salles et studio d’enregistrement"
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold">
                  Location de salles & studio
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                  Des espaces dédiés à la création, à la répétition et à l’enregistrement,
                  accessibles aux artistes et aux groupes.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 transition group-hover:text-foreground">
                  Plus d’infos <span aria-hidden>→</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* VALEURS & APPROCHE */}
      <section className="relative bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-28 sm:pt-15 sm:pb-15 lg:pt-15 lg:pb-36">
          <div className="max-w-6xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Une approche artistique exigeante, humaine et collective
            </h2>

            <p className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
              À Crea'Star, la formation artistique ne se limite pas à l’apprentissage de
              techniques. Elle s’inscrit dans un accompagnement global, où la création,
              le collectif et l’épanouissement personnel occupent une place centrale.
            </p>
          </div>

          {/* Grille des valeurs */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {/* Valeur 1 */}
            <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent/5 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold">
                La création comme moteur
              </h3>
              <p className="mt-4 text-base leading-relaxed text-foreground/80">
                L’apprentissage s’appuie sur des projets concrets, laissant une large place
                à l’expression, à l’imagination et à la création personnelle.
              </p>

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(218,180,90,0.10),transparent_60%)]" />
            </div>

            {/* Valeur 2 */}
            <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent/10 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold">
                Exigence et bienveillance
              </h3>
              <p className="mt-4 text-base leading-relaxed text-foreground/80">
                Un cadre structuré, stimulant et respectueux, qui encourage le dépassement
                de soi dans un climat de confiance.
              </p>

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(5,102,79,0.12),transparent_60%)]" />
            </div>

            {/* Valeur 3 */}
            <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent/15 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold">
                L’apprentissage collectif
              </h3>
              <p className="mt-4 text-base leading-relaxed text-foreground/80">
                Le groupe comme force créative : partager, construire ensemble et apprendre
                à évoluer sur scène avec les autres.
              </p>

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(218,180,90,0.08),transparent_60%)]" />
            </div>

            {/* Valeur 4 */}
            <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent/20 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold">
                Progressivité et accompagnement
              </h3>
              <p className="mt-4 text-base leading-relaxed text-foreground/80">
                Chaque élève est suivi dans son évolution, avec une attention particulière
                portée à son rythme, à sa confiance et à son développement artistique.
              </p>

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(5,102,79,0.10),transparent_60%)]" />
            </div>
          </div>
        </div>
      </section>

      {/* SPECTACLE FINAL / CTA */}
      <section className="relative overflow-hidden bg-background text-foreground">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/spectacles/salle-spectacle.jpg"
            alt="Scène de spectacle — création collective CREA’STAR"
            fill
            unoptimized
            className="object-cover object-center"
            sizes="100vw"
          />

          {/* Dégradé principal pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/55 to-background/20" />

          {/* Matière subtile dorée */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(218,180,90,0.10),transparent_60%)]" />
        </div>

        {/* Contenu */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-36 sm:pt-36 sm:pb-40 lg:pt-40 lg:pb-48 text-center">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Et tout ceci prend vie à travers la création{" "}
            <br className="hidden sm:block" />
            d’un spectacle imaginé et porté ensemble...
          </h2>

          <p className="mx-auto mt-8 max-w-1xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            Rejoignez Crea’Star et vivez une expérience artistique complète,
            de l’apprentissage à la scène.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* CTA principal */}
            <a
              href="/inscriptions"
              className="inline-flex items-center justify-center rounded-xl bg-primary border border-accent/60 px-10 py-4 text-base font-semibold text-foreground transition hover:border-accent"
            >
              S’inscrire
            </a>

            {/* CTA secondaire */}
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-background border border-accent/60 px-10 py-4 text-base font-medium text-foreground/90 transition hover:border-accent"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-background text-foreground">
        {/* Ligne signature */}
        <div className="h-px w-full bg-accent/50" />

        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Haut du footer */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:items-start">
            {/* LOGO — identique au header */}
            <div>
              <span className="relative flex flex-col text-4xl font-semibold tracking-tight leading-[0.85]">
                <span
                  className="text-foreground"
                  style={{
                    textShadow:
                      "0 2px 0 rgba(0,0,0,0.65), 0 12px 26px rgba(0,0,0,0.85)",
                  }}
                >
                  CREA’
                </span>
                <span
                  className="ml-6 text-accent"
                  style={{
                    textShadow:
                      "0 0 12px rgba(218,180,90,0.45), 0 0 28px rgba(218,180,90,0.35)",
                  }}
                >
                  STAR
                </span>
              </span>

              {/* Slogan sous le logo */}
              <p className="mt-4 w-64 font-bold text-xl leading-relaxed text-foreground/80">
                La création au cœur<br />
                du parcours artistique
              </p>
            </div>
            
            {/* Colonne vide pour respiration (desktop) */}
            <div className="hidden lg:block" />

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

            {/* Adresse */}
            <div className="text-sm text-foreground/70 lg:text-right">
              <p>Chaussée de Bruxelles, 258</p>
              <p>1410 Waterloo</p>
              <p className="invisible">—</p>
              <p>+32 (0) 471 01 61 81</p>
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
