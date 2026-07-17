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

// Bbox del país completo, calculado a partir del contorno real (con
// margen). Un recorte al corredor andino se veía irreconocible, como
// una tira sin forma — con el país completo (Guajira arriba, cola del
// Amazonas abajo) sí se lee como "Colombia", aunque las burbujas queden
// concentradas en la zona centro-occidental (donde vive casi toda la
// población real).
const PROJECTION_BOUNDS = { minLat: -4.6, maxLat: 12.7, minLng: -79.3, maxLng: -66.6 };

// Contorno real del país: disuelto de los 33 departamentos (shapefile
// de Maurix Suárez, vía github.com/john-guerra/43c7656821069d00dcbc)
// con mapshaper (-dissolve -simplify 0.3%), quedándonos solo con el
// anillo exterior del continente (se descartan las islas menores).
const COLOMBIA_OUTLINE: [number, number][] = [
  [8.27, -77.0], [8.27, -77.02], [8.65, -77.39], [8.51, -77.47], [8.19, -77.28],
  [7.89, -77.22], [7.52, -77.59], [7.47, -77.83], [7.25, -77.92], [6.87, -77.69],
  [6.57, -77.35], [6.23, -77.5], [5.79, -77.28], [5.51, -77.48], [4.7, -77.35],
  [4.19, -77.41], [3.82, -77.17], [3.25, -77.52], [2.85, -77.77], [2.66, -78.03],
  [2.48, -78.61], [2.15, -78.71], [1.79, -78.62], [1.83, -78.92], [1.59, -79.06],
  [1.27, -78.69], [0.81, -78.02], [0.84, -77.71], [0.35, -77.44], [0.36, -77.12],
  [0.24, -76.9], [0.25, -76.45], [0.42, -76.34], [0.3, -76.04], [0.06, -75.85],
  [-0.26, -74.77], [-0.59, -74.41], [-1.02, -74.29], [-1.29, -73.71], [-1.54, -73.52],
  [-1.78, -73.55], [-1.95, -73.12], [-2.39, -73.11], [-2.5, -72.9], [-2.43, -72.65],
  [-2.47, -72.17], [-2.17, -71.74], [-2.4, -71.39], [-2.28, -70.85], [-2.8, -70.08],
  [-3.84, -70.71], [-3.86, -70.23], [-4.25, -69.95], [-3.11, -69.74], [-1.36, -69.41],
  [-1.11, -69.44], [-0.78, -69.63], [-0.53, -69.63], [-0.15, -70.07], [0.49, -70.05],
  [0.68, -69.49], [0.6, -69.22], [0.98, -69.24], [1.04, -69.85], [1.67, -69.86],
  [1.69, -69.41], [1.65, -68.19], [1.68, -67.93], [2.07, -67.51], [1.96, -67.37],
  [1.36, -67.1], [1.26, -66.88], [2.2, -67.24], [2.72, -67.6], [2.79, -67.86],
  [3.27, -67.35], [3.71, -67.51], [3.86, -67.69], [3.97, -67.73], [4.55, -67.92],
  [5.33, -67.85], [5.44, -67.68], [5.75, -67.64], [5.99, -67.46], [6.26, -67.59],
  [6.28, -67.8], [6.17, -68.0], [6.1, -68.7], [6.18, -69.14], [6.07, -69.45],
  [6.96, -70.14], [6.92, -70.36], [7.06, -70.7], [6.96, -71.04], [7.04, -71.79],
  [6.95, -71.99], [7.02, -72.1], [7.38, -72.27], [7.48, -72.51], [8.33, -72.43],
  [8.59, -72.69], [9.07, -72.81], [9.13, -73.02], [9.14, -73.38], [9.75, -73.03],
  [10.25, -72.94], [10.41, -72.83], [11.08, -72.5], [11.14, -72.25], [11.65, -71.98],
  [11.79, -71.42], [12.04, -71.2], [12.3, -71.31], [12.42, -71.62], [12.21, -72.21],
  [11.88, -72.3], [11.69, -72.76], [11.26, -73.37], [11.25, -73.61], [11.33, -74.09],
  [10.97, -74.32], [11.07, -74.85], [10.78, -75.26], [10.56, -75.52], [10.08, -75.58],
  [9.39, -75.69], [9.42, -75.82], [9.35, -76.07], [8.88, -76.45], [8.63, -76.89],
  [8.36, -76.77], [8.27, -77.0],
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
      <div className="relative w-full lg:w-2/3 aspect-[127/173] lg:self-start">
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

      <div className="w-full lg:w-1/3 p-3 flex flex-col overflow-hidden">
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
