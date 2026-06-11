import { ListingType } from "@/domain/entities/listing.enums";
import { PropertyType } from "@/domain/entities/property.enums";

export const LISTINS_MAP: Record<string, ListingType> = {
  // ES
  arriendo: ListingType.RENT,
  venta: ListingType.SALE,
  // EN
  rent: ListingType.RENT,
  sale: ListingType.SALE,
};

export const PROPERTIES_MAP: Record<string, PropertyType> = {
  // ES
  casas: PropertyType.House,
  apartamentos: PropertyType.Apartment,
  condominios: PropertyType.Condo,
  "casas-campestres": PropertyType.TownHouse,
  lotes: PropertyType.Land,
  locales: PropertyType.Commercial,
  oficinas: PropertyType.Office,
  bodegas: PropertyType.Warehouse,
  fincas: PropertyType.State,
  estados: PropertyType.State,
  otros: PropertyType.Other,
  // EN
  houses: PropertyType.House,
  apartments: PropertyType.Apartment,
  condos: PropertyType.Condo,
  townhouses: PropertyType.TownHouse,
  land: PropertyType.Land,
  commercial: PropertyType.Commercial,
  offices: PropertyType.Office,
  warehouses: PropertyType.Warehouse,
  states: PropertyType.State,
  other: PropertyType.Other,
};

export const LISTINS_SLUG: Record<ListingType, Record<"es" | "en", string>> = {
  [ListingType.RENT]: { es: "arriendo", en: "rent" },
  [ListingType.SALE]: { es: "venta", en: "sale" },
};

export const PROPERTIES_SLUG: Record<
  PropertyType,
  Record<"es" | "en", string>
> = {
  [PropertyType.House]: { es: "casas", en: "houses" },
  [PropertyType.Apartment]: { es: "apartamentos", en: "apartments" },
  [PropertyType.Condo]: { es: "condominios", en: "condos" },
  [PropertyType.TownHouse]: { es: "casas-campestres", en: "townhouses" },
  [PropertyType.Land]: { es: "lotes", en: "land" },
  [PropertyType.Commercial]: { es: "locales", en: "commercial" },
  [PropertyType.Office]: { es: "oficinas", en: "offices" },
  [PropertyType.Warehouse]: { es: "bodegas", en: "warehouses" },
  [PropertyType.State]: { es: "fincas", en: "states" },
  [PropertyType.Other]: { es: "otros", en: "other" },
};
