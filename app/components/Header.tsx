"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const aboutItems = [
  { href: "/a-propos/notre-ecole", label: "Notre école" },
  { href: "/a-propos/notre-equipe", label: "Notre équipe" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const courseItems = [
  { href: "/cours/full-artist", label: "Parcours Full Artist" },
  { href: "/cours/comedie-musicale", label: "Parcours Comédie musicale" },
  { href: "/cours/eveil-musical", label: "Éveil musical" },
  { href: "/cours/cours-individuels", label: "Cours individuels" },
  { href: "/cours/calendrier", label: "Calendrier annuel" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-black/75 transition hover:text-primary"
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
    <div className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-medium text-black/75 transition hover:text-primary"
      >
        {label}
        <span className="text-black/45 transition group-hover:text-primary">▾</span>
      </button>

      <div className="invisible absolute left-0 top-full z-50 mt-4 w-64 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="rounded-3xl border border-black/7 bg-[rgba(255,253,249,0.94)] p-2 shadow-[0_18px_50px_rgba(16,16,16,0.08)] backdrop-blur-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm text-black/75 transition hover:bg-[rgb(var(--background-soft))] hover:text-primary"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }

    if (mobileOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 py-4">
      <div className="site-shell">
        <div
          className={`relative overflow-hidden rounded-[28px] border transition-all duration-300 ${
            scrolled
              ? "border-black/8 bg-[rgba(255,253,249,0.88)] shadow-[0_12px_40px_rgba(16,16,16,0.08)] backdrop-blur-xl"
              : "border-black/6 bg-[rgba(255,253,249,0.72)] backdrop-blur-lg"
          }`}
        >
          <div className="absolute inset-y-0 left-0 w-[300px] bg-[linear-gradient(90deg,rgba(8,8,8,0.94)_0%,rgba(20,20,20,0.88)_62%,rgba(20,20,20,0.00)_100%)]" />
          <div className="relative flex h-20 items-center justify-between px-4 sm:px-6">
            <Link href="/" className="relative z-10 inline-flex items-center pl-2 sm:pl-3">
              <img
                src="/Logo-footer.png"
                alt="Logo CREA'STAR"
                className="block h-[48px] w-auto sm:h-[56px]"
              />
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              <Dropdown label="À propos" items={aboutItems} />
              <Dropdown label="Nos cours" items={courseItems} />
              <NavLink href="/stages" label="Nos stages" />
              <NavLink href="/inscriptions" label="Inscriptions" />
              <NavLink href="/locations" label="Réservation salles / studio" />
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:inline-flex rounded-full border border-primary/18 bg-white/70 px-4 py-2 text-sm font-medium text-black/82 transition hover:border-primary/28 hover:text-primary"
              >
                Connexion
              </Link>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-black/8 bg-white/70 px-4 py-3 text-lg text-black/80 backdrop-blur-sm transition hover:bg-white md:hidden"
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-8 bottom-0">
            <div className="gold-line" />
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          <button
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/22 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto border-l border-black/7 bg-[rgba(255,253,249,0.96)] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.24em] text-primary/80">
                Menu
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-black/8 bg-white/70 px-3 py-2 text-sm text-black/80"
                onClick={() => setMobileOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-black/6 bg-white/80 p-4">
                <p className="text-sm font-semibold text-black">À propos</p>
                <div className="mt-3 space-y-1">
                  {aboutItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-2xl px-3 py-3 text-sm text-black/72 transition hover:bg-[rgb(var(--background-soft))] hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-black/6 bg-white/80 p-4">
                <p className="text-sm font-semibold text-black">Nos cours</p>
                <div className="mt-3 space-y-1">
                  {courseItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-2xl px-3 py-3 text-sm text-black/72 transition hover:bg-[rgb(var(--background-soft))] hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-black/6 bg-white/80 p-4">
                <div className="space-y-1">
                  <Link
                    href="/stages"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm text-black/72 transition hover:bg-[rgb(var(--background-soft))] hover:text-primary"
                  >
                    Nos stages
                  </Link>
                  <Link
                    href="/inscriptions"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm text-black/72 transition hover:bg-[rgb(var(--background-soft))] hover:text-primary"
                  >
                    Inscriptions
                  </Link>
                  <Link
                    href="/locations"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm text-black/72 transition hover:bg-[rgb(var(--background-soft))] hover:text-primary"
                  >
                    Réservation salles / studio
                  </Link>
                </div>

                <div className="mt-5">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-strong"
                  >
                    Connexion
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}