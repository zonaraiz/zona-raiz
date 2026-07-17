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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function project(lat: number, lng: number) {
  const { minLat, maxLat, minLng, maxLng } = PROJECTION_BOUNDS;
  const left = ((lng - minLng) / (maxLng - minLng)) * 100;
  const top = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return { left: clamp(left, 6, 94), top: clamp(top, 8, 92) };
}

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
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#040a18] shadow-2xl h-full flex flex-col lg:flex-row">
      <div
        className="relative w-full lg:w-3/5 h-56 lg:h-auto"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 25%, rgba(0,214,190,0.14), transparent 60%), radial-gradient(circle at 80% 75%, rgba(0,139,186,0.12), transparent 55%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        {withCoords.map((city) => {
          const coords = CITY_COORDINATES[city.slug];
          if (!coords) return null;
          const pos = project(coords.lat, coords.lng);
          const size = 28 + Math.round((city.count / maxCount) * 34);

          return (
            <button
              key={city.slug}
              type="button"
              onClick={() => goToCity(city.slug)}
              title={city.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00d6be] text-[#040a18] font-bold flex items-center justify-center shadow-[0_0_0_4px_rgba(0,214,190,0.18)] hover:scale-105 transition-transform cursor-pointer"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                width: size,
                height: size,
                fontSize: size > 46 ? 13 : 11,
              }}
            >
              {city.count}
            </button>
          );
        })}

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
