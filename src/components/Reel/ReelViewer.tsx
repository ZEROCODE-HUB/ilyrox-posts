"use client";
import { useEffect, useState } from "react";
import { getReelById } from "../../services/reelService";
import { getProfileById } from "../../services/userService";
import { DownloadAppModal } from "../Shared/DownloadAppModal";
import { GeneratedByIlyrox } from "../Shared/GeneratedByIlyrox";
import type { Reel, perfiles } from "../types";
import Avatar from "../Shared/Avatar";

export const ReelViewer = ({
  id,
  hideData,
}: {
  id?: string;
  hideData?: boolean;
}) => {
  const [reel, setReel] = useState<Reel | null>(null);
  const [agent, setAgent] = useState<perfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchReel = async () => {
      try {
        setLoading(true);
        const data = await getReelById(id);
        if (data) {
          setReel(data);

          // Fetch user profile — en modo "sin datos" (hideData) no se
          // busca ni se muestra ningún agente.
          if (!hideData && data.publicado_por) {
            const profile = await getProfileById(data.publicado_por);
            if (profile) {
              setAgent(profile);
            }
          }
        } else {
          setError("Reel no encontrado");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar el reel");
      } finally {
        setLoading(false);
      }
    };

    fetchReel();
  }, [id, hideData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !reel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {error || "Reel no encontrado"}
        </h2>
        <p className="text-gray-500">Verifica que el ID sea correcto.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full pb-24">
      <div className="flex flex-col bg-black border border-gray-800 shadow-2xl overflow-hidden relative max-w-lg mx-auto aspect-auto">
        {/* Transparent Header with User Info — oculto en modo "sin datos" */}
        {!hideData && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="absolute top-0 left-0 right-0 z-10 p-6 bg-linear-to-b from-black/60 to-transparent flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-xl">
              {agent?.foto ? (
                <img
                  src={agent.foto}
                  alt={agent.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar name={agent?.nombre || "Usuario"} size={40} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-shadow-sm group-hover:text-primary transition-colors">
                {agent?.nombre_completo || "Usuario"}
              </span>
              <span className="text-white/60 text-xs text-shadow-sm">
                Ver perfil
              </span>
            </div>
          </div>
        )}

        <video
          src={reel.video_url}
          controls
          loop
          autoPlay
          muted
          poster={reel.thumbnail_url || undefined}
          className="w-full h-full"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-8 pt-20 pointer-events-none">
          <div className="text-white">
            <p className="font-medium text-sm text-gray-200 line-clamp-3 leading-relaxed pb-7">
              {reel.descripcion || "Sin descripción"}
            </p>
          </div>
        </div>
      </div>

      <GeneratedByIlyrox className="mt-4 mb-8" />

      <DownloadAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
