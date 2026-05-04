"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/plateforme/supabase/client";
import PlatformShell, { Avatar, ShellProfile, ShellEleve, ShellNotification } from "@/app/components/plateforme/PlatformShell";
import Link from "next/link";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TabId = "recus" | "discussions";

interface Notification extends ShellNotification {}

interface Contact {
  user_id: string;
  prenom: string;
  nom: string;
  role: "direction" | "prof_salarie" | "prof_independant";
  discipline?: string;
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
  contacts: Contact[];
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  message:   { icon: "✉",  label: "Message",   color: "text-blue-600",           bg: "bg-blue-50"  },
  note_prof: { icon: "📝", label: "Note prof",  color: "text-violet-600",         bg: "bg-violet-50" },
  annonce:   { icon: "📣", label: "Annonce",    color: "text-amber-600",          bg: "bg-amber-50"  },
  fidelite:  { icon: "★",  label: "Fidélité",   color: "text-[rgb(185,151,83)]", bg: "bg-[rgb(185,151,83)]/10" },
  systeme:   { icon: "ℹ",  label: "Info",       color: "text-[rgb(22,92,71)]",   bg: "bg-[rgb(239,244,239)]" },
};

function roleLabel(role: string) {
  return { direction: "Direction", prof_salarie: "Professeur", prof_independant: "Professeur" }[role] ?? role;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return d.toLocaleDateString("fr-BE", { weekday: "short" });
  return d.toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}

function formatDateSep(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return d.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
}

// ─── ONGLET REÇUS ─────────────────────────────────────────────────────────────
function OngletRecus({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const unread = notifications.filter(n => !n.lu).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-black/5 shrink-0 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-black">Reçus</p>
          <p className="text-[10px] text-black/40 mt-0.5">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-medium text-[rgb(22,92,71)] hover:underline"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <p className="text-3xl mb-3">📬</p>
            <p className="text-sm font-medium text-black/60 mb-1">Aucune notification</p>
            <p className="text-xs text-black/35 leading-5">Tes notifications apparaîtront ici.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/4">
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.systeme;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.lu && onMarkRead(n.id)}
                  className={`flex gap-3 px-5 py-4 cursor-pointer transition hover:bg-black/2 ${!n.lu ? "bg-[rgb(247,249,247)]" : ""}`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-base ${cfg.bg}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm truncate ${!n.lu ? "font-bold" : "font-semibold"}`}>{n.titre}</p>
                      <span className={`text-[9px] font-semibold uppercase tracking-[0.1em] shrink-0 ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-black/55 leading-5 line-clamp-2">{n.contenu}</p>
                    {n.lien && (
                      <Link
                        href={n.lien}
                        onClick={e => e.stopPropagation()}
                        className="mt-1 inline-block text-[10px] font-semibold text-[rgb(22,92,71)] hover:underline"
                      >
                        Voir →
                      </Link>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <p className="text-[10px] text-black/30">{formatTime(n.created_at)}</p>
                    {!n.lu && <div className="h-2 w-2 rounded-full bg-[rgb(22,92,71)]" />}
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

// ─── ONGLET DISCUSSIONS ───────────────────────────────────────────────────────
function OngletDiscussions({
  conversations: initialConvs,
  contacts,
  userId,
}: {
  conversations: Conversation[];
  contacts: Contact[];
  userId: string;
}) {
  const [convs, setConvs] = useState<Conversation[]>(initialConvs);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(initialConvs[0] ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileView, setMobileView] = useState<"liste" | "chat">("liste");
  const supabase = createClient();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const selectedConvRef = useRef<Conversation | null>(null);

  const contactsSansConv = contacts.filter(
    c => !convs.some(conv => conv.contact.user_id === c.user_id)
  );

  // ── Charger messages ──────────────────────────────────────────────────────
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("loadMessages error:", error);
      setLoadingMsgs(false);
      return;
    }

    setMessages((data as Message[]) ?? []);
    setLoadingMsgs(false);
  }, []);
  // ── Marquer messages comme lus en base ────────────────────────────────────
  const markConvAsRead = useCallback(async (convId: string) => {
    // Récupérer tous les messages non lus de cette conv
    const { data: unread } = await supabase
      .from("messages")
      .select("id, lu_par")
      .eq("conversation_id", convId)
      .not("lu_par", "cs", `{${userId}}`);

    if (!unread || unread.length === 0) return;

    // Mettre à jour chaque message
    await Promise.all(
      unread.map((msg: any) =>
        supabase
          .from("messages")
          .update({ lu_par: [...(msg.lu_par ?? []), userId] })
          .eq("id", msg.id)
      )
    );

    // Mettre à jour l'état local
    setConvs(prev =>
      prev.map(c => c.id === convId ? { ...c, nonLus: 0 } : c)
    );
  }, [userId]);

  // ── Sélectionner une conversation ────────────────────────────────────────
  const handleSelectConv = useCallback(async (conv: Conversation) => {
    // Si on reclique sur la conv déjà ouverte, juste scroller en bas
    if (selectedConvRef.current?.id === conv.id) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      return;
    }
    selectedConvRef.current = conv;
    setSelectedConv(conv);
    setMobileView("chat");
    await loadMessages(conv.id);
    if (conv.nonLus > 0) await markConvAsRead(conv.id);
  }, [loadMessages, markConvAsRead]);
  
  // Charger auto la première conv
  useEffect(() => {
    if (initialConvs[0]) handleSelectConv(initialConvs[0]);
  }, []);

  // Scroll auto en bas
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [messages.length]);

  // ── Realtime : nouveaux messages ──────────────────────────────────────────
  // ── Polling toutes les 3 secondes (remplace Realtime) ────────────────────
  useEffect(() => {
    if (!selectedConv) return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(prenom, nom, role)")
        .eq("conversation_id", selectedConv.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!data) return;

      // Ajouter uniquement les nouveaux messages
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const nouveaux = (data as Message[]).filter(m => !existingIds.has(m.id));
        if (nouveaux.length === 0) return prev;

        // Mettre à jour le dernier message dans la liste des convs
        const dernier = nouveaux[nouveaux.length - 1];
        setConvs(prevConvs => prevConvs.map(c =>
          c.id === selectedConv.id
            ? { ...c, dernierMessage: dernier.contenu, dernierMessageDate: dernier.created_at }
            : c
        ));

        return [...prev, ...nouveaux];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConv?.id]);
  // ── Realtime : badge non lus sur toutes les convs ─────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("messages-badge")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const newMsg = payload.new as Message;
        // Si c'est dans une autre conv que la conv active — incrémenter badge
        if (newMsg.sender_id !== userId && newMsg.conversation_id !== selectedConv?.id) {
          setConvs(prev =>
            prev.map(c =>
              c.id === newMsg.conversation_id
                ? {
                    ...c,
                    nonLus: c.nonLus + 1,
                    dernierMessage: newMsg.contenu,
                    dernierMessageDate: newMsg.created_at,
                  }
                : c
            )
          );
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, selectedConv?.id]);

  // ── Démarrer une nouvelle conversation ────────────────────────────────────
  const handleStartConv = async (contact: Contact) => {
    // Vérifier si la conv existe déjà
    const existing = convs.find(c => c.contact.user_id === contact.user_id);
    if (existing) { handleSelectConv(existing); return; }

    // Créer la conversation
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({ participants: [userId, contact.user_id], type: "prive" })
      .select()
      .single();

    if (!newConv) return;

    const conv: Conversation = {
      id: newConv.id,
      contact,
      nonLus: 0,
    };

    setConvs(prev => [conv, ...prev]);
    handleSelectConv(conv);
  };

  // ── Envoyer un message ────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !selectedConv || sending) return;
    setSending(true);
    setNewMessage("");

    const { data: newMsg } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConv.id,
        sender_id: userId,
        contenu: text,
        lu_par: [userId],
      })
      .select("*")
      .single();

    if (newMsg) {
      // Ajouter immédiatement en local sans attendre le polling
      setMessages(prev => [...prev, newMsg as Message]);
      setConvs(prev => prev.map(c =>
        c.id === selectedConv.id
          ? { ...c, dernierMessage: text, dernierMessageDate: newMsg.created_at }
          : c
      ));
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); handleSend(); }
  };

  // ── LISTE PANEL ───────────────────────────────────────────────────────────
  const ListePanel = (
    <div className={`w-full md:w-72 lg:w-80 shrink-0 flex flex-col border-r border-black/6 ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
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
                          {conv.nonLus > 9 ? "9+" : conv.nonLus}
                        </span>
                      )}
                    </div>
                    {conv.dernierMessage && (
                      <p className={`text-[11px] mt-0.5 truncate ${conv.nonLus > 0 ? "font-semibold text-black" : "text-black/40"}`}>
                        {conv.dernierMessage}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Nouveaux contacts */}
        {contactsSansConv.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30 mb-2">
              Nouveau message
            </p>
            <div className="space-y-1">
              {contactsSansConv.map(c => (
                <button
                  key={c.user_id}
                  onClick={() => handleStartConv(c)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-[12px] border border-dashed border-black/10 hover:border-[rgb(22,92,71)]/30 hover:bg-[rgb(247,249,247)] transition"
                >
                  <Avatar prenom={c.prenom} nom={c.nom} size="md" />
                  <div>
                    <p className="text-sm font-medium text-black">{c.prenom} {c.nom}</p>
                    <p className="text-[10px] text-[rgb(22,92,71)] font-medium uppercase tracking-[0.1em]">
                      {roleLabel(c.role)}{c.discipline ? ` · ${c.discipline}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {convs.length === 0 && contactsSansConv.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <p className="text-2xl mb-3">💬</p>
            <p className="text-sm font-medium text-black/60 mb-1">Aucune conversation</p>
            <p className="text-xs text-black/35 leading-5">
              Tes professeurs et la direction apparaîtront ici une fois assignés.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── CHAT PANEL ────────────────────────────────────────────────────────────
  const ChatPanel = (
    <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "liste" ? "hidden md:flex" : "flex"}`}>
      {selectedConv ? (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-black/5 shrink-0">
            <button
              onClick={() => setMobileView("liste")}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-black/50 text-sm"
            >←</button>
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

          {/* Messages — flex-1 + min-h-0 au lieu de hauteur fixe */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-[rgb(22,92,71)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-3xl mb-3">👋</p>
                <p className="text-sm font-medium text-black/60 mb-1">Début de la conversation</p>
                <p className="text-xs text-black/35">Envoyez votre premier message à {selectedConv.contact.prenom}.</p>
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
                      <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                        {showSender && !isMine && (
                          <p className="text-[10px] font-semibold text-black/40 px-1">
                            {msg.sender?.prenom} {msg.sender?.nom}
                          </p>
                        )}
                        <div className={`rounded-[18px] px-4 py-2.5 ${
                          isMine
                            ? "bg-[rgb(22,92,71)] text-white rounded-br-[6px]"
                            : "bg-[rgb(247,249,247)] text-black border border-black/6 rounded-bl-[6px]"
                        }`}>
                          <p className="text-sm leading-6 whitespace-pre-wrap">{msg.contenu}</p>
                        </div>
                        <p className="text-[9px] text-black/25 px-1">{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-black/5 shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message à ${selectedConv.contact.prenom}…`}
                rows={1}
                className="flex-1 resize-none rounded-[16px] border border-black/10 bg-[rgb(247,249,247)] px-4 py-2.5 text-sm text-black placeholder:text-black/30 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(22,92,71)] text-white transition hover:bg-[rgb(18,75,58)] disabled:opacity-30 disabled:cursor-not-allowed"
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
    <div className="flex rounded-[20px] border border-black/6 bg-white shadow-[0_2px_12px_rgba(16,16,16,0.04)] overflow-hidden"
      style={{ height: "calc(100dvh - 13rem)" }}>
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
  const [convs, setConvs] = useState<Conversation[]>(initialConversations);
  const supabase = createClient();

  const unreadRecus = notifications.filter(n => !n.lu).length;
  const unreadDiscussions = convs.reduce((acc, c) => acc + c.nonLus, 0);

  // ── Marquer une notification comme lue en base + local ────────────────────
  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    await supabase
      .from("notifications")
      .update({ lu: true })
      .eq("id", id);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.lu).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    if (unreadIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ lu: true })
        .in("id", unreadIds);
    }
  };

  const TABS = [
    { id: "recus" as TabId,       label: "Reçus",      badge: unreadRecus       },
    { id: "discussions" as TabId, label: "Discussions", badge: unreadDiscussions },
  ];

  return (
    <PlatformShell
      profile={profile}
      eleves={eleves}
      initialNotifications={notifications}
      unreadDiscussions={unreadDiscussions}
    >
      <div className="flex flex-col gap-4">

        {/* ── EN-TÊTE ── */}
        <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Espace élève</p>
              <h1 className="mt-0.5 text-base font-semibold text-black">Messages</h1>
            </div>
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
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === "recus" ? "📬" : "💬"}</span>
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
        <div className="rounded-[20px] border border-black/6 bg-white shadow-[0_2px_12px_rgba(16,16,16,0.04)] overflow-hidden"
          style={{ height: "calc(100dvh - 13em)", minHeight: "400px" }}>
          {activeTab === "recus" ? (
            <OngletRecus
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />
          ) : (
            <OngletDiscussions
              conversations={convs}
              contacts={contacts}
              userId={userId}
            />
          )}
        </div>

      </div>
    </PlatformShell>
  );
}