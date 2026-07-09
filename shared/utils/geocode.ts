import { CITY_COORDINATES } from "@/lib/city-coordinates";

interface GeocodeAddressInput {
  street?: string | null;
  city?: string | null;
  state?: string | null;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Deriva latitude/longitude a partir de la dirección de una propiedad, sin
 * requerir que el usuario las ingrese a mano. Intenta geocodificar la
 * dirección completa con Nominatim (OpenStreetMap, gratis, sin API key) y,
 * si no encuentra nada, cae al centro aproximado de la ciudad.
 */
export async function geocodeAddress(
  input: GeocodeAddressInput,
): Promise<Coordinates | null> {
  const query = [input.street, input.city, input.state, "Colombia"]
    .filter(Boolean)
    .join(", ");

  if (query) {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "co");

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent": "zonaraiz.com.co (contacto@zonaraiz.com.co)",
        },
      });

      if (response.ok) {
        const results = (await response.json()) as Array<{
          lat: string;
          lon: string;
        }>;
        const first = results[0];
        if (first) {
          return { latitude: Number(first.lat), longitude: Number(first.lon) };
        }
      }
    } catch {
      // Si falla la geocodificación, seguimos al fallback por ciudad.
    }
  }

  const cityCenter = input.city ? CITY_COORDINATES[input.city] : undefined;
  if (cityCenter) {
    return { latitude: cityCenter.lat, longitude: cityCenter.lng };
  }

  return null;
}

/** true si las coordenadas están ausentes o son el placeholder por defecto (0,0). */
export function needsGeocoding(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  return (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined ||
    (latitude === 0 && longitude === 0)
  );
}
