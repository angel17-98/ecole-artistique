"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/client";

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
      className="group relative whitespace-nowrap text-[13px] font-medium !text-white/84 transition duration-200 hover:text-white"
    >
      <span className="relative inline-block">
        {label}
        <span className="absolute -bottom-1 left-0 h-px w-0 bg-white/70 transition-all duration-300 group-hover:w-full" />
      </span>
    </Link>
  );
}

function DesktopDropdown({
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
        className="group inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-white/84 transition duration-200 hover:text-white"
      >
        <span className="relative inline-block">
          {label}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-white/70 transition-all duration-300 group-hover:w-full" />
        </span>
        <span className="text-white/46 transition duration-200 group-hover:rotate-180 group-hover:text-white/74">
          ▾
        </span>
      </button>

      <div className="invisible absolute left-0 top-full z-50 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
        <div className="w-72 overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.45),transparent)]" />
          <div className="p-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-[18px] px-4 py-3 text-sm font-medium text-black/78 transition duration-200 hover:bg-[rgb(var(--background-soft))] hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: { href: string; label: string }[];
  onNavigate: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
        {title}
      </p>
      <div className="mt-3 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="block rounded-[18px] px-3 py-3 text-sm font-medium text-white/82 transition duration-200 hover:bg-white/8 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // ── Auth state ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  // ── Mobile scroll lock ──────────────────────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/70 backdrop-blur-xl">
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.18),transparent)]" />

        <div className="site-shell-wide">
          <div className="flex min-h-[88px] items-center justify-between px-6 md:px-10 lg:px-14">

            {/* Logo */}
            <Link href="/" className="relative inline-flex items-center shrink-0">
              <img
                src="/Logo-footer.png"
                alt="Logo CREA'STAR"
                className="block h-[48px] w-auto sm:h-[56px]"
              />
            </Link>

            {/* Nav desktop */}
            <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
              <DesktopDropdown label="À propos" items={aboutItems} />
              <DesktopDropdown label="Nos cours" items={courseItems} />
              <NavLink href="/stages" label="Stages & Workshops" />
              <NavLink href="/inscriptions" label="Inscriptions" />
              <NavLink href="/locations" label="Réservation studio / salles" />
            </nav>

            {/* Actions desktop */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <Link
                    href="/plateforme/dashboard"
                    className="hidden md:inline-flex items-center justify-center rounded-full border border-white/50 bg-white/40 px-5 py-2.5 text-sm font-medium text-black transition duration-200 hover:bg-white/30 hover:text-white"
                  >
                    Mon espace
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:inline-flex items-center justify-center rounded-full border border-white/70 bg-white/60 px-4 py-2.5 text-sm font-medium text-black/70 transition duration-200 hover:bg-white/50 hover:text-white"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/plateforme/login"
                  className="hidden md:inline-flex items-center justify-center rounded-full border border-white/14 bg-white/70 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-white/40"
                >
                  Connexion
                </Link>
              )}

              {/* Burger mobile */}
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/12 text-lg text-white transition duration-200 hover:bg-white/18 lg:hidden"
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MENU MOBILE ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <button
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute right-0 top-0 h-[100dvh] w-[92%] max-w-sm overflow-y-auto overscroll-contain border-l border-white/10 bg-[linear-gradient(180deg,rgba(7,10,9,0.99)_0%,rgba(10,18,14,0.99)_100%)] p-5 shadow-[-20px_0_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/52">Navigation</p>
                <p className="mt-1 text-sm text-white/84">CREA&apos;STAR</p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10 text-sm text-white transition hover:bg-white/16"
                onClick={() => setMobileOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-8 space-y-5 pb-8 text-white/72">
              <MobileGroup title="À propos" items={aboutItems} onNavigate={() => setMobileOpen(false)} />
              <MobileGroup title="Nos cours" items={courseItems} onNavigate={() => setMobileOpen(false)} />

              <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">Autres</p>
                <div className="mt-3 space-y-1">
                  <Link href="/stages" onClick={() => setMobileOpen(false)} className="block rounded-[18px] px-3 py-3 text-sm font-medium text-white/82 transition duration-200 hover:bg-white/8 hover:text-white">
                    Nos stages
                  </Link>
                  <Link href="/inscriptions" onClick={() => setMobileOpen(false)} className="block rounded-[18px] px-3 py-3 text-sm font-medium text-white/82 transition duration-200 hover:bg-white/8 hover:text-white">
                    Inscriptions
                  </Link>
                  <Link href="/locations" onClick={() => setMobileOpen(false)} className="block rounded-[18px] px-3 py-3 text-sm font-medium text-white/82 transition duration-200 hover:bg-white/8 hover:text-white">
                    Réservation studio / salles
                  </Link>
                </div>
              </div>

              {/* ── Auth mobile ── */}
              <div className="border-t border-white/10 pt-5">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/plateforme/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-full bg-[rgb(22,92,71)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)]"
                    >
                      ◈ Mon espace Crea'Star
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-full border border-white/14 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/8 hover:text-white"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/plateforme/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[rgb(var(--background-soft))]"
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}