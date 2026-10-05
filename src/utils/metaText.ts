/**
 * Helpers para los textos que van a los meta tags (og:description,
 * twitter:description) y a las tarjetas OG generadas en /api/og.
 *
 * Las descripciones se guardan como texto plano con saltos de línea (vienen de
 * un `AppInput multiline` en la app), y pueden traer HTML si el texto se copió
 * desde un CMS como EasyBroker. Para las previews necesitamos una sola línea
 * limpia: sin etiquetas, sin saltos, sin doble espacio y acotada.
 */

/** Entidades HTML más comunes, por si el texto llegó escapado o con HTML. */
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&aacute;": "á",
  "&eacute;": "é",
  "&iacute;": "í",
  "&oacute;": "ó",
  "&uacute;": "ú",
  "&ntilde;": "ñ",
  "&Aacute;": "Á",
  "&Eacute;": "É",
  "&Iacute;": "Í",
  "&Oacute;": "Ó",
  "&Uacute;": "Ú",
  "&Ntilde;": "Ñ",
};

/**
 * Quita etiquetas HTML, `<br>` y `<p>` para que quede el texto legible.
 * Nunca deja el texto vacío si la entrada tenía contenido visible.
 */
export function stripHtml(input: string): string {
  if (!input) return "";

  let out = input
    // Saltos de línea como HTML → espacio (se compactan en el paso siguiente).
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, " ")
    // Cualquier otra etiqueta.
    .replace(/<[^>]*>/g, "");

  out = out.replace(
    /&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g,
    (match) => ENTITIES[match] ?? " ",
  );

  return out;
}

/**
 * Deja el texto en una sola línea limpia: sin HTML, sin saltos, sin espacios
 * repetidos ni bordes. Ideal para og:description.
 */
export function plainText(input?: string | null): string {
  if (!input) return "";

  return stripHtml(String(input))
    // \r\n y cualquier espacio en blanco (incluidos los unicode) → un espacio.
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Recorta en un límite de palabra para no partir "habitacion**es**" a la mitad.
 * Si el texto ya cabe, se devuelve tal cual (sin puntos suspensivos de más).
 */
export function truncate(
  text: string,
  maxLength: number,
  ellipsis = "…",
): string {
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;

  // Cortar en maxLength y retroceder hasta el último espacio.
  const slice = clean.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");

  // Si no hay espacio (una sola palabra muy larga), cortamos duro.
  const base = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${base.replace(/[\s,;:.\-–—]+$/, "")}${ellipsis}`;
}

/**
 * Atajo usado por `generateMetadata`: texto de una línea, acotado y con
 * respaldo. Devuelve `fallback` si el input queda vacío tras limpiar.
 */
export function metaDescription(
  input: string | null | undefined,
  maxLength = 180,
  fallback = "",
): string {
  const clean = plainText(input);
  if (!clean) return fallback;
  return truncate(clean, maxLength);
}