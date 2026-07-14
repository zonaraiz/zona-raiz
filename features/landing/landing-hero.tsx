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
import { IconSearch } from "@tabler/icons-react";
import { CtaButton } from "./button-cta";
import { ListingEntity } from "@/domain/entities/listing.entity";

interface LandingHeroProps {
  cities?: LandingCity[];
  lang?: Lang;
  listings?: ListingEntity[];
}

const HERO_MOSAIC_SIZE = 6;

export function LandingHero({ lang = "es", listings = [] }: LandingHeroProps) {
  const { t } = useTranslation("landing");
  const router = useRouter();
  const routes = useRoutes();

  const [listingType, setListingType] = useState<ListingType>(ListingType.RENT);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [place, setPlace] = useState<ParsedPlace | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Mosaico de fotos reales de propiedades en vez de una foto de stock —
  // si faltan fotos, repite las que hay; solo cae a la de stock si no hay
  // ninguna disponible.
  const propertyImages = listings
    .map((listing) => listing.property.property_images?.[0]?.public_url)
    .filter((url): url is string => Boolean(url));

  const mosaicImages =
    propertyImages.length > 0
      ? Array.from(
          { length: HERO_MOSAIC_SIZE },
          (_, i) => propertyImages[i % propertyImages.length],
        )
      : null;

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
      <div className="absolute inset-0">
        {mosaicImages ? (
          <div className="grid grid-cols-3 grid-rows-2 w-full h-full gap-0.5">
            {mosaicImages.map((src, i) => (
              <div key={i} className="relative w-full h-full">
                <Image
                  src={src}
                  alt="Propiedad publicada en Zonaraíz"
                  fill
                  sizes="34vw"
                  className="object-cover"
                  priority={i < 3}
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src="/images/hero.jpeg"
            alt="Hero property"
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Overlay más oscuro en mobile para que el texto sea legible */}
        <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/35 to-black/25 lg:from-black/20 lg:via-black/25 lg:to-black/10" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-black/10 lg:from-black/20 lg:via-black/20 lg:to-black/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-64px)] flex flex-col justify-center gap-10 py-16">
        {/* Texto hero */}
        <div
          className="max-w-xl"
          style={{ animation: "fadeSlideUp 0.6s ease both" }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4 lg:mb-6">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white/90 text-xs font-medium tracking-wide">
              {t("hero.badge")}
            </span>
          </div>

          <h1
            className="text-white font-bold leading-none mb-4 lg:mb-6"
            style={{
              fontSize: "clamp(2rem, 6vw, 4.5rem)",
              animation: "fadeSlideUp 0.7s ease 0.1s both",
            }}
          >
            {t("hero.title_1")},<br />
            {t("hero.title_2")},<br />& {t("hero.title_3")}
          </h1>

          <p
            className="text-white text-base sm:text-xl font-semibold max-w-sm leading-relaxed"
            style={{ animation: "fadeSlideUp 0.7s ease 0.2s both" }}
          >
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Search bar — siempre en apariencia clara, sin importar el tema del sitio */}
        <div
          className="theme-light w-full max-w-3xl"
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
