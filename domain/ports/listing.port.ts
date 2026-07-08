import { ListingEntity } from "../entities/listing.entity";
import { LandingCity, LandingStats } from "@/domain/types/landing.types";
import { AmenitiesType } from "../entities/property.enums";

export interface ListingCountFilters {
  agent_id?: string;
  real_estate_id?: string;
  property_id?: string;
  type?: string;
  listing_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface ListingBounds {
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
}

export interface ListingSearchFilters {
  q?: string;
  listing_type?: string;
  type?: string;
  country?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  postal_code?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  amenities?: AmenitiesType[];
  sort_by?: string;
  search_query?: string;
  page?: number;
  limit?: number;
  real_estate_id?: string;
  property_id?: string;
  status?: string;
  price?: number;
  bounds?: ListingBounds;
}

export interface ListingPort {
  all(filter?: ListingSearchFilters): Promise<ListingEntity[]>;
  create(data: Partial<ListingEntity>): Promise<ListingEntity>;
  update(id: string, data: Partial<ListingEntity>): Promise<ListingEntity>;
  findById(id: string): Promise<ListingEntity | null>;
  findByIds(ids: string[]): Promise<ListingEntity[]>;
  findActive(): Promise<ListingEntity[]>;
  delete(id: string): Promise<void>;
  count(filters?: ListingCountFilters): Promise<number>;
  countWithViews(filters?: ListingCountFilters): Promise<number>;
  findFeatured(limit?: number, realEstateId?: string): Promise<ListingEntity[]>;
  findBySlug(slug: string): Promise<ListingEntity | null>;
  countByStatusAndMonth(
    year: number,
    filters?: Omit<ListingCountFilters, "start_date" | "end_date">,
  ): Promise<Record<string, Record<string, number>>>;
  findSimplePublished(
    limit?: number,
    realEstateId?: string,
  ): Promise<ListingEntity[]>;
  findCitiesWithActiveListings(): Promise<LandingCity[]>;
  getLandingStats(): Promise<LandingStats>;
  deleteCascade(id: string): Promise<void>;
}
