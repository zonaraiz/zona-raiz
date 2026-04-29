import type { Metadata } from "next";
import { SearchPageClient } from "../search-page-client";
import { getTranslation } from "@/i18n/server";
import { Lang } from "@/i18n/settings";
import { LISTINS_SLUG, PROPERTIES_SLUG } from "@/lib/search-config";
import { CITY_LABELS, STATE_LABELS } from "@/lib/locations";
import {
  parseLocation,
  parseSearchParams,
  buildCanonicalUrl,
  getBreadcrumbLabel,
} from "../_search/helpers";
import { getListings } from "../_search/server";
import { appModule } from "@/application/modules/app.module";
import { cookies } from "next/headers";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { ListingType } from "@/domain/entities/listing.enums";
import { PropertyType } from "@/domain/entities/property.enums";
import { EUserRole } from "@/domain/entities/profile.entity";

interface SearchPageProps {
  params: Promise<{ lang: Lang; location?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ─────────────────────────────────────────────
// STATIC PARAMS — rutas populares pre-renderizadas
// usando ciudades reales con listings activos
// ─────────────────────────────────────────────
export async function generateStaticParams() {
  const langs: Lang[] = ["es", "en"];
  const listins: ListingType[] = [ListingType.RENT, ListingType.SALE];
  const properties: PropertyType[] = [
    PropertyType.Apartment,
    PropertyType.House,
  ];

  // Ciudades hardcoded como fallback si falla el servicio
  const fallbackCities = [
    "bogota",
    "medellin",
    "cali",
    "barranquilla",
    "cartagena",
  ];

  let cities: string[] = fallbackCities;
  try {
    // Usar las ciudades reales con listings activos
    const cookieStore = await cookies();
    const { listingService } = await appModule("es", { cookies: cookieStore });
    const activeCities =
      await listingService.getCachedCitiesWithActiveListings();
    if (activeCities?.length) {
      cities = activeCities
        .map((c: any) => c.city ?? c.value ?? c)
        .filter(Boolean);
    }
  } catch {
    cities = fallbackCities;
  }

  const params: { lang: Lang; location: string[] }[] = [];

  for (const lang of langs) {
    // base: /es, /en
    params.push({ lang, location: [] });

    for (const lt of listins) {
      const ltSlug = LISTINS_SLUG[lt][lang];

      // /es/arriendo
      params.push({ lang, location: [ltSlug] });

      for (const pt of properties) {
        const ptSlug = PROPERTIES_SLUG[pt][lang];

        // /es/arriendo/apartamentos
        params.push({ lang, location: [ltSlug, ptSlug] });

        for (const city of cities) {
          // /es/arriendo/apartamentos/bogota
          params.push({ lang, location: [ltSlug, ptSlug, city] });
        }
      }
    }
  }

  return params;
}

// ─────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────
function buildJsonLd(listings: ListingEntity[], canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: canonicalUrl,
    itemListElement: listings.slice(0, 10).map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "RealEstateListing",
        "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${listing.id}`,
        name: listing.property.title,
        description: listing.property.description ?? undefined,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${listing.id}`,
        price: listing.price,
        priceCurrency: listing.currency,
        address: {
          "@type": "PostalAddress",
          addressLocality:
            CITY_LABELS[listing.property.city] ?? listing.property.city,
          addressRegion:
            STATE_LABELS[listing.property.state] ?? listing.property.state,
          addressCountry: "CO",
          streetAddress: listing.property.street ?? undefined,
        },
        ...(listing.property.latitude && listing.property.longitude
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: listing.property.latitude,
                longitude: listing.property.longitude,
              },
            }
          : {}),
        ...(listing.property.property_images?.[0]?.public_url
          ? {
              image: listing.property.property_images[0].public_url,
            }
          : {}),
        numberOfRooms: listing.property.bedrooms ?? undefined,
        numberOfBathroomsTotal: listing.property.bathrooms ?? undefined
      },
    })),
  };
}

// ─────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────
export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { lang, location } = await params;
  const { t } = await getTranslation(lang);
  const sp = await searchParams;
  const parsed = parseLocation(location);

  const parts: string[] = [];
  if (parsed.type_listins) parts.push(LISTINS_SLUG[parsed.type_listins][lang]);
  if (parsed.type_property)
    parts.push(PROPERTIES_SLUG[parsed.type_property][lang]);
  if (parsed.city) parts.push(CITY_LABELS[parsed.city] ?? parsed.city);
  else if (parsed.state) parts.push(STATE_LABELS[parsed.state] ?? parsed.state);

  const locationLabel =
    parts.length > 0 ? parts.join(" · ") : t("common:sections.all_properties");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const canonicalUrl = buildCanonicalUrl(baseUrl, lang, location ?? [], sp);

  return {
    title: `${locationLabel} | ${t("common:titles.app")}`,
    description: t("properties:sections.search_meta_description", {
      location: locationLabel,
    }),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${locationLabel} | ${t("common:titles.app")}`,
      description: t("properties:sections.search_meta_description", {
        location: locationLabel,
      }),
      url: canonicalUrl,
      type: "website",
    },
  };
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default async function Page({ params, searchParams }: SearchPageProps) {
  const cookieStore = await cookies();
  const { lang, location } = await params;
  const { t } = await getTranslation(lang);
  const sp = await searchParams;

  const parsed = parseLocation(location);
  const filters = parseSearchParams(sp, location);

  const { listings, total } = await getListings(filters, lang);

// Auth + favorites
  let favoriteIds: string[] = [];
  let isAuth = false;
  let profile = null;
  let role = EUserRole.Client;

  try {
    const { sessionService, favoriteService, profileService, cookiesService } = await appModule(lang, {
      cookies: cookieStore,
    });
    role = isAuth ? await cookiesService.getProfileRole() || EUserRole.Client : EUserRole.Client;

    isAuth = await sessionService.isAuth();
    role = isAuth ? await cookiesService.getProfileRole() || EUserRole.Client : EUserRole.Client;

    if (isAuth) {
      const userId = await sessionService.getCurrentUserId();
      if (userId) {
        const favorites = await favoriteService.findByProfileId(userId);
        favoriteIds = favorites.map((f) => f.listing_id);
        profile = await profileService.getCachedProfileByUserId(userId);
      }
    }
  } catch {
    favoriteIds = [];
  }

  const totalPages = Math.ceil(total / (filters.limit || 12));
  const currentPage = filters.page || 1;

  const locationPath = (location ?? []).join("/");
  const basePath = `/${lang}${locationPath ? `/${locationPath}` : ""}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const canonicalUrl = buildCanonicalUrl(baseUrl, lang, location ?? [], sp);
  const jsonLd = buildJsonLd(listings, canonicalUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
<SearchPageClient
        lang={lang}
        filters={filters}
        listings={listings}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        breadcrumb={getBreadcrumbLabel(parsed, t)}
        basePath={basePath}
        favoriteIds={favoriteIds}
        isAuth={isAuth}
        profile={profile}
        role={role}
      />
    </>
  );
}
