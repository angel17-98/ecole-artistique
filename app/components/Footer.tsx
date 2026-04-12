import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-8 border-t border-black/6 bg-[rgba(255,253,249,0.7)] text-foreground backdrop-blur-sm">
      <div className="site-shell py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
          <div>
            <img
              src="/Logo-footer.png"
              alt="Logo CREA'STAR"
              className="block w-[180px] h-auto"
            />

            <p className="mt-5 max-w-[280px] text-xl font-semibold leading-relaxed text-black/80">
              La création au cœur
              <br />
              de l&apos;apprentissage
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/86">
                À propos
              </p>

              <ul className="mt-4 space-y-2 text-sm text-black/66">
                <li>
                  <Link href="/a-propos/notre-ecole" className="transition hover:text-primary">
                    Notre école
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos/notre-equipe" className="transition hover:text-primary">
                    Notre équipe
                  </Link>
                </li>
                <li>
                  <Link href="/actualites" className="transition hover:text-primary">
                    Actualités
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="transition hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/86">
                Notre offre
              </p>

              <ul className="mt-4 space-y-2 text-sm text-black/66">
                <li>
                  <Link href="/cours/full-artist" className="transition hover:text-primary">
                    Full Artist
                  </Link>
                </li>
                <li>
                  <Link href="/cours/comedie-musicale" className="transition hover:text-primary">
                    Comédie musicale
                  </Link>
                </li>
                <li>
                  <Link href="/cours/eveil-musical" className="transition hover:text-primary">
                    Éveil musical
                  </Link>
                </li>
                <li>
                  <Link href="/cours/cours-individuels" className="transition hover:text-primary">
                    Cours individuels
                  </Link>
                </li>
                <li>
                  <Link href="/locations" className="transition hover:text-primary">
                    Location studio & salles
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-sm text-black/66 lg:text-right">
            <p className="font-semibold text-black/90 uppercase tracking-[0.14em]">
              Coordonnées
            </p>

            <div className="mt-4 space-y-1 leading-7">
              <p>Chaussée de Bruxelles, 258</p>
              <p>1410 Waterloo</p>
              <p className="pt-2">+32 (0) 471 01 61 81</p>
            </div>
          </div>
        </div>

        <div className="my-8 gold-line" />

        <div className="flex flex-col gap-4 text-xs text-black/56 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>© {new Date().getFullYear()} CREA’STAR</p>
          </div>

          <div className="flex gap-6 sm:justify-end">
            <Link href="/confidentialite" className="transition hover:text-primary">
              Confidentialité
            </Link>
            <Link href="/mentions-legales" className="transition hover:text-primary">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}