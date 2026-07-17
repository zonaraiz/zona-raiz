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

// Recorte del corredor andino/caribe donde vive la gran mayoría de los
// listings — un bbox de todo el país (incluida la Amazonía) dejaría las
// burbujas apretadas en una esquina. No es una proyección cartográfica
// real, solo un mapeo lineal lat/lng -> % pensado para verse bien acá.
const PROJECTION_BOUNDS = { minLat: 1, maxLat: 11.5, minLng: -77.5, maxLng: -71.5 };

// Silueta simplificada de la costa/frontera colombiana recortada a
// PROJECTION_BOUNDS — no es geográficamente exacta, solo lo bastante
// reconocible (golfo de Urabá, costa Caribe, frontera oriental) para que
// el widget se lea como "mapa de Colombia" y no como puntos flotando.
const COLOMBIA_OUTLINE: [number, number][] = [
  [8.6, -77.3],
  [8.9, -76.8],
  [9.3, -76.2],
  [9.9, -75.9],
  [10.4, -75.5],
  [10.6, -75.0],
  [11.0, -74.8],
  [11.2, -74.3],
  [11.5, -73.8],
  [11.5, -72.8],
  [11.3, -72.5],
  [10.5, -72.8],
  [9.5, -72.9],
  [8.2, -72.5],
  [7.0, -71.6],
  [4.0, -71.5],
  [1.0, -71.5],
  [1.0, -75.0],
  [1.3, -77.3],
  [1.5, -77.5],
  [3.9, -77.5],
  [5.5, -77.4],
  [6.8, -77.3],
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
      <div className="relative w-full lg:w-3/5 aspect-[6/10.5] lg:self-start">
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
