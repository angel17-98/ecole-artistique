// "use client";

// import Link from "next/link";
// import { useEffect } from "react";

// type InscriptionModalProps = {
//   parcours: "full-artist" | "comedie-musicale";
//   onClose: () => void;
// };

// const parcoursLabels: Record<InscriptionModalProps["parcours"], string> = {
//   "full-artist": "Full Artist",
//   "comedie-musicale": "Comédie Musicale",
// };

// export default function InscriptionModal({ parcours, onClose }: InscriptionModalProps) {
//   const label = parcoursLabels[parcours];

//   // Fermeture au clavier Escape
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);

//   // Bloquer le scroll du body quand la modale est ouverte
//   useEffect(() => {
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = prev; };
//   }, []);

//   return (
//     /* Backdrop */
//     <div
//       className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
//       role="dialog"
//       aria-modal="true"
//       aria-label={`Comment rejoindre le parcours ${label}`}
//     >
//       {/* Overlay cliquable */}
//       <div
//         className="absolute inset-0 bg-black/58 backdrop-blur-[3px]"
//         onClick={onClose}
//         aria-hidden="true"
//       />

//       {/* Modale */}
//       <div className="relative z-10 w-full max-w-[580px] overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)]">

//         {/* Header vert */}
//         <div className="relative bg-[rgb(22,92,71)] px-7 pb-6 pt-6 sm:px-8">
//           <button
//             onClick={onClose}
//             aria-label="Fermer"
//             className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-sm text-white/80 transition hover:bg-white/22"
//           >
//             ✕
//           </button>

//           <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
//             Parcours {label} · Candidature
//           </p>
//           <h2 className="mt-2 text-xl font-semibold leading-snug text-white sm:text-2xl">
//             Comment rejoindre le parcours ?
//           </h2>
//           <p className="mt-2 text-sm leading-6 text-white/64">
//             Pas d'audition, pas de niveau requis — juste de la motivation
//             et l'envie sincère de créer.
//           </p>
//         </div>

//         {/* Corps */}
//         <div className="px-7 py-6 sm:px-8">

//           {/* 3 étapes */}
//           <div className="space-y-5">

//             <div className="flex gap-4">
//               <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(239,244,239)] text-sm font-semibold text-[rgb(22,92,71)]">
//                 1
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-black">
//                   Tu remplis ta lettre d'intention artistique
//                 </p>
//                 <p className="mt-1.5 text-sm leading-6 text-black/60">
//                   Quelques questions simples : qui tu es, pourquoi tu veux rejoindre
//                   Crea'Star, ce que tu veux créer, et où tu en es dans chaque discipline.
//                   Pas d'exigence de niveau — on veut juste te connaître.
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(239,244,239)] text-sm font-semibold text-[rgb(22,92,71)]">
//                 2
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-black">
//                   Tu envoies une courte vidéo de présentation
//                 </p>
//                 <p className="mt-1.5 text-sm leading-6 text-black/60">
//                   2 à 3 minutes maximum. Montre-nous ce que tu sais faire aujourd'hui —
//                   chanter, danser, jouer, ou simplement parler de ta démarche artistique.
//                   C'est pour nous aider à former des groupes cohérents, pas pour te juger.
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(239,244,239)] text-sm font-semibold text-[rgb(22,92,71)]">
//                 3
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-black">
//                   On te répond sous 2 semaines
//                 </p>
//                 <p className="mt-1.5 text-sm leading-6 text-black/60">
//                   Si ta candidature est retenue, on te contacte pour finaliser
//                   l'inscription et t'accueillir dans le parcours. Si on a des
//                   questions, on prend le temps d'en discuter avec toi.
//                 </p>
//               </div>
//             </div>

//           </div>

//           {/* Note rassurante */}
//           <div className="mt-6 rounded-[14px] bg-[rgb(239,244,239)] px-5 py-4">
//             <p className="text-sm leading-6 text-[rgb(15,65,48)]">
//               <span className="font-semibold">Crea'Star n'est pas une école élitiste.</span>{" "}
//               On cherche des personnes qui ont vraiment envie de créer, de s'investir
//               et de vivre l'expérience collectivement. Le niveau technique d'aujourd'hui
//               n'est pas ce qui compte — c'est l'élan de demain.
//             </p>
//           </div>
//         </div>

//         {/* Footer avec boutons */}
//         <div className="flex flex-col gap-2 border-t border-black/6 px-7 pb-6 pt-4 sm:flex-row sm:px-8">
//           <Link
//             href={`/candidature?parcours=${parcours}`}
//             className="inline-flex flex-1 items-center justify-center rounded-full bg-[rgb(22,92,71)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
//           >
//             Déposer ma candidature →
//           </Link>
//           <Link
//             href="/contact"
//             onClick={onClose}
//             className="inline-flex items-center justify-center rounded-full border border-black/12 bg-white px-6 py-3 text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black"
//           >
//             Poser une question
//           </Link>
//         </div>

//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect } from "react";

type InscriptionModalProps = {
  parcours: "full-artist" | "comedie-musicale";
  onClose: () => void;
};

const parcoursLabels: Record<InscriptionModalProps["parcours"], string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie Musicale",
};

export default function InscriptionModal({ parcours, onClose }: InscriptionModalProps) {
  const label = parcoursLabels[parcours];

  // Fermeture au clavier Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Bloquer le scroll du body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
      role="dialog"
      aria-modal="true"
      aria-label={`Comment rejoindre le parcours ${label}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/58 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
        Modale :
        - max-h avec espace haut/bas garanti par le py- du parent
        - flex-col pour que le footer reste fixé en bas
        - overflow-hidden sur la carte, overflow-y-auto sur le corps scrollable
      */}
      <div className="relative z-10 flex w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)]"
        style={{ maxHeight: "calc(100dvh - 6rem)" }}
      >

        {/* Header vert — fixe, ne scroll pas */}
        <div className="relative shrink-0 bg-[rgb(22,92,71)] px-6 pb-5 pt-6 sm:px-8">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-sm text-white/80 transition hover:bg-white/22"
          >
            ✕
          </button>

          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">
            Parcours {label} · Candidature
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug text-white sm:text-2xl">
            Comment rejoindre le parcours ?
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/64">
            Pas d'audition, pas de niveau requis — juste de la motivation
            et l'envie sincère de créer.
          </p>
        </div>

        {/* Corps — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(239,244,239)] text-sm font-semibold text-[rgb(22,92,71)]">
                1
              </div>
              <div>
                <p className="text-sm font-semibold text-black">
                  Tu remplis ta lettre d'intention artistique
                </p>
                <p className="mt-1.5 text-sm leading-6 text-black/60">
                  Quelques questions simples : qui tu es, pourquoi tu veux rejoindre
                  Crea'Star, ce que tu veux créer, et où tu en es dans chaque discipline.
                  Pas d'exigence de niveau — on veut juste te connaître.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(239,244,239)] text-sm font-semibold text-[rgb(22,92,71)]">
                2
              </div>
              <div>
                <p className="text-sm font-semibold text-black">
                  Tu envoies une courte vidéo de présentation
                </p>
                <p className="mt-1.5 text-sm leading-6 text-black/60">
                  2 à 3 minutes maximum. Montre-nous ce que tu sais faire aujourd'hui —
                  chanter, danser, jouer, ou simplement parler de ta démarche artistique.
                  C'est pour nous aider à former des groupes cohérents, pas pour te juger.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(239,244,239)] text-sm font-semibold text-[rgb(22,92,71)]">
                3
              </div>
              <div>
                <p className="text-sm font-semibold text-black">
                  On te répond sous 1 semaine
                </p>
                <p className="mt-1.5 text-sm leading-6 text-black/60">
                  Si ta candidature est retenue, on te contacte pour finaliser
                  l'inscription et t'accueillir dans le parcours. Si on a des
                  questions, on prend le temps d'en discuter avec toi.
                </p>
              </div>
            </div>
          </div>

          {/* Note rassurante */}
          <div className="mt-6 rounded-[14px] bg-[rgb(239,244,239)] px-5 py-4">
            <p className="text-sm leading-6 text-[rgb(15,65,48)]">
              <span className="font-semibold">Crea'Star n'est pas une école élitiste.</span>{" "}
              On cherche des personnes qui ont vraiment envie de créer, de s'investir
              et de vivre l'expérience collectivement. Le niveau technique d'aujourd'hui
              n'est pas ce qui compte — c'est l'élan de demain.
            </p>
          </div>
        </div>

        {/* Footer — fixe, ne scroll pas */}
        <div className="shrink-0 flex flex-col gap-2 border-t border-black/6 px-6 pb-5 pt-4 sm:flex-row sm:px-8">
          <Link
            href={`/candidature?parcours=${parcours}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[rgb(22,92,71)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
          >
            Déposer ma candidature →
          </Link>
          <Link
            href="/contact"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-black/12 bg-white px-6 py-3 text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black"
          >
            Poser une question
          </Link>
        </div>

      </div>
    </div>
  );
}
