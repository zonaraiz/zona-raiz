"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRoutes, buildSearchUrl } from "@/i18n/client-router";
import { Lang } from "@/i18n/settings";
import { LandingCity } from "@/domain/types/landing.types";
import { PlaceSearch, ParsedPlace } from "@/features/places/place-search";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PropertyType } from "@/domain/entities/property.enums";
import { ListingType } from "@/domain/entities/listing.enums";
import { PROPERTIES_SLUG } from "@/lib/search-config";
import {
  landingSearchSchema,
  LandingSearchFormInput,
  defaultLandingSearchValues,
} from "@/application/validation/landing-search.schema";
import { PROPERTY_TYPES, LISTING_TYPES } from "@/config/listing-selectors";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  IconArrowRight,
  IconBed,
  IconBath,
  IconCurrencyDollar,
  IconMapPin,
  IconSearch,
} from "@tabler/icons-react";
import { CtaButton } from "./button-cta";

interface LandingHeroProps {
  cities?: LandingCity[];
  lang?: Lang;
}

export function LandingHero({ lang = "es" }: LandingHeroProps) {
  const { t } = useTranslation("landing");
  const router = useRouter();
  const routes = useRoutes();

  const [listingType, setListingType] = useState<ListingType>(ListingType.RENT);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [place, setPlace] = useState<ParsedPlace | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<LandingSearchFormInput>({
    resolver: yupResolver(
      landingSearchSchema,
    ) as Resolver<LandingSearchFormInput>,
    defaultValues: defaultLandingSearchValues,
    mode: "onChange",
  });

  const onSubmit = (data: LandingSearchFormInput) => {
    setIsSearching(true);

    const url = buildSearchUrl({
      lang,
      listing_type: listingType,
      type: propertyType ?? undefined,
      city: place?.city,
      neighborhood: place?.neighborhood,
    });

    const sp = new URLSearchParams();
    if (data.min_bedrooms) sp.set("min_bedrooms", String(data.min_bedrooms));
    if (data.min_bathrooms) sp.set("min_bathrooms", String(data.min_bathrooms));
    if (data.max_price && data.max_price < 1e8)
      sp.set("max_price", String(data.max_price));

    const qs = sp.toString();
    router.push(`${url}${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="relative w-full min-h-screen pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpeg"
          alt="Hero property"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay más oscuro en mobile para que el texto sea legible */}
        <div className="absolute inset-0 bg-linear-to-r from-black/30 via-black/20 to-black/10 lg:from-black/5 lg:via-black/8 lg:to-black/0" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-black/0 lg:from-black/8 lg:via-black/10 lg:to-black/0" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-64px)] flex items-center lg:py-0">
        <div className="flex flex-col lg:flex-row items-center lg:justify-between w-full gap-8 lg:gap-12">
          {/* Left — texto hero */}
          <div
            className="flex-1 max-w-lg w-full text-center lg:text-left"
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
              className="text-white text-base sm:text-xl font-semibold mb-6 lg:mb-8 max-w-sm mx-auto lg:mx-0 leading-relaxed"
              style={{ animation: "fadeSlideUp 0.7s ease 0.2s both" }}
            >
              {t("hero.subtitle")}
            </p>

            <CtaButton
              href={routes.search()}
              className="hidden lg:inline-flex"
              text={t("hero.see_all")}
              style={{ animation: "fadeSlideUp 0.7s ease 0.3s both" }}
            />
          </div>

          {/* Right — Search Card */}
          <div
            className="w-full max-w-sm lg:shrink-0"
            style={{ animation: "fadeSlideUp 0.8s ease 0.2s both" }}
          >
            <Card className="overflow-hidden shadow-2xl">
              {/* Listing type tabs */}
              <CardHeader className="p-0">
                <div className="flex border-b">
                  {LISTING_TYPES.map((lt) => (
                    <button
                      key={lt.value}
                      type="button"
                      onClick={() => setListingType(lt.value)}
                      className={cn(
                        "flex-1 py-3.5 text-sm font-semibold transition-all duration-200",
                        listingType === lt.value
                          ? "text-primary border-b-2 border-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground bg-muted/30",
                      )}
                    >
                      {t(lt.label)}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Property type pills */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
                    {t("hero.property_type_label")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setPropertyType(propertyType === value ? null : value)
                        }
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                          propertyType === value
                            ? "bg-primary text-primary-foreground border-primary scale-105 shadow-sm"
                            : "bg-background text-foreground border-border hover:border-primary/50 hover:scale-[1.02]",
                        )}
                      >
                        <Icon className="size-3" />
                        {t(label)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Place search */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {t("hero.location_label")}
                  </p>
                  <PlaceSearch
                    lang={lang}
                    navigate={false}
                    placeholder={t("hero.location_placeholder")}
                    onSelect={(p) => setPlace(p)}
                  />
                </div>

                {/* RHF Form */}
                <Form form={form} onSubmit={onSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Form.Input
                      name="min_bedrooms"
                      type="number"
                      placeholder={t("hero.beds")}
                      min={0}
                      label={
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconBed className="size-3" />
                          {t("hero.beds_label")}
                        </span>
                      }
                    />
                    <Form.Input
                      name="min_bathrooms"
                      type="number"
                      placeholder={t("hero.baths")}
                      min={0}
                      label={
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconBath className="size-3" />
                          {t("hero.baths_label")}
                        </span>
                      }
                    />
                  </div>

                  <Form.Input
                    name="max_price"
                    type="currency"
                    placeholder={t("hero.max_price_placeholder")}
                    label={
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconCurrencyDollar className="size-3" />
                        {t("hero.max_price")}
                      </span>
                    }
                  />

                  {/* Summary chips */}
                  {(place || propertyType || listingType) && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                      <span className="text-[10px] text-muted-foreground w-full">
                        {t("hero.searching_label")}
                      </span>
                      <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                        {t(
                          listingType === ListingType.RENT
                            ? "hero.listing_types.rent"
                            : "hero.listing_types.sale",
                        )}
                      </span>
                      {propertyType && (
                        <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                          {PROPERTIES_SLUG[propertyType]?.[lang]}
                        </span>
                      )}
                      {place?.label && (
                        <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <IconMapPin className="size-2.5" />
                          {place.label}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSearching}
                    className="w-full rounded-full"
                  >
                    {isSearching ? (
                      <>
                        <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                        {t("hero.searching")}
                      </>
                    ) : (
                      <>
                        {t("hero.search_btn")}
                        <IconSearch className="size-4" />
                      </>
                    )}
                  </Button>
                </Form>

                {/* CTA visible solo en mobile, debajo de la card */}
                <CtaButton
                  href={routes.search()}
                  className="lg:hidden w-full justify-center"
                  text={t("hero.see_all")}
                />
              </CardContent>
            </Card>
          </div>
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
