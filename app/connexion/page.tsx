"use client";
// app/connexion/page.tsx
// Recevoir un lien de connexion par mail, sans mot de passe (18/11/2026).
// Adresse : /connexion  (paramètres facultatifs : ?next=/page-voulue&expire=1)

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const champ =
  "w-full rounded-[14px] border border-black/10 bg-white px-4 py-3.5 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition";

function FormulaireLien() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/plateforme/dashboard";
  const expire = params.get("expire") === "1";

  const [email, setEmail] = useState("");
  const [piege, setPiege] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await fetch("/api/auth/lien-connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next, site_web: piege }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Envoi impossible");
      setEnvoye(true);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setEnvoi(false);
    }
  };

  if (envoye) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">✉</div>
        <h1 className="text-2xl font-semibold tracking-tight text-black">Regarde tes mails</h1>
        <p className="mt-3 text-sm leading-7 text-black/60">
          Si un compte existe avec <strong className="text-black">{email}</strong>, tu vas recevoir un lien pour te
          connecter. Pense à vérifier les courriers indésirables.
        </p>
        <button onClick={() => setEnvoye(false)} className="mt-6 text-sm font-semibold text-primary hover:underline">
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black">Recevoir un lien de connexion</h1>
        <p className="mt-2 text-sm leading-6 text-black/55">
          Pas besoin de mot de passe : indique ton adresse mail, on t&apos;envoie un lien qui te connecte directement.
        </p>
      </div>

      {expire && (
        <p className="rounded-[14px] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          Ce lien a expiré ou a déjà servi. Demande-en un nouveau ci-dessous.
        </p>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-black/78">Adresse mail</label>
        <input type="email" required autoComplete="email" className={champ} placeholder="prenom@exemple.be"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {/* Champ piège invisible pour les robots */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden"
        value={piege} onChange={(e) => setPiege(e.target.value)} />

      {erreur && <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-600">{erreur}</p>}

      <button type="submit" disabled={envoi}
        className="w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold !text-white transition hover:bg-primary-strong disabled:opacity-50">
        {envoi ? "Envoi…" : "Recevoir mon lien"}
      </button>

      <p className="pt-1 text-center text-sm text-black/45">
        Tu as un mot de passe ?{" "}
        <Link href="/plateforme/login" className="font-semibold text-primary hover:underline">Se connecter</Link>
      </p>
    </form>
  );
}

export default function ConnexionPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[rgb(239,244,239)] px-6 py-20">
      <div className="w-full max-w-md rounded-[28px] border border-black/8 bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-10">
        <Suspense fallback={null}>
          <FormulaireLien />
        </Suspense>
      </div>
    </main>
  );
}