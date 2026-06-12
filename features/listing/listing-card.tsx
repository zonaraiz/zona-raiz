"use client";

import { useRef, useState, useEffect } from "react";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { useRoutes } from "@/i18n/client-router";
import { useTranslation } from "react-i18next";
import { FavoriteToggleButton } from "@/features/favorites/favorite-toggle-button";
import { useListingOptions } from "./hooks/use-listing-options";
import Image from "next/image";
import { CITY_LABELS, STATE_LABELS, humanizeLocation } from "@/lib/locations";
import { propertyTypeLabels } from "@/domain/entities/property.entity";

interface ListingCardProps {
  listing: ListingEntity;
  isFavInitial?: boolean;
  isPublic?: boolean;
  index?: number; // para stagger delay
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function ListingCard({
  listing,
  isFavInitial = false,
  index = 0,
  isPublic = false,
}: ListingCardProps) {
  const { t } = useTranslation("listings");
  const { getListingTypeLabel } = useListingOptions();
  const { ref, inView } = useInView();

  const property = listing.property;
  const images = property.property_images || [];
  const mainImage = images.length > 0 ? images[0].public_url : null;
  const routes = useRoutes();

  // Stagger delay basado en el index (máx 5 para no esperar demasiado)
  const delay = Math.min(index % 6, 5) * 80;

  const url = isPublic
    ? `${routes.listings_public(listing.property.slug)}`
    : `${routes.listing(listing.id)}`;

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.97)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <Link href={url}>
        <Card className="overflow-hidden pt-0 cursor-pointer hover:shadow-lg transition-all group h-full flex flex-col">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={property.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center transition-colors duration-300 group-hover:bg-muted/70">
                <IconHome className="w-12 h-12 text-muted-foreground/50 transition-transform duration-300 group-hover:scale-110" />
              </div>
            )}

            {/* Top left badges */}
            <div
              className="absolute top-3 left-3 flex gap-2"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateX(0)" : "translateX(-8px)",
                transition: `opacity 0.4s ease ${delay + 150}ms, transform 0.4s ease ${delay + 150}ms`,
              }}
            >
              <Badge variant="secondary">
                {getListingTypeLabel(listing.listing_type)}
              </Badge>
              {listing.featured && (
                <Badge className="bg-primary hover:bg-primary/80">
                  {t("words:featured")}
                </Badge>
              )}
            </div>

            {/* Favorite button */}
            <div
              className="absolute top-3 right-3"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateX(0)" : "translateX(8px)",
                transition: `opacity 0.4s ease ${delay + 150}ms, transform 0.4s ease ${delay + 150}ms`,
              }}
            >
              <FavoriteToggleButton
                listingId={listing.id}
                isFavInitial={isFavInitial}
              />
            </div>

            {/* Price badge */}
            <div
              className="absolute bottom-3 right-3"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(6px)",
                transition: `opacity 0.4s ease ${delay + 200}ms, transform 0.4s ease ${delay + 200}ms`,
              }}
            >
              <Badge
                variant="secondary"
                className="backdrop-blur-sm text-foreground capitalize"
              >
                {listing.currency} {listing.price.toLocaleString("es-ES")} {` `}
                {listing.price_negotiable && t("words:negotiable")}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-foreground line-clamp-1 capitalize">
              {property.title}
            </h3>

            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm truncate capitalize">
                {[
                  property.neighborhood
                    ? humanizeLocation(property.neighborhood)
                    : null,
                  property.city ? CITY_LABELS[property.city] ?? humanizeLocation(property.city) : null,
                  property.state ? STATE_LABELS[property.state] ?? humanizeLocation(property.state) : null,
                ]
                  .filter(Boolean)
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .join(", ")}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 flex-1">
              {property.bedrooms !== null && property.bedrooms > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Bed className="size-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms !== null && property.bathrooms > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Bath className="size-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.lot_area && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Maximize className="size-4" />
                  <span>{property.lot_area} m²</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground mt-2 capitalize">
              {propertyTypeLabels[property.property_type] ?? humanizeLocation(property.property_type)}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
