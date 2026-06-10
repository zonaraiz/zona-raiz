"use client";

import { ListingSearchFiltersInput as ListingSearchFiltersType } from "@/application/validation/listing-search-full.schema";
import { ListingSearchFilters } from "@/features/listing/listing-search-filters";
import { ListingGrid } from "@/features/listing/listing-grid";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Lang } from "@/i18n/settings";
import { LISTINS_SLUG, PROPERTIES_SLUG } from "@/lib/search-config";
import { ListingType } from "@/domain/entities/listing.enums";
import { PropertyType } from "@/domain/entities/property.enums";
import { buildUrl } from "./_search/helpers";
import { LandingNav } from "@/features/landing/landing-nav";
import { ProfileEntity, EUserRole } from "@/domain/entities/profile.entity";
import { CITY_LABELS, STATE_LABELS, humanizeLocation } from "@/lib/locations";

interface SearchPageClientProps {
  filters: ListingSearchFiltersType;
  listings: ListingEntity[];
  total: number;
  totalPages: number;
  currentPage: number;
  breadcrumb: string;
  basePath: string;
  lang: Lang;
  favoriteIds?: string[];
  isAuth: boolean;
  profile?: ProfileEntity | null;
  role?: EUserRole | null;
}

function FiltersContent({
  filters,
  onFiltersChange,
}: {
  filters: ListingSearchFiltersType;
  onFiltersChange: (filters: ListingSearchFiltersType) => void;
}) {
  return (
    <ListingSearchFilters
      initialFilters={filters}
      onFiltersChange={onFiltersChange}
    />
  );
}

export function SearchPageClient({
  filters,
  listings,
  total,
  totalPages,
  currentPage,
  breadcrumb,
  basePath,
  lang,
  favoriteIds,
  isAuth,
  profile,
  role,
}: SearchPageClientProps) {
  const { t } = useTranslation(["listings", "common"]);
  const router = useRouter();

  const handleFiltersChange = (newFilters: ListingSearchFiltersType) => {
    const parts: string[] = [];

    if (newFilters.listing_type) {
      parts.push(
        LISTINS_SLUG[newFilters.listing_type as ListingType]?.[lang] ??
          newFilters.listing_type,
      );
    }
    if (newFilters.type) {
      parts.push(
        PROPERTIES_SLUG[newFilters.type as PropertyType]?.[lang] ??
          newFilters.type,
      );
    }
    if (newFilters.city) parts.push(newFilters.city as string);

    const newBasePath = `/${lang}${parts.length ? `/${parts.join("/")}` : ""}`;
    router.push(buildUrl(
      { ...newFilters, page: 1 },
      newBasePath,
      newFilters,
    ), { scroll: false });
  };

  const handleSortChange = (value: string) => {
    router.push(buildUrl({ sort_by: value, page: 1 }, basePath, filters), {
      scroll: false,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNav isAuth={isAuth} role={role ?? null} profile={profile} />

      {/* Breadcrumb */}
      <div className="bg-primary border-y">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-primary-foreground">
            <IconMapPin className="size-4 shrink-0" />
            <span className="capitalize truncate">{breadcrumb}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-4 bg-card rounded-lg border p-4">
              <h2 className="font-semibold mb-4 capitalize">
                {t("common:sections.filters")}
              </h2>
              <FiltersContent
                onFiltersChange={handleFiltersChange}
                filters={filters}
              />
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold capitalize truncate">
                  {filters.city
                    ? CITY_LABELS[filters.city as string] ??
                      humanizeLocation(filters.city as string)
                    : filters.state
                      ? STATE_LABELS[filters.state as string] ??
                        humanizeLocation(filters.state as string)
                      : t("detail.breadcrumb.properties")}
                </h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {total} {total === 1 ? t("words:result") : t("words:results")}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Filter trigger — mobile only */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden flex items-center gap-1.5"
                    >
                      <IconAdjustmentsHorizontal className="size-4" />
                      <span>{t("common:sections.filters")}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 max-w-[85vw] flex flex-col p-0"
                  >
                    <SheetHeader className="px-4 py-4 border-b shrink-0">
                      <SheetTitle className="capitalize text-left">
                        {t("common:sections.filters")}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                      <FiltersContent
                        onFiltersChange={handleFiltersChange}
                        filters={filters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select
                  value={filters.sort_by || "created_at_desc"}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-40 sm:w-50">
                    <SelectValue
                      placeholder="Ordenar por"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { label: "Más recientes", value: "created_at_desc" },
                      { label: "Más antiguos", value: "created_at_asc" },
                      { label: "Precio: menor a mayor", value: "price_asc" },
                      { label: "Precio: mayor a menor", value: "price_desc" },
                    ].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ListingGrid listings={listings} favoriteIds={favoriteIds} />

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  href={buildUrl({ page: currentPage - 1 }, basePath, filters)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                  >
                    <IconChevronLeft className="size-4" />
                    {t("words:back")}
                  </Button>
                </Link>

                <span className="text-sm text-muted-foreground capitalize">
                  {t("words:page")} {currentPage} {t("words:of")} {totalPages}
                </span>

                <Link
                  href={buildUrl({ page: currentPage + 1 }, basePath, filters)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                  >
                    {t("words:next")}
                    <IconChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
