// ============================================
// SCHEMA DE BÚSQUEDA COMPLETA PARA LISTINGS
// (usado en listing-search-filters.tsx)
// ============================================
import * as yup from "yup";
import { searchSchema } from "./base/search.schema";
import { addressSchema } from "./base/address.schema";
import { priceSchema } from "./base/price.schema";
import { bedroomsSchema } from "./base/bedrooms.schema";
import { bathroomsSchema } from "./base/bathrooms.schema";
import { propertyTypeSchema } from "./base/property_type.schema";
import { listingTypeSchema } from "./base/listing_type.schema";
import { ListingType } from "@/domain/entities/listing.enums";
import { PropertyType } from "@/domain/entities/property.enums";

export const listingSearchFiltersSchema = yup.object({
  q: searchSchema.optional(),
  listing_type: listingTypeSchema.optional(),
  type: propertyTypeSchema.optional(),
  ...addressSchema.fields,
  neighborhood: yup.string().optional(),
  street: yup.string().optional(),
  min_price: priceSchema.optional(),
  max_price: priceSchema.optional(),
  min_bedrooms: bedroomsSchema.optional(),
  min_bathrooms: bathroomsSchema.optional(),
  amenities: yup.array().of(yup.string()).optional(),
  sort_by: yup.string().optional(),
  page: yup.number().min(1).optional(),
  limit: yup.number().min(1).max(100).optional(),
});

export type ListingSearchFiltersInput = yup.InferType<
  typeof listingSearchFiltersSchema
>;

export const defaultListingSearchFiltersValues: ListingSearchFiltersInput = {
  q: undefined,
  listing_type: ListingType.RENT,
  type: PropertyType.Apartment,
  country: undefined,
  state: undefined,
  city: undefined,
  neighborhood: undefined,
  street: undefined,
  min_price: 0,
  max_price: 10_000_000_000,
  min_bedrooms: undefined,
  min_bathrooms: undefined,
  amenities: [],
  sort_by: "created_at_desc",
  page: 1,
  limit: 12,
};

// Alias para compatibilidad con consumidores externos
export const defaultFilters = defaultListingSearchFiltersValues;
