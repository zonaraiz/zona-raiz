"use client";

import { ListingEntity } from "@/domain/entities/listing.entity";
import { Card } from "@/components/ui/card";
import { IconHome } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ListingCard } from "./listing-card";

interface ListingGridProps {
  listings: ListingEntity[];
  loading?: boolean;
  favoriteIds?: string[];
}

export function ListingGrid({
  listings,
  loading,
  favoriteIds = [],
}: ListingGridProps) {
  const { t } = useTranslation("listings");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-muted animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconHome className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          {t("listings:exceptions.properties_not_found")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("listings:sections.try_change_filters")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing, i) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isPublic={true}
          isFavInitial={favoriteIds.includes(listing.id)}
          index={i}
        />
      ))}
    </div>
  );
}
