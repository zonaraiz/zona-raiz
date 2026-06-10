"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import { buildSearchUrl, useRoutes } from "@/i18n/client-router";
import { Button } from "@/components/ui/button";
import { LandingCity } from "@/domain/types/landing.types";

interface LandingCitiesProps {
  cities: LandingCity[];
}

export function LandingCities({ cities }: LandingCitiesProps) {
  const { t } = useTranslation("landing");
  const router = useRouter();
  const params = useParams();
  const routes = useRoutes();
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const lang = typeof params.lang === "string" ? params.lang : "es";

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2
              className="text-neutral-900"
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(24px, 3vw, 32px)",
                fontWeight: 400,
              }}
            >
              {t("cities.title")}
            </h2>
            <p className="text-[13px] text-neutral-400 mt-1">
              {t("cities.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-neutral-200 text-neutral-700 hover:bg-white text-[13px] font-semibold px-5 h-9 transition-all duration-200 hover:scale-105 cursor-pointer"
            onClick={() => router.push(routes.search())}
          >
            {t("cities.explore")} →
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cities.slice(0, 4).map((city) => (
            <div
              key={city.slug}
              className="cursor-pointer group"
              onClick={() =>
                router.push(
                  buildSearchUrl({
                    lang,
                    city: city.slug,
                  }),
                )
              }
              onMouseEnter={() => setHoveredCity(city.slug)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              <div
                className={`overflow-hidden rounded-3xl border border-white/80 bg-white shadow-md transition-all duration-300 ${
                  hoveredCity === city.slug
                    ? "scale-[1.03] shadow-xl ring-2 ring-primary/30"
                    : "group-hover:shadow-lg group-hover:-translate-y-1"
                }`}
              >
                <img
                  src={
                    city.image?.startsWith("http")
                      ? city.image
                      : `https://images.unsplash.com/${city.image}?w=700&q=80`
                  }
                  alt={city.name}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="px-4 py-4">
                  <p className="text-[18px] font-bold text-neutral-800 leading-tight">
                    {city.name}
                  </p>
                  <p className="text-[12px] text-neutral-400 mt-1">
                    {city.count} {t("cities.listings")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
