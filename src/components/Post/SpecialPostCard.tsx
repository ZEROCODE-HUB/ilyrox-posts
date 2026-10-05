import { Search, MapPin } from "lucide-react";
import type { Post } from "../types";
import Avatar from "../Shared/Avatar";
import { ImageCarousel } from "../Shared/ImageCarousel";
import { formatPrice } from "../../utils/priceFormatter";
import firstUpperCase from "../../utils/firstUpperCase";
import { parseImages } from "../../utils/parseImages";

interface SpecialPostCardProps {
  post: Post;
  mode?: "preview" | "detail" | "grid";
  /** Opcionales y ya no los usa nadie en la vista pública: la tarjeta es
   *  puramente informativa. Se mantienen por si el modo "preview" vuelve a
   *  necesitar una acción. */
  onUserClick?: () => void;
  onOfferClick?: () => void;
  hideData?: boolean;
}

const SPECIAL_COLORS = {
  aniversario: "#74b5c3", // Azul claro tipo 'Celebración'
  openhouse: "#6A1B9A", // Morado oscuro
  sold: "#D32F2F", // Rojo para vendido
  textWhite: "#FFFFFF",
};

export const SpecialPostCard = ({
  post,
  mode = "preview",
  onUserClick,
  onOfferClick,
  hideData,
}: SpecialPostCardProps) => {
  const postType = post.tipo
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

  // `imagenes` puede venir como array o como JSON string según el registro;
// `parseImages` normaliza ambas formas. Antes, si llegaba un string, quedaba
// como texto y el carrusel no renderizaba nada.
  const parsedImages = parseImages(post.imagenes);
  const allImages =
    parsedImages.length > 0
      ? parsedImages
      : post.foto_propiedad
        ? [post.foto_propiedad]
        : [];

  // Datos variables
  const userName =
    post.perfiles?.nombre && post.perfiles?.apellido_paterno
      ? `${post.perfiles.nombre} ${post.perfiles.apellido_paterno}`
      : post.perfiles?.nombre_completo ||
        post.nombre_asesor ||
        post.publicado_por ||
        "Usuario";
  const userLocation =
    (post.perfiles?.ciudad &&
      post.perfiles?.estado &&
      `${post.perfiles.ciudad}, ${post.perfiles.estado}`) ||
    post.ubicacion ||
    "Ubicación pendiente";
  const eventDate = post.fecha_hora || "Próximamente";
  const eventEndDate = post.fecha_finalizacion || "Próximamente";
  const years = post.antiguedad || 1;
  const userAvatar = post.foto_perfil_usuario;

  // --- RENDER: ANIVERSARIO ---
  if (postType === "aniversario") {
    return (
      <div
        className="w-full relative overflow-hidden flex flex-col items-center justify-center py-8 rounded-4xl shadow-sm"
        style={{ backgroundColor: SPECIAL_COLORS.aniversario }}
      >
        {/* Decoración superior */}
        <div className="p-2 text-center z-10">
          <h2 className="text-white font-bold text-xl md:text-2xl text-center px-4 drop-shadow-md">
            🎉 ¡Hoy celebro {years} años en el mundo inmobiliario! 🎉
          </h2>
        </div>

        {/* Avatar Central con efecto 'burst' */}
        <div className="my-6 relative z-10">
          <div className="p-2 rounded-full border-2 border-white border-dashed bg-white/20 backdrop-blur-sm">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-xl">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-4xl">
                  userName
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Inferior */}
        <div className="p-4 text-center z-10">
          <p className="text-[#6A1B9A] font-bold text-sm uppercase tracking-wider mb-1">
            Asesor Inmobiliario
          </p>
          <h3 className="text-[#6A1B9A] font-black text-2xl md:text-3xl mb-1">
            {userName}
          </h3>
          <p className="text-[#6A1B9A] font-medium text-sm md:text-base">
            {userLocation}
          </p>
        </div>

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      </div>
    );
  }

  // --- RENDER: OPEN HOUSE y SOLD ---
  if (postType === "openhouse" || postType === "sold") {
    const isSold =
      post.status?.toLowerCase() === "vendida" ||
      post.status?.toLowerCase() === "sold";

    const mainColor = isSold ? SPECIAL_COLORS.sold : SPECIAL_COLORS.openhouse;
    const bannerText = isSold ? "VENDIDO" : "OPEN HOUSE";

    return (
      <div className="w-lvh bg-white rounded-4xl overflow-hidden shadow-sm border border-gray-100">
        {/* Imagen Principal */}
        {allImages.length > 0 ? (
          <ImageCarousel
            images={allImages}
            alt="Propiedad"
            aspectClassName="h-64 md:h-80"
          />
        ) : (
          <div className="w-full h-64 md:h-80 flex items-center justify-center bg-gray-200 text-gray-400">
            No Image
          </div>
        )}

        {/* Banner Central */}
        <div
          className="relative -mt-6 z-10 flex justify-center items-center py-3 pl-20 shadow-lg"
          style={{ backgroundColor: mainColor }}
        >
          <h2
            className={`text-white font-black text-2xl md:text-3xl tracking-widest uppercase ${isSold ? "bg-[#D32F2F] border-2 border-white px-4 py-1 rounded-lg" : ""}`}
          >
            {bannerText}
          </h2>
        </div>

        {/* Footer Info */}
        <div
          className="flex flex-row pb-6 px-6 pt-4 min-h-[140px]"
          style={{ backgroundColor: mainColor }}
        >
          {/* Avatar sobrepuesto (Left) */}
          <div className="relative -mt-16 mr-4 z-20 shrink-0">
            <div className="w-24 h-24 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar name={userName} size={90} />
              )}
            </div>
          </div>

          {/* Textos (Right) */}
          <div className="flex-1 flex flex-col justify-center text-white pt-2">
            <h3 className="font-bold text-lg text-center mb-1">
              {isSold ? "¡PROPIEDAD VENDIDA!" : "----- UNETENOS -----"}
            </h3>

            {!isSold && (
              <>
                {post.fecha_hora && (
                  <p className="text-white/90 font-bold text-base text-center mb-2">
                    Inicia:{" "}
                    {new Date(eventDate).toLocaleString("es-ES", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {post.fecha_finalizacion && (
                  <p className="text-white/90 font-bold text-base text-center mb-2">
                    Finaliza:{" "}
                    {new Date(eventEndDate).toLocaleString("es-ES", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </>
            )}

            <div className="flex items-center justify-center gap-1 opacity-90">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" />
              <p className="text-xs md:text-sm text-center line-clamp-2">
                {userLocation}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: BUSQUEDA ---
  if (postType === "busqueda" && post.busquedas_json) {
    const { busquedas_json } = post;
    const isDetail = mode === "detail";
    const f = busquedas_json.filtros ?? {};

    // Operación (venta/renta). Soporta múltiple (operaciones[]) y legacy (operacion string)
    const operaciones: string[] = (
      Array.isArray(f.operaciones) && f.operaciones.length > 0
        ? f.operaciones
        : typeof f.operacion === "string" && f.operacion
          ? [f.operacion]
          : []
    )
      .map((o: any) => String(o).toLowerCase())
      .filter((o: string) => o === "venta" || o === "renta");

    // Título grande: tipo de propiedad (o primer subtipo si no hay tipo).
    // Soporta el schema legacy donde `subtipo` venía como string suelto.
    const subtipoArr: string[] = Array.isArray(f.subtipo)
      ? f.subtipo.filter(
          (s: unknown) =>
            typeof s === "string" && (s as string).trim().length > 0,
        )
      : typeof f.subtipo === "string" && f.subtipo.trim()
        ? [f.subtipo]
        : [];
    const rawTipo = f.tipo_propiedad || subtipoArr[0] || "Propiedad";
    const titulo = firstUpperCase(rawTipo);

    // Rango(s) de presupuesto: compra y/o renta
    const moneda = f.moneda || "MXN";
    const precioNum = (v: unknown): number | null =>
      typeof v === "number" && v > 0 ? v : null;
    const fmtRango = (
      min: number | null,
      max: number | null,
    ): string | null => {
      if (min && max)
        return `${formatPrice(min)} – ${formatPrice(max)} ${moneda}`;
      if (min) return `Desde ${formatPrice(min)} ${moneda}`;
      if (max) return `Hasta ${formatPrice(max)} ${moneda}`;
      return null;
    };
    const ventaRango = fmtRango(precioNum(f.precio_min), precioNum(f.precio_max));
    const rentaRango = fmtRango(
      precioNum(f.precio_renta_min),
      precioNum(f.precio_renta_max),
    );
    const hayAmbosPrecios = !!ventaRango && !!rentaRango;
    const presupuestos: Array<{ label: string; text: string }> = [];
    if (ventaRango)
      presupuestos.push({
        label: hayAmbosPrecios ? "Presupuesto · Compra" : "Presupuesto",
        text: ventaRango,
      });
    if (rentaRango)
      presupuestos.push({
        label: hayAmbosPrecios ? "Presupuesto · Renta" : "Presupuesto",
        text: rentaRango,
      });
    if (presupuestos.length === 0)
      presupuestos.push({ label: "Presupuesto", text: "Sin especificar" });

    // Zonas (chips)
    const zonas: Array<{ id?: string; label: string }> = Array.isArray(
      f.zonas_interes,
    )
      ? f.zonas_interes
      : [];

    // Ubicaciones multi-nivel (nuevo schema): un chip por entrada con su label
    const ubicacionesMulti: string[] = Array.isArray(f.ubicaciones)
      ? f.ubicaciones
          .filter(
            (u: any) => u && typeof u.label === "string" && u.label.trim(),
          )
          .map((u: any) => u.label as string)
      : [];

    // Colonias múltiples (schema anterior) o legacy (string)
    const coloniasArr: string[] = Array.isArray(f.ubicacion?.colonias)
      ? f.ubicacion.colonias.filter(
          (c: unknown) =>
            typeof c === "string" && (c as string).trim().length > 0,
        )
      : typeof f.ubicacion?.colonia === "string" && f.ubicacion.colonia.trim()
        ? [f.ubicacion.colonia]
        : [];

    // Fallback: priorizar ubicaciones multi-nivel; si no, usar datos legacy
    const ubicacionFallback: string[] = !zonas.length
      ? ubicacionesMulti.length > 0
        ? ubicacionesMulti
        : coloniasArr.length > 0
          ? [coloniasArr.join(", ")]
          : [f.ubicacion?.ciudad, f.ubicacion?.municipio, f.ubicacion?.estado]
              .filter(
                (s: unknown) =>
                  typeof s === "string" && (s as string).trim().length > 0,
              )
              .slice(0, 1)
      : [];

    // Características y superficies: mostramos todo lo que el usuario llenó
    const num = (v: unknown): number | null =>
      typeof v === "number" && v > 0 ? v : null;
    const fmt = (n: number): string =>
      String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const habitaciones = num(f.caracteristicas?.habitaciones);
    const banos = num(f.caracteristicas?.banos);
    const mediosBanos = num(f.caracteristicas?.medios_banos);
    const estacionamientos = num(f.caracteristicas?.estacionamientos);
    const niveles = num(f.caracteristicas?.niveles);
    const antiguedad: string =
      typeof f.caracteristicas?.antiguedad === "string"
        ? f.caracteristicas.antiguedad.trim()
        : "";

    // Superficies mínimas → el post indica que se busca "más de" (+) esa cantidad
    const m2TerrenoMin = num(f.superficies?.m2_terreno_min);
    const m2ConstruccionMin = num(f.superficies?.m2_construccion_min);

    const stats: Array<{
      key: string;
      emoji: string;
      value: string;
      label: string;
    }> = [];
    if (habitaciones)
      stats.push({
        key: "rec",
        emoji: "🛏️",
        value: String(habitaciones),
        label: "rec.",
      });
    if (banos)
      stats.push({
        key: "ban",
        emoji: "🚽",
        value: String(banos),
        label: "baños",
      });
    if (mediosBanos)
      stats.push({
        key: "medban",
        emoji: "🚽",
        value: String(mediosBanos),
        label: "½ baños",
      });
    if (estacionamientos)
      stats.push({
        key: "est",
        emoji: "🚗",
        value: String(estacionamientos),
        label: "estac.",
      });
    if (niveles)
      stats.push({
        key: "niv",
        emoji: "🏢",
        value: String(niveles),
        label: niveles === 1 ? "planta" : "plantas",
      });

    const nota: string = typeof f.nota === "string" ? f.nota : "";

    // Detalles especializados según tipo (comercial / industrial / agrícola)
    const joinArr = (v: unknown): string =>
      Array.isArray(v)
        ? v.filter(Boolean).join(", ")
        : typeof v === "string"
          ? v
          : "";
    const especializados: Array<{ key: string; value: string }> = [];
    const detAdd = (key: string, value: string) => {
      if (value && value.trim()) especializados.push({ key, value });
    };
    if (f.comercial) {
      const c = f.comercial;
      detAdd("Ubicación", joinArr(c.tipoUbicacion));
      if (c.frenteMin) detAdd("Frente mín.", `${c.frenteMin} m`);
      if (c.nivel) detAdd("Nivel", String(c.nivel));
      const flags: string[] = [];
      if (c.sobreAvenidaPrincipal) flags.push("Av. principal");
      if (c.enEsquina) flags.push("En esquina");
      if (c.altaVisibilidad) flags.push("Alta visibilidad");
      if (c.altoFlujoVehicular) flags.push("Alto flujo");
      detAdd("Características", flags.join(", "));
    }
    if (f.industrial) {
      const it = f.industrial;
      detAdd("Ubicación", joinArr(it.ubicacion));
      detAdd("Altura libre", joinArr(it.alturaLibre));
      detAdd("Energía", joinArr(it.energiaKva));
      if (it.areaOficinasMin)
        detAdd("Oficinas mín.", `${it.areaOficinasMin} m²`);
      if (it.patioManiobrasMin)
        detAdd("Patio maniobras mín.", `${it.patioManiobrasMin} m²`);
    }
    if (f.agricola) {
      const a = f.agricola;
      detAdd("Agua", joinArr(a.tiposAgua));
      if (a.concesionAgua) detAdd("Concesión de agua", "Sí");
      detAdd("Uso de terreno", joinArr(a.usoTerreno));
      detAdd("Tipo de riego", joinArr(a.tipoRiego));
      const serv: string[] = [];
      if (a.electricidad) serv.push("Electricidad");
      if (a.caminoAcceso) serv.push("Camino de acceso");
      if (a.cercado) serv.push("Cercado");
      if (a.pieCarretera) serv.push("Pie de carretera");
      if (a.accesCamiones) serv.push("Acceso camiones");
      detAdd("Servicios", serv.join(", "));
    }

    const handleOffer = onOfferClick ?? onUserClick;

    return (
      <div
        className={`w-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden ${isDetail ? "" : "max-w-md mx-auto"}`}
      >
        <div className="p-5 md:p-6">
          {/* Header de agente/quien compartió — mismo patrón visual que
              las otras ramas del archivo (isTextOnly, DEFAULT RENDER).
              userName/userAvatar ya reflejan correctamente a quien
              compartió el link (sharedBy) o al creador, según corresponda;
              este bloque solo hacía falta agregarlo aquí. En modo "sin
              datos" (hideData) no se muestra ni siquiera el placeholder. */}
          {!hideData && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0891b2]/20 flex items-center justify-center text-[#0891b2] font-bold">
                    U
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{userName}</h3>
                <p className="text-xs text-gray-500">
                  {post.created_at
                    ? new Date(post.created_at).toLocaleDateString()
                    : "Reciente"}
                </p>
              </div>
            </div>
          )}

          {/* SE BUSCA + Operación(es) */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-xs font-extrabold text-primary tracking-wider">
              SE BUSCA
            </span>
            {operaciones.map((op) => (
              <span
                key={op}
                className="ml-1 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-extrabold tracking-wide"
              >
                {op === "venta" ? "EN VENTA" : "EN RENTA"}
              </span>
            ))}
          </div>

          {/* Título grande */}
          <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3">
            {titulo}
          </h3>

          {/* Subtipos seleccionados (todos) */}
          {subtipoArr.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {subtipoArr.map((s, idx) => (
                <span
                  key={`${s}-${idx}`}
                  className="px-3 py-1.5 rounded-2xl bg-primary/10 border border-primary/25 text-sm font-bold text-primary"
                >
                  {firstUpperCase(s)}
                </span>
              ))}
            </div>
          )}

          {/* Presupuesto(s): compra y/o renta */}
          {presupuestos.map((p, i) => (
            <div key={i}>
              <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase mb-1">
                {p.label}
              </p>
              <p className="text-lg font-extrabold text-gray-900 mb-4">
                {p.text}
              </p>
            </div>
          ))}

          {/* Zonas de interés */}
          {(zonas.length > 0 || ubicacionFallback.length > 0) && (
            <>
              <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase mb-2">
                Zonas de interés
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {zonas.map((z, idx) => (
                  <span
                    key={z.id ?? `${z.label}-${idx}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-gray-800"
                  >
                    <span>📍</span>
                    <span className="truncate max-w-[200px]">{z.label}</span>
                  </span>
                ))}
                {ubicacionFallback.map((label, idx) => (
                  <span
                    key={`fallback-${idx}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-gray-800"
                  >
                    <span>📍</span>
                    <span className="truncate max-w-[200px]">{label}</span>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Características */}
          {stats.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase mb-2">
                Características
              </p>
              <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                {stats.map((s) => (
                  <span key={s.key}>
                    {s.emoji}{" "}
                    <span className="font-bold text-gray-900">{s.value}</span>{" "}
                    {s.label}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Superficie mínima → se busca "más de" (+) esa cantidad */}
          {(m2TerrenoMin || m2ConstruccionMin) && (
            <>
              <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase mb-2">
                Superficie
              </p>
              <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                {m2TerrenoMin ? (
                  <span>
                    📐{" "}
                    <span className="font-bold text-gray-900">
                      +{fmt(m2TerrenoMin)} m²
                    </span>{" "}
                    terreno
                  </span>
                ) : null}
                {m2ConstruccionMin ? (
                  <span>
                    🏗️{" "}
                    <span className="font-bold text-gray-900">
                      +{fmt(m2ConstruccionMin)} m²
                    </span>{" "}
                    construcción
                  </span>
                ) : null}
              </div>
            </>
          )}

          {/* Antigüedad */}
          {antiguedad.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase mb-1">
                Antigüedad
              </p>
              <p className="text-base font-semibold text-gray-900 mb-4">
                {antiguedad}
              </p>
            </>
          )}

          {/* Detalles especializados (comercial / industrial / agrícola) */}
          {especializados.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase mb-2">
                Detalles
              </p>
              <div className="flex flex-col gap-1.5 mb-4">
                {especializados.map((d, i) => (
                  <div
                    key={`${d.key}-${i}`}
                    className="flex justify-between items-start gap-3"
                  >
                    <span className="text-[13px] text-gray-400 shrink-0">
                      {d.key}
                    </span>
                    <span className="text-[13px] text-gray-900 font-medium text-right">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Nota */}
          {nota.trim().length > 0 && (
            <>
              <div className="h-px bg-gray-100 my-4" />
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                <span className="font-bold text-gray-900">Nota: </span>
                {nota}
              </p>
            </>
          )}
        </div>

        {/* CTA "Ofrecer propiedad". Solo se pinta si hay un handler: en la vista
            pública compartida no se pasa ninguno, y un botón que no hace
            nada es peor que no tenerlo. */}
        {handleOffer && (
          <div className="px-5 md:px-6 pb-5 md:pb-6">
            <button
              type="button"
              onClick={handleOffer}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 active:scale-[0.99] transition-all"
            >
              Ofrecer propiedad 👋
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: TEXT ONLY (NO IMAGES, TYPE POST) ---
  const isTextOnly =
    parsedImages.length === 0 && (!postType || postType === "post");

  if (isTextOnly) {
    return (
      <div className="flex flex-col bg-white rounded-3xl p-6 border border-gray-100 shadow-sm max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#0891b2]/20 flex items-center justify-center text-[#0891b2] font-bold">
                U
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{userName}</h3>
            <p className="text-xs text-gray-500">
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString()
                : "Reciente"}
            </p>
          </div>
        </div>

        {/* Text as Image-like Block */}
        <div className="w-full aspect-square rounded-2xl bg-[#0891b2] flex items-center justify-center p-8 md:p-12 text-center shadow-lg relative overflow-hidden group/text">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
          <p className="text-white font-extrabold text-2xl md:text-3xl lg:text-4xl leading-snug whitespace-pre-wrap drop-shadow-lg relative z-10 transition-transform duration-500 group-hover/text:scale-105">
            {post.contenido}
          </p>
        </div>
      </div>
    );
  }

  // --- DEFAULT RENDER (STANDARD POST) ---
  return (
    <div className="flex flex-col bg-white rounded-3xl p-6 border border-gray-100 shadow-sm max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="User"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#0891b2]/20 flex items-center justify-center text-[#0891b2] font-bold">
              U
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{userName}</h3>
          <p className="text-xs text-gray-500">
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString()
              : "Reciente"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.contenido}
        </p>
      </div>

      {/* Media */}
      {allImages.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100">
          <ImageCarousel
            images={allImages}
            alt="Contenido del post"
            dynamicAspect
            showCounter
          />
        </div>
      )}
    </div>
  );
};
