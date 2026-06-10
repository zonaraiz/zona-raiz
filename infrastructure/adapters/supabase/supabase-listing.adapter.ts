import { mapListingRowToEntity } from "@/application/mappers/listing.mapper";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { ProfileEntity } from "@/domain/entities/profile.entity";
import {
  ListingPort,
  ListingCountFilters,
  ListingSearchFilters,
} from "@/domain/ports/listing.port";
import { LandingCity, LandingStats } from "@/domain/types/landing.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { humanizeLocation } from "@/lib/locations";
import { AmenitiesType } from "@/domain/entities/property.enums";

interface ListingRow {
  created_at: string;
  status: string;
}

interface AgentProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
}

interface ListingRowWithAgent extends ListingRow {
  real_estate_agent?: {
    profile?: AgentProfile;
  };
}

export class SupabaseListingAdapter implements ListingPort {
  constructor(private readonly supabase: SupabaseClient) {}

  async all(filters?: ListingSearchFilters): Promise<ListingEntity[]> {
    const sortField =
      filters?.sort_by?.toString().split("_")[0] || "created_at";
    const sortOrder = filters?.sort_by?.includes("desc") ? false : true;

    let query = this.supabase
      .from("listings")
      .select(
        `
      *,
      property:properties!inner(*, property_images(*))
    `,
      )
      .order(sortField === "price" ? "price" : "created_at", {
        ascending: sortOrder,
      });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.real_estate_id) {
      query = query.eq("properties.real_estate_id", filters.real_estate_id);
    }
    if (filters?.property_id) {
      query = query.eq("property_id", filters.property_id);
    }
    if (filters?.listing_type) {
      query = query.eq("listing_type", filters.listing_type);
    }
    if (filters?.price) {
      query = query.eq("price", filters.price);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.min_price) {
      query = query.gte("price", filters.min_price);
    }
    if (filters?.max_price) {
      query = query.lte("price", filters.max_price);
    }
    if (filters?.search_query) {
      query = query.textSearch("property.search_vector", filters.search_query);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const normalizedFilters = {
      street: filters?.street?.trim().toLowerCase(),
      city: filters?.city?.trim().toLowerCase(),
      state: filters?.state?.trim().toLowerCase(),
      postal_code: filters?.postal_code?.trim().toLowerCase(),
      country: filters?.country?.trim().toLowerCase(),
      neighborhood: filters?.neighborhood?.trim().toLowerCase(),
      type: filters?.type,
      q: filters?.q?.trim().toLowerCase(),
      min_bedrooms: filters?.min_bedrooms,
      min_bathrooms: filters?.min_bathrooms,
      amenities: filters?.amenities ?? [],
    };

    const listings = ((data || []).map(
      (item) => mapListingRowToEntity(item)!,
    ) as ListingEntity[]).filter((listing) => {
      const property = listing.property;
      if (!property) return false;

      if (normalizedFilters.type && property.property_type !== normalizedFilters.type) {
        return false;
      }

      if (normalizedFilters.q) {
        const haystack = [
          property.title,
          property.description,
          property.neighborhood,
          property.city,
          property.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedFilters.q)) {
          return false;
        }
      }

      if (
        normalizedFilters.street &&
        !property.street?.toLowerCase().includes(normalizedFilters.street)
      ) {
        return false;
      }

      if (
        normalizedFilters.city &&
        property.city?.toLowerCase() !== normalizedFilters.city
      ) {
        return false;
      }

      if (
        normalizedFilters.state &&
        property.state?.toLowerCase() !== normalizedFilters.state
      ) {
        return false;
      }

      if (
        normalizedFilters.postal_code &&
        property.postal_code?.toLowerCase() !== normalizedFilters.postal_code
      ) {
        return false;
      }

      if (
        normalizedFilters.country &&
        property.country?.toLowerCase() !== normalizedFilters.country
      ) {
        return false;
      }

      if (
        normalizedFilters.neighborhood &&
        !property.neighborhood?.toLowerCase().includes(normalizedFilters.neighborhood)
      ) {
        return false;
      }

      if (
        normalizedFilters.min_bedrooms !== undefined &&
        (property.bedrooms ?? 0) < normalizedFilters.min_bedrooms
      ) {
        return false;
      }

      if (
        normalizedFilters.min_bathrooms !== undefined &&
        (property.bathrooms ?? 0) < normalizedFilters.min_bathrooms
      ) {
        return false;
      }

      if (normalizedFilters.amenities.length > 0) {
        const propertyAmenities = (property.amenities || []).map((amenity) =>
          typeof amenity === "string"
            ? amenity
            : ((amenity as { value?: AmenitiesType }).value ?? ""),
        );

        const hasAllAmenities = normalizedFilters.amenities.every((amenity) =>
          propertyAmenities.includes(amenity as AmenitiesType),
        );

        if (!hasAllAmenities) return false;
      }

      return true;
    });

    if (sortField === "price") {
      listings.sort((a, b) =>
        sortOrder ? a.price - b.price : b.price - a.price,
      );
    } else {
      listings.sort((a, b) =>
        sortOrder
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return listings;
  }

  async create(data: Partial<ListingEntity>): Promise<ListingEntity> {
    const { data: row, error } = await this.supabase
      .from("listings")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapListingRowToEntity(row);
  }

  async update(
    id: string,
    data: Partial<ListingEntity>,
  ): Promise<ListingEntity> {
    const { data: row, error } = await this.supabase
      .from("listings")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapListingRowToEntity(row);
  }

  async findById(id: string): Promise<ListingEntity | null> {
    const { data: row, error } = await this.supabase
      .from("listings")
      .select("*,  property:properties(*, property_images(*))")
      .eq("id", id)
      .single();

    if (error || !row) return null;
    return mapListingRowToEntity(row);
  }

  async findByIds(ids: string[]): Promise<ListingEntity[]> {
    if (ids.length === 0) return [];
    const { data: rows, error } = await this.supabase
      .from("listings")
      .select(
        `
        *,
        property:properties(*, property_images(*))
      `,
      )
      .in("id", ids);

    if (error) throw error;
    return (rows || []).map(mapListingRowToEntity);
  }

  async findActive(): Promise<ListingEntity[]> {
    const { data: row, error } = await this.supabase
      .from("listings")
      .select("*")
      .eq("status", "active");

    if (error) throw error;
    return row.map(mapListingRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async count(filters?: ListingCountFilters): Promise<number> {
    let query = this.supabase.from("listings").select(
      `
      *,
      property:properties!inner(*)
    `,
      { count: "exact", head: true },
    );

    if (filters?.real_estate_id) {
      query = query.eq("properties.real_estate_id", filters.real_estate_id);
    }
    if (filters?.property_id) {
      query = query.eq("property_id", filters.property_id);
    }
    if (filters?.listing_type) {
      query = query.eq("listing_type", filters.listing_type);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.agent_id) {
      query = query.eq("agent_id", filters.agent_id);
    }
    if (filters?.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte("created_at", filters.end_date);
    }

    const { count, error } = await query;

    if (error) throw new Error(error.message);

    return count || 0;
  }

  async countWithViews(filters?: ListingCountFilters): Promise<number> {
    let query = this.supabase
      .from("listings")
      .select(
        `
      *,
      property:properties!inner(*)
    `,
        { count: "exact", head: true },
      )
      .gt("views_count", 0);

    if (filters?.real_estate_id) {
      query = query.eq("properties.real_estate_id", filters.real_estate_id);
    }
    if (filters?.property_id) {
      query = query.eq("property_id", filters.property_id);
    }
    if (filters?.listing_type) {
      query = query.eq("listing_type", filters.listing_type);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.start_date) {
      query = query.gte("created_at", filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte("created_at", filters.end_date);
    }

    const { count, error } = await query;

    if (error) throw new Error(error.message);

    return count || 0;
  }

  async findFeatured(
    limit: number = 10,
    realEstateId?: string,
  ): Promise<ListingEntity[]> {
    let query = this.supabase
      .from("listings")
      .select(
        "*,property:properties!inner(*, property_images:property_images(*))",
      )
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (realEstateId) {
      query = query.eq("properties.real_estate_id", realEstateId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return (data || []).map(
      (item) => mapListingRowToEntity(item)!,
    ) as ListingEntity[];
  }

  async findBySlug(slug: string): Promise<ListingEntity | null> {
    const { data: row, error } = await this.supabase
      .from("listings")
      .select(
        `
        *,
        property:properties!inner(*, property_images(*))
      `,
      )
      .eq("properties.slug", slug)
      .eq("status", "active")
      .single();

    if (error || !row) return null;
    return mapListingRowToEntity(row) as ListingEntity;
  }

  async countByStatusAndMonth(
    year: number,
    filters?: Omit<ListingCountFilters, "start_date" | "end_date">,
  ): Promise<Record<string, Record<string, number>>> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    let query = this.supabase.from("listings").select(
      `
        status, created_at,
        property:properties!inner(*, property_images(*))
      `,
      { count: "exact", head: false },
    );

    if (filters?.real_estate_id) {
      query = query.eq("properties.real_estate_id", filters.real_estate_id);
    }

    query = query.gte("created_at", startDate).lte("created_at", endDate);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const result: Record<string, Record<string, number>> = {};
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    months.forEach((month) => {
      result[month] = { draft: 0, active: 0, archived: 0 };
    });

    (data || []).forEach((item: ListingRow) => {
      const date = new Date(item.created_at);
      const monthIndex = date.getMonth();
      const status = item.status as string;
      if (months[monthIndex] && result[months[monthIndex]]) {
        if (result[months[monthIndex]][status] !== undefined) {
          result[months[monthIndex]][status]++;
        }
      }
    });

    return result;
  }

  async findSimplePublished(
    limit: number = 10,
    realEstateId?: string,
  ): Promise<ListingEntity[]> {
    let query = this.supabase.from("listings").select(
      `
        *,
        property:properties!inner(*, property_images(*)),
        real_estate_agent:real_estate_agents(
        profile:profiles!inner(id, full_name, avatar_url, phone))
      `,
    );

    if (realEstateId) {
      query = query.eq("properties.real_estate_id", realEstateId);
    }

    query = query
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return (data || []).map((item: ListingRowWithAgent) => {
      const entity = mapListingRowToEntity(item as unknown as ListingEntity);
      if (entity && item.real_estate_agent?.profile) {
        entity.agent = item.real_estate_agent.profile as ProfileEntity;
      }
      return entity;
    }) as ListingEntity[];
  }

  async findCitiesWithActiveListings(): Promise<LandingCity[]> {
    // Query listings with their properties to get cities
    const { data, error } = await this.supabase
      .from("listings")
      .select(
        `
        status,
        property:properties!inner(
          city,
          property_images(public_url)
        )
      `,
      )
      .eq("status", "active")
      .not("properties.city", "is", null);

    if (error) throw new Error(error.message);

    // Group by city and count listings, collect images
    const cityMap = new Map<string, { count: number; image?: string }>();

    for (const row of data || []) {
      const prop = row.property as unknown as {
        city: string;
        property_images?: Array<{ public_url: string }>;
      } | null;
      if (!prop?.city) continue;

      const city = prop.city;
      const existing = cityMap.get(city) || { count: 0 };
      existing.count++;

      // Get first available image
      if (!existing.image && prop.property_images?.length) {
        existing.image = prop.property_images[0].public_url;
      }

      cityMap.set(city, existing);
    }

    return Array.from(cityMap.entries()).map(([city, data]) => ({
      name: humanizeLocation(city),
      slug: city,
      count: data.count,
      image: data.image,
    }));
  }

  async getLandingStats(): Promise<LandingStats> {
    // Get total listings (published)
    const { count: totalListings } = await this.supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get total agents (distinct profiles in real_estate_agents)
    const { data: agents } = await this.supabase
      .from("real_estate_agents")
      .select("profile_id");

    const uniqueAgents = new Set(agents?.map((a) => a.profile_id) || []);

    // Get total cities with published listings
    const { data: listingsWithCities } = await this.supabase
      .from("listings")
      .select("property:properties(city)")
      .eq("status", "active")
      .not("properties.city", "is", null);

    const uniqueCities = new Set(
      (listingsWithCities || [])
        .map((l) => (l.property as unknown as { city: string } | null)?.city)
        .filter(Boolean) as string[],
    );

    return {
      totalListings: totalListings || 0,
      totalAgents: uniqueAgents.size,
      totalCities: uniqueCities.size,
    };
  }

  async deleteCascade(id: string): Promise<void> {
    // 1. Delete the listing record (ON DELETE CASCADE handles favorites and enquiries FK)
    const { error: listingError } = await this.supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (listingError) throw new Error(listingError.message);
  }
}
