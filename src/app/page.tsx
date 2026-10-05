import type { Metadata } from "next";
import { headers } from "next/headers";
import { PropertyViewer } from "../components/Property/PropertyViewer";
import { ReelViewer } from "../components/Reel/ReelViewer";
import { PostViewer } from "../components/Post/PostViewer";
import { getPropertyById } from "../services/propertyService";
import { getReelById } from "../services/reelService";
import { getPostById } from "../services/postService";
import { metaDescription } from "../utils/metaText";

/** Largo máximo de `og:description`. WhatsApp y Facebook recortan igual o
 *  peor, y un texto de 1.500 caracteres se renderiza amontonado. */
const MAX_META_DESCRIPTION = 180;

/** Dimensiones de la imagen que devuelve /api/og. Se declaran porque hay
 *  scrapers que descartan la previsualización si no conocen el tamaño. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const type = resolvedParams.type as string | undefined;
  const id = resolvedParams.id as string | undefined;
  const sharedBy = resolvedParams.sharedBy as string | undefined;
  const sd = resolvedParams.sd as string | undefined;

  const defaultDescription =
    "Encuentra la propiedad de tus sueños en Ilyrox";
  let title = "Ilyrox Web";
  let description = defaultDescription;

  // Try to get base URL from headers for dynamic environments (Vercel previews, etc.)
  const host = (await headers()).get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const baseUrl = host
    ? `${protocol}://${host}`
    : process.env.NEXT_PUBLIC_BASE_URL || "https://feeds.ilyrox.com";

  const logoUrl = `${baseUrl}/Logo.jpeg`; // Fallback URL

  let imageUrl = logoUrl;
  // `false` hasta saber si vamos a usar /api/og: solo entonces tiene sentido
  // declarar width/height (las declara un PNG nuestro, no el logo suelto).
  let usesOgRoute = false;

  if (type === "property" && id) {
    title = "Propiedad en Ilyrox";
    try {
      const prop = await getPropertyById(id);
      if (prop) {
        const lugar =
          prop.municipio || prop.location?.city || prop.estado || "";
        title = `ILYROX - ${prop.subtipo || prop.tipo}${lugar ? ` en ${lugar}` : ""}`;
        description = metaDescription(
          prop.descripcion,
          MAX_META_DESCRIPTION,
          defaultDescription,
        );
      }
    } catch (e) {
      console.error(e);
    }

    // La miniatura SIEMPRE pasa por /api/og. Apuntar directo a `fotos[0]`
    // fallaba de forma intermitente: las fotos importadas de EasyBroker pesan
    // 2-3 MB en PNG, y los crawlers de WhatsApp/Facebook abortan la descarga
    // (o la imagen ni aparece). /api/og la rasteriza a 1200x630 y la cachea.
    imageUrl = `${baseUrl}/api/og?type=property&id=${encodeURIComponent(id)}`;
    usesOgRoute = true;
  } else if (id) {
    // Both Reels and Posts will use the dynamic OG image route
    imageUrl = `${baseUrl}/api/og?type=${type}&id=${encodeURIComponent(id)}`;
    usesOgRoute = true;
    if (type === "post") {
      title = "Publicación en Ilyrox";
      try {
        const post = await getPostById(id);
        if (post) {
          description = metaDescription(
            post.contenido,
            MAX_META_DESCRIPTION,
            defaultDescription,
          );
        }
      } catch (e) {
        console.error(e);
      }
    } else if (type === "reel") {
      title = "Reel en Ilyrox";
      try {
        const reel = await getReelById(id);
        if (reel) {
          description = metaDescription(
            reel.descripcion,
            MAX_META_DESCRIPTION,
            defaultDescription,
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // La URL canónica debe llevar los MISMOS parámetros que se compartieron.
  // Si no, el crawler resuelve `og:url` a una dirección sin sharedBy/sd y el
  // link "canónico" deja de ser el que el usuario mandó.
  const canonicalQuery = new URLSearchParams();
  if (type) canonicalQuery.set("type", type);
  if (id) canonicalQuery.set("id", id);
  if (sharedBy?.trim()) canonicalQuery.set("sharedBy", sharedBy.trim());
  if (sd === "1") canonicalQuery.set("sd", "1");
  const canonicalUrl = `${baseUrl}/?${canonicalQuery.toString()}`;

  // Smart banner de Safari: si la app está instalada la abre, si no lleva al App
  // Store. `app-argument` es la URL que recibe la app al abrirse.
  const appleItunesApp =
    type && id
      ? `app-id=6756507569, app-argument=${canonicalUrl}`
      : `app-id=6756507569`;

  const ogImage = usesOgRoute
    ? {
        url: imageUrl,
        width: OG_WIDTH,
        height: OG_HEIGHT,
        type: "image/png",
        alt: title,
      }
    : { url: imageUrl, alt: title };

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    other: { "apple-itunes-app": appleItunesApp },
    openGraph: {
      title,
      description,
      images: [ogImage],
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

import { IDSearchInput } from "../components/Property/IDSearchInput";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const type = resolvedParams.type as string | undefined;
  const id = resolvedParams.id as string | undefined;
  const sd = resolvedParams.sd as string | undefined;

  const hideData = sd === "1";

  if (!type || !id) {
    return (
      <main className="min-h-screen py-12 px-6 flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-full max-w-2xl text-center py-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <img
                src="/Logo.jpeg"
                alt="Ilyrox Logo"
                className="relative w-28 h-28 rounded-3xl shadow-xl border border-white"
              />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Bienvenido a <span className="text-cyan-600">Ilyrox</span>
          </h1>

          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Explora las mejores propiedades o accede directamente mediante su
            código.
          </p>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/60 max-w-lg mx-auto">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
              Búsqueda Rápida
            </h2>
            <IDSearchInput />
          </div>

          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="h-px w-12 bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
              Propiedades • Reels • Posts
            </span>
            <div className="h-px w-12 bg-gray-200"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-0 flex flex-col items-center">
      <div className="w-full transition-all duration-500 ease-in-out">
        {type === "property" && <PropertyViewer id={id} hideData={hideData} />}
        {type === "reel" && <ReelViewer id={id} hideData={hideData} />}
        {type === "post" && <PostViewer id={id} hideData={hideData} />}
      </div>
    </main>
  );
}
