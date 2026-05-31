// app/components/plateforme/direction/DriveTransferButton.tsx
// Bloc vidéo complet dans la fiche candidature direction :
// - Bouton "Visionner" (pop-up) si vidéo sur Supabase
// - Bouton "Transférer vers Drive" 
// - Bouton "Voir sur Drive" (pop-up iframe) si déjà sur Drive

"use client";

import { useState } from "react";
import { Play, Upload, FolderOpen } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

interface Props {
  candidatureId: string;
  candidatNom: string;
  hasVideoOnSupabase: boolean;   // video_url présent
  supabaseUrl?: string;          // video_url valeur
  hasVideoOnDrive: boolean;      // drive_video_url présent
  driveUrl?: string;             // drive_video_url valeur
  onSuccess?: (url: string) => void;
}

export default function DriveTransferButton({
  candidatureId,
  candidatNom,
  hasVideoOnSupabase,
  supabaseUrl,
  hasVideoOnDrive,
  driveUrl,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onDrive, setOnDrive] = useState(hasVideoOnDrive);
  const [currentDriveUrl, setCurrentDriveUrl] = useState(driveUrl);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const [playerIsDrive, setPlayerIsDrive] = useState(false);

  const openPlayer = (url: string, isDrive: boolean) => {
    setPlayerUrl(url);
    setPlayerIsDrive(isDrive);
    setShowPlayer(true);
  };

  const handleTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/drive/transfer-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatureId }),
      });

      const data = await res.json();

      // Drive non connecté → lancer le flux OAuth
      if (!res.ok && data.error?.includes("non connecté")) {
        const connectRes = await fetch("/api/drive/oauth-connect");
        const connectData = await connectRes.json();
        if (connectData.url) window.location.href = connectData.url;
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Erreur de transfert");

      setOnDrive(true);
      setCurrentDriveUrl(data.url);
      onSuccess?.(data.url);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aucune vidéo du tout
  if (!hasVideoOnSupabase && !onDrive) {
    return (
      <p className="text-sm italic" style={{ color: "rgba(0,0,0,0.35)" }}>
        Aucune vidéo soumise.
      </p>
    );
  }

  return (
    <>
      {/* Modal lecteur */}
      {showPlayer && (
        <VideoPlayer
          url={playerUrl}
          isDrive={playerIsDrive}
          candidatNom={candidatNom}
          onClose={() => setShowPlayer(false)}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">

        {/* ── Vidéo sur Supabase — Visionner + Transférer ── */}
        {hasVideoOnSupabase && supabaseUrl && !onDrive && (
          <>
            <button
              onClick={() => openPlayer(supabaseUrl, false)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition"
              style={{
                background: "rgba(22,92,71,0.08)",
                color: "rgb(22,92,71)",
                border: "1px solid rgba(22,92,71,0.2)",
              }}
            >
              <Play size={12} /> Visionner
            </button>

            <button
              onClick={handleTransfer}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50"
              style={{
                background: "rgba(66,133,244,0.08)",
                color: "rgb(66,133,244)",
                border: "1px solid rgba(66,133,244,0.2)",
              }}
            >
              {loading ? (
                <><span className="animate-spin inline-block">⏳</span> Transfert…</>
              ) : (
                <><Upload size={12} /> Transférer vers Drive</>
              )}
            </button>
          </>
        )}

        {/* ── Vidéo sur Drive — Visionner + Lien Drive ── */}
        {onDrive && currentDriveUrl && (
          <>
            <button
              onClick={() => openPlayer(currentDriveUrl, true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition"
              style={{
                background: "rgba(22,92,71,0.08)",
                color: "rgb(22,92,71)",
                border: "1px solid rgba(22,92,71,0.2)",
              }}
            >
              <Play size={12} /> Visionner
            </button>

            <a
              href={currentDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition hover:opacity-80"
              style={{
                background: "rgba(66,133,244,0.08)",
                color: "rgb(66,133,244)",
                border: "1px solid rgba(66,133,244,0.2)",
              }}
            >
              <FolderOpen size={12} /> Voir sur Drive
            </a>
          </>
        )}

        {/* Erreur */}
        {error && (
          <p className="w-full text-xs mt-1" style={{ color: "rgb(220,38,38)" }}>
            {error}
          </p>
        )}
      </div>
    </>
  );
}