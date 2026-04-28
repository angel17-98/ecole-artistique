"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/plateforme/supabase/client";
import { Home, CalendarDays, FolderOpen, UserCircle, MessageCircle, Image, Bell, Zap, Clock, GraduationCap, BookOpen, Star, DoorOpen, Users } from "lucide-react";

// ─── TYPES EXPORTÉS ──────────────────────────────────────────────────────────
export interface ShellProfile {
  id: string;
  role: string;
  prenom: string | null;
  nom: string | null;
  telephone?: string | null;
}

export interface ShellEleve {
  id: string;
  prenom: string;
  nom: string;
  statut_premium: boolean;
}

export interface ShellNotification {
  id: string;
  type: "message" | "note_prof" | "annonce" | "fidelite" | "systeme";
  titre: string;
  contenu: string;
  lu: boolean;
  lien?: string;
  created_at: string;
}

interface PlatformShellProps {
  profile: ShellProfile;
  eleves: ShellEleve[];
  children: React.ReactNode;
  initialNotifications?: ShellNotification[];
  unreadDiscussions?: number;
}

// ─── NAV ITEMS ───────────────────────────────────────────────────────────────
const navItems = [
  { href: "/plateforme/dashboard", label: "Accueil", icon: <Home size={18} /> },
  { href: "/plateforme/planning",  label: "Planning", icon: <CalendarDays size={18} /> },
  { href: "/plateforme/dossier",   label: "Dossier",  icon: <FolderOpen size={18} /> },
  { href: "/plateforme/mon-compte",label: "Compte",   icon: <UserCircle size={18} /> },
];

// ─── EXPORTS UTILITAIRES ─────────────────────────────────────────────────────
export function Avatar({
  prenom, nom, size = "md", photo_url,
}: {
  prenom: string; nom: string; size?: "sm" | "md" | "lg"; photo_url?: string | null;
}) {
  const initials = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
  const palette = ["bg-emerald-700", "bg-teal-700", "bg-cyan-700", "bg-green-700", "bg-lime-700"];
  const idx = ((prenom.charCodeAt(0) ?? 0) + (nom.charCodeAt(0) ?? 0)) % palette.length;
  const sizeMap = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-sm" };

  if (photo_url) {
    return <img src={photo_url} alt={`${prenom} ${nom}`} className={`${sizeMap[size]} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${sizeMap[size]} ${palette[idx]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

export function BadgePremium({ mini = false }: { mini?: boolean }) {
  if (mini) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(22,92,71)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
        ★ Premium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(22,92,71)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
      ★ Premium
    </span>
  );
}

// ─── BADGE COMPTEUR ──────────────────────────────────────────────────────────
function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[rgb(22,92,71)] px-1 text-[9px] font-bold text-white leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// ─── PANEL REÇUS ─────────────────────────────────────────────────────────────
function RecusPanel({
  notifs, onClose, onMarkAllRead, onMarkRead,
}: {
  notifs: ShellNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}) {
  const unread = notifs.filter(n => !n.lu);
  const typeIcon: Record<ShellNotification["type"], string> = {
    message: "✉", note_prof: "📝", annonce: "📣", fidelite: "★", systeme: "ℹ",
  };
  const typeLabel: Record<ShellNotification["type"], string> = {
    message: "Message", note_prof: "Note prof", annonce: "Annonce", fidelite: "Fidélité", systeme: "Info",
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-[20px] border border-black/8 bg-white shadow-[0_16px_60px_rgba(0,0,0,0.16)] z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
        <div>
          <p className="text-sm font-semibold text-black">Reçus</p>
          <p className="text-[10px] text-black/40 mt-0.5">
            {unread.length > 0 ? `${unread.length} non lu${unread.length > 1 ? "s" : ""}` : "Tout est lu"}
          </p>
        </div>
        {unread.length > 0 && (
          <button onClick={onMarkAllRead} className="text-[11px] font-medium text-[rgb(22,92,71)] hover:underline">
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-black/4">
        {notifs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-2xl mb-2">📬</p>
            <p className="text-sm font-medium text-black/50">Aucun message reçu</p>
            <p className="text-xs text-black/30 mt-1 px-6 leading-4">
              Les notes de vos profs et annonces de la direction apparaîtront ici.
            </p>
          </div>
        ) : (
          notifs.map(n => (
            <div
              key={n.id}
              onClick={() => {
                onMarkRead(n.id);
                onClose();
                if (n.lien) window.location.href = n.lien;
              }}
              className={`flex gap-3 px-4 py-3 hover:bg-black/2 transition cursor-pointer ${!n.lu ? "bg-[rgb(239,244,239)]/60" : ""}`}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${!n.lu ? "bg-[rgb(22,92,71)]/10" : "bg-black/5"}`}>
                {typeIcon[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className={`text-xs text-black truncate ${!n.lu ? "font-bold" : "font-semibold"}`}>{n.titre}</p>
                  <span className="text-[9px] font-medium text-black/30 uppercase tracking-[0.1em] shrink-0">{typeLabel[n.type]}</span>
                </div>
                <p className="text-[11px] text-black/50 mt-0.5 line-clamp-2 leading-4">{n.contenu}</p>
                <p className="text-[10px] text-black/30 mt-1">
                  {new Date(n.created_at).toLocaleDateString("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.lu && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[rgb(22,92,71)]" />}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-black/5 px-4 py-2.5">
        <Link
          href="/plateforme/messages?tab=recus"
          onClick={onClose}
          className="block text-center text-[11px] font-medium text-[rgb(22,92,71)] hover:underline"
        >
          Voir tous les reçus →
        </Link>
      </div>
    </div>
  );
}

// ─── HEADER PLATEFORME ───────────────────────────────────────────────────────
function PlatformHeader({
  profile, eleves, notifs, unreadDiscussions, onMarkAllRead, onMarkRead,
}: {
  profile: ShellProfile;
  eleves: ShellEleve[];
  notifs: ShellNotification[];
  unreadDiscussions: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}) {
  const [recusOpen, setRecusOpen] = useState(false);
  const recusRef = useRef<HTMLDivElement>(null);
  const unreadRecus = notifs.filter(n => !n.lu).length;
  const isPremium = eleves.some(e => e.statut_premium);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (recusRef.current && !recusRef.current.contains(e.target as Node)) {
        setRecusOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/plateforme/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/5 shadow-[0_1px_8px_rgba(16,16,16,0.04)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/plateforme/dashboard" className="flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgb(22,92,71)]">CREA'STAR</span>
          <span className="hidden sm:block text-black/20 text-xs">|</span>
          <span className="hidden sm:block text-[10px] text-black/40 uppercase tracking-[0.14em]">Espace élève</span>
        </Link>

        {/* Cluster droite */}
        <div className="flex items-center gap-2">

          {isPremium && <BadgePremium mini />}

          {/* 📬 Reçus */}
          <div ref={recusRef} className="relative">
            <button
              onClick={() => setRecusOpen(v => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-base text-black/50 transition hover:bg-black/4 hover:text-black"
              title="Reçus — notes, annonces, infos"
            >
              📬
              <CountBadge count={unreadRecus} />
            </button>
            {recusOpen && (
              <RecusPanel
                notifs={notifs}
                onClose={() => setRecusOpen(false)}
                onMarkAllRead={onMarkAllRead}
                onMarkRead={onMarkRead}
              />
            )}
          </div>

          {/* 💬 Discussions */}
          <Link
            href="/plateforme/messages?tab=discussions"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-base text-black/50 transition hover:bg-black/4 hover:text-black"
            title="Discussions avec profs et direction"
          >
            💬
            <CountBadge count={unreadDiscussions} />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── SIDEBAR DESKTOP ─────────────────────────────────────────────────────────
function Sidebar({ active }: { active: string }) {
  const allItems = [...navItems];
  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0">
      <nav className="sticky top-20 space-y-1 pt-2">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Navigation</p>
        {allItems.map(item => {
          const isActive = active === item.href || active.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-[rgb(22,92,71)] !text-white" : "text-black/60 hover:bg-black/4 hover:text-black"
              }`}
            >
              <span className={`text-base ${isActive ? "text-white" : "text-[rgb(22,92,71)]"}`}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── BOTTOM NAV MOBILE ───────────────────────────────────────────────────────
function BottomNav({ active }: { active: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-black/6 shadow-[0_-4px_20px_rgba(16,16,16,0.06)]">
      <div className="flex items-stretch" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navItems.map(item => {
          const isActive = active === item.href || active.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold transition relative ${
                isActive ? "text-[rgb(22,92,71)]" : "text-black/35"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[rgb(22,92,71)]" />
              )}
              <span className={`text-[18px] leading-none transition-transform ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="leading-none tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── PLATFORM SHELL PRINCIPAL ────────────────────────────────────────────────
export default function PlatformShell({
  profile,
  eleves,
  children,
  // Les notifs viennent UNIQUEMENT du serveur — jamais de données mock ici
  initialNotifications = [],
  unreadDiscussions = 0,
}: PlatformShellProps) {
  const pathname = usePathname();
  const [notifs, setNotifs] = useState<ShellNotification[]>(initialNotifications);

  // ── Marquer une notif comme lue — persiste en base ───────────────────────
  const handleMarkRead = async (id: string) => {
    // Optimistic update immédiat
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));

    // Persister en base
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ lu: true })
      .eq("id", id);
  };

  // ── Marquer toutes comme lues ─────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    const unreadIds = notifs.filter(n => !n.lu).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })));

    // Persister en base
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ lu: true })
      .in("id", unreadIds);
  };

  return (
    <div className="min-h-screen bg-[rgb(247,249,247)]">
      <PlatformHeader
        profile={profile}
        eleves={eleves}
        notifs={notifs}
        unreadDiscussions={unreadDiscussions}
        onMarkAllRead={handleMarkAllRead}
        onMarkRead={handleMarkRead}
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-28 lg:pb-10">
        <div className="flex gap-8 xl:gap-12">
          <Sidebar active={pathname} />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
      <BottomNav active={pathname} />
    </div>
  );
}