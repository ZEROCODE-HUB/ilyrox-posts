import { supabase } from "../lib/supabase";
import type { Property } from "../components/types";

export const getPropertyById = async (id: string): Promise<Property | null> => {
  // 1. Intentar por UUID (caso más común en links compartidos desde la app)
  const { data: byId, error: errorById } = await supabase
    .from("propiedades")
    .select("*, operaciones_propiedad(*), perfiles!propiedades_creado_por_fkey(id, nombre, foto, ocupacion, estado, apellido_paterno)")
    .eq("id", id)
    .single();

  if (!errorById && byId) return byId as Property;

  // 2. Fallback por codigo_propiedad (compatibilidad con códigos legibles)
  const { data: byCode, error: errorByCode } = await supabase
    .from("propiedades")
    .select("*, operaciones_propiedad(*), perfiles!propiedades_creado_por_fkey(id, nombre, foto, ocupacion, estado, apellido_paterno)")
    .eq("codigo_propiedad", id)
    .single();

  if (errorByCode) {
    console.error("[propertyService] Error fetching property:", errorByCode);
    return null;
  }

  return byCode as Property;
};

export const getAmenitiesByPropertyId = async (propertyId: string) => {
  const { data, error } = await supabase
    .from("propiedad_amenidades")
    .select("*, catalogo_amenidades(*)")
    .eq("propiedad_id", propertyId);

  if (error) {
    console.error("Error fetching amenities:", error);
    return [];
  }

  return data;
};
