"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useRoutes, buildSearchUrl } from "@/i18n/client-router";
import { Lang } from "@/i18n/settings";
import { LandingCity } from "@/domain/types/landing.types";
import { PlaceSearch, ParsedPlace } from "@/features/places/place-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyType } from "@/domain/entities/property.enums";
import { ListingType } from "@/domain/entities/listing.enums";
import { PROPERTY_TYPES, LISTING_TYPES } from "@/config/listing-selectors";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IconSearch, IconHome, IconMapPin, IconShieldCheck } from "@tabler/icons-react";
import { CtaButton } from "./button-cta";
import { LandingStats } from "@/domain/types/landing.types";
import { LandingCityMap } from "./landing-city-map";

interface LandingHeroProps {
  cities?: LandingCity[];
  lang?: Lang;
  stats?: LandingStats;
}

// Foto curada por el cliente para el fondo del hero — se prefiere sobre
// fotos de listings reales porque esas varían mucho en calidad/encuadre.
const HERO_IMAGE = "/images/hero-living-room.jpg";

export function LandingHero({ lang = "es", stats, cities = [] }: LandingHeroProps) {
  const { t } = useTranslation("landing");
  const router = useRouter();
  const routes = useRoutes();

  const [listingType, setListingType] = useState<ListingType>(ListingType.RENT);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [place, setPlace] = useState<ParsedPlace | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const trustStats = [
    {
      icon: IconHome,
      value: stats ? `+${new Intl.NumberFormat("es-CO").format(stats.totalListings)}` : undefined,
      title: t("hero.stats.listings.title"),
      caption: t("hero.stats.listings.caption"),
    },
    {
      icon: IconMapPin,
      title: t("hero.stats.coverage.title"),
      caption: t("hero.stats.coverage.caption"),
    },
    {
      icon: IconShieldCheck,
      title: t("hero.stats.security.title"),
      caption: t("hero.stats.security.caption"),
    },
  ];

  const handleSearch = () => {
    setIsSearching(true);

    const url = buildSearchUrl({
      lang,
      listing_type: listingType,
      type: propertyType ?? undefined,
      city: place?.city,
      neighborhood: place?.neighborhood,
    });

    router.push(url);
  };

  return (
    <section className="relative w-full min-h-screen pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#040a18]">
        <Image
          src={HERO_IMAGE}
          alt="Propiedad publicada en Zonaraíz"
          fill
          className="object-cover opacity-60"
          priority
        />
        {/* Overlay navy de marca para que el hero se sienta oscuro/premium, no un collage de fotos */}
        <div className="absolute inset-0 bg-linear-to-r from-[#040a18]/95 via-[#040a18]/70 to-[#040a18]/50 lg:via-[#040a18]/55 lg:to-[#040a18]/30" />
        <div className="absolute inset-0 bg-linear-to-t from-[#040a18]/90 via-[#040a18]/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-64px)] flex flex-col justify-center py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 lg:gap-8 lg:items-stretch">
          {/* Columna izquierda: texto, tarjetas de confianza, buscador */}
          <div className="flex flex-col gap-4 lg:gap-5 min-w-0">
            {/* Texto hero */}
            <div
              className="max-w-xl"
              style={{ animation: "fadeSlideUp 0.6s ease both" }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-3 lg:mb-4">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span className="text-white/90 text-xs font-medium tracking-wide">
                  {t("hero.badge")}
                </span>
              </div>

              <h1
                className="text-white font-bold leading-none mb-2 lg:mb-3"
                style={{
                  fontSize: "clamp(1.6rem, 4.2vw, 3.1rem)",
                  animation: "fadeSlideUp 0.7s ease 0.1s both",
                }}
              >
                {t("hero.title_line1")}
                <br />
                <span className="bg-linear-to-r from-[#00d6be] to-[#008bba] bg-clip-text text-transparent">
                  {t("hero.title_highlight")}
                </span>
              </h1>

              <p
                className="text-white/80 text-base sm:text-xl font-semibold max-w-sm leading-relaxed"
                style={{ animation: "fadeSlideUp 0.7s ease 0.2s both" }}
              >
                {t("hero.subtitle_v2")}
              </p>
            </div>

            {/* Tarjetas de confianza */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              style={{ animation: "fadeSlideUp 0.75s ease 0.15s both" }}
            >
              {trustStats.map(({ icon: Icon, value, title, caption }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm px-3.5 py-2.5"
                >
                  <span className="shrink-0 size-9 rounded-xl bg-[#00d6be]/15 text-[#00d6be] flex items-center justify-center">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    {value && (
                      <p className="text-white font-bold leading-tight">{value}</p>
                    )}
                    <p className="text-white text-sm font-semibold leading-tight">
                      {title}
                    </p>
                    <p className="text-white/60 text-xs leading-tight mt-0.5">
                      {caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search bar — siempre en apariencia clara, sin importar el tema del sitio */}
            <div
              className="theme-light w-full"
              style={{ animation: "fadeSlideUp 0.8s ease 0.2s both" }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                {/* Listing type tabs */}
                <div className="flex bg-black/30 backdrop-blur-sm p-1.5 gap-1">
                  {LISTING_TYPES.map((lt) => (
                    <button
                      key={lt.value}
                      type="button"
                      onClick={() => setListingType(lt.value)}
                      className={cn(
                        "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
                        listingType === lt.value
                          ? "bg-white text-foreground shadow-sm"
                          : "text-white/80 hover:text-white",
                      )}
                    >
                      {t(lt.label)}
                    </button>
                  ))}
                </div>

                {/* Search row */}
                <div className="bg-white flex flex-col sm:flex-row items-stretch gap-2 p-2">
                  <Select
                    value={propertyType ?? undefined}
                    onValueChange={(value) => setPropertyType(value as PropertyType)}
                  >
                    <SelectTrigger className="sm:w-44 border-0 shadow-none focus-visible:ring-0">
                      <SelectValue placeholder={t("hero.property_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {t(label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="hidden sm:block w-px bg-border" />

                  <PlaceSearch
                    lang={lang}
                    navigate={false}
                    placeholder={t("hero.location_placeholder")}
                    onSelect={(p) => setPlace(p)}
                    className="flex-1"
                    commandClassName="border-0 shadow-none rounded-none"
                  />

                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={isSearching}
                    aria-label={t("hero.search_btn")}
                    className="shrink-0 self-center sm:self-auto size-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isSearching ? (
                      <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <IconSearch className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              <CtaButton
                href={routes.search()}
                className="w-full sm:w-auto justify-center mt-4"
                text={t("hero.see_all")}
              />
            </div>
          </div>

          {/* Columna derecha: mapa de ciudades — alineado arriba, alto propio (aspect-ratio) */}
          {cities.length > 0 && (
            <div className="w-full lg:self-start">
              <LandingCityMap cities={cities} />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
