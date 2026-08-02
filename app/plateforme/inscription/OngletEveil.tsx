"use client";
// app/plateforme/inscription/OngletEveil.tsx
// v3 — design enrichi + tunnel paiement Mollie (acompte 50€ + annuel/trimestriel)

import Link from "next/link";
import { useState } from "react";

const TARIF_EVEIL = 500;
const ACOMPTE_EVEIL = 50;

interface GroupeEveil {
  id: string;
  nom: string;
  jour_semaine?: string | null;
  heure_debut?: string | null;
  heure_fin?: string | null;
  places_restantes: number;
  complet: boolean;
}

interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  date_naissance?: string | null;
}

interface Props {
  user: { id: string; email: string } | null;
  eleves: Eleve[];
  groupes: GroupeEveil[];
}

function calcAge(dateNaissance?: string | null): number | null {
  if (!dateNaissance) return null;
  const today = new Date();
  const born  = new Date(dateNaissance);
  let age = today.getFullYear() - born.getFullYear();
  const m = today.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
  return age;
}

function formatH(g: GroupeEveil): string {
  if (!g.jour_semaine) return "Horaire à confirmer";
  const h = g.heure_debut ? g.heure_debut.slice(0, 5) : "";
  const f = g.heure_fin   ? ` → ${g.heure_fin.slice(0, 5)}` : "";
  return `${g.jour_semaine}${h ? ` · ${h}${f}` : ""}`;
}

function calcTarifsEveil() {
  const tri = Math.ceil(TARIF_EVEIL * 1.04);
  return {
    annuel:        TARIF_EVEIL,
    trimestriel:   tri,
    parTrimestre:  Math.ceil((tri - ACOMPTE_EVEIL) / 3),
  };
}

// ── Badge places ──────────────────────────────────────────────────────────────
function PlaceBadge({ g }: { g: GroupeEveil }) {
  if (g.complet) return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/6 text-black/40">
      Complet
    </span>
  );
  const urgent = g.places_restantes <= 2;
  return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: urgent ? "rgba(220,38,38,0.08)" : "rgba(22,92,71,0.08)",
        color:      urgent ? "rgb(185,28,28)"        : "rgb(15,75,57)",
      }}>
      {g.places_restantes} place{g.places_restantes > 1 ? "s" : ""} libre{g.places_restantes > 1 ? "s" : ""}
    </span>
  );
}

// ── Bloc droite : étapes + infos pratiques ────────────────────────────────────
function InfosEveil() {
  const tarifs = calcTarifsEveil();

  const etapes = [
    {
      n: "01", color: "rgb(185,151,83)",
      titre: "Choisir un groupe",
      desc: "Sélectionne un créneau avec des places disponibles. Les groupes sont limités à 8–10 enfants.",
    },
    {
      n: "02", color: "rgb(22,92,71)",
      titre: "Inscrire l'enfant",
      desc: "Indique pour quel enfant tu t'inscris. Si l'enfant n'est pas encore dans ton foyer, tu peux l'ajouter.",
    },
    {
      n: "03", color: "rgb(185,151,83)",
      titre: "Acompte de 50 €",
      desc: "Un acompte sécurise la place immédiatement par Bancontact. Le solde est réglé en une fois ou par trimestre.",
    },
    {
      n: "04", color: "rgb(22,92,71)",
      titre: "C'est parti !",
      desc: "Tu reçois une confirmation par email avec tous les détails du groupe et du premier cours.",
      pills: ["Accès espace élève"],
    },
  ];

  const infos = [
    { icon: "🎵", label: "Disciplines",  val: "Rythme, écoute, voix, mouvement, jeu musical" },
    { icon: "👶", label: "Âge",          val: "3 à 8 ans" },
    { icon: "👥", label: "Groupe",       val: "8 à 10 enfants maximum" },
    { icon: "⏱",  label: "Séance",       val: "45 minutes par semaine" },
    { icon: "📅", label: "Engagement",   val: "Annuel — septembre à juin" },
  ];

  return (
    <div className="space-y-6">

      {/* Étapes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/35 mb-2">Le processus</p>
        <h3 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl mb-5">
          De l'inscription <span style={{ color: "rgb(22,92,71)" }}>au premier cours</span>
        </h3>

        <div className="relative">
          <div className="absolute left-6 top-6 bottom-6 w-px"
            style={{ background: "linear-gradient(180deg, rgb(185,151,83), rgb(22,92,71), rgb(185,151,83), rgb(22,92,71))" }} />
          <div className="space-y-0">
            {etapes.map(e => (
              <div key={e.n} className="relative flex gap-5 pb-6 last:pb-0">
                <div className="relative z-10 shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                    style={{ background: e.color }}>
                    <span className="text-white text-sm font-bold">{e.n}</span>
                  </div>
                </div>
                <div className="pt-2.5 flex-1">
                  <h4 className="text-base font-semibold text-black mb-1">{e.titre}</h4>
                  <p className="text-sm leading-6 text-black/50">{e.desc}</p>
                  {e.pills && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.pills.map(pill => (
                        <span key={pill} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(22,92,71,0.08)", color: "rgb(15,75,57)", border: "1px solid rgba(22,92,71,0.15)" }}>
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infos pratiques */}
      <div className="rounded-[18px] overflow-hidden border border-black/8">
        <div className="px-4 py-3 border-b border-black/6" style={{ background: "rgba(22,92,71,0.04)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">Infos pratiques</p>
        </div>
        <div className="bg-white divide-y divide-black/5">
          {infos.map(i => (
            <div key={i.label} className="flex items-center gap-3 px-4 py-3">
              <span className="text-base shrink-0 w-6 text-center">{i.icon}</span>
              <span className="text-xs text-black/40 w-20 shrink-0">{i.label}</span>
              <span className="text-sm font-medium text-black">{i.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tarifs */}
      <div className="rounded-[18px] p-4" style={{ background: "rgba(22,92,71,0.04)", border: "1px solid rgba(22,92,71,0.1)" }}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/35 mb-3">Tarifs</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-black/65 font-sm self-center">Éveil musical</span>
          <span className="font-bold" style={{ color: "rgb(22,92,71)" }}>
            {TARIF_EVEIL} €
            <span className="text-sm font-normal text-black/30 ml-1">/an</span>
          </span>
        </div>
        <p className="text-sm text-black/30 mt-3 pt-3 border-t border-black/6 leading-5">
          Acompte {ACOMPTE_EVEIL} € à l'inscription · annuel ou 3× trimestriel (+4%)
        </p>
      </div>
    </div>
  );
}

// ── Tunnel paiement ───────────────────────────────────────────────────────────
function TunnelPaiement({
  eleve, groupe, onRetour,
}: {
  eleve: Eleve;
  groupe: GroupeEveil;
  onRetour: () => void;
}) {
  const [etape, setEtape]         = useState<"rythme" | "recap" | "paiement">("rythme");
  const [rythme, setRythme]       = useState<"annuel" | "trimestriel" | null>(null);
  const [conditions, setConditions] = useState(false);
  const [loading, setLoading]     = useState(false);
  const tarifs = calcTarifsEveil();

  const handlePayer = async () => {
    setLoading(true);
    try {
      // TODO: appel API /api/inscription/eveil → crée inscription + redirige Mollie
      await new Promise(r => setTimeout(r, 800));
      alert("Mollie à brancher ✓");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[24px] overflow-hidden border border-black/10 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="px-6 py-5" style={{ background: "rgb(22,92,71)" }}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/45 mb-1">
          Inscription · Éveil musical
        </p>
        <p className="text-xl font-semibold text-white">Finalise l'inscription</p>
      </div>

      {/* Stepper */}
      <div className="flex gap-2 px-6 py-3 border-b border-black/6 bg-white">
        {(["rythme", "recap", "paiement"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="text-sm font-semibold px-4 py-1.5 rounded-full transition"
              style={{
                background: etape === s ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
                color:      etape === s ? "white" : "rgba(0,0,0,0.4)",
              }}>
              {i + 1} {s === "rythme" ? "Rythme" : s === "recap" ? "Récap" : "Paiement"}
            </span>
            {i < 2 && <span className="text-black/15">›</span>}
          </div>
        ))}
      </div>

      <div className="bg-white px-6 py-6">

        {/* Étape 1 — Rythme */}
        {etape === "rythme" && (
          <div className="space-y-5">
            <p className="text-base font-semibold text-black">Choisis ton rythme de paiement</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  id: "annuel" as const,
                  titre: "Annuel",
                  badge: "Base", badgeBg: "rgba(22,92,71,0.1)", badgeC: "rgb(15,75,57)",
                  montant: tarifs.annuel,
                  detail: "Un seul règlement · Zéro supplément",
                },
                {
                  id: "trimestriel" as const,
                  titre: "Trimestriel",
                  badge: "+4%", badgeBg: "rgba(185,151,83,0.12)", badgeC: "rgb(110,80,20)",
                  montant: tarifs.parTrimestre,
                  detail: "3× /trimestre après acompte · sept. / jan. / avr.",
                },
              ].map(opt => (
                <button key={opt.id} onClick={() => setRythme(opt.id)}
                  className="text-left rounded-[16px] p-5 transition border-2"
                  style={{
                    background:   rythme === opt.id ? "rgba(22,92,71,0.04)" : "rgb(247,249,246)",
                    borderColor:  rythme === opt.id ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                  }}>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-base font-semibold text-black">{opt.titre}</p>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: opt.badgeBg, color: opt.badgeC }}>{opt.badge}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "rgb(22,92,71)" }}>
                    {opt.montant.toLocaleString("fr-BE")} €
                  </p>
                  <p className="text-xs text-black/40 mt-1">{opt.detail}</p>
                </button>
              ))}
            </div>
            <p className="text-sm text-black/40 rounded-[12px] p-4 border border-black/6 leading-6"
              style={{ background: "rgb(249,250,249)" }}>
              Acompte de <strong className="text-black/60">{ACOMPTE_EVEIL} €</strong> prélevé immédiatement par Bancontact pour sécuriser la place.
            </p>
            <div className="flex gap-3">
              <button onClick={onRetour}
                className="flex-1 rounded-full py-3.5 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
                ← Retour
              </button>
              <button disabled={!rythme} onClick={() => setEtape("recap")}
                className="flex-[2] rounded-full py-4 text-base font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
                style={{ background: "rgb(22,92,71)" }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 — Récap */}
        {etape === "recap" && rythme && (
          <div className="space-y-5">
            <p className="text-base font-semibold text-black">Récapitulatif</p>
            <div className="rounded-[16px] overflow-hidden border border-black/8">
              {[
                { l: "Enfant",   v: `${eleve.prenom} ${eleve.nom}` },
                { l: "Groupe",   v: groupe.nom },
                { l: "Horaire",  v: formatH(groupe) },
                { l: "Rythme",   v: rythme === "annuel" ? "Annuel" : "Trimestriel (+4%)" },
                { l: "Acompte aujourd'hui", v: `${ACOMPTE_EVEIL} €`, accent: true },
                ...(rythme === "annuel"
                  ? [{ l: "Solde restant", v: `${(tarifs.annuel - ACOMPTE_EVEIL).toLocaleString("fr-BE")} €` }]
                  : [
                      { l: "Trimestre 1 — sept.", v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
                      { l: "Trimestre 2 — jan.",  v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
                      { l: "Trimestre 3 — avr.",  v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
                    ]
                ),
              ].map((row: any, i, arr) => (
                <div key={i} className="flex justify-between text-sm px-5 py-3.5"
                  style={{
                    background:   row.accent ? "rgba(22,92,71,0.04)" : i % 2 === 0 ? "white" : "rgb(249,250,249)",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  }}>
                  <span className="text-black/50">{row.l}</span>
                  <span className="font-semibold" style={{ color: row.accent ? "rgb(22,92,71)" : "black" }}>
                    {row.v}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold px-5 py-4 border-t border-black/8"
                style={{ background: "rgba(22,92,71,0.04)" }}>
                <span>Total annuel</span>
                <span style={{ color: "rgb(22,92,71)" }}>
                  {(rythme === "annuel" ? tarifs.annuel : tarifs.trimestriel).toLocaleString("fr-BE")} €
                </span>
              </div>
            </div>

            <div className="rounded-[14px] p-4 text-sm leading-6 text-black/50 space-y-1.5"
              style={{ background: "rgb(249,250,249)", border: "1px solid rgba(0,0,0,0.07)" }}>
              <p><strong className="text-black/65">Engagement annuel ferme.</strong> L'année commencée est due dans son intégralité.</p>
              <p><strong className="text-black/65">Acompte non remboursable</strong> sauf exception validée par la direction.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer rounded-[14px] p-4 border border-black/8 bg-white hover:border-black/15 transition">
              <input type="checkbox" checked={conditions} onChange={e => setConditions(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0" style={{ accentColor: "rgb(22,92,71)" }} />
              <span className="text-sm text-black/60 leading-6">
                J'ai lu et j'accepte les{" "}
                <Link href="/conditions" className="underline hover:opacity-70 transition"
                  style={{ color: "rgb(22,92,71)" }}>
                  conditions générales d'inscription
                </Link>
                {" "}de Crea'Star.
              </span>
            </label>

            <div className="flex gap-3">
              <button onClick={() => setEtape("rythme")}
                className="flex-1 rounded-full py-3.5 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
                ← Retour
              </button>
              <button disabled={!conditions} onClick={() => setEtape("paiement")}
                className="flex-[2] rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
                style={{ background: "rgb(22,92,71)" }}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 — Paiement */}
        {etape === "paiement" && (
          <div className="space-y-5">
            <p className="text-base font-semibold text-black">Paiement de l'acompte</p>
            <div className="rounded-[20px] py-10 text-center space-y-2"
              style={{ background: "rgba(22,92,71,0.04)", border: "1.5px solid rgba(22,92,71,0.12)" }}>
              <p className="text-5xl font-bold tracking-tight" style={{ color: "rgb(22,92,71)" }}>
                {ACOMPTE_EVEIL} €
              </p>
              <p className="text-sm text-black/40">Bancontact · Sécurisé par Mollie · Non remboursable</p>
            </div>
            <button onClick={handlePayer} disabled={loading}
              className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition"
              style={{ background: "rgb(22,92,71)" }}>
              {loading ? "Redirection..." : `Payer ${ACOMPTE_EVEIL} € par Bancontact →`}
            </button>
            <button onClick={() => setEtape("recap")}
              className="w-full text-center text-sm text-black/30 hover:text-black/55 transition py-2">
              ← Retour au récapitulatif
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function OngletEveil({ user, eleves, groupes }: Props) {
  const [eleveId,  setEleveId]  = useState<string | null>(null);
  const [groupeId, setGroupeId] = useState<string | null>(null);
  const [etape,    setEtape]    = useState<"selection" | "tunnel">("selection");

  const eleve  = eleves.find(e => e.id === eleveId);
  const groupe = groupes.find(g => g.id === groupeId);
  const tousComplets = groupes.length > 0 && groupes.every(g => g.complet);
  const aucunePlace  = groupes.length === 0 || tousComplets;

  return (
    <div className="space-y-8">

      {/* ── Notification : pas de place disponible ── */}
      {aucunePlace && (
        <div className="rounded-[24px] overflow-hidden border border-black/8">
          <div className="relative px-7 py-8 overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.15),transparent_55%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.4),transparent)]" />
            <div className="relative">
              <p className="text-3xl mb-4">🎵</p>
              <h3 className="text-xl font-semibold text-white mb-2">
                {groupes.length === 0
                  ? "Aucun groupe ouvert pour le moment"
                  : "Tous les groupes sont complets"}
              </h3>
              <p className="text-sm text-white/55 leading-6 max-w-3xl">
                {groupes.length === 0
                  ? "La direction n'a pas encore ouvert de groupe d'éveil musical. Laisse-nous tes coordonnées, on te prévient dès l'ouverture."
                  : "Il n'y a plus de place disponible. Laisse-nous tes coordonnées, on te prévient dès qu'une place se libère."}
              </p>
            </div>
          </div>
          <div className="bg-white px-7 py-4 flex flex-col sm:flex-row gap-3">
            <Link href="/contact?sujet=eveil-musical"
              className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold !text-white hover:brightness-110 transition"
              style={{ background: "rgb(22,92,71)" }}>
              Me faire notifier →
            </Link>
            <Link href="/contact"
              className="inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-black/50 border border-black/10 hover:bg-black/4 transition">
              Poser une question
            </Link>
          </div>
        </div>
      )}

      {/* ── Contenu principal ── */}
      {!aucunePlace && (
        <div className="grid gap-10 lg:grid-cols-[1fr_850px]">

          {/* Col gauche — sélection + tunnel */}
          <div className="space-y-5">

            {/* Tunnel paiement si étape tunnel */}
            {etape === "tunnel" && eleve && groupe && (
              <TunnelPaiement
                eleve={eleve}
                groupe={groupe}
                onRetour={() => setEtape("selection")}
              />
            )}

            {/* Sélection groupe + élève */}
            {etape === "selection" && (
              <>
                {/* Groupes */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">
                    Groupes disponibles
                  </p>
                  <div className="space-y-2">
                    {groupes.map(g => {
                      const sel = groupeId === g.id;
                      return (
                        <button key={g.id} disabled={g.complet}
                          onClick={() => !g.complet && setGroupeId(g.id)}
                          className="w-full text-left rounded-[16px] p-4 transition border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background:  sel ? "rgba(22,92,71,0.05)" : "white",
                            borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                            boxShadow:   sel ? "0 0 0 3px rgba(22,92,71,0.06)" : "none",
                          }}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                                style={{
                                  borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.2)",
                                  background:  sel ? "rgb(22,92,71)" : "transparent",
                                }}>
                                {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-black">{g.nom}</p>
                                <p className="text-[11px] text-black/40 mt-0.5">{formatH(g)}</p>
                              </div>
                            </div>
                            <PlaceBadge g={g} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sélection élève */}
                {!user ? (
                  <div className="rounded-[20px] overflow-hidden">
                    <div className="px-5 py-5" style={{ background: "rgb(22,92,71)" }}>
                      <p className="text-sm font-semibold text-white mb-1">Un compte est nécessaire pour s'inscrire</p>
                      <p className="text-xs text-white/50 leading-5 mb-4">
                        Suivi en temps réel · Réductions famille · Accès espace élève
                      </p>
                      <div className="flex flex-col gap-2">
                        <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=eveil"
                          className="rounded-full px-4 py-2.5 text-sm font-semibold bg-white/10 text-center !text-white border border-white/25 hover:border-white/50 transition">
                          Se connecter
                        </Link>
                        <Link href="/plateforme/register?source=eveil"
                          className="rounded-full px-4 py-2.5 text-sm font-semibold text-center hover:brightness-105 transition"
                          style={{ background: "rgb(185,151,83)", color: "white" }}>
                          Créer un compte →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[20px] overflow-hidden border border-black/8">
                    <div className="px-5 py-3.5 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
                      <p className="text-xs font-semibold text-black">Pour quel enfant ?</p>
                    </div>
                    <div className="bg-white p-3 space-y-2">
                      {eleves.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-black/45 mb-3">Aucun enfant dans le foyer.</p>
                          <Link href="/plateforme/dashboard?action=ajouter-eleve"
                            className="text-xs font-semibold" style={{ color: "rgb(22,92,71)" }}>
                            Ajouter un enfant →
                          </Link>
                        </div>
                      ) : eleves.map(e => {
                        const age  = calcAge(e.date_naissance);
                        const sel  = eleveId === e.id;
                        const hors = age !== null && (age < 3 || age > 8);
                        return (
                          <button key={e.id} onClick={() => setEleveId(e.id)}
                            className="w-full text-left rounded-[12px] p-3 transition border-2"
                            style={{
                              background:  sel ? "rgba(22,92,71,0.05)" : "rgb(249,250,249)",
                              borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
                            }}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-black">{e.prenom} {e.nom}</p>
                                <p className="text-[10px] text-black/40 mt-0.5">
                                  {age !== null ? `${age} ans` : "Âge non renseigné"}
                                </p>
                              </div>
                              {hors && (
                                <span className="text-[10px] font-medium px-2 py-1 rounded-full"
                                  style={{ background: "rgba(245,158,11,0.1)", color: "rgb(146,95,14)" }}>
                                  Hors tranche
                                </span>
                              )}
                            </div>
                            {hors && sel && (
                              <p className="text-[10px] text-amber-700 mt-2 leading-4">
                                L'éveil musical est conçu pour les 3–8 ans. Une exception peut être accordée par la direction.
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bouton continuer */}
                {user && (
                  <button
                    disabled={!eleveId || !groupeId}
                    onClick={() => setEtape("tunnel")}
                    className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
                    style={{ background: "rgb(22,92,71)" }}>
                    Continuer vers le paiement →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Col droite — infos + processus (sticky) */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <InfosEveil />
          </div>
        </div>
      )}
    </div>
  );
}