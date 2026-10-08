import { ImageResponse } from "next/og";
import { getPostById } from "../../../services/postService";
import { getReelById } from "../../../services/reelService";
import { getProfileById } from "../../../services/userService";
import { formatPrice } from "../../../utils/priceFormatter";
import firstUpperCase from "../../../utils/firstUpperCase";

const Logo =
  (process.env.NEXT_PUBLIC_BASE_URL || "https://ilyrox.vercel.app") +
  "/Logo.jpeg";

/**
 * Función para renderizar el Avatar compatible con Satori (evitando Tailwind)
 */
function satoriAvatar(name: string, size: number, url?: string) {
  console.log("url", url);
  if (url && url.trim().length > 0 && !url.includes("placehold.co")) {
    return (
      <img
        src={url}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${size / 2}px`,
          objectFit: "cover",
          display: "flex",
        }}
      />
    );
  }

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${size / 2}px`,
        backgroundColor: "#0891b2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: `${size * 0.4}px`,
      }}
    >
      {initials}
    </div>
  );
}

/**
 * Función separada para generar la miniatura del Reel basada en su URL de video
 */
async function generateVideoThumbnail(videoUrl: string): Promise<string> {
  if (videoUrl.includes("supabase.co")) {
    const thumbUrl = videoUrl
      .replace("/reels/", "/thumbnails/")
      .replace(".mp4", ".jpg");
    return thumbUrl;
  }
  return Logo;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const idRaw = searchParams.get("id");
  const urlId = idRaw?.trim() || "";

  console.log(`[OG Route] Request received: type=${type}, id=${urlId} (original: ${idRaw})`);

  if (!urlId) {
    console.error("[OG Route] Missing or empty ID in search parameters.");
    return new Response("Missing id", { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://ilyrox.vercel.app";

  const makeAbsolute = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  try {
    if (type === "post") {
      console.log(`[OG Route] Attempting to fetch post with ID: ${urlId}`);
      const post = await getPostById(urlId);
      if (!post) {
        console.error(`[OG Route] Post NOT FOUND or RLS issue for id: ${urlId}`);
        return new Response("Post not found", { status: 404 });
      }

      const postType = post.tipo
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");

      const userName =
        post.perfiles?.nombre_completo || post.nombre_asesor || "Usuario";
      const userAvatar = post.foto_perfil_usuario || post.perfiles?.foto;
      const absoluteAvatar = makeAbsolute(userAvatar || "/Logo.jpeg");
      const content = post.contenido || "";
      const images = (post.imagenes || []).map(makeAbsolute);
      const userLocation = post.ubicacion || post.perfiles?.ciudad;

      console.log("img", post.foto_propiedad);

      const SPECIAL_COLORS = {
        aniversario: "#74b5c3",
        openhouse: "#6A1B9A",
        sold: "#D32F2F",
      };

      // --- RENDER: OPEN HOUSE / SOLD ---
      if (postType === "openhouse" || postType === "sold") {
        const isSold =
          postType === "sold" ||
          post.status?.toLowerCase() === "vendida" ||
          post.status?.toLowerCase() === "sold";
        const mainColor = isSold
          ? SPECIAL_COLORS.sold
          : SPECIAL_COLORS.openhouse;
        const bannerText = isSold ? "VENDIDO" : "OPEN HOUSE";
        const headerImage =
          images[0] || post.foto_propiedad || makeAbsolute("/Logo.jpeg");
        const eventDate = post.fecha_hora || "Próximamente";

        return new ImageResponse(
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              fontFamily: "sans-serif",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", width: "100%", height: "340px" }}>
              <img
                src={headerImage}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                backgroundColor: mainColor,
                padding: "12px 40px 12px 280px",
                marginTop: "-25px",
                zIndex: 10,
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              }}
            >
              <h2
                style={{
                  color: "white",
                  fontSize: "44px",
                  fontWeight: 1000,
                  textTransform: "uppercase",
                  letterSpacing: "6px",
                  margin: 0,
                  display: "flex",
                }}
              >
                {bannerText}
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                backgroundColor: mainColor,
                flex: 1,
                padding: "10px 40px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50px",
                  bottom: "60px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "120px",
                  border: "8px solid white",
                  backgroundColor: "white",
                  display: "flex",
                  overflow: "hidden",
                  zIndex: 20,
                }}
              >
                {satoriAvatar(
                  userName,
                  200,
                  userAvatar ? absoluteAvatar : undefined,
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  paddingLeft: "280px",
                  color: "white",
                }}
              >
                <h3
                  style={{
                    fontSize: "26px",
                    fontWeight: "bold",
                    margin: "0 0 8px 0",
                    opacity: 0.9,
                    display: "flex",
                  }}
                >
                  {isSold ? "¡PROPIEDAD VENDIDA!" : "--- ÚNETENOS ---"}
                </h3>
                {!isSold && (
                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                      display: "flex",
                    }}
                  >
                    {new Date(eventDate).toLocaleString("es-ES", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
                {userLocation && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "22px",
                      opacity: 0.9,
                    }}
                  >
                    📍 {userLocation}
                  </div>
                )}
              </div>
            </div>
          </div>,
          { width: 1200, height: 630 },
        );
      }

      // --- RENDER: ANIVERSARIO ---
      if (postType === "aniversario") {
        const years = post.antiguedad || 1;
        return new ImageResponse(
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: SPECIAL_COLORS.aniversario,
              padding: "60px",
              fontFamily: "sans-serif",
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "48px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "30px",
                display: "flex",
              }}
            >
              🎉 ¡Hoy celebro {years} años en el mundo inmobiliario! 🎉
            </h2>
            <div
              style={{
                display: "flex",
                borderRadius: "50%",
                border: "12px solid white",
                overflow: "hidden",
                width: "300px",
                height: "300px",
              }}
            >
              <img
                src={absoluteAvatar}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "30px",
              }}
            >
              <span
                style={{
                  color: "#6A1B9A",
                  fontSize: "24px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Asesor Inmobiliario
              </span>
              <span
                style={{
                  color: "#6A1B9A",
                  fontSize: "44px",
                  fontWeight: 900,
                  margin: "5px 0",
                  display: "flex",
                }}
              >
                {userName}
              </span>
              {userLocation && (
                <span
                  style={{
                    color: "#6A1B9A",
                    fontSize: "22px",
                    fontWeight: 500,
                    display: "flex",
                  }}
                >
                  {userLocation}
                </span>
              )}
            </div>
          </div>,
          { width: 1200, height: 630 },
        );
      }

      // --- RENDER: BUSQUEDA ---
      if (postType === "busqueda" && post.busquedas_json) {
        const bj = post.busquedas_json as any;
        const f = bj.filtros ?? {};

        const operacion =
          typeof f.operacion === "string" ? f.operacion.toLowerCase() : "";
        const subtipoArr = Array.isArray(f.subtipo) ? f.subtipo : [];
        const titulo = firstUpperCase(
          subtipoArr[0] || f.tipo_propiedad || "Propiedad",
        );

        const moneda = f.moneda || "MXN";
        const precioMin =
          typeof f.precio_min === "number" && f.precio_min > 0
            ? f.precio_min
            : null;
        const precioMax =
          typeof f.precio_max === "number" && f.precio_max > 0
            ? f.precio_max
            : null;
        let presupuestoText = "Sin especificar";
        if (precioMin && precioMax) {
          presupuestoText = `${formatPrice(precioMin)} – ${formatPrice(precioMax)} ${moneda}`;
        } else if (precioMin) {
          presupuestoText = `Desde ${formatPrice(precioMin)} ${moneda}`;
        } else if (precioMax) {
          presupuestoText = `Hasta ${formatPrice(precioMax)} ${moneda}`;
        }

        const ubicacionesMulti: string[] = Array.isArray(f.ubicaciones)
          ? f.ubicaciones
              .filter(
                (u: any) => u && typeof u.label === "string" && u.label.trim(),
              )
              .map((u: any) => u.label as string)
          : [];
        const coloniasArr: string[] = Array.isArray(f.ubicacion?.colonias)
          ? f.ubicacion.colonias.filter(
              (c: any) => typeof c === "string" && c.trim().length > 0,
            )
          : typeof f.ubicacion?.colonia === "string" &&
              f.ubicacion.colonia.trim()
            ? [f.ubicacion.colonia]
            : [];
        const zonas: string[] =
          ubicacionesMulti.length > 0
            ? ubicacionesMulti
            : coloniasArr.length > 0
              ? [coloniasArr.join(", ")]
              : [f.ubicacion?.ciudad, f.ubicacion?.municipio, f.ubicacion?.estado]
                  .filter(
                    (s: any) => typeof s === "string" && s.trim().length > 0,
                  )
                  .slice(0, 1);

        const habitaciones = f.caracteristicas?.habitaciones;
        const banos = f.caracteristicas?.banos;

        return new ImageResponse(
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              padding: "60px",
              fontFamily: "sans-serif",
              border: "15px solid #45a0a5",
            }}
          >
            {/* Header SE BUSCA + Operación */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
                flexShrink: 0,
              }}
            >
              <span
                style={{ fontSize: "44px", marginRight: "16px", display: "flex" }}
              >
                🔍
              </span>
              <span
                style={{
                  color: "#0e7490",
                  fontSize: "34px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  display: "flex",
                }}
              >
                SE BUSCA
              </span>
              {(operacion === "venta" || operacion === "renta") && (
                <div
                  style={{
                    display: "flex",
                    marginLeft: "20px",
                    padding: "8px 22px",
                    backgroundColor: "#45a0a5",
                    borderRadius: "999px",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "24px",
                  }}
                >
                  {operacion === "venta" ? "EN VENTA" : "EN RENTA"}
                </div>
              )}
            </div>

            {/* Título grande */}
            <div
              style={{
                display: "flex",
                fontSize: "58px",
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.1,
                marginBottom: "18px",
                flexShrink: 0,
              }}
            >
              {titulo}
            </div>

            {/* Presupuesto */}
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
                flexShrink: 0,
              }}
            >
              PRESUPUESTO
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "44px",
                fontWeight: 900,
                color: "#111827",
                marginBottom: "24px",
                flexShrink: 0,
              }}
            >
              {presupuestoText}
            </div>

            {/* Zonas de interés */}
            {zonas.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "24px",
                  flexShrink: 0,
                }}
              >
                {zonas.slice(0, 2).map((label, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 22px",
                      backgroundColor: "#f9fafb",
                      border: "2px solid #e5e7eb",
                      borderRadius: "999px",
                      fontSize: "26px",
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    {`📍 ${label}`}
                  </div>
                ))}
              </div>
            )}

            {/* Características */}
            {(habitaciones || banos) && (
              <div
                style={{
                  display: "flex",
                  gap: "40px",
                  fontSize: "30px",
                  color: "#4b5563",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {habitaciones ? (
                  <div style={{ display: "flex" }}>{`Recámaras: ${habitaciones}`}</div>
                ) : null}
                {banos ? (
                  <div style={{ display: "flex" }}>{`Baños: ${banos}`}</div>
                ) : null}
              </div>
            )}
          </div>,
          { width: 1200, height: 630 },
        );
      }

      // --- RENDER: STANDARD POST ---
      if (images.length === 0) {
        return new ImageResponse(
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0891b2",
              padding: "80px",
              fontFamily: "sans-serif",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50px",
                left: "50px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {satoriAvatar(
                userName,
                100,
                userAvatar ? absoluteAvatar : undefined,
              )}
              <span
                style={{
                  marginLeft: "20px",
                  color: "white",
                  fontSize: "32px",
                  fontWeight: "bold",
                  display: "flex",
                }}
              >
                {userName}
              </span>
            </div>
            <p
              style={{
                color: "white",
                fontSize: "64px",
                fontWeight: "900",
                textAlign: "center",
                lineHeight: 1.2,
                padding: "0 40px",
                display: "flex",
              }}
            >
              {content.length > 100 ? content.slice(0, 100) + "..." : content}
            </p>
          </div>,
          { width: 1200, height: 630 },
        );
      } else {
        return new ImageResponse(
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              backgroundColor: "white",
              fontFamily: "sans-serif",
              flexDirection: "row",
            }}
          >
            <div style={{ width: "50%", height: "100%", display: "flex" }}>
              <img
                src={images[0]}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                width: "50%",
                padding: "60px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "40px",
                }}
              >
                {satoriAvatar(
                  userName,
                  80,
                  userAvatar ? absoluteAvatar : undefined,
                )}
                <span
                  style={{
                    marginLeft: "20px",
                    color: "#111827",
                    fontSize: "30px",
                    fontWeight: "bold",
                    display: "flex",
                  }}
                >
                  {userName}
                </span>
              </div>
              <p
                style={{
                  color: "#374151",
                  fontSize: "34px",
                  lineHeight: 1.4,
                  fontWeight: "medium",
                  display: "flex",
                }}
              >
                {content.length > 120 ? content.slice(0, 120) + "..." : content}
              </p>
              {userLocation && (
                <div
                  style={{
                    marginTop: "30px",
                    display: "flex",
                    alignItems: "center",
                    color: "#0891b2",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  📍 {userLocation}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "40px",
                }}
              >
                <img
                  src={Logo}
                  alt="Logo"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50px",
                    border: "5px solid white",
                    display: "flex",
                  }}
                />
                <span
                  style={{
                    marginLeft: "10px",
                    color: "#111827",
                    fontSize: "30px",
                    fontWeight: "bold",
                    display: "flex",
                  }}
                >
                  ilyrox
                </span>
              </div>
            </div>
          </div>,
          { width: 1200, height: 630 },
        );
      }
    }

    if (type === "reel") {
      console.log(`[OG Route] Attempting to fetch reel with ID: ${urlId}`);
      const reel = await getReelById(urlId);
      if (!reel) {
        console.error(`[OG Route] Reel NOT FOUND or RLS issue for id: ${urlId}`);
        return new Response("Reel not found", { status: 404 });
      }

      const profile = reel.publicado_por
        ? await getProfileById(reel.publicado_por)
        : null;
      const userName = profile?.nombre_completo || "Usuario";

      const videoThumbUrl = await generateVideoThumbnail(reel.video_url);
      const mainThumb = makeAbsolute(reel.thumbnail_url || videoThumbUrl);

      return new ImageResponse(
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "black",
            color: "white",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.6,
            }}
          >
            <img
              src={mainThumb}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "75px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "6px solid white",
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "25px solid transparent",
                  borderBottom: "25px solid transparent",
                  borderLeft: "50px solid white",
                  marginLeft: "2px",
                  display: "flex",
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "60px",
              right: "60px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              {satoriAvatar(userName, 100, profile?.foto || undefined)}
              <span
                style={{
                  marginLeft: "25px",
                  fontSize: "40px",
                  fontWeight: "bold",
                  textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                  display: "flex",
                }}
              >
                {userName}
              </span>
            </div>
            <p
              style={{
                fontSize: "34px",
                fontWeight: "600",
                textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                lineHeight: 1.3,
                marginBottom: "20px",
                display: "flex",
              }}
            >
              {reel.descripcion
                ? reel.descripcion.length > 70
                  ? reel.descripcion.slice(0, 70) + "..."
                  : reel.descripcion
                : "Mira este Reel en Ilyrox"}
            </p>
            <div style={{ display: "flex" }}>
              <div
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#0891b2",
                  borderRadius: "12px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  display: "flex",
                }}
              >
                VER VIDEO COMPLETO
              </div>
            </div>
          </div>
        </div>,
        { width: 1200, height: 630 },
      );
    }

    return new Response("Invalid type", { status: 400 });
  } catch (err: any) {
    console.error("OG error:", err);
    return new Response(`Error generating image: ${err.message}`, {
      status: 500,
    });
  }
}
