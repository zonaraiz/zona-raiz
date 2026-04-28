import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { LISTINS_SLUG, PROPERTIES_SLUG } from "@/lib/search-config";
import { CITY_LABELS, STATE_LABELS } from "@/lib/locations";
import { ListingDetailDTO } from "@/application/mappers/listing.mapper";
import { useParams } from "next/navigation";
import { Lang } from "@/i18n/settings";

interface ListingBreadcrumbProps {
  data: ListingDetailDTO;
}

export function ListingBreadcrumb({ data }: ListingBreadcrumbProps) {
  const { listing, propertyDetail } = data;
  const { property } = propertyDetail;
  const { lang } = useParams();

  const listingTypeSlug = LISTINS_SLUG[listing.listing_type][lang as Lang];
  const propertyTypeSlug =
    PROPERTIES_SLUG[property.property_type][lang as Lang];
  const cityLabel = CITY_LABELS[property.city] ?? property.city;
  const stateLabel = STATE_LABELS[property.state] ?? property.state;

  const crumbs = [
    {
      label: "Inicio",
      href: `/${lang}`,
    },
    listingTypeSlug && {
      label: listingTypeSlug,
      href: `/${lang}/${listingTypeSlug}`,
    },
    propertyTypeSlug && {
      label: propertyTypeSlug,
      href: `/${lang}/${listingTypeSlug}/${propertyTypeSlug}`,
    },
    property.state && {
      label: stateLabel,
      href: `/${lang}/${listingTypeSlug}/${propertyTypeSlug}/${property.state}`,
    },
    property.city && {
      label: cityLabel,
      href: `/${lang}/${listingTypeSlug}/${propertyTypeSlug}/${property.city}`,
    },
    {
      label: property.title,
      href: null,
    },
  ].filter(Boolean) as { label: string; href: string | null }[];

  return (
    <div className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1 text-sm text-primary-foreground/80 flex-wrap"
        >
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;

            return (
              <span key={i} className="flex items-center gap-1 min-w-0">
                {i === 0 && <Home className="size-3.5 shrink-0" />}

                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="capitalize truncate hover:text-primary-foreground transition-colors underline-offset-2 hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={`capitalize truncate ${
                      isLast
                        ? "text-primary-foreground font-medium"
                        : "text-primary-foreground/80"
                    }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}

                {!isLast && (
                  <ChevronRight className="size-3 shrink-0 opacity-50" />
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
