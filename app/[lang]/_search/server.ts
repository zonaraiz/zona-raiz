"use server";

import { cookies } from "next/headers";
import { ListingSearchFiltersInput as ListingSearchFiltersType } from "@/application/validation/listing-search-full.schema";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { pickDefined } from "@/shared/utils/object";
import { ListingSearchFilters } from "@/domain/ports/listing.port";
import { appModule } from "@/application/modules/app.module";
import { Lang } from "@/i18n/settings";
import { AmenitiesType } from "@/domain/entities/property.enums";

export async function getListings(
  filters: ListingSearchFiltersType,
  lang: Lang,
): Promise<{ listings: ListingEntity[]; total: number }> {
  const cookieStore = await cookies();
  const { listingService } = await appModule(lang, { cookies: cookieStore });

  const searchFilters: ListingSearchFilters = {
    listing_type: filters.listing_type as string | undefined,
    type: filters.type as string | undefined,
    state: filters.state as string | undefined,
    city: filters.city as string | undefined,
    neighborhood: filters.neighborhood as string | undefined,
    min_price: filters.min_price as number | undefined,
    max_price: filters.max_price as number | undefined,
    min_bedrooms: filters.min_bedrooms as number | undefined,
    min_bathrooms: filters.min_bathrooms as number | undefined,
    amenities: filters.amenities as AmenitiesType[] | undefined,
    q: filters.q as string | undefined,
    sort_by: filters.sort_by as string | undefined,
    page: filters.page as number | undefined,
    limit: filters.limit as number | undefined,
  };

  const clean = pickDefined(searchFilters);


  const isSimple =
    !filters.q &&
    !filters.min_price &&
    (!filters.max_price || filters.max_price >= 100000000) &&
    !filters.amenities?.length;

  if (isSimple) {
    return listingService.getCachedSearchWithCount(clean);
  }

  return listingService.searchWithCount(clean);
}
