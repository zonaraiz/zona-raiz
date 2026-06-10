import { ListingSearchFiltersInput as ListingSearchFiltersType } from "@/application/validation/listing-search-full.schema";
import { Lang } from "@/i18n/settings";
import {
  LISTINS_MAP,
  PROPERTIES_MAP,
  LISTINS_SLUG,
  PROPERTIES_SLUG,
} from "@/lib/search-config";
import {
  STATES_SET,
  CITIES_SET,
  CITY_TO_STATE,
  CITY_LABELS,
  STATE_LABELS,
  humanizeLocation,
} from "@/lib/locations";
import { ListingType } from "@/domain/entities/listing.enums";
import { PropertyType } from "@/domain/entities/property.enums";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
export type ParsedLocation = {
  type_listins?: ListingType;
  type_property?: PropertyType;
  state: string;
  city: string;
  neighborhood?: string;
};

// ─────────────────────────────────────────────
// PARSE LOCATION
// ─────────────────────────────────────────────
export const parseLocation = (segments?: string[]): ParsedLocation => {
  if (!segments || segments.length === 0) {
    return { state: "", city: "" };
  }

  const result: Partial<ParsedLocation> = {};
  const remaining: string[] = [];

  for (const seg of segments) {
    if (!result.type_listins && seg in LISTINS_MAP) {
      result.type_listins = LISTINS_MAP[seg];
    } else if (!result.type_property && seg in PROPERTIES_MAP) {
      result.type_property = PROPERTIES_MAP[seg];
    } else if (!result.state && STATES_SET.has(seg)) {
      result.state = seg;
    } else if (!result.city && CITIES_SET.has(seg)) {
      result.city = seg;
    } else {
      remaining.push(seg);
    }
  }

  // Inferir state desde city si no vino en la URL
  if (result.city && !result.state) {
    result.state = CITY_TO_STATE[result.city] ?? "";
  }

  if (remaining.length > 0) {
    result.neighborhood = remaining[remaining.length - 1];
  }

  return {
    type_listins: result.type_listins,
    type_property: result.type_property,
    state: result.state ?? "",
    city: result.city ?? "",
    neighborhood: result.neighborhood,
  };
};

// ─────────────────────────────────────────────
// PARSE SEARCH PARAMS
// ─────────────────────────────────────────────
export const parseSearchParams = (
  sp: { [key: string]: string | string[] | undefined },
  location?: string[],
): ListingSearchFiltersType => {
  const parsed = parseLocation(location);
  const amenities = sp.amenities
    ? String(sp.amenities).split(",").filter(Boolean)
    : [];

  return {
    q: (sp.q as string) || "",
    listing_type: parsed.type_listins,
    type: parsed.type_property,
    state: parsed.state,
    city: parsed.city,
    neighborhood: parsed.neighborhood || (sp.neighborhood as string) || "",
    street: (sp.street as string) || "",
    min_price: sp.min_price ? Number(sp.min_price) : 0,
    max_price: sp.max_price ? Number(sp.max_price) : 10000000000000,
    min_bedrooms: sp.min_bedrooms ? Number(sp.min_bedrooms) : undefined,
    min_bathrooms: sp.min_bathrooms ? Number(sp.min_bathrooms) : undefined,
    amenities: amenities.length > 0 ? amenities : [],
    sort_by: (sp.sort_by as string) || "created_at_desc",
    page: sp.page ? Number(sp.page) : 1,
    limit: sp.limit ? Number(sp.limit) : 12,
  };
};

// ─────────────────────────────────────────────
// BUILD URL — navegación interna (filtros extras)
// ─────────────────────────────────────────────
export const buildUrl = (
  overrides: Partial<ListingSearchFiltersType> = {},
  basePath: string,
  filters: Partial<ListingSearchFiltersType>,
): string => {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.q) params.set("q", merged.q);
  if (merged.street) params.set("street", merged.street);
  if (merged.neighborhood) params.set("neighborhood", merged.neighborhood);
  if (merged.min_price && merged.min_price > 0)
    params.set("min_price", String(merged.min_price));
  if (merged.max_price && merged.max_price < 10000000000000)
    params.set("max_price", String(merged.max_price));
  if (merged.min_bedrooms)
    params.set("min_bedrooms", String(merged.min_bedrooms));
  if (merged.min_bathrooms)
    params.set("min_bathrooms", String(merged.min_bathrooms));
  if (merged.amenities?.length)
    params.set("amenities", merged.amenities.join(","));
  if (merged.sort_by && merged.sort_by !== "created_at_desc")
    params.set("sort_by", merged.sort_by);
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));

  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
};

// ─────────────────────────────────────────────
// BUILD CANONICAL URL — SEO
// ─────────────────────────────────────────────
export const buildCanonicalUrl = (
  baseUrl: string,
  lang: Lang,
  location: string[],
  sp: { [key: string]: string | string[] | undefined },
): string => {
  const parsed = parseLocation(location);

  const parts = [
    parsed.type_listins ? LISTINS_SLUG[parsed.type_listins][lang] : null,
    parsed.type_property ? PROPERTIES_SLUG[parsed.type_property][lang] : null,
    parsed.city || null,
    parsed.neighborhood || null,
  ].filter(Boolean);

  const canonicalParams = new URLSearchParams();
  if (sp.sort_by && sp.sort_by !== "created_at_desc")
    canonicalParams.set("sort_by", String(sp.sort_by));
  if (sp.page && Number(sp.page) > 1)
    canonicalParams.set("page", String(sp.page));

  const qs = canonicalParams.toString();
  return `${baseUrl}/${lang}${parts.length ? `/${parts.join("/")}` : ""}${qs ? `?${qs}` : ""}`;
};

// ─────────────────────────────────────────────
// GET BREADCRUMB LABEL — UI
// ─────────────────────────────────────────────
export const getBreadcrumbLabel = (
  parsed: ParsedLocation,
  t: (key: string) => string,
): string => {
  const parts: string[] = [];
  if (parsed.city) parts.push(CITY_LABELS[parsed.city] ?? humanizeLocation(parsed.city));
  else if (parsed.state) parts.push(STATE_LABELS[parsed.state] ?? humanizeLocation(parsed.state));
  if (parsed.neighborhood) parts.push(humanizeLocation(parsed.neighborhood));
  return parts.join(" > ") || t("common:sections.all_properties");
};
