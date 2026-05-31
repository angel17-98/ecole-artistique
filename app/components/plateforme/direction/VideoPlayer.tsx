// app/components/plateforme/direction/VideoPlayer.tsx
// Modal de lecture vidéo — supporte Supabase Storage (lecture directe) et Google Drive (iframe)

"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  url: string;
  isDrive: boolean;
  candidatNom: string;
  onClose: () => void;
}

function getDriveEmbedUrl(url: string): string {
  // Convertir l'URL webViewLink Drive en URL embed
  // https://drive.google.com/file/d/FILE_ID/view → https://drive.google.com/file/d/FILE_ID/preview
  return url.replace("/view", "/preview").replace("open?id=", "file/d/").replace("&usp=drive_link", "/preview");
}

export default function VideoPlayer({ url, isDrive, candidatNom, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fermer sur Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Fermer en cliquant sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const embedUrl = isDrive ? getDriveEmbedUrl(url) : null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ background: "rgb(15,15,15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(22,92,71,0.3)" }}>
              <span className="text-xs">🎬</span>
            </div>
            <p className="text-sm font-semibold text-white">{candidatNom}</p>
            {isDrive && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(22,92,71,0.25)", color: "rgb(110,200,160)" }}>
                Google Drive
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <X size={14} color="white" />
          </button>
        </div>

        {/* Lecteur */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {isDrive ? (
            // Google Drive — iframe embed
            <iframe
              src={embedUrl!}
              className="w-full h-full"
              allow="autoplay"
              allowFullScreen
              style={{ border: "none" }}
            />
          ) : (
            // Supabase Storage — lecteur natif HTML5
            <video
              src={url}
              controls
              autoPlay
              className="w-full h-full"
              style={{ background: "black" }}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          )}
        </div>

        {/* Footer — lien externe */}
        <div className="flex items-center justify-end px-5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium transition hover:underline"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Ouvrir dans un nouvel onglet ↗
          </a>
        </div>
      </div>
    </div>
  );
}