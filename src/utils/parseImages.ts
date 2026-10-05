/**
 * Normaliza el campo `fotos` / `imagenes` que viene de Supabase.
 *
 * El campo es un array en la mayoría de los registros, pero hay filas donde
 * quedó guardado como JSON string (p.ej. '["https://...","https://..."]') o
 * como CSV. La app móvil ya normaliza esto en `imageParser.ts`; el web no lo
 * hacía, y un string que llega donde se espera un array rompe el `.map()` del
 * carrusel — la imagen simplemente no aparece.
 *
 * Nunca lanza: cualquier forma inesperada devuelve `[]`.
 */
export function parseImages(
  rawFotos: string[] | string | null | undefined,
): string[] {
  if (!rawFotos) return [];

  let list: unknown[];

  if (Array.isArray(rawFotos)) {
    list = rawFotos;
  } else {
    const trimmed = rawFotos.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        list = Array.isArray(parsed) ? parsed : [];
      } catch {
        // No es JSON válido → caemos al formato CSV.
        list = trimmed.includes(",")
          ? trimmed.split(",")
          : [trimmed];
      }
    } else {
      list = trimmed.includes(",") ? trimmed.split(",") : [trimmed];
    }
  }

  return list
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export default parseImages;