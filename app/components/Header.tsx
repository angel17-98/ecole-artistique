"use client";
// app/components/Header.tsx
// Menu du site public — refonte du 18/11/2026.
//   À propos ▾ · Cours collectifs ▾ · Cours individuels · Stages & Workshops · Location
//   + bouton « S'inscrire » toujours visible.
// Les liens viennent de lib/navigation.ts (les pages pas encore créées y sont cachées).

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/client";
import {
  A_PROPOS, COURS_COLLECTIFS, LIENS_DIRECTS, LIEN_INSCRIPTION,
  groupesPrets, liensPrets, estActif,
  type GroupeNav,
} from "@/lib/navigation";

const OR = "rgb(185,151,83)";

// ─── DESKTOP ─────────────────────────────────────────────────────────────────

function NavLink({ href, label, actif }: { href: string; label: string; actif: boolean }) {
  return (
    <Link
      href={href}
      aria-current={actif ? "page" : undefined}
      className={`group relative whitespace-nowrap text-[13px] font-medium transition duration-200 hover:text-white ${actif ? "!text-white" : "!text-white/84"}`}
    >
      <span className="relative inline-block">
        {label}
        <span className={`absolute -bottom-1 left-0 h-px bg-white/70 transition-all duration-300 group-hover:w-full ${actif ? "w-full" : "w-0"}`} />
      </span>
    </Link>
  );
}

function DesktopDropdown({
  label,
  groupes,
  pathname,
}: {
  label: string;
  groupes: GroupeNav[];
  pathname: string;
}) {
  const actif = groupes.some((g) => g.liens.some((l) => estActif(pathname, l.href)));

  return (
    // focus-within : le menu s'ouvre aussi au clavier (Tab), pas seulement au survol
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="true"
        className={`group inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium transition duration-200 hover:text-white ${actif ? "text-white" : "text-white/84"}`}
      >
        <span className="relative inline-block">
          {label}
          <span className={`absolute -bottom-1 left-0 h-px bg-white/70 transition-all duration-300 group-hover:w-full ${actif ? "w-full" : "w-0"}`} />
        </span>
        <span className="text-white/46 transition duration-200 group-hover:rotate-180 group-hover:text-white/74">
          ▾
        </span>
      </button>

      <div className="invisible absolute left-0 top-full z-50 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="w-80 overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.45),transparent)]" />
          <div className="p-2">
            {groupes.map((g, i) => (
              <div key={g.titre ?? i} className={i > 0 ? "mt-1 border-t border-black/6 pt-1" : ""}>
                {g.titre && (
                  <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/38">
                    {g.titre}
                  </p>
                )}
                {g.liens.map((item) => {
                  const itemActif = estActif(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={itemActif ? "page" : undefined}
                      className={`block rounded-[18px] px-4 py-2.5 transition duration-200 hover:bg-[rgb(var(--background-soft))] ${itemActif ? "bg-[rgb(var(--background-soft))]" : ""}`}
                    >
                      <span className="block text-sm font-medium text-black/80">{item.label}</span>
                      {item.description && (
                        <span className="mt-0.5 block text-xs text-black/45">{item.description}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE ──────────────────────────────────────────────────────────────────

function MobileGroup({
  titre,
  groupes,
  pathname,
  onNavigate,
}: {
  titre: string;
  groupes: GroupeNav[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">{titre}</p>
      <div className="mt-3 space-y-3">
        {groupes.map((g, i) => (
          <div key={g.titre ?? i}>
            {g.titre && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">{g.titre}</p>
            )}
            <div className="space-y-1">
              {g.liens.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={estActif(pathname, item.href) ? "page" : undefined}
                  className={`block rounded-[18px] px-3 py-3 text-sm font-medium transition duration-200 hover:bg-white/8 hover:text-white ${estActif(pathname, item.href) ? "bg-white/8 text-white" : "text-white/82"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const aPropos = groupesPrets(A_PROPOS);
  const coursCollectifs = groupesPrets(COURS_COLLECTIFS);
  const liensDirects = liensPrets(LIENS_DIRECTS);

  // ── Auth state + récupération du rôle ──────────────────
  useEffect(() => {
    const supabase = createClient();

    async function fetchUserAndRole(userId: string) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setUserRole(profile?.role ?? null);
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchUserAndRole(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchUserAndRole(u.id);
      } else {
        setUserRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Href "Mon espace" selon le rôle ────────────────────
  const monEspaceHref =
    userRole === "direction"
      ? "/plateforme/direction"
      : "/plateforme/dashboard";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  // ── Fermer le menu mobile quand on change de page ──────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const fermer = () => setMobileOpen(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/70 backdrop-blur-xl">
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.18),transparent)]" />

        <div className="site-shell-wide">
          <div className="flex min-h-[88px] items-center justify-between gap-4 px-6 md:px-10 lg:px-14">

            {/* Logo */}
            <Link href="/" className="relative inline-flex items-center shrink-0">
              <img
                src="/Logo-footer.png"
                alt="Logo CREA'STAR"
                className="block h-[48px] w-auto sm:h-[56px]"
              />
            </Link>

            {/* Nav desktop */}
            <nav aria-label="Menu principal" className="hidden items-center gap-5 lg:flex xl:gap-7">
              <DesktopDropdown label="À propos" groupes={aPropos} pathname={pathname} />
              <DesktopDropdown label="Cours collectifs" groupes={coursCollectifs} pathname={pathname} />
              {liensDirects.map((l) => (
                <NavLink key={l.href} href={l.href} label={l.label} actif={estActif(pathname, l.href)} />
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={LIEN_INSCRIPTION.href}
                className="hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:brightness-110"
                style={{ background: OR }}
              >
                {LIEN_INSCRIPTION.label}
              </Link>

              {user ? (
                <>
                  <Link
                    href={monEspaceHref}
                    className="hidden md:inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-white/20"
                  >
                    Mon espace
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden xl:inline-flex items-center justify-center rounded-full border border-white/14 px-4 py-2.5 text-sm font-medium text-white/60 transition duration-200 hover:bg-white/10 hover:text-white"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/plateforme/login"
                  className="hidden md:inline-flex items-center justify-center rounded-full border border-white/20 bg-white/50 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-white/40"
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
        <div className="fixed inset-0 z-40 flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={fermer}
          />

          {/* Drawer */}
          <aside className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-[rgb(10,10,10)] px-5 pb-10 pt-28 shadow-2xl">
            <div className="space-y-3">
              <Link
                href={LIEN_INSCRIPTION.href}
                onClick={fermer}
                className="flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ background: OR }}
              >
                {LIEN_INSCRIPTION.label}
              </Link>

              <MobileGroup titre="Cours collectifs" groupes={coursCollectifs} pathname={pathname} onNavigate={fermer} />
              <MobileGroup titre="Autres formats" groupes={[{ liens: liensDirects }]} pathname={pathname} onNavigate={fermer} />
              <MobileGroup titre="À propos" groupes={aPropos} pathname={pathname} onNavigate={fermer} />

              <div className="pt-2">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href={monEspaceHref}
                      onClick={fermer}
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
                    onClick={fermer}
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