// app/plateforme/direction/DirectionSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/client";
import {
  LayoutDashboard, FileText, Users, GraduationCap,
  Layers, Megaphone, MessageSquare, LogOut
} from "lucide-react";

const NAV = [
  { href: "/plateforme/direction", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/plateforme/direction/candidatures", icon: FileText, label: "Candidatures", alertKey: "candidatures" },
  { href: "/plateforme/direction/eleves", icon: Users, label: "Élèves" },
  { href: "/plateforme/direction/profs", icon: GraduationCap, label: "Profs" },
  { href: "/plateforme/direction/groupes", icon: Layers, label: "Groupes" },
  { href: "/plateforme/direction/communication", icon: Megaphone, label: "Comm." },
  { href: "/plateforme/messages", icon: MessageSquare, label: "Messages", alertKey: "messages" },
];

export default function DirectionSidebar({
  profile,
  photoSrc,
}: {
  profile: { prenom?: string; nom?: string; photo_url?: string } | null;
  photoSrc: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [alerts, setAlerts] = useState({ candidatures: 0, messages: 0 });

  // Fetch des counts en temps réel
  useEffect(() => {
    const supabase = createClient();

    const fetchAlerts = async () => {
      const [{ count: candidaturesCount }, { data: { user } }] = await Promise.all([
        supabase
          .from("candidatures")
          .select("id", { count: "exact", head: true })
          .eq("statut", "en_attente"),
        supabase.auth.getUser(),
      ]);

      let messagesCount = 0;
      if (user) {
        const { data: convs } = await supabase
          .from("conversations")
          .select("messages(id, lu_par, sender_id)")
          .contains("participants", [user.id]);

        messagesCount = (convs ?? []).reduce((acc: number, conv: any) => {
          return acc + (conv.messages ?? []).filter(
            (m: any) => !m.lu_par?.includes(user.id) && m.sender_id !== user.id
          ).length;
        }, 0);
      }

      setAlerts({
        candidatures: candidaturesCount ?? 0,
        messages: messagesCount,
      });
    };

    fetchAlerts();

    // Refresh toutes les 30 secondes
    const interval = setInterval(fetchAlerts, 30_000);

    // Realtime sur candidatures
    const sub = supabase
      .channel("direction-alerts")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "candidatures",
      }, fetchAlerts)
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(sub);
    };
  }, []);

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
        bottom: "0",
      }}
    >
      {/* Logo */}
      <Link
        href="/plateforme/direction"
        className="mb-5 flex items-center justify-center w-10 h-10 rounded-[12px] flex-shrink-0"
        style={{ background: "linear-gradient(135deg, rgb(22,92,71) 0%, rgb(30,115,88) 100%)" }}
      >
        <span className="text-[10px] font-black tracking-wider text-white">CS</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV.map(item => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const alertCount = item.alertKey ? alerts[item.alertKey as keyof typeof alerts] : 0;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="group relative flex flex-col items-center justify-center w-full h-[52px] rounded-[12px] transition-all duration-200"
              style={{ background: isActive ? "rgba(22,92,71,0.55)" : "transparent" }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? "rgb(185,151,83)" : "rgba(255,255,255,0.35)" }}
              />
              <span
                className="text-[8px] mt-1 font-medium tracking-wide"
                style={{ color: isActive ? "rgba(185,151,83,0.8)" : "rgba(255,255,255,0.25)" }}
              >
                {item.label.slice(0, 6)}
              </span>

              {/* Badge count */}
              {alertCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[8px] font-bold px-1"
                  style={{ background: "rgb(185,151,83)", color: "white" }}
                >
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              )}

              {/* Tooltip */}
              <span
                className="pointer-events-none absolute left-full ml-2 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ background: "rgb(8,20,14)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {item.label}
                {alertCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                    style={{ background: "rgb(185,151,83)" }}>
                    {alertCount}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Séparateur */}
      <div className="w-8 h-px mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Avatar */}
      <div className="flex flex-col items-center gap-2 px-2 mb-1">
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: "1.5px solid rgba(185,151,83,0.4)" }}
        >
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={profile?.prenom ?? ""}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "rgba(22,92,71,0.5)", color: "rgb(185,151,83)" }}
            >
              {(profile?.prenom?.[0] ?? "") + (profile?.nom?.[0] ?? "")}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Déconnexion"
          className="flex items-center justify-center w-8 h-8 rounded-[10px] transition-all hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}