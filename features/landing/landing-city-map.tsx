"use client";

import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { buildSearchUrl } from "@/i18n/client-router";
import { Lang } from "@/i18n/settings";
import { LandingCity } from "@/domain/types/landing.types";
import { CITY_COORDINATES } from "@/lib/city-coordinates";
import { IconMapPin } from "@tabler/icons-react";

const MAX_MAP_CITIES = 8;
const MAX_LIST_CITIES = 7;

// Bbox del país completo (con margen) — un recorte más ajustado al
// corredor andino se veía irreconocible, como una tira sin forma. Con el
// país completo la silueta (Guajira arriba, cola del Amazonas abajo) sí
// se lee como "Colombia", aunque las burbujas queden concentradas en la
// zona centro-occidental (donde de hecho vive casi toda la población).
const PROJECTION_BOUNDS = { minLat: -4.5, maxLat: 12.7, minLng: -79, maxLng: -66.5 };

// Silueta simplificada de la costa/frontera colombiana — no es
// geográficamente exacta, solo lo bastante reconocible (península de
// la Guajira, golfo de Urabá, costa Pacífica, cola del Amazonas hasta
// Leticia, frontera oriental) para que el widget se lea como "mapa de
// Colombia" y no como una forma genérica.
const COLOMBIA_OUTLINE: [number, number][] = [
  [12.4, -71.7],
  [11.9, -72.9],
  [11.2, -74.2],
  [11.0, -74.8],
  [10.4, -75.5],
  [9.6, -75.7],
  [9.3, -76.3],
  [8.6, -76.9],
  [8.0, -77.3],
  [7.2, -77.5],
  [6.0, -77.4],
  [4.4, -77.5],
  [3.0, -77.6],
  [1.6, -78.8],
  [1.4, -77.0],
  [0.5, -75.2],
  [-1.0, -74.0],
  [-4.2, -70.0],
  [-4.0, -69.4],
  [-1.5, -69.6],
  [1.0, -69.9],
  [2.8, -67.9],
  [4.0, -67.5],
  [5.5, -67.9],
  [6.2, -67.5],
  [6.9, -68.0],
  [7.0, -70.7],
  [7.8, -72.4],
  [8.3, -72.6],
  [10.0, -72.7],
  [11.0, -72.7],
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function project(lat: number, lng: number) {
  const { minLat, maxLat, minLng, maxLng } = PROJECTION_BOUNDS;
  const left = ((lng - minLng) / (maxLng - minLng)) * 100;
  const top = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return { left, top };
}

const OUTLINE_POINTS = COLOMBIA_OUTLINE.map(([lat, lng]) => {
  const { left, top } = project(lat, lng);
  return `${left},${top}`;
}).join(" ");

interface LandingCityMapProps {
  cities: LandingCity[];
}

export function LandingCityMap({ cities }: LandingCityMapProps) {
  const { t } = useTranslation("landing");
  const router = useRouter();
  const params = useParams();
  const lang: Lang = params.lang === "en" ? "en" : "es";

  const ranked = [...cities].sort((a, b) => b.count - a.count);
  const withCoords = ranked
    .filter((city) => CITY_COORDINATES[city.slug])
    .slice(0, MAX_MAP_CITIES);
  const listCities = ranked.slice(0, MAX_LIST_CITIES);
  const maxCount = withCoords[0]?.count ?? 1;

  const goToCity = (slug: string) => {
    router.push(buildSearchUrl({ lang, city: slug }));
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#040a18] shadow-2xl flex flex-col lg:flex-row">
      {/* aspect-ratio calcado de PROJECTION_BOUNDS (lngRange/latRange) para
          que la silueta no se estire — si esto no coincide con el bbox,
          el mapa se ve como una tira angosta en vez de Colombia. */}
      <div className="relative w-full lg:w-3/5 aspect-[125/172] lg:self-start">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon
            points={OUTLINE_POINTS}
            fill="rgba(0,214,190,0.14)"
            stroke="rgba(0,214,190,0.45)"
            strokeWidth={0.6}
          />
        </svg>

        {withCoords.map((city) => {
          const coords = CITY_COORDINATES[city.slug];
          if (!coords) return null;
          const pos = project(coords.lat, coords.lng);
          const left = clamp(pos.left, 6, 94);
          const top = clamp(pos.top, 8, 92);
          const size = 24 + Math.round((city.count / maxCount) * 26);

          return (
            <button
              key={city.slug}
              type="button"
              onClick={() => goToCity(city.slug)}
              title={city.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00d6be] text-[#040a18] font-bold flex items-center justify-center shadow-[0_0_0_4px_rgba(0,214,190,0.18)] hover:scale-105 transition-transform cursor-pointer"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                fontSize: size > 40 ? 12 : 10,
              }}
            >
              {city.count}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => router.push(buildSearchUrl({ lang }))}
          className="absolute left-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#040a18]/90 backdrop-blur-sm border border-white/15 text-white text-xs font-medium px-3 py-1.5 hover:bg-[#040a18] transition-colors"
        >
          <IconMapPin className="size-3.5" />
          {t("hero.map.view_on_map")}
        </button>
      </div>

      <div className="w-full lg:w-2/5 p-3 flex flex-col overflow-hidden">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5">
          {t("hero.map.by_city")}
        </p>
        <ul className="flex-1 divide-y divide-white/10 overflow-y-auto">
          {listCities.map((city) => (
            <li key={city.slug}>
              <button
                type="button"
                onClick={() => goToCity(city.slug)}
                className="w-full flex items-center justify-between py-1.5 text-sm hover:text-[#00d6be] transition-colors"
              >
                <span className="text-white/90 truncate">{city.name}</span>
                <span className="text-[#00d6be] font-semibold tabular-nums shrink-0 ml-2">
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
