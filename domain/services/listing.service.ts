import {
  ListingPort,
  ListingCountFilters,
  ListingSearchFilters,
} from "@/domain/ports/listing.port";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { unstable_cache } from "next/cache";
import { Lang } from "@/i18n/settings";
import { ListingStatus } from "../entities/listing.enums";
import { CACHE_TAGS } from "@/infrastructure/config/constants";

export type CreateListingInput = Omit<
  ListingEntity,
  | "id"
  | "property_id"
  | "agent_id"
  | "views_count"
  | "enquiries_count"
  | "whatsapp_clicks"
  | "published_at"
  | "property"
>;

export interface ListingSearchResult {
  listings: ListingEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListingService {
  constructor(
    private readonly listingPort: ListingPort,
    private lang: Lang = "es",
  ) {}

  all(filter?: ListingSearchFilters) {
    return this.listingPort.all(filter);
  }

  create(data: CreateListingInput) {
    return this.listingPort.create(data);
  }

  update(id: string, data: CreateListingInput) {
    return this.listingPort.update(id, data);
  }

  findById(id: string) {
    return this.listingPort.findById(id);
  }

  findByIds(ids: string[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.listingPort.findByIds(ids);
  }

  findActive() {
    return this.listingPort.findActive();
  }

  delete(id: string) {
    return this.listingPort.delete(id);
  }

  deleteCascade(id: string) {
    return this.listingPort.deleteCascade(id);
  }

  findFeatured(limit?: number, realEstateId?: string) {
    return this.listingPort.findFeatured(limit, realEstateId);
  }

  findBySlug(slug: string) {
    return this.listingPort.findBySlug(slug);
  }

  count(filters?: ListingCountFilters) {
    return this.listingPort.count(filters);
  }

  countWithViews(filters?: ListingCountFilters) {
    return this.listingPort.countWithViews(filters);
  }
  async getCountByRealEstate(realEstateId: string): Promise<number> {
    return this.listingPort.count({ real_estate_id: realEstateId });
  }

  findSimplePublished(limit: number = 10, realEstateId?: string) {
    return this.listingPort.findSimplePublished(limit, realEstateId);
  }

  private buildCacheKey(filters?: ListingSearchFilters): string {
    const parts =
      filters &&
      Object.entries(filters)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}:${v.join(",")}`;
          return `${k}:${v}`;
        });
    return parts && parts.length > 0 ? parts.join(":") : "default";
  }

  async search(filters: ListingSearchFilters): Promise<ListingSearchResult> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;

    const allListings = await this.listingPort.all(filters);
    const total = allListings.length;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedListings = allListings.slice(startIndex, endIndex);

    return {
      listings: paginatedListings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchWithCount(
    filters: ListingSearchFilters,
  ): Promise<{ listings: ListingEntity[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const allListings = await this.listingPort.all({
      ...filters,
      status: ListingStatus.ACTIVE,
    });
    const total = allListings.length;

    const paginatedListings = allListings.slice(from, to + 1);

    return {
      listings: paginatedListings,
      total,
    };
  }

  countByStatusAndMonth(
    year: number,
    filters?: Omit<ListingCountFilters, "start_date" | "end_date">,
  ) {
    return this.listingPort.countByStatusAndMonth(year, filters);
  }

  findCitiesWithActiveListings() {
    return this.listingPort.findCitiesWithActiveListings();
  }

  getCachedAll(filter?: ListingSearchFilters) {
    return unstable_cache(
      async () => this.listingPort.all(filter),
      [CACHE_TAGS.LISTING.KEYS.ALL(filter)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.ALL],
      },
    )();
  }

  getCachedById(id: string) {
    return unstable_cache(
      async () => this.listingPort.findById(id),
      [CACHE_TAGS.LISTING.KEYS.BY_ID(id)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.DETAIL(id)],
      },
    )();
  }

  getCachedActive() {
    return unstable_cache(
      async () => this.listingPort.findActive(),
      [CACHE_TAGS.LISTING.KEYS.ACTIVE()],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.ACTIVE],
      },
    )();
  }

  getCachedFeatured(limit?: number, realEstateId?: string) {
    return unstable_cache(
      async () => this.listingPort.findFeatured(limit, realEstateId),
      [CACHE_TAGS.LISTING.KEYS.FEATURED(limit, realEstateId)],
      {
        revalidate: 300,
        tags: [
          CACHE_TAGS.LISTING.PRINCIPAL,
          CACHE_TAGS.LISTING.FEATURED,
          ...(realEstateId
            ? [CACHE_TAGS.REAL_ESTATE.DETAIL(realEstateId)]
            : []),
        ],
      },
    )();
  }

  getCachedBySlug(slug: string) {
    return unstable_cache(
      async () => this.listingPort.findBySlug(slug),
      [CACHE_TAGS.LISTING.KEYS.BY_SLUG(slug)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.SLUG(slug)],
      },
    )();
  }

  getCachedCount(filters?: ListingCountFilters) {
    return unstable_cache(
      async () => this.listingPort.count(filters),
      [CACHE_TAGS.LISTING.KEYS.COUNT(filters)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.COUNT],
      },
    )();
  }

  getCachedCountWithViews(filters?: ListingCountFilters) {
    return unstable_cache(
      async () => this.listingPort.countWithViews(filters),
      [CACHE_TAGS.LISTING.KEYS.COUNT_WITH_VIEWS(filters)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.COUNT],
      },
    )();
  }

  getCachedCountByRealEstate(realEstateId: string) {
    return unstable_cache(
      async () => this.listingPort.count({ real_estate_id: realEstateId }),
      [CACHE_TAGS.LISTING.KEYS.COUNT_BY_REAL_ESTATE(realEstateId)],
      {
        revalidate: 300,
        tags: [
          CACHE_TAGS.LISTING.PRINCIPAL,
          CACHE_TAGS.REAL_ESTATE.DETAIL(realEstateId),
        ],
      },
    )();
  }

  getCachedCountWithDateRange(
    startDate: string,
    endDate: string,
    filters?: Omit<ListingCountFilters, "start_date" | "end_date">,
  ) {
    return unstable_cache(
      async () =>
        this.listingPort.count({
          ...filters,
          start_date: startDate,
          end_date: endDate,
        }),
      [CACHE_TAGS.LISTING.KEYS.COUNT_DATE_RANGE(startDate, endDate, filters)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.COUNT],
      },
    )();
  }

  getCachedCountByRealEstateWithDateRange(
    realEstateId: string,
    startDate: string,
    endDate: string,
  ) {
    return unstable_cache(
      async () =>
        this.listingPort.count({
          real_estate_id: realEstateId,
          start_date: startDate,
          end_date: endDate,
        }),
      [
        CACHE_TAGS.LISTING.KEYS.COUNT_REAL_ESTATE_DATE_RANGE(
          realEstateId,
          startDate,
          endDate,
        ),
      ],
      {
        revalidate: 300,
        tags: [
          CACHE_TAGS.LISTING.PRINCIPAL,
          CACHE_TAGS.REAL_ESTATE.DETAIL(realEstateId),
        ],
      },
    )();
  }

  getCachedSimplePublished(limit: number = 10) {
    return unstable_cache(
      async () => this.listingPort.findSimplePublished(limit),
      [CACHE_TAGS.LISTING.KEYS.SIMPLE_PUBLISHED(limit)],
      {
        revalidate: 60,
        tags: [
          CACHE_TAGS.LISTING.PRINCIPAL,
          CACHE_TAGS.LISTING.SIMPLE_PUBLISHED,
        ],
      },
    )();
  }

  getCachedSimplePublishedByRealEstate(
    limit: number = 10,
    realEstateId: string,
  ) {
    return unstable_cache(
      async () => this.listingPort.findSimplePublished(limit, realEstateId),
      [
        CACHE_TAGS.LISTING.KEYS.SIMPLE_PUBLISHED_BY_REAL_ESTATE(
          limit,
          realEstateId,
        ),
      ],
      {
        revalidate: 60,
        tags: [
          CACHE_TAGS.LISTING.PRINCIPAL,
          CACHE_TAGS.LISTING.SIMPLE_PUBLISHED,
        ],
      },
    )();
  }

  getCachedSearch(filters: ListingSearchFilters) {
    return unstable_cache(
      async () => this.search(filters),
      [CACHE_TAGS.LISTING.KEYS.SEARCH(this.buildCacheKey(filters))],
      {
        revalidate: 60,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.SEARCH],
      },
    )();
  }

  getCachedSearchWithCount(filters: ListingSearchFilters) {
    return unstable_cache(
      async () => this.searchWithCount(filters),
      [CACHE_TAGS.LISTING.KEYS.SEARCH_WITH_COUNT(this.buildCacheKey(filters))],
      {
        revalidate: 60,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.SEARCH],
      },
    )();
  }

  getCachedCountByStatusAndMonth(
    year: number,
    filters?: Omit<ListingCountFilters, "start_date" | "end_date">,
  ) {
    return unstable_cache(
      async () => this.listingPort.countByStatusAndMonth(year, filters),
      [
        CACHE_TAGS.LISTING.KEYS.COUNT_STATUS_MONTH(
          year,
          filters?.real_estate_id,
        ),
      ],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.COUNT],
      },
    )();
  }

  getCachedCitiesWithActiveListings() {
    return unstable_cache(
      async () => this.listingPort.findCitiesWithActiveListings(),
      [CACHE_TAGS.LISTING.KEYS.CITIES()],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.CITIES],
      },
    )();
  }

  getCachedLandingStats() {
    return unstable_cache(
      async () => this.listingPort.getLandingStats(),
      [CACHE_TAGS.LISTING.KEYS.STATS()],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.STATS],
      },
    )();
  }
}
