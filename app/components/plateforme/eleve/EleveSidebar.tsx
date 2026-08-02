// app/components/plateforme/eleve/EleveSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/client";
import {
  LayoutDashboard, CalendarDays, FolderOpen, UserCircle,
  MessageSquare, LogOut,
} from "lucide-react";

const NAV = [
  { href: "/plateforme/dashboard",  icon: LayoutDashboard, label: "Accueil",  exact: true },
  { href: "/plateforme/planning",   icon: CalendarDays,    label: "Planning" },
  { href: "/plateforme/dossier",    icon: FolderOpen,      label: "Dossier" },
  { href: "/plateforme/mon-compte", icon: UserCircle,      label: "Compte" },
  { href: "/plateforme/messages",   icon: MessageSquare,   label: "Messages", alertKey: "messages" },
];

export default function EleveSidebar({
  profile,
  photoSrc,
}: {
  profile: { prenom?: string | null; nom?: string | null };
  photoSrc: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [messagesNonLus, setMessagesNonLus] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    const fetchMessagesNonLus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: convs } = await supabase
        .from("conversations")
        .select("messages(id, lu_par, sender_id)")
        .contains("participants", [user.id]);

      const count = (convs ?? []).reduce((acc: number, conv: any) => {
        return acc + (conv.messages ?? []).filter(
          (m: any) => !m.lu_par?.includes(user.id) && m.sender_id !== user.id
        ).length;
      }, 0);

      setMessagesNonLus(count);
    };

    fetchMessagesNonLus();
    const interval = setInterval(fetchMessagesNonLus, 30_000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/plateforme/login");
    router.refresh();
  };

  return (
    <aside
      className="fixed left-0 z-30 w-[72px] flex flex-col items-center py-5 gap-0"
      style={{
        background: "rgb(8, 20, 14)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        top: "88px",
        bottom: 0,
      }}
    >
      {/* Logo */}
      <Link href="/plateforme/dashboard"
        className="mb-5 flex items-center justify-center w-10 h-10 rounded-[12px] flex-shrink-0"
        style={{ background: "linear-gradient(135deg, rgb(22,92,71) 0%, rgb(30,115,88) 100%)" }}>
        <span className="text-[10px] font-black tracking-wider text-white">CS</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const alertCount = item.alertKey === "messages" ? messagesNonLus : 0;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} title={item.label}
              className="group relative flex flex-col items-center justify-center w-full h-[52px] rounded-[12px] transition-all duration-200 shrink-0"
              style={{ background: isActive ? "rgba(22,92,71,0.55)" : "transparent" }}>
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? "rgb(185,151,83)" : "rgba(255,255,255,0.35)" }} />
              <span className="text-[8px] mt-1 font-medium tracking-wide"
                style={{ color: isActive ? "rgba(185,151,83,0.8)" : "rgba(255,255,255,0.25)" }}>
                {item.label.slice(0, 6)}
              </span>
              {alertCount > 0 && (
                <span className="absolute top-2 right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: "rgb(185,151,83)", color: "white" }}>
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full ml-2 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ background: "rgb(8,20,14)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Séparateur */}
      <div className="w-8 h-px mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Avatar */}
      <div className="flex flex-col items-center gap-2 px-2 mb-2">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: "1.5px solid rgba(185,151,83,0.4)" }}>
          {photoSrc ? (
            <img src={photoSrc} alt={profile?.prenom ?? ""} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "rgba(22,92,71,0.5)", color: "rgb(185,151,83)" }}>
              {(profile?.prenom?.[0] ?? "") + (profile?.nom?.[0] ?? "")}
            </div>
          )}
        </div>
        <button onClick={handleLogout} title="Déconnexion"
          className="flex items-center justify-center w-8 h-8 rounded-[10px] transition-all hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.2)" }}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}