"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { useRoutes } from "@/i18n/client-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { CITY_COORDINATES } from "@/lib/city-coordinates";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const COLOMBIA_CENTER: [number, number] = [-74.08, 4.61];

// Bounding box amplio de Colombia — descarta coordenadas corruptas/placeholder
// (ej. lat/lng en 0, o invertidas) para que no arruinen el encuadre del mapa.
const COLOMBIA_BOUNDS = { minLat: -5, maxLat: 13, minLng: -80, maxLng: -66 };

// Formatea el precio para el pin del mapa siguiendo la convención local
// ("720 millones", "1.680 millones") en vez de cortarlo con un "k" que no
// tiene sentido a la escala de precios en COP.
function formatPinPrice(price: number, currency: string): string {
  if (price >= 1_000_000) {
    const millions = Math.round(price / 1_000_000);
    return `${currency} ${millions.toLocaleString("es-CO")}M`;
  }
  return `${currency} ${price.toLocaleString("es-CO")}`;
}

function isPlausible(lat: number, lng: number): boolean {
  return (
    lat >= COLOMBIA_BOUNDS.minLat &&
    lat <= COLOMBIA_BOUNDS.maxLat &&
    lng >= COLOMBIA_BOUNDS.minLng &&
    lng <= COLOMBIA_BOUNDS.maxLng
  );
}

// Hash simple y determinístico para desplazar levemente (jitter) los pines
// que caen en el mismo centro de ciudad, así no quedan apilados uno sobre otro.
function hashOffset(id: string, salt: number): number {
  let hash = salt;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * 0.03 - 0.015; // ±0.015° (~1.5km)
}

/**
 * Resuelve la posición a usar para un listing en el mapa:
 * 1. lat/lng propios de la propiedad, si son plausibles (dentro de Colombia).
 * 2. Centro aproximado de la ciudad (con jitter), si la propiedad no tiene
 *    coordenadas propias pero sí ciudad reconocida.
 * 3. null si no hay forma de ubicarlo.
 */
function resolveListingCoords(
  listing: ListingEntity,
): { lat: number; lng: number } | null {
  const { latitude, longitude, city } = listing.property;

  if (latitude !== null && longitude !== null && isPlausible(latitude, longitude)) {
    return { lat: latitude, lng: longitude };
  }

  const cityCenter = city ? CITY_COORDINATES[city] : undefined;
  if (cityCenter) {
    return {
      lat: cityCenter.lat + hashOffset(listing.id, 1),
      lng: cityCenter.lng + hashOffset(listing.id, 7),
    };
  }

  return null;
}

export interface MapBounds {
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
}

interface PropertyMapProps {
  listings: ListingEntity[];
  onSearchThisArea?: (bounds: MapBounds) => void;
  className?: string;
}

function buildPopupContent(
  listing: ListingEntity,
  href: string,
): HTMLElement {
  const wrapper = document.createElement("a");
  wrapper.href = href;
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.gap = "2px";
  wrapper.style.textDecoration = "none";
  wrapper.style.color = "inherit";
  wrapper.style.minWidth = "160px";

  const image = listing.property.property_images?.[0]?.public_url;
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = listing.property.title;
    img.style.width = "100%";
    img.style.height = "100px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.marginBottom = "6px";
    wrapper.appendChild(img);
  }

  const title = document.createElement("p");
  title.textContent = listing.property.title;
  title.style.fontWeight = "600";
  title.style.fontSize = "13px";
  title.style.margin = "0";
  title.style.overflow = "hidden";
  title.style.textOverflow = "ellipsis";
  title.style.whiteSpace = "nowrap";
  wrapper.appendChild(title);

  const price = document.createElement("p");
  price.textContent = `${listing.currency} ${listing.price.toLocaleString("es-ES")}`;
  price.style.fontSize = "13px";
  price.style.fontWeight = "700";
  price.style.margin = "0";
  wrapper.appendChild(price);

  return wrapper;
}

export function PropertyMap({
  listings,
  onSearchThisArea,
  className,
}: PropertyMapProps) {
  const { t } = useTranslation("listings");
  const routes = useRoutes();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const withCoords = listings
    .map((listing) => ({ listing, coords: resolveListingCoords(listing) }))
    .filter(
      (item): item is { listing: ListingEntity; coords: { lat: number; lng: number } } =>
        item.coords !== null,
    );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: COLOMBIA_CENTER,
        zoom: 5,
        attributionControl: false,
      });
    } catch (err) {
      console.error("MapLibre init error:", err);
      queueMicrotask(() => setMapError(true));
      return;
    }

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.on("dragend", () => setShowSearchButton(true));
    map.on("zoomend", () => setShowSearchButton(true));
    map.on("load", () => setReady(true));
    map.on("error", (e) => {
      // Errores de tiles individuales son comunes/recuperables — solo se
      // loguean. El banner visible queda para la falla fatal (WebGL, etc.)
      console.error("MapLibre error:", e.error);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Mantiene el canvas del mapa correctamente dimensionado cuando el
  // contenedor pasa de oculto (display:none, ej. toggle en mobile) a visible.
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    setShowSearchButton(false);

    if (withCoords.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    withCoords.forEach(({ listing, coords }) => {
      const { lat: latitude, lng: longitude } = coords;

      const el = document.createElement("div");
      el.style.background = "var(--primary)";
      el.style.color = "var(--primary-foreground)";
      el.style.padding = "4px 10px";
      el.style.borderRadius = "999px";
      el.style.fontSize = "12px";
      el.style.fontWeight = "700";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
      el.style.cursor = "pointer";
      el.style.whiteSpace = "nowrap";
      el.textContent = formatPinPrice(listing.price, listing.currency);

      const href = routes.listings_public(listing.property.slug);
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([longitude, latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setDOMContent(
            buildPopupContent(listing, href),
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([longitude, latitude]);
    });

    if (!bounds.isEmpty()) {
      if (withCoords.length === 1) {
        map.flyTo({ center: bounds.getCenter(), zoom: 14, duration: 500 });
      } else {
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, listings]);

  const handleSearchThisArea = () => {
    const map = mapRef.current;
    if (!map || !onSearchThisArea) return;
    const b = map.getBounds();
    onSearchThisArea({
      min_lat: b.getSouth(),
      max_lat: b.getNorth(),
      min_lng: b.getWest(),
      max_lng: b.getEast(),
    });
    setShowSearchButton(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />

      {showSearchButton && onSearchThisArea && (
        <Button
          onClick={handleSearchThisArea}
          size="sm"
          className="absolute top-4 left-1/2 -translate-x-1/2 shadow-lg rounded-full"
        >
          <IconSearch className="size-4" />
          {t("map.search_this_area")}
        </Button>
      )}

      {ready && withCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground text-center px-4">
          {t("map.no_coordinates")}
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background text-sm text-muted-foreground text-center px-4">
          {t("map.load_error")}
        </div>
      )}
    </div>
  );
}
