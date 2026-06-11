"use client";

import { Bath, Bed, Car, MapPin, Maximize2 } from "lucide-react";
import { PropertyDetail } from "@/features/properties/property-details";
import { ListingDetailDTO } from "@/application/mappers/listing.mapper";
import PropertyCarouselGallery from "../properties/property-carousel-gallery";
import { LandingNav } from "../landing/landing-nav";
import { ListingBreadcrumb } from "./listing-breadcrumb";
import { ListingDetailInfo } from "./listing-detail-info";
import { EnquiryForm } from "./enquiry-form";
import { ListingPricing } from "./listing-pricing";
import { ListingActions } from "./listing-actions";
import { EUserRole } from "@/domain/entities/profile.entity";
import { useTranslation } from "react-i18next";
import { PropertyType } from "@/domain/entities/property.enums";

interface ListingDetailProps {
  data: ListingDetailDTO | null | undefined;
  isFavInitial?: boolean;
  isAuth?: boolean;
  role: EUserRole
}

export function ListingDetail({
  data,
  isFavInitial = false,
  isAuth = false,
  role
}: ListingDetailProps) {
  const { t } = useTranslation("listings");
  if (!data) return null;
  const { propertyDetail, listing } = data;
  const { imageUrls, property } = propertyDetail;

  const propertyTypeLabelMap: Record<PropertyType, string> = {
    [PropertyType.Apartment]: t("keywords.apartment"),
    [PropertyType.House]: t("keywords.house"),
    [PropertyType.Condo]: t("keywords.condo"),
    [PropertyType.TownHouse]: t("keywords.townhouse"),
    [PropertyType.Land]: t("keywords.land"),
    [PropertyType.Commercial]: t("keywords.commercial"),
    [PropertyType.Office]: t("keywords.office"),
    [PropertyType.Warehouse]: t("keywords.warehouse"),
    [PropertyType.State]: t("keywords.land"),
    [PropertyType.Other]: t("keywords.other"),
  };

  const propertyTypeLabel =
    propertyTypeLabelMap[property.property_type] ?? t("keywords.other");

  return (
    <div>
      <LandingNav isAuth={isAuth} role={role}/>
      <ListingBreadcrumb data={data} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="w-full overflow-hidden">
            <PropertyCarouselGallery images={imageUrls} />
          </div>

          <section className="rounded-[2rem] border border-border/60 bg-card/50 px-6 py-6 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.9)] md:px-8 md:py-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {listing.listing_type === "rent"
                      ? t("listing_types.rent")
                      : t("listing_types.sale")}
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-foreground/80">
                    {propertyTypeLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
                    {property.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground md:text-base">
                    <MapPin className="size-4" />
                    <span>{property.city}</span>
                    <span>·</span>
                    <span>{propertyDetail.formattedState}</span>
                    {property.neighborhood ? (
                      <>
                        <span>·</span>
                        <span>{property.neighborhood}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
                {property.bedrooms ? (
                  <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Bed className="size-4" />
                      <span className="text-[11px] uppercase tracking-[0.18em]">
                        {t("detail.labels.features")}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {property.bedrooms}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("properties:detail.labels.bedrooms")}
                    </div>
                  </div>
                ) : null}

                {property.bathrooms ? (
                  <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Bath className="size-4" />
                      <span className="text-[11px] uppercase tracking-[0.18em]">
                        {t("detail.labels.features")}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {property.bathrooms}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("properties:detail.labels.bathrooms")}
                    </div>
                  </div>
                ) : null}

                {property.lot_area ? (
                  <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Maximize2 className="size-4" />
                      <span className="text-[11px] uppercase tracking-[0.18em]">
                        {t("detail.labels.features")}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {property.lot_area}
                    </div>
                    <div className="text-xs text-muted-foreground">m²</div>
                  </div>
                ) : null}

                {property.parking_spots ? (
                  <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Car className="size-4" />
                      <span className="text-[11px] uppercase tracking-[0.18em]">
                        {t("detail.labels.features")}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {property.parking_spots}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("properties:detail.labels.parking")}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="order-2 w-full lg:order-1 lg:col-span-7">
              <div className="rounded-[2rem] border border-border/60 bg-card/50 p-2 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.9)]">
                <PropertyDetail data={propertyDetail} />
                <ListingDetailInfo listing={listing} />
              </div>
            </div>

            <div className="order-1 w-full lg:order-2 lg:col-span-5">
              <div className="space-y-5 lg:sticky lg:top-8">
                <div className="rounded-[2rem] border border-border/60 bg-card/60 p-6 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.95)]">
                  <div className="space-y-3">
                    <ListingPricing listing={listing} />
                    <ListingActions listing={listing} isFavInitial={isFavInitial} />
                  </div>
                </div>

                {property.real_estate_id && (
                  <div className="rounded-[2rem] border border-border/60 bg-card/60 p-1 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.95)]">
                    <EnquiryForm
                      listingId={listing.id}
                      realEstateId={property.real_estate_id}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
