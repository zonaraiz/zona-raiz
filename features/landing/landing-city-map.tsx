"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { buildSearchUrl } from "@/i18n/client-router";
import { Lang } from "@/i18n/settings";
import { LandingCity } from "@/domain/types/landing.types";
import { CITY_COORDINATES } from "@/lib/city-coordinates";
import { IconMapPin } from "@tabler/icons-react";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const COLOMBIA_CENTER: [number, number] = [-74.3, 4.3];
const MAX_MAP_CITIES = 8;
const MAX_LIST_CITIES = 7;

interface LandingCityMapProps {
  cities: LandingCity[];
}

export function LandingCityMap({ cities }: LandingCityMapProps) {
  const { t } = useTranslation("landing");
  const router = useRouter();
  const params = useParams();
  const lang: Lang = params.lang === "en" ? "en" : "es";

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapError, setMapError] = useState(false);

  const ranked = [...cities].sort((a, b) => b.count - a.count);
  const withCoords = ranked
    .filter((city) => CITY_COORDINATES[city.slug])
    .slice(0, MAX_MAP_CITIES);
  const listCities = ranked.slice(0, MAX_LIST_CITIES);
  const maxCount = withCoords[0]?.count ?? 1;

  const goToCity = (slug: string) => {
    router.push(buildSearchUrl({ lang, city: slug }));
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: COLOMBIA_CENTER,
        zoom: 4.6,
        attributionControl: false,
        interactive: true,
      });
    } catch (err) {
      console.error("MapLibre init error:", err);
      queueMicrotask(() => setMapError(true));
      return;
    }

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    map.scrollZoom.disable();

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      withCoords.forEach((city) => {
        const coords = CITY_COORDINATES[city.slug];
        if (!coords) return;

        const size = 32 + Math.round((city.count / maxCount) * 40);

        const el = document.createElement("div");
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = "9999px";
        el.style.background = "#00d6be";
        el.style.color = "#040a18";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontWeight = "700";
        el.style.fontSize = size > 50 ? "14px" : "12px";
        el.style.boxShadow = "0 0 0 4px rgba(0,214,190,0.2)";
        el.style.cursor = "pointer";
        el.textContent = String(city.count);
        el.title = city.name;
        el.addEventListener("click", () => goToCity(city.slug));

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([coords.lng, coords.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once("load", addMarkers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#040a18] shadow-2xl h-full flex flex-col lg:flex-row">
      <div className="relative w-full lg:w-3/5 h-64 lg:h-auto min-h-64">
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{ filter: "invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(0.9)" }}
        />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#040a18] text-sm text-white/60 text-center px-4">
            {t("hero.map.load_error")}
          </div>
        )}
        <button
          type="button"
          onClick={() => router.push(buildSearchUrl({ lang }))}
          className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-[#040a18]/90 backdrop-blur-sm border border-white/15 text-white text-xs font-medium px-3 py-2 hover:bg-[#040a18] transition-colors"
        >
          <IconMapPin className="size-3.5" />
          {t("hero.map.view_on_map")}
        </button>
      </div>

      <div className="w-full lg:w-2/5 p-4 flex flex-col">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
          {t("hero.map.by_city")}
        </p>
        <ul className="flex-1 divide-y divide-white/10">
          {listCities.map((city) => (
            <li key={city.slug}>
              <button
                type="button"
                onClick={() => goToCity(city.slug)}
                className="w-full flex items-center justify-between py-2 text-sm hover:text-[#00d6be] transition-colors"
              >
                <span className="text-white/90">{city.name}</span>
                <span className="text-[#00d6be] font-semibold tabular-nums">
                  {city.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
