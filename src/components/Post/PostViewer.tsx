"use client";
import { useEffect, useState } from "react";
import { getPostById } from "../../services/postService";
import { getProfileById } from "../../services/userService";
import type { Post, perfiles } from "../types";
import { DownloadAppModal } from "../Shared/DownloadAppModal";
import { GeneratedByIlyrox } from "../Shared/GeneratedByIlyrox";
import { SpecialPostCard } from "./SpecialPostCard";

export const PostViewer = ({
  id,
  hideData,
}: {
  id?: string;
  hideData?: boolean;
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [sharerOverride, setSharerOverride] = useState<perfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(id);

        if (data) {
          setPost(data);

          // En modo "sin datos" (hideData) no se busca ni se usa ningún
          // perfil — ni el `?sharedBy=<id>` de la URL ni el `post.perfiles`
          // que trae el join. Solo en modo "con datos" se aplica la
          // prioridad: quien COMPARTIÓ el link gana sobre el creador
          // original.
          if (!hideData) {
            const params = new URLSearchParams(window.location.search);
            const sharedByParam = params.get("sharedBy");
            if (sharedByParam && sharedByParam.trim()) {
              const profile = await getProfileById(sharedByParam.trim());
              if (profile) {
                setSharerOverride(profile);
              }
            }
          }
        } else {
          setError("Post no encontrado");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar el post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, hideData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh] bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-600 mb-2">Error</h3>
        <p className="text-sm text-gray-400">{error || "Post no encontrado"}</p>
      </div>
    );
  }
  // Quien se muestra: en modo "sin datos" (hideData) se omite toda la
  // información de agente/contacto (ni creador ni quien compartió). Con
  // datos, si la URL trae `?sharedBy=<id>` se usa ESE perfil en lugar del
  // `post.perfiles` que vino del join con el creador original.
  const displayPost: Post = hideData
    ? {
        ...post,
        perfiles: undefined,
        foto_perfil_usuario: undefined,
        nombre_asesor: undefined,
        publicado_por: "Usuario",
      }
    : sharerOverride
      ? {
          ...post,
          perfiles: sharerOverride,
          foto_perfil_usuario:
            sharerOverride.foto || post.foto_perfil_usuario,
        }
      : post;

  return (
    <div className="flex flex-col items-center w-full mt-12 pb-24">
      <div className="flex justify-center w-full">
        <SpecialPostCard
          post={displayPost}
          hideData={hideData}
          mode="detail"
          onUserClick={() => setIsModalOpen(true)}
          onOfferClick={() => setIsModalOpen(true)}
        />
      </div>

      <GeneratedByIlyrox className="mt-4 mb-8" />

      <DownloadAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
