// app/plateforme/direction/candidatures/[id]/CandidatureDetailClient.tsx
"use client";

import DriveTransferButton from "@/app/components/plateforme/direction/DriveTransferButton";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Send, Mail,
  User, MapPin, Music, Phone, FileVideo, ExternalLink,
  Hourglass, UserCheck, Calendar, AlertCircle,X,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Statut =
  | "en_attente" | "info_complementaire" | "validee"
  | "liste_attente" | "place_proposee" | "inscrit" | "refusee"
  | "expiree" | "sans_reponse";

type NoteType = "action" | "email" | "systeme" | "note";

interface NoteDiri {
  id: string;
  contenu: string;
  type: NoteType;
  created_at: string;
  auteur_prenom: string;
  auteur_nom: string;
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist":      "Full Artist",
  "comedie-musicale": "Comédie Musicale",
  "eveil-musical":    "Éveil Musical",
};

const DISCIPLINES = [
  { key: "eval_chant",    label: "Chant",                icon: "🎤" },
  { key: "eval_danse",    label: "Danse",                icon: "💃" },
  { key: "eval_theatre",  label: "Théâtre & Impro",      icon: "🎭" },
  { key: "eval_ecriture", label: "Écriture & Compo",     icon: "✍️" },
  { key: "eval_scenique", label: "Expression scénique",  icon: "🌟" },
  { key: "eval_studio",   label: "Studio",               icon: "🎵" },
];

const EVAL_LABELS: Record<string, string[]> = {
  eval_chant:    ["Dans ma douche", "J'apprends seul·e", "Cours depuis peu", "Scène associative", "Concerts & projets"],
  eval_danse:    ["Jamais pratiqué", "J'explore", "Cours réguliers", "Spectacles", "Formations pro"],
  eval_theatre:  ["Jamais monté", "Timide sur scène", "Impro & ateliers", "Pièces & rôles", "Formations & planches"],
  eval_ecriture: ["Je n'écris pas", "Quelques textes", "Compositions perso", "Projets aboutis", "Publications & scènes"],
  eval_scenique: ["Inconnu pour moi", "Je découvre", "Je travaille ça", "À l'aise sur scène", "Présence affirmée"],
  eval_studio:   ["Jamais enregistré", "Enregistrements maison", "Sessions studio", "Productions perso", "Projets professionnels"],
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
      <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgb(248,250,248)" }}>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(0,0,0,0.4)" }}>{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span style={{ color: "rgba(0,0,0,0.3)", marginTop: 2 }}>{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(0,0,0,0.35)" }}>{label}</p>
        <p className="text-sm font-medium text-black mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function TextBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "rgba(0,0,0,0.35)" }}>{label}</p>
      <div className="rounded-[12px] px-4 py-3" style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <p className="text-sm leading-7" style={{ color: "rgba(0,0,0,0.75)", whiteSpace: "pre-wrap" }}>{content}</p>
      </div>
    </div>
  );
}

// ── STATUT CONFIG ─────────────────────────────────────────────────────────────
function statutConfig(statut: string) {
  switch (statut) {
    case "en_attente":          return { label: "En attente",       bg: "rgba(185,151,83,0.1)", color: "rgb(185,151,83)",  icon: <Clock size={14} /> };
    case "info_complementaire": return { label: "Info demandée",    bg: "rgba(139,92,246,0.1)", color: "rgb(139,92,246)",  icon: <AlertCircle size={14} /> };
    case "validee":
    case "liste_attente":       return { label: "Liste d'attente",  bg: "rgba(59,130,246,0.08)",color: "rgb(59,130,246)",  icon: <Hourglass size={14} /> };
    case "place_proposee":      return { label: "Place proposée",   bg: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)",  icon: <Send size={14} /> };
    case "inscrit":             return { label: "Inscrit ✓",        bg: "rgba(22,92,71,0.15)",  color: "rgb(22,92,71)",    icon: <CheckCircle2 size={14} /> };
    case "refusee":             return { label: "Refusée",          bg: "rgba(220,38,38,0.08)", color: "rgb(220,38,38)",   icon: <XCircle size={14} /> };
    case "expiree":
    case "sans_reponse":        return { label: "Sans réponse",     bg: "rgba(0,0,0,0.05)",     color: "rgba(0,0,0,0.4)",  icon: <Clock size={14} /> };
    default: return { label: statut, bg: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)", icon: null };
  }
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────
function getActions(statut: string) {
  switch (statut) {
    case "en_attente":
    case "info_complementaire":
      return [
        { id: "acceptable",    label: "Acceptable",                  style: "primary",   icon: "check"     },
        { id: "email",         label: "Demander une info",           style: "ghost",     icon: "mail"      },
        { id: "refuser",       label: "Refuser",                     style: "danger",    icon: "x"         },
      ];
    case "validee":
      return [
        { id: "email",         label: "Envoyer un email",            style: "ghost",     icon: "mail"      },
        { id: "refuser",       label: "Refuser",                     style: "danger",    icon: "x"         },
      ];
    case "liste_attente":
      return [
        { id: "email",         label: "Envoyer un email",            style: "ghost",     icon: "mail"      },
        { id: "refuser",       label: "Refuser",                     style: "danger",    icon: "x"         },
      ];
    case "place_proposee":
      return [
        { id: "email",         label: "Relancer par email",          style: "ghost",     icon: "mail"      },
        { id: "liste_attente", label: "Remettre en liste d'attente", style: "secondary", icon: "hourglass" },
      ];
    case "expiree":
    case "sans_reponse":
      return [
        { id: "liste_attente", label: "Remettre en liste d'attente", style: "secondary", icon: "hourglass" },
        { id: "refuser",       label: "Clôturer définitivement",     style: "danger",    icon: "x"         },
      ];
    case "refusee":
      return [
        { id: "acceptable",    label: "Reconsidérer",                style: "secondary", icon: "check"     },
      ];
    case "inscrit":
      return [];
    default:
      return [];
  }
}

// ── MODALE EMAIL ──────────────────────────────────────────────────────────────
function EmailModal({ candidature, onClose, onSent }: {
  candidature: any; onClose: () => void;
  onSent: (objet: string, contenu: string) => void;
}) {
  const [objet, setObjet]     = useState(`Votre candidature Crea'Star — ${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}`);
  const [contenu, setContenu] = useState(`Bonjour ${candidature.prenom},\n\n`);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const send = async () => {
    if (!objet.trim() || !contenu.trim()) { setError("L'objet et le contenu sont obligatoires."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/direction/candidatures/${candidature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "info_complementaire", emailObjet: objet, emailContenu: contenu }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur envoi");
      onSent(objet, contenu);
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-2xl rounded-[24px] overflow-hidden shadow-2xl bg-white">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "rgb(248,250,248)" }}>
          <div className="flex items-center gap-3">
            <Mail size={18} style={{ color: "rgb(22,92,71)" }} />
            <div>
              <p className="text-sm font-semibold text-black">Email à {candidature.prenom} {candidature.nom}</p>
              <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>{candidature.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-black/30 hover:text-black/60 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-[12px] text-sm text-red-600"
              style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>{error}</div>
          )}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(0,0,0,0.4)" }}>Objet</label>
            <input type="text" value={objet} onChange={e => setObjet(e.target.value)}
              className="w-full px-4 py-3 rounded-[12px] text-sm outline-none"
              style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.08)", color: "black" }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(0,0,0,0.4)" }}>Message</label>
            <textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={10}
              className="w-full px-4 py-3 rounded-[12px] text-sm outline-none resize-none"
              style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.08)", color: "black", fontFamily: "inherit", lineHeight: "1.7" }} />
            <p className="text-[10px] mt-1" style={{ color: "rgba(0,0,0,0.35)" }}>
              Le candidat pourra répondre via info@creastar.be · Le statut passera à "Info demandée"
            </p>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(0,0,0,0.07)", background: "rgb(248,250,248)" }}>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2.5 rounded-full hover:bg-black/5" style={{ color: "rgba(0,0,0,0.5)" }}>Annuler</button>
          <button onClick={send} disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full hover:brightness-110 disabled:opacity-50"
            style={{ background: "rgb(22,92,71)", color: "white" }}>
            <Send size={14} />
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface GroupeAssigne {
  id: string;
  nom: string;
  jour_semaine?: string | null;
  heure_debut?: string | null;
  heure_fin?: string | null;
  places_max: number;
  placesOccupees: number;
}

function BandeauGroupe({
  statut,
  groupe,
}: {
  statut: string;
  groupe: GroupeAssigne | null;
}) {
  function formatHeure(h?: string | null) {
    if (!h) return "";
    return h.slice(0, 5);
  }
 
  // Pas de groupe assigné — candidature acceptable en attente d'assignation
  if (!groupe && statut === "validee") {
    return (
      <div className="flex items-center gap-3 rounded-[14px] px-4 py-3"
        style={{ background: "rgba(22,92,71,0.06)", border: "1px solid rgba(22,92,71,0.12)" }}>
        <span className="text-base">🎯</span>
        <p className="text-xs leading-5" style={{ color: "rgb(22,92,71)" }}>
          Candidature acceptable — assigne une place dans le{" "}
          <a href="/plateforme/direction/groupes"
            className="font-bold underline underline-offset-2">
            module Groupes →
          </a>
        </p>
      </div>
    );
  }
 
  // Groupe assigné — affichage dynamique selon statut
  if (groupe) {
    const libres = groupe.places_max - groupe.placesOccupees;
    const pct = Math.round((groupe.placesOccupees / groupe.places_max) * 100);
    const aPlanning = groupe.jour_semaine && groupe.heure_debut;
 
    const config = {
      place_proposee: {
        bg: "rgba(185,151,83,0.08)",
        border: "rgba(185,151,83,0.25)",
        color: "rgb(146,95,14)",
        dot: "rgb(186,117,23)",
        label: "Place proposée — en attente de confirmation",
        icon: "⏳",
      },
      inscrit: {
        bg: "rgba(22,92,71,0.07)",
        border: "rgba(22,92,71,0.18)",
        color: "rgb(22,92,71)",
        dot: "rgb(99,153,34)",
        label: "Inscrit confirmé",
        icon: "✓",
      },
      default: {
        bg: "rgba(24,95,165,0.06)",
        border: "rgba(24,95,165,0.18)",
        color: "rgb(24,95,165)",
        dot: "rgb(24,95,165)",
        label: "Assigné — proposition non envoyée",
        icon: "👥",
      },
    };
 
    const c = config[statut as keyof typeof config] ?? config.default;
 
    return (
      <div
        className="rounded-[14px] px-4 py-3"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: c.dot, flexShrink: 0,
            }} />
            <span className="text-xs font-semibold" style={{ color: c.color }}>
              {c.icon} {c.label}
            </span>
          </div>
          <a
            href="/plateforme/direction/groupes"
            className="text-[10px] font-semibold underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: c.color }}
          >
            Voir les groupes →
          </a>
        </div>
 
        {/* Infos groupe */}
        <div className="mt-2.5 flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: c.color }}>
            {groupe.nom}
          </span>
 
          {aPlanning && (
            <span className="text-xs" style={{ color: c.color, opacity: 0.75 }}>
              {groupe.jour_semaine} · {formatHeure(groupe.heure_debut)}–{formatHeure(groupe.heure_fin)}
            </span>
          )}
 
          {/* Barre de remplissage */}
          <div className="flex items-center gap-2 ml-auto">
            <div style={{
              width: 64, height: 4, borderRadius: 100,
              background: "rgba(0,0,0,0.08)", overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 100,
                background: pct >= 100 ? "rgb(220,38,38)" : pct > 80 ? "rgb(186,117,23)" : c.dot,
                transition: "width 0.3s",
              }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: c.color, opacity: 0.7 }}>
              {groupe.placesOccupees}/{groupe.places_max}
            </span>
          </div>
        </div>
      </div>
    );
  }
 
  // Inscrit sans groupe (ne devrait pas arriver, mais garde-fou)
  if (statut === "inscrit") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
        style={{ background: "rgba(22,92,71,0.08)", color: "rgb(22,92,71)" }}>
        ✓ Élève inscrit — aucune action requise
      </div>
    );
  }
 
  return null;
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function CandidatureDetailClient({
  candidature, hasAccount, rang, totalParcours, notesDiri, groupeAssigne,
  currentUserPrenom, currentUserNom,
}: {
  candidature: any;
  hasAccount: boolean;
  rang: number;
  totalParcours: number;
  notesDiri: NoteDiri[];
  groupeAssigne: GroupeAssigne | null;
  currentUserPrenom: string;
  currentUserNom: string;
}) {
  const router = useRouter();
  const [loading, setLoading]               = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal]  = useState(false);
  const [notes, setNotes]                   = useState("");
  const [notesSaved, setNotesSaved]         = useState(false);
  const [currentStatut, setCurrentStatut]   = useState(candidature.statut as Statut);
  const [localNotesDiri, setLocalNotesDiri] = useState<NoteDiri[]>(notesDiri);
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [toast, setToast]                   = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleEmail = (id: string) => {
    setExpandedEmails(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const doAction = async (actionId: string) => {
    setLoading(actionId);
    try {
      const apiAction = actionId === "acceptable" ? "accepter" : actionId;

      const res = await fetch(`/api/direction/candidatures/${candidature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: apiAction }),
      });

      // ← Sécurisation du parsing JSON
      let data: any = {};
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text);
      } catch {
        // Réponse vide ou non-JSON — on continue si status OK
      }

      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);

      const newStatuts: Record<string, Statut> = {
        accepter:      "validee",
        liste_attente: "liste_attente",
        refuser:       "refusee",
      };
      if (newStatuts[apiAction]) setCurrentStatut(newStatuts[apiAction]);

      const actionLabels: Record<string, string> = {
        accepter:      `✅ Candidature marquée acceptable par ${currentUserPrenom} ${currentUserNom}`,
        liste_attente: `🕐 Mis en liste d'attente par ${currentUserPrenom} ${currentUserNom}`,
        refuser:       `❌ Candidature refusée par ${currentUserPrenom} ${currentUserNom}`,
      };
      if (actionLabels[apiAction]) {
        setLocalNotesDiri(prev => [...prev, {
          id: crypto.randomUUID(),
          contenu: actionLabels[apiAction],
          type: "action" as NoteType,
          created_at: new Date().toISOString(),
          auteur_prenom: currentUserPrenom,
          auteur_nom: currentUserNom,
        }]);
      }

      const msgs: Record<string, string> = {
        accepter:      "Candidature acceptable · Email envoyé ✓",
        liste_attente: "Mis en liste d'attente · Email envoyé ✓",
        refuser:       "Candidature refusée · Email envoyé ✓",
      };
      showToast(msgs[apiAction] ?? "Action effectuée");
      router.refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(null);
    }
  };

  const saveNotes = async () => {
    if (!notes.trim()) return;
    setLoading("notes");
    try {
      const res = await fetch(`/api/direction/candidatures/${candidature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "notes_internes", notes }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text);
      } catch {}

      if (!res.ok) throw new Error(data.error ?? "Erreur sauvegarde");

      setLocalNotesDiri(prev => [...prev, {
        id: crypto.randomUUID(),
        contenu: notes.trim(),
        type: "note" as NoteType,
        created_at: new Date().toISOString(),
        auteur_prenom: currentUserPrenom,
        auteur_nom: currentUserNom,
      }]);
      setNotes("");
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setLoading(null); }
  };

  const st = statutConfig(currentStatut);
  const actions = getActions(currentStatut);
  const dateArrivee = new Date(candidature.created_at);
  const jours = Math.floor((Date.now() - dateArrivee.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-medium"
          style={{ background: toast.type === "success" ? "rgb(22,92,71)" : "rgb(220,38,38)", color: "white" }}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {showEmailModal && (
        <EmailModal
          candidature={candidature}
          onClose={() => setShowEmailModal(false)}
          onSent={(objet, contenu) => {
            setCurrentStatut("info_complementaire");
            setLocalNotesDiri(prev => [...prev,
              {
                id: crypto.randomUUID(),
                contenu: `📧 EMAIL ENVOYÉ\n\nObjet : ${objet}\n\n${contenu}`,
                type: "email" as NoteType,
                created_at: new Date().toISOString(),
                auteur_prenom: currentUserPrenom,
                auteur_nom: currentUserNom,
              },
              {
                id: crypto.randomUUID(),
                contenu: `📬 Demande d'info envoyée par ${currentUserPrenom} ${currentUserNom}`,
                type: "action" as NoteType,
                created_at: new Date().toISOString(),
                auteur_prenom: currentUserPrenom,
                auteur_nom: currentUserNom,
              }
            ]);
            showToast("Email envoyé · Statut mis à jour");
            router.refresh();
          }}
        />
      )}

      {/* ── HEADER ── */}
      <div className="px-10 lg:px-14 pb-6" style={{ paddingTop: "calc(88px + 24px)" }}>
        <Link href="/plateforme/direction/candidatures"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:text-black"
          style={{ color: "rgba(0,0,0,0.4)" }}>
          <ArrowLeft size={14} /> Retour aux candidatures
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: "rgb(185,151,83)" }}>
                #{String(rang).padStart(2, "0")} sur {totalParcours} · {PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: st.bg, color: st.color }}>
                {st.icon} {st.label}
              </span>
              {hasAccount && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: "rgba(22,92,71,0.08)", color: "rgb(22,92,71)" }}>
                  <UserCheck size={11} /> A un compte
                </span>
              )}
            </div>
            <h1 className="text-3xl font-semibold" style={{ color: "rgb(8,20,14)" }}>
              {candidature.prenom} {candidature.nom}
            </h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
                <Calendar size={13} />
                {dateArrivee.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {" à "}
                {dateArrivee.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {jours >= 3 && currentStatut === "en_attente" && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(185,151,83,0.15)", color: "rgb(185,151,83)" }}>
                  ⚠ {jours}j sans décision
                </span>
              )}
            </div>
          </div>

          {/* ── BOUTONS CONTEXTUELS ── */}
          <div className="flex flex-col gap-3">
            {actions.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {actions.map(a => (
                  <button
                    key={a.id}
                    onClick={() => a.id === "email" ? setShowEmailModal(true) : doAction(a.id)}
                    disabled={!!loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-50"
                    style={{
                      background: a.style === "primary"   ? "rgb(22,92,71)"
                                : a.style === "secondary" ? "white"
                                : a.style === "danger"    ? "rgba(220,38,38,0.08)"
                                : "white",
                      color:      a.style === "primary"   ? "white"
                                : a.style === "secondary" ? "rgba(0,0,0,0.7)"
                                : a.style === "danger"    ? "rgb(220,38,38)"
                                : "rgba(0,0,0,0.6)",
                      border:     a.style === "primary"   ? "none"
                                : a.style === "secondary" ? "1px solid rgba(0,0,0,0.12)"
                                : a.style === "danger"    ? "1px solid rgba(220,38,38,0.2)"
                                : "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {loading === a.id ? "..." : a.label}
                  </button>
                ))}
              </div>
            )}

            <BandeauGroupe statut={currentStatut} groupe={groupeAssigne} />

          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-10 lg:px-14 pb-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ── GAUCHE ── */}
        <div className="space-y-6">

          <Card title="Informations personnelles">
            <div className="grid grid-cols-2 gap-4">
              <InfoField icon={<User size={13} />}  label="Âge"              value={`${candidature.age} ans`} />
              <InfoField icon={<Mail size={13} />}  label="Email"            value={candidature.email} />
              {candidature.telephone && <InfoField icon={<Phone size={13} />}  label="Téléphone" value={candidature.telephone} />}
              {candidature.ville     && <InfoField icon={<MapPin size={13} />} label="Ville"     value={candidature.ville} />}
              <InfoField icon={<Music size={13} />} label="Parcours demandé" value={PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours} />
            </div>
          </Card>

          <Card title="Motivations & projet">
            <div className="space-y-5">
              {candidature.pourquoi        && <TextBlock label="Pourquoi Crea'Star ?"         content={candidature.pourquoi} />}
              {candidature.projet          && <TextBlock label="Projet artistique"             content={candidature.projet} />}
              {candidature.esprit_creastar && <TextBlock label="Ce que Crea'Star représente"  content={candidature.esprit_creastar} />}
            </div>
          </Card>

          {DISCIPLINES.some(d => candidature[d.key] != null) && (
            <Card title="Auto-évaluation artistique">
              <p className="text-[11px] mb-4" style={{ color: "rgba(0,0,0,0.4)" }}>
                Évaluation renseignée par le candidat lors de sa candidature.
              </p>
              <div className="space-y-4">
                {DISCIPLINES.map(d => candidature[d.key] != null ? (
                  <div key={d.key} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 flex-shrink-0">
                      <span className="text-base">{d.icon}</span>
                      <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.6)" }}>{d.label}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${(candidature[d.key] / 5) * 100}%`,
                            background: candidature[d.key] >= 4 ? "rgb(22,92,71)" : candidature[d.key] >= 3 ? "rgb(185,151,83)" : "rgb(220,38,38)",
                          }} />
                        </div>
                        <span className="text-[10px] font-semibold w-6 flex-shrink-0" style={{ color: "rgba(0,0,0,0.4)" }}>{candidature[d.key]}/5</span>
                        <span className="text-[11px] italic min-w-[140px] flex-shrink-0" style={{ color: "rgba(0,0,0,0.45)" }}>
                          {EVAL_LABELS[d.key]?.[candidature[d.key] - 1] ?? ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null)}
              </div>
            </Card>
          )}

          <Card title="Vidéo de candidature">
            <div className="space-y-3">
              {/* Lien externe (YouTube, Drive manuel) */}
              {candidature.video_link && (
                
                <a
                  href={candidature.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  style={{ color: "rgb(22,92,71)" }}
                >
                  <ExternalLink size={13} /> Lien vidéo externe
                </a>
              )}

              {/* Bouton transfert Supabase → Drive */}
              <DriveTransferButton
                candidatureId={candidature.id}
                candidatNom={`${candidature.prenom} ${candidature.nom}`}
                hasVideoOnSupabase={!!candidature.video_url}
                supabaseUrl={candidature.video_url ?? undefined}
                hasVideoOnDrive={!!candidature.drive_video_url}
                driveUrl={candidature.drive_video_url ?? undefined}
              />

              {!candidature.video_url && !candidature.drive_video_url && !candidature.video_link && (
                <p className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>
                  Aucune vidéo soumise.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ── DROITE — TIMELINE ── */}
        <div className="space-y-6">
          <Card title="Historique & notes">
            <div className="relative">

              {/* Ligne verticale */}
              {localNotesDiri.length > 0 && (
                <div className="absolute left-[15px] top-2 bottom-20 w-px"
                  style={{ background: "rgba(0,0,0,0.06)" }} />
              )}

              <div className="space-y-4 mb-5">
                {localNotesDiri.length === 0 && (
                  <p className="text-sm pl-2" style={{ color: "rgba(0,0,0,0.4)" }}>
                    Aucune action enregistrée.
                  </p>
                )}

                {localNotesDiri.map(n => {
                  const isEmail  = n.type === "email";
                  const isAction = n.type === "action";
                  const isSystem = n.type === "systeme";
                  const isExpanded = expandedEmails.has(n.id);

                  const dotColor = isAction ? "rgb(22,92,71)"
                                 : isEmail  ? "rgb(139,92,246)"
                                 : isSystem ? "rgb(59,130,246)"
                                 : "rgba(0,0,0,0.2)";

                  const labelColor = isAction ? "rgb(22,92,71)"
                                   : isEmail  ? "rgb(139,92,246)"
                                   : isSystem ? "rgb(59,130,246)"
                                   : "rgba(0,0,0,0.4)";

                  return (
                    <div key={n.id} className="flex gap-4 pl-1">
                      {/* Point timeline */}
                      <div className="flex-shrink-0 z-10" style={{ width: 30, paddingTop: 2 }}>
                        <div className="w-[10px] h-[10px] rounded-full"
                          style={{ background: dotColor, border: "2px solid white", boxShadow: `0 0 0 1px ${dotColor}` }} />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-semibold" style={{ color: labelColor }}>
                            {n.auteur_prenom} {n.auteur_nom}
                          </span>
                          <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.3)" }}>
                            {new Date(n.created_at).toLocaleDateString("fr-BE", {
                              day: "numeric", month: "short",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {isAction || isSystem ? (
                          <p className="text-xs leading-5" style={{ color: "rgba(0,0,0,0.6)" }}>{n.contenu}</p>
                        ) : isEmail ? (
                          <div className="rounded-[10px] p-3"
                            style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.12)" }}>
                            <p className="text-[10px] font-bold mb-1" style={{ color: "rgb(139,92,246)" }}>Email envoyé</p>
                            {isExpanded
                              ? <pre className="text-xs whitespace-pre-wrap leading-5"
                                  style={{ color: "rgba(0,0,0,0.6)", fontFamily: "inherit" }}>
                                  {n.contenu.replace("📧 EMAIL ENVOYÉ\n\n", "")}
                                </pre>
                              : <p className="text-xs line-clamp-2" style={{ color: "rgba(0,0,0,0.5)" }}>
                                  {n.contenu.replace("📧 EMAIL ENVOYÉ\n\n", "")}
                                </p>
                            }
                            <button onClick={() => toggleEmail(n.id)}
                              className="text-[10px] font-semibold mt-1.5 hover:underline"
                              style={{ color: "rgb(139,92,246)" }}>
                              {isExpanded ? "Réduire ↑" : "Voir le contenu ↓"}
                            </button>
                          </div>
                        ) : (
                        <div style={{ position: "relative" }}>
                          <div className="rounded-[10px] px-3 py-2.5 group"
                            style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.06)" }}>
                            <p className="text-sm leading-6 pr-6" style={{ color: "rgba(0,0,0,0.7)", whiteSpace: "pre-wrap" }}>
                              {n.contenu}
                            </p>
                            <button
                              onClick={async () => {
                                if (!confirm("Supprimer cette note ?")) return;
                                const res = await fetch(`/api/direction/candidatures/${candidature.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "supprimer_note", noteId: n.id }),
                                });
                                if (res.ok) setLocalNotesDiri(prev => prev.filter(x => x.id !== n.id));
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                width: 22, height: 22, borderRadius: "50%",
                                background: "rgba(220,38,38,0.08)", border: "none",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                color: "rgb(220,38,38)",
                              }}
                              title="Supprimer cette note"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nouvelle note */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 16 }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
                  style={{ color: "rgba(0,0,0,0.35)" }}>Ajouter une note interne</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Note visible uniquement par la direction…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-[12px] text-sm outline-none resize-none mb-2"
                  style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.08)", color: "black", fontFamily: "inherit" }}
                />
                <button
                  onClick={saveNotes}
                  disabled={!notes.trim() || loading === "notes"}
                  className="w-full py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-40"
                  style={{ background: "rgb(22,92,71)", color: "white" }}
                >
                  {loading === "notes" ? "Sauvegarde…" : notesSaved ? "✓ Sauvegardé" : "Ajouter la note"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
