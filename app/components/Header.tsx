import Link from "next/link";

const aboutItems = [
  { href: "/a-propos/notre-ecole", label: "Notre école" },
  { href: "/a-propos/notre-equipe", label: "Notre équipe" },
  { href: "/a-propos/actualites", label: "Actualités" },
  { href: "/a-propos/contact", label: "Contact" },
  { href: "/a-propos/FAQ", label: "FAQ" },
];

const courseItems = [
  { href: "/cours/full-artist", label: "Parcours Full Artist" },
  { href: "/cours/comedie-musicale", label: "Parcours Comédie Musicale" },
  { href: "/cours/eveil-musical", label: "Éveil musical - Cours collectifs" },
  { href: "/cours/cours-individuels", label: "Cours individuel" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-foreground transition-colors hover:text-foreground"
    >
      {label}
    </Link>
  );
}

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div className="relative group">
      {/* Bouton */}
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
      >
        {label}
        <span className="text-foreground/60 transition group-hover:text-foreground">
          ▾
        </span>
      </button>

      {/* Menu */}
      <div className="absolute left-0 top-full mt-2 w-60 opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
        <div className="rounded-2xl border border-white/10 bg-background/95 p-2 shadow-xl backdrop-blur">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2 text-sm text-foreground/85 transition hover:bg-white/5 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-20 bg-transparent backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        {/* Logo / Nom */}
        <Link href="/" className="group inline-flex items-start">
          <span className="relative flex flex-col text-3xl font-semibold tracking-tight leading-[0.85]">
            {/* CREA' (blanc) */}
            <span
              className="text-foreground"
              style={{
                textShadow: "0 2px 0 rgba(0,0,0,0.65), 0 12px 26px rgba(0,0,0,0.85)",
              }}
            >
              CREA&apos;
            </span>

            {/* STAR (doré) en dessous, décalé pour commencer sous le E */}
            <span
              className="pl-[1.15em] text-accent transition-all duration-300"
              style={{
                WebkitTextStroke: "0.35px rgb(var(--accent))",
              }}
            >
              <span className="inline-block transition-all duration-300 group-hover:drop-shadow-[0_2px_0_rgba(0,0,0,0.65)] group-hover:drop-shadow-[0_16px_34px_rgba(0,0,0,0.8)]">
                STAR
              </span>
            </span>
          </span>
        </Link>

        {/* Ligne décorative bas du header */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px]">
          <div className="h-[1px] bg-primary" />
          <div className="h-[1px] bg-accent" />
        </div>


        {/* Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Dropdown label="À propos" items={aboutItems} />
          <Dropdown label="Nos cours" items={courseItems} />
          <NavLink href="/stages" label="Nos stages" />
          <NavLink href="/inscriptions" label="Inscriptions" />
          <NavLink href="/locations" label="Réservation salles / studio" />
        </nav>

        {/* Bouton (action) */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-full border border-accent/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:brightness-110"
          >
            Connexion
          </Link>
        </div>
      </div>

    </header>
  );
}
