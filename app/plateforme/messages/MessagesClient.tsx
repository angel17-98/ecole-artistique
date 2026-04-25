"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/client";
import PlatformShell, { Avatar, ShellProfile, ShellEleve, ShellNotification } from "@/app/components/plateforme/PlatformShell";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TabId = "recus" | "discussions";

interface Notification extends ShellNotification {}

interface Contact {
  user_id: string;
  prenom: string;
  nom: string;
  role: "direction" | "prof_salarie" | "prof_independant";
  discipline?: string;
  conversation_id?: string; // null si pas encore de conversation
}

interface Conversation {
  id: string;
  contact: Contact;
  dernierMessage?: string;
  dernierMessageDate?: string;
  nonLus: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  contenu: string;
  lu_par: string[];
  created_at: string;
  sender?: { prenom: string | null; nom: string | null; role: string };
}

interface MessagesProps {
  profile: ShellProfile;
  eleves: ShellEleve[];
  userId: string;
  initialNotifications: Notification[];
  initialConversations: Conversation[];
  contacts: Contact[]; // profs assignés + direction — toujours visibles
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  message:   { icon: "✉",  label: "Message",   color: "text-blue-600",               bg: "bg-blue-50"  },
  note_prof: { icon: "📝", label: "Note prof",  color: "text-violet-600",             bg: "bg-violet-50" },
  annonce:   { icon: "📣", label: "Annonce",    color: "text-amber-600",              bg: "bg-amber-50"  },
  fidelite:  { icon: "★",  label: "Fidélité",   color: "text-[rgb(185,151,83)]",     bg: "bg-[rgb(185,151,83)]/10" },
  systeme:   { icon: "ℹ",  label: "Info",       color: "text-[rgb(22,92,71)]",       bg: "bg-[rgb(239,244,239)]" },
};

function roleLabel(role: string) {
  const m: Record<string, string> = {
    direction: "Direction",
    prof_salarie: "Professeur",
    prof_independant: "Professeur",
  };
  return m[role] ?? role;
}

function formatTime(date: string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}

function formatDateSep(date: string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
}

// ─── ONGLET REÇUS ────────────────────────────────────────────────────────────
function OngletRecus({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [filter, setFilter] = useState<"tout" | ShellNotification["type"]>("tout");
  const unread = notifications.filter(n => !n.lu).length;

  const filtered = filter === "tout"
    ? notifications
    : notifications.filter(n => n.type === filter);

  const filters: { id: "tout" | ShellNotification["type"]; label: string }[] = [
    { id: "tout",      label: "Tout" },
    { id: "note_prof", label: "Notes profs" },
    { id: "annonce",   label: "Annonces" },
    { id: "fidelite",  label: "Fidélité" },
    { id: "systeme",   label: "Infos" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Barre actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                filter === f.id
                  ? "bg-[rgb(22,92,71)] text-white"
                  : "border border-black/10 text-black/50 hover:border-[rgb(22,92,71)]/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            className="shrink-0 ml-3 text-[11px] font-medium text-[rgb(22,92,71)] hover:underline"
          >
            Tout lu
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
            <p className="text-4xl mb-3">📬</p>
            <p className="text-sm font-medium text-black/60 mb-1">Aucun message reçu</p>
            <p className="text-xs text-black/35 leading-5">Les notes de vos professeurs et annonces de la direction apparaîtront ici.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/4">
            {filtered
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map(n => {
                const cfg = TYPE_CONFIG[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className={`flex gap-3 px-4 py-4 hover:bg-black/2 transition cursor-pointer ${!n.lu ? "bg-[rgb(239,244,239)]/50" : ""}`}
                  >
                    <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-[12px] ${cfg.bg}`}>
                      <span className={`text-sm ${cfg.color}`}>{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <p className={`text-sm text-black ${!n.lu ? "font-bold" : "font-semibold"} truncate`}>{n.titre}</p>
                            <span className={`text-[9px] font-semibold uppercase tracking-[0.1em] shrink-0 ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <p className="text-xs text-black/55 leading-5 line-clamp-2">{n.contenu}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <p className="text-[10px] text-black/30">{formatTime(n.created_at)}</p>
                          {!n.lu && <div className="h-2 w-2 rounded-full bg-[rgb(22,92,71)]" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ONGLET DISCUSSIONS ──────────────────────────────────────────────────────
function OngletDiscussions({
  conversations,
  contacts,
  userId,
  onConversationStart,
}: {
  conversations: Conversation[];
  contacts: Contact[];
  userId: string;
  onConversationStart: (conv: Conversation) => void;
}) {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(
    conversations[0] ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [convs, setConvs] = useState<Conversation[]>(conversations);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Mobile : afficher liste ou chat
  const [mobileView, setMobileView] = useState<"liste" | "chat">("liste");

  // Contacts sans conversation (pour démarrer une nouvelle)
  const contactsSansConv = contacts.filter(
    c => !convs.some(conv => conv.contact.user_id === c.user_id)
  );

  // ── Charger messages ──────────────────────────────────────────────────────
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles!sender_id(prenom, nom, role)")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((data as Message[]) ?? []);
    setLoadingMsgs(false);
  }, [supabase]);

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv.id);
  }, [selectedConv?.id]);

  // ── Scroll bas ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`conv:${selectedConv.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, async payload => {
        const m = payload.new as Message;
        const { data: s } = await supabase.from("profiles").select("prenom,nom,role").eq("id", m.sender_id).single();
        setMessages(prev => [...prev, { ...m, sender: s ?? undefined }]);
        setConvs(prev => prev.map(c => c.id === selectedConv.id
          ? { ...c, dernierMessage: m.contenu, dernierMessageDate: m.created_at }
          : c
        ));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv?.id]);

  // ── Démarrer une conv depuis un contact ───────────────────────────────────
  const handleStartConv = async (contact: Contact) => {
    // Appel RPC Supabase pour get_or_create_conversation
    const { data: convId, error } = await supabase
      .rpc("get_or_create_conversation", { user_a: userId, user_b: contact.user_id });
    if (error || !convId) return;

    const newConv: Conversation = {
      id: convId,
      contact,
      nonLus: 0,
    };
    setConvs(prev => [newConv, ...prev]);
    setSelectedConv(newConv);
    setMobileView("chat");
  };

  // ── Sélectionner une conv ─────────────────────────────────────────────────
  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    setMobileView("chat");
  };

  // ── Envoyer ───────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !selectedConv || sending) return;
    setSending(true);
    setNewMessage("");
    await supabase.from("messages").insert({
      conversation_id: selectedConv.id,
      sender_id: userId,
      contenu: text,
      lu_par: [userId],
    });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ─── LISTE ────────────────────────────────────────────────────────────────
  const ListePanel = (
    <div className={`flex flex-col border-r border-black/5 shrink-0 w-full md:w-72 lg:w-80 ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
      {/* Header liste */}
      <div className="px-4 py-3.5 border-b border-black/5 shrink-0">
        <p className="text-sm font-semibold text-black">Discussions</p>
        <p className="text-[10px] text-black/40 mt-0.5">{convs.length} conversation{convs.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Conversations existantes */}
        {convs.length > 0 && (
          <div className="p-2 space-y-1">
            {convs.map(conv => {
              const isActive = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-[14px] transition ${
                    isActive ? "bg-[rgb(22,92,71)]/8 border border-[rgb(22,92,71)]/15" : "hover:bg-black/3 border border-transparent"
                  }`}
                >
                  <Avatar prenom={conv.contact.prenom} nom={conv.contact.nom} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm font-semibold truncate ${isActive ? "text-[rgb(22,92,71)]" : "text-black"}`}>
                        {conv.contact.prenom} {conv.contact.nom}
                      </p>
                      {conv.dernierMessageDate && (
                        <p className="text-[10px] text-black/30 shrink-0">{formatTime(conv.dernierMessageDate)}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-[10px] text-[rgb(22,92,71)] font-medium uppercase tracking-[0.1em]">
                        {roleLabel(conv.contact.role)}{conv.contact.discipline ? ` · ${conv.contact.discipline}` : ""}
                      </p>
                      {conv.nonLus > 0 && (
                        <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[rgb(22,92,71)] px-1 text-[9px] font-bold text-white">
                          {conv.nonLus}
                        </span>
                      )}
                    </div>
                    {conv.dernierMessage && (
                      <p className={`text-[11px] mt-0.5 truncate ${conv.nonLus > 0 ? "text-black/70 font-medium" : "text-black/40"}`}>
                        {conv.dernierMessage}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Contacts disponibles (pas encore de conv) */}
        {contactsSansConv.length > 0 && (
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30 mb-2">
              {convs.length > 0 ? "Démarrer une nouvelle discussion" : "Vos contacts"}
            </p>
            <div className="space-y-1">
              {contactsSansConv.map(contact => (
                <button
                  key={contact.user_id}
                  onClick={() => handleStartConv(contact)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-[12px] border border-dashed border-black/10 hover:border-[rgb(22,92,71)]/30 hover:bg-[rgb(239,244,239)]/50 transition"
                >
                  <Avatar prenom={contact.prenom} nom={contact.nom} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">{contact.prenom} {contact.nom}</p>
                    <p className="text-[10px] text-[rgb(22,92,71)] font-medium uppercase tracking-[0.1em]">
                      {roleLabel(contact.role)}{contact.discipline ? ` · ${contact.discipline}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-black/25">+</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {convs.length === 0 && contactsSansConv.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm font-medium text-black/60 mb-1">Aucun contact disponible</p>
            <p className="text-xs text-black/35 leading-5">Vos profs et la direction apparaîtront ici dès votre inscription à un parcours.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ─── ZONE CHAT ────────────────────────────────────────────────────────────
  const ChatPanel = (
    <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${mobileView === "liste" ? "hidden md:flex" : "flex"}`}>
      {selectedConv ? (
        <>
          {/* Header chat */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/5 shrink-0">
            <button
              onClick={() => setMobileView("liste")}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-black/50 text-sm"
            >
              ←
            </button>
            <Avatar prenom={selectedConv.contact.prenom} nom={selectedConv.contact.nom} size="sm" />
            <div>
              <p className="text-sm font-semibold text-black">
                {selectedConv.contact.prenom} {selectedConv.contact.nom}
              </p>
              <p className="text-[10px] text-[rgb(22,92,71)] font-medium uppercase tracking-[0.1em]">
                {roleLabel(selectedConv.contact.role)}
                {selectedConv.contact.discipline ? ` · ${selectedConv.contact.discipline}` : ""}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-[rgb(22,92,71)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-3xl mb-3">👋</p>
                <p className="text-sm font-medium text-black/60 mb-1">Début de la conversation</p>
                <p className="text-xs text-black/35">
                  Envoyez votre premier message à {selectedConv.contact.prenom}.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const prev = messages[i - 1];
                const isMine = msg.sender_id === userId;
                const showDateSep = !prev || new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString();
                const showSender = !isMine && (!prev || prev.sender_id !== msg.sender_id || showDateSep);

                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-black/6" />
                        <p className="text-[10px] text-black/35 font-medium shrink-0">{formatDateSep(msg.created_at)}</p>
                        <div className="flex-1 h-px bg-black/6" />
                      </div>
                    )}
                    <div className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMine && (
                        <div className="shrink-0 self-end mb-0.5">
                          <Avatar prenom={msg.sender?.prenom ?? "?"} nom={msg.sender?.nom ?? ""} size="sm" />
                        </div>
                      )}
                      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMine ? "items-end" : "items-start"}`}>
                        {showSender && (
                          <p className="text-[10px] font-semibold text-black/40 px-1">
                            {msg.sender?.prenom} {msg.sender?.nom}
                          </p>
                        )}
                        <div className={`rounded-[16px] px-4 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? "bg-[rgb(22,92,71)] text-white rounded-br-[4px]"
                            : "bg-white border border-black/6 text-black shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-bl-[4px]"
                        }`}>
                          {msg.contenu}
                        </div>
                        <p className={`text-[10px] text-black/30 px-1 ${isMine ? "text-right" : "text-left"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                          {isMine && msg.lu_par.length > 1 && <span className="ml-1 text-[rgb(22,92,71)]">✓✓</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Saisie */}
          <div className="px-4 py-3 border-t border-black/5 shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message à ${selectedConv.contact.prenom}…`}
                rows={1}
                className="flex-1 resize-none rounded-[14px] border border-black/10 bg-[rgb(247,249,247)] px-4 py-2.5 text-sm text-black placeholder:text-black/30 focus:border-[rgb(22,92,71)]/40 focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/8 transition leading-relaxed"
                style={{ minHeight: "44px", maxHeight: "112px" }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 112)}px`;
                }}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(22,92,71)] text-white transition hover:bg-[rgb(18,75,58)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {sending
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <span className="text-sm font-bold">↑</span>
                }
              </button>
            </div>
            <p className="text-[10px] text-black/25 mt-1.5 px-1">Entrée pour envoyer · Maj+Entrée pour un retour à la ligne</p>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-full bg-[rgb(239,244,239)] flex items-center justify-center text-3xl mx-auto mb-4">💬</div>
            <p className="text-base font-semibold text-black mb-2">Vos discussions</p>
            <p className="text-sm text-black/45 leading-6 max-w-xs">Sélectionnez une conversation ou démarrez-en une nouvelle depuis la liste.</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex rounded-[20px] border border-black/6 bg-white shadow-[0_2px_12px_rgba(16,16,16,0.04)] overflow-hidden" style={{ height: "calc(100vh - 13rem)" }}>
      {ListePanel}
      {ChatPanel}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function MessagesClient({
  profile, eleves, userId, initialNotifications, initialConversations, contacts,
}: MessagesProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam === "discussions" ? "discussions" : "recus"
  );
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadRecus = notifications.filter(n => !n.lu).length;
  const unreadDiscussions = initialConversations.reduce((acc, c) => acc + c.nonLus, 0);

  const handleMarkRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  const handleMarkAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, lu: true })));

  const TABS: { id: TabId; icon: string; label: string; badge: number }[] = [
    { id: "recus",       icon: "📬", label: "Reçus",      badge: unreadRecus       },
    { id: "discussions", icon: "💬", label: "Discussions", badge: unreadDiscussions },
  ];

  return (
    <PlatformShell
      profile={profile}
      eleves={eleves}
      initialNotifications={notifications}
      unreadDiscussions={unreadDiscussions}
    >
      <div className="space-y-4">

        {/* ── EN-TÊTE ── */}
        <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Espace élève</p>
              <h1 className="mt-0.5 text-base font-semibold text-black">Messages</h1>
            </div>

            {/* Slider onglets */}
            <div className="flex items-center rounded-full border border-black/10 overflow-hidden bg-[rgb(247,249,247)] p-0.5">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-[rgb(22,92,71)] text-white shadow-sm"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                      activeTab === tab.id ? "bg-white/25 text-white" : "bg-[rgb(22,92,71)] text-white"
                    }`}>
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div className="rounded-[20px] border border-black/6 bg-white shadow-[0_2px_12px_rgba(16,16,16,0.04)] overflow-hidden" style={{ height: "calc(100vh - 16rem)", minHeight: "400px" }}>
          {activeTab === "recus" ? (
            <OngletRecus
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />
          ) : (
            <OngletDiscussions
              conversations={initialConversations}
              contacts={contacts}
              userId={userId}
              onConversationStart={() => {}}
            />
          )}
        </div>

      </div>
    </PlatformShell>
  );
}