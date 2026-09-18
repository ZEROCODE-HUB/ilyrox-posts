"use client";
import { useEffect, useState } from "react";
import { MainImage, PropertyInfo } from "./PropertyComponents";
import { AgentCard } from "./AgentCard";
import {
  getPropertyById,
  getAmenitiesByPropertyId,
} from "../../services/propertyService";
import { getProfileById } from "../../services/userService";
import type { Property as GlobalProperty, perfiles } from "../types";

import { DownloadAppModal } from "../Shared/DownloadAppModal";
import { GeneratedByIlyrox } from "../Shared/GeneratedByIlyrox";
import { isInAppBrowser, openInApp } from "../../lib/openInApp";

export const PropertyViewer = ({
  id,
  hideData,
}: {
  id?: string;
  hideData?: boolean;
}) => {
  const [property, setProperty] = useState<GlobalProperty | null>(null);
  const [agent, setAgent] = useState<perfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Dentro de webviews (Instagram, Facebook, WhatsApp, Messenger…) los
    // universal links no disparan y el usuario se queda atrapado en la web. Si
    // el link se abrió en un navegador in-app, se intenta abrir la app por su
    // esquema propio SIN caer a la tienda: si la app no está instalada, la
    // página sigue funcionando con normalidad.
    if (isInAppBrowser()) {
      openInApp({ withStoreFallback: false });
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await getPropertyById(id);
        if (data) {
          // Fetch amenities separately since there is no FK relation
          const amenities = await getAmenitiesByPropertyId(data.id);
          const propertyWithAmenities = {
            ...data,
            propiedades_amenidades: amenities,
          };
          setProperty(propertyWithAmenities);

          // Fetch agent profile — prioriza quien COMPARTIÓ el link
          // (?sharedBy=<id> en la URL) sobre quien publicó/creó el
          // contenido originalmente. Si el link no trae `sharedBy` (links
          // viejos, o compartido antes de este cambio), cae al
          // comportamiento anterior.
          //
          // En modo "sin datos" (hideData) NO se busca ni se muestra
          // ningún agente — ni el creador ni quien compartió. Ese es
          // justamente el propósito de "sin datos": cero información
          // personal, ni siquiera con un fetch de red de por medio.
          if (!hideData) {
            const params = new URLSearchParams(window.location.search);
            const sharedByParam = params.get("sharedBy");
            const userId =
              (sharedByParam && sharedByParam.trim()) ||
              (data as any).publicado_por ||
              (data as any).created_by;
            if (userId && typeof userId === "string") {
              const profile = await getProfileById(userId);
              if (profile) {
                setAgent(profile);
              }
            }
          }
        } else {
          setError("Propiedad no encontrada");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar la propiedad");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, hideData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {error || "Propiedad no encontrada"}
        </h2>
        <p className="text-gray-500">
          Verifica que el ID y el tipo sean correctos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full pb-24 md:pb-0">
      <div className="bg-white rounded-none md:rounded-[2.5rem] shadow-sm md:border md:border-gray-100 p-0 md:p-8 max-w-3xl mx-auto overflow-hidden">
        {/* Agent Header */}
        {agent && !hideData && (
          <div className="flex justify-between items-center px-2 py-2 md:px-0 md:mb-2">
            <AgentCard agent={agent} onClick={() => setIsModalOpen(true)} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-0 md:gap-8">
          {/* Left Column: Image */}
          <div className="w-full">
            <MainImage property={property} />
          </div>

          {/* Right Column: Info */}
          <div className="w-full px-4 pb-8 md:px-0 md:pb-0">
            <PropertyInfo property={property} hideData={hideData} />
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
