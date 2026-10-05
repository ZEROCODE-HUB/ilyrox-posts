import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import type { Property } from "../types";
import { CardFeature } from "./CardFeature";
import { ImageCarousel } from "../Shared/ImageCarousel";
import { CopyableId } from "./CopyableId";
import { parseImages } from "../../utils/parseImages";

interface MainImageProps {
  property: Property;
}

export function MainImage({ property }: MainImageProps) {
  // `fotos` llega como array en casi todos los registros, pero hay filas
  // guardadas como JSON string. Sin normalizar, `.map` del carrusel revienta
  // y la galería entera se queda en blanco. `parseImages` cubre ambas formas.
  const images = parseImages(property.fotos);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full rounded-none md:rounded-3xl overflow-hidden shadow-sm">
      <ImageCarousel
        images={images}
        alt={property.title}
        aspectClassName="aspect-square md:aspect-video"
        dotsClassName="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20"
      >
        {/* Banner ID / Fecha */}
        <div className="absolute bottom-0 bg-black/40 backdrop-blur-md md:rounded-b-3xl text-gray-200/80 text-xs px-2 py-1 font-bold w-full">
          {property.codigo_propiedad ? (
            <CopyableId id={property.codigo_propiedad} className="p-2" />
          ) : (
            <span className="p-2">ID: —</span>
          )}
          <span>•</span>
          <span>
            Publicado el{" "}
            {isMounted && property.created_at
              ? new Date(property.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "..."}
          </span>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
      </ImageCarousel>
    </div>
  );
}

interface PropertyInfoProps {
  property: Property;
  hideData?: boolean;
}

export function PropertyInfo({ property, hideData }: PropertyInfoProps) {
  const tipo = (property.tipo || "").toLowerCase();
  const num = (v?: number) => (typeof v === "number" ? v : 0);

  // Características comunes — solo se muestran si tienen valor (> 0).
  const common: { value: string | number; text: string }[] = [];
  if (num(property.habitaciones) > 0)
    common.push({ value: property.habitaciones!, text: "Rec." });
  if (num(property.banos) > 0)
    common.push({ value: property.banos!, text: "Baños" });
  if (num(property.medios_banos) > 0)
    common.push({ value: property.medios_banos!, text: "½ Baños" });
  if (num(property.estacionamientos) > 0)
    common.push({ value: property.estacionamientos!, text: "Estac." });
  if (num(property.pisos) > 0)
    common.push({ value: property.pisos!, text: "Niveles" });
  if (num(property.metros_cuadrados_construccion) > 0)
    common.push({ value: `${property.metros_cuadrados_construccion} m²`, text: "Construcción" });
  if (num(property.metros_cuadrados_terreno) > 0)
    common.push({ value: `${property.metros_cuadrados_terreno} m²`, text: "Terreno" });
  if (num(property.ancho_terreno) > 0)
    common.push({ value: `${property.ancho_terreno} m`, text: "Frente" });
  if (num(property.largo_terreno) > 0)
    common.push({ value: `${property.largo_terreno} m`, text: "Fondo" });

  // Características específicas por tipo (replican el detalle de la app).
  const typeStats: { label: string; value: string }[] = [];
  const typeChips: { label: string; items: string[] }[] = [];
  const typeFlags: string[] = [];
  let sectionTitle = "";

  if (tipo === "comercial") {
    sectionTitle = "Características Comerciales";
    if (property.tipo_ubicacion_comercial)
      typeStats.push({ label: "Ubicación", value: property.tipo_ubicacion_comercial });
    if (num(property.nivel_piso) > 0)
      typeStats.push({ label: "Nivel de piso", value: String(property.nivel_piso) });
    if (property.sobre_avenida_principal) typeFlags.push("Sobre Avenida Principal");
    if (property.en_esquina) typeFlags.push("En Esquina");
    if (property.alta_visibilidad) typeFlags.push("Alta Visibilidad");
    if (property.alto_flujo_vehicular) typeFlags.push("Alto Flujo Vehicular");
  } else if (tipo === "industrial") {
    sectionTitle = "Características Industriales";
    if (property.ubicacion_industrial)
      typeStats.push({ label: "Ubicación", value: property.ubicacion_industrial });
    if (property.altura_libre_m)
      typeStats.push({ label: "Altura Libre", value: property.altura_libre_m });
    if (num(property.area_oficinas_m2) > 0)
      typeStats.push({ label: "Área Operativa", value: `${property.area_oficinas_m2} m²` });
    if (num(property.patio_maniobras_m2) > 0)
      typeStats.push({ label: "Patio de Maniobras", value: `${property.patio_maniobras_m2} m²` });
    if (property.tipo_energia_kva?.length)
      typeChips.push({ label: "Energía (kVA)", items: property.tipo_energia_kva });
  } else if (tipo === "agricola") {
    sectionTitle = "Características Agrícolas";
    if (property.uso_terreno?.length)
      typeChips.push({ label: "Uso de Terreno", items: property.uso_terreno });
    if (property.tipo_riego?.length)
      typeChips.push({ label: "Sistema de Riego", items: property.tipo_riego });
    if (property.tipo_agua?.length)
      typeChips.push({ label: "Fuente de Agua", items: property.tipo_agua });
    if (property.concesion_agua) typeFlags.push("Concesión de Agua");
    if (property.infra_electricidad) typeFlags.push("Electricidad");
    if (property.infra_camino_acceso) typeFlags.push("Acceso/Camino");
    if (property.infra_cercado) typeFlags.push("Cercado");
    if (property.acceso_carretera) typeFlags.push("A pie de Carretera");
    if (property.acceso_camiones) typeFlags.push("Acceso para tráiler");
  }

  const hasTypeSection =
    typeStats.length > 0 || typeChips.length > 0 || typeFlags.length > 0;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-semibold text-primary leading-tight bg-cyan-50 rounded-xl px-2 w-fit py-1">
            {property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1)}
          </h1>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {`${property.subtipo} en ${property.municipio ? property.municipio : property.estado}`}
          </h1>

          <div className="flex flex-col gap-2">
            <div className="cursor-default pt-2">
              <div className="flex flex-wrap items-center gap-4">
                {property.operaciones_propiedad.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center bg-gray-100/80 rounded-2xl overflow-hidden border border-gray-200 transition-all hover:scale-[1.02] shadow-sm"
                  >
                    <div
                      className={`px-3 py-2 flex items-center justify-center min-h-[40px] ${op.tipo_operacion === "renta" ? " bg-gray-100 text-gray-700" : "bg-[#1a2e2fda] text-gray-100"}`}
                    >
                      <span className="text-[13px] font-black uppercase tracking-[0.15em] leading-none">
                        {op.tipo_operacion === "renta" ? "Renta" : "Venta"}
                      </span>
                    </div>
                    <div className="px-3 py-1 flex items-baseline gap-2 text-gray-800">
                      <span className="text-sm font-semibold opacity-90">
                        {op.moneda}
                      </span>
                      <span className="text-lg font-bold tracking-tight">
                        ${op.precio.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-gray-400 font-medium">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {property.calle
                  ? `${property.calle} ${
                      property.numero_exterior ? property.numero_exterior : ""
                    }, `
                  : ""}
                {property.colonia ? property.colonia + ", " : ""}
                {property.municipio ? property.municipio + ", " : ""}
                {property.estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Características comunes — solo texto, sin íconos (omiten valores en 0) */}
      {common.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 -my-1">
          {common.map((c) => (
            <CardFeature key={c.text} value={c.value} text={c.text} />
          ))}
        </div>
      )}

      {/* Características específicas por tipo — solo texto */}
      {hasTypeSection && (
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{sectionTitle}</h3>

          {typeStats.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {typeStats.map((s) => (
                <div
                  key={s.label}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                >
                  <span className="text-gray-400 font-medium">{s.label}: </span>
                  <span className="font-semibold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {typeChips.map((g) => (
            <div key={g.label} className="mb-2">
              <p className="text-sm font-semibold text-gray-500 mb-1">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <div
                    key={it}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700"
                  >
                    {it}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {typeFlags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {typeFlags.map((flag) => (
                <div
                  key={flag}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700"
                >
                  {flag}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Amenities Section */}
      {property.propiedades_amenidades &&
        property.propiedades_amenidades.length > 0 && (
          <div className="border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Amenidades</h3>

            <div className="flex flex-wrap gap-2">
              {property.propiedades_amenidades.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray"
                >
                  {item.catalogo_amenidades.nombre}
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="flex flex-col gap-2">
        <p className="text-lg font-bold text-gray-900">Descripción</p>
        {/* `whitespace-pre-wrap` es lo que hace que los saltos de línea que se
            guardaron se vean tal cual: sin esto el navegador colapsa los
            `\n\n` y todo queda como un solo párrafo corrido.
            `break-words` evita que una URL o palabra larga desborde la caja. */}
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {property.descripcion}
        </p>
      </div>

      {property.latitud && property.longitud && (
        <div className="py-4 flex justify-center gap-5">
          {/* <a
            href="https://ilyrox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-1 bg-primary hover:bg-primary/80 text-white rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/30 active:scale-95 group hover:scale-105"
          >
            Ver más
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a> */}
          <a
            href={`https://www.google.com/maps?q=${property.latitud},${property.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-fit px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold transition-all border border-gray-100 mt-1 duration-300 hover:scale-105"
          >
            <MapPin className="w-6 h-6 text-primary" />
            <span className="font-semibold text-md text-primary">
              Ver en Google Maps
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
