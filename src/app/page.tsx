import type { Metadata } from "next";
import { headers } from "next/headers";
import { PropertyViewer } from "../components/Property/PropertyViewer";
import { ReelViewer } from "../components/Reel/ReelViewer";
import { PostViewer } from "../components/Post/PostViewer";
import { getPropertyById } from "../services/propertyService";
import { getReelById } from "../services/reelService";
import { getPostById } from "../services/postService";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const type = resolvedParams.type as string | undefined;
  const id = resolvedParams.id as string | undefined;

  let title = "Ilyrox Web";
  let description = "Encuentra la propiedad de tus sueños en Ilyrox";
  // Try to get base URL from headers for dynamic environments (Vercel previews, etc.)
  const host = (await headers()).get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const baseUrl = host
    ? `${protocol}://${host}`
    : process.env.NEXT_PUBLIC_BASE_URL || "https://feeds.ilyrox.com";

  let imageUrl = `${baseUrl}/Logo.jpeg`; // Fallback URL
  // REV05-35: alto declarado de la imagen (solo se conoce en /api/og: 1200x630).
  let imageHeight: number | undefined;

  const makeAbsolute = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (type === "property" && id) {
    title = "Propiedad en Ilyrox";
    try {
      const prop = await getPropertyById(id);
      if (prop) {
        title = `ILYROX - Propiedad ${prop.tipo}`;
        description = prop.descripcion || description;
        if (prop.fotos && prop.fotos.length > 0) {
          // REV05-35: WhatsApp descarta imagenes pesadas o lentas (la foto original de
          // Tokko/EasyBroker). El optimizador de Next la entrega redimensionada (1200 px,
          // calidad 75) desde nuestro dominio, normalmente por debajo de 300 KB.
          const foto = makeAbsolute(prop.fotos[0]);
          imageUrl = `${baseUrl}/_next/image?url=${encodeURIComponent(foto)}&w=1200&q=75`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  } else if (id) {
    // Both Reels and Posts will use the dynamic OG image route.
    // `&v=2` es un cache-buster: si WhatsApp cacheó "falló" para una versión
    // anterior del OG, este parámetro fuerza al crawler a pedir de cero.
    imageUrl = `${baseUrl}/api/og?type=${type}&id=${id}&v=2`;
    imageHeight = 630;
    if (type === "post") {
      title = "Publicación en Ilyrox";
      try {
        const post = await getPostById(id);
        if (post) {
          description = post.contenido || description;
        }
      } catch (e) {
        console.error(e);
      }
    } else if (type === "reel") {
      title = "Reel en Ilyrox";
      try {
        const reel = await getReelById(id);
        if (reel) {
          description = reel.descripcion || description;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      // REV05-35: solo se declara el tamano cuando se conoce con certeza (/api/og = 1200x630).
      images: imageHeight
        ? [{ url: imageUrl, width: 1200, height: imageHeight }]
        : [imageUrl],
      url: `/?type=${type}&id=${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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
        {type === "reel" && <ReelViewer id={id} />}
        {type === "post" && <PostViewer id={id} />}
      </div>
    </main>
  );
}
