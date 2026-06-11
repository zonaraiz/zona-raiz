"use client";

import { MapPin, Bed, Bath, Maximize2, Car } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PropertyDetailDTO } from "@/application/mappers/property.mapper";

interface PropertyDetailProps {
  data: PropertyDetailDTO | null | undefined;
}

export const PropertyDetail = ({ data }: PropertyDetailProps) => {
  const { t } = useTranslation("properties");

  if (!data) return null;

  const { property, formattedState } = data;

  return (
    <div className="bg-background mx-auto">
      <div className="px-6 pb-6 pt-4 space-y-8">
        <header className="space-y-3 border-b border-border/50 pb-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
            {t("detail.sections.overview")}
          </span>
          <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground/90">
            <MapPin className="w-3 h-3" />
            <span>
              {data.formattedLocation}
            </span>
          </div>
          {property.description && (
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          )}
        </header>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
            {t("detail.sections.key_features")}
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {property.bedrooms! > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Bed className="w-4 h-4 stroke-[1.5]" />
                <span className="text-[11px] uppercase tracking-[0.18em]">
                  {t("detail.sections.summary")}
                </span>
              </div>
              <span className="text-base font-semibold text-foreground">
                {property.bedrooms} {t("properties:detail.labels.bedrooms")}
              </span>
            </div>
          )}
          {property.bathrooms! > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Bath className="w-4 h-4 stroke-[1.5]" />
                <span className="text-[11px] uppercase tracking-[0.18em]">
                  {t("detail.sections.summary")}
                </span>
              </div>
              <span className="text-base font-semibold text-foreground">
                {property.bathrooms} {t("properties:detail.labels.bathrooms")}
              </span>
            </div>
          )}
          {property.lot_area && (
            <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Maximize2 className="w-4 h-4 stroke-[1.5]" />
                <span className="text-[11px] uppercase tracking-[0.18em]">
                  {t("detail.sections.summary")}
                </span>
              </div>
              <span className="text-base font-semibold text-foreground">
                {property.lot_area} {t("properties:detail.labels.area_unit")}
              </span>
            </div>
          )}
          {property.parking_spots! > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                <Car className="w-4 h-4 stroke-[1.5]" />
                <span className="text-[11px] uppercase tracking-[0.18em]">
                  {t("detail.sections.summary")}
                </span>
              </div>
              <span className="text-base font-semibold text-foreground">
                {property.parking_spots} {t("properties:detail.labels.parking")}
              </span>
            </div>
          )}
          </div>
        </section>

        {property.amenities.length > 0 && (
          <section className="pt-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
              {t("detail.sections.amenities")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span
                  key={amenity.label}
                  className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                >
                  {amenity.label}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
