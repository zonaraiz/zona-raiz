"use client";

import { useEffect, useRef } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@/components/ui/form";
import {
  amenitiesOptions,
} from "@/domain/entities/property.entity";
import { PropertyType } from "@/domain/entities/property.enums";
import { PROPERTY_TYPES, LISTING_TYPES, LAND_TYPES } from "@/config/listing-selectors";
import {
  IconMapPin,
  IconHome,
  IconClearAll,
  IconCurrencyDollar,
  IconCheckbox,
  IconTag,
  IconX,

} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  listingSearchFiltersSchema,
  ListingSearchFiltersInput,
  defaultListingSearchFiltersValues,
  defaultFilters,
} from "@/application/validation/listing-search-full.schema";
import { PlaceSearch, ParsedPlace } from "../places/place-search";
import { useParams } from "next/navigation";
import { CITY_LABELS, STATE_LABELS } from "@/lib/locations";
import { cn } from "@/lib/utils";

export { defaultFilters };
export type { ListingSearchFiltersInput };

interface ListingSearchFiltersProps {
  initialFilters?: ListingSearchFiltersInput;
  onFiltersChange: (filters: ListingSearchFiltersInput) => void;
  debounceMs?: number;
}

export function ListingSearchFilters({
  initialFilters,
  onFiltersChange,
  debounceMs = 300,
}: ListingSearchFiltersProps) {
  const { t, i18n } = useTranslation("listings");
  // Namespace separado para traducciones de landing (hero.property_types.*)
  const { t: tLanding } = useTranslation("landing");
  const isExternalUpdate = useRef(false);
  const params = useParams();
  const lang = typeof params.lang === "string" ? params.lang : "es";

  const form = useForm<ListingSearchFiltersInput>({
    resolver: yupResolver(
      listingSearchFiltersSchema,
    ) as Resolver<ListingSearchFiltersInput>,
    defaultValues: initialFilters ?? defaultListingSearchFiltersValues,
    mode: "onChange",
  });

  const { control, setValue, reset, watch, register } = form;
  const values = useWatch({ control });
  const priceRange = watch(["min_price", "max_price"]);

  // Determinar si es tipo terreno/lote
  const isLandType = values.type && LAND_TYPES.includes(values.type as PropertyType);

  // Notifica cambios con debounce
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onFiltersChange(values as ListingSearchFiltersInput);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [values, debounceMs, onFiltersChange]);

  // Sincroniza si cambian los initialFilters desde afuera
  useEffect(() => {
    if (initialFilters) {
      isExternalUpdate.current = true;
      reset(initialFilters);
    }
  }, [initialFilters, reset]);

  useEffect(() => {
    register("country");
    register("state");
    register("city");
    register("neighborhood");
    register("street");
  }, [register]);

  const handleReset = () => {
    reset(defaultListingSearchFiltersValues);
    onFiltersChange(defaultListingSearchFiltersValues);
  };

  return (
    <Form form={form} onSubmit={() => {}} className="space-y-3">
      <div className="flex gap-2 items-end">
        <Form.Input
          name="q"
          placeholder={`${t("placeholders.search_properties")}...`}
          className="flex-1 py-2"
        />
        <Button type="button" size="sm" onClick={handleReset} variant="outline" className="px-2">
          <IconClearAll className="size-4" />
        </Button>
      </div>

      {/* Listing Type - Tabs estilo hero */}
      <CardHeader className="p-0 pb-3">
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <IconTag className="size-3" />
          {t("sections.type_listings")}
        </span>
        <div className="flex border-b rounded-md overflow-hidden">
          {LISTING_TYPES.map((lt) => (
            <button
              key={lt.value}
              type="button"
              onClick={() => setValue("listing_type", lt.value)}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-all duration-200",
                values.listing_type === lt.value
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground bg-muted/30",
              )}
            >
              {tLanding(lt.label)}
            </button>
          ))}
        </div>
      </CardHeader>

      <Form.Set
        legend={
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <IconMapPin className="size-3" />
            {t("sections.location")}
          </span>
        }
      >
        <div className="space-y-2">
          <PlaceSearch
            lang={lang as "es" | "en"}
            navigate={false}
            placeholder={t("common:words.search") || "Ciudad o barrio..."}
            onSelect={(place: ParsedPlace) => {
              if (place.city) setValue("city", place.city);
              if (place.state) setValue("state", place.state);
              if (place.neighborhood)
                setValue("neighborhood", place.neighborhood);
            }}
          />
          {/* Mostrar chips de lo seleccionado */}
          {(values.city || values.state || values.neighborhood) && (
            <div className="flex flex-wrap gap-1.5">
              {values.state && typeof values.state === "string" && (
                <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {STATE_LABELS[values.state as keyof typeof STATE_LABELS] ??
                    values.state}
                  <button
                    type="button"
                    onClick={() => {
                      setValue("state", undefined);
                      setValue("city", undefined);
                    }}
                  >
                    <IconX className="size-2.5" />
                  </button>
                </span>
              )}
              {values.city && typeof values.city === "string" && (
                <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {CITY_LABELS[values.city as keyof typeof CITY_LABELS] ??
                    values.city}
                  <button
                    type="button"
                    onClick={() => setValue("city", undefined)}
                  >
                    <IconX className="size-2.5" />
                  </button>
                </span>
              )}
              {values.neighborhood && (
                <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {values.neighborhood}
                  <button
                    type="button"
                    onClick={() => setValue("neighborhood", undefined)}
                  >
                    <IconX className="size-2.5" />
                  </button>
                </span>
              )}
            </div>
          )}
          {/* Barrio manual como fallback */}
          <Form.Input
            name="neighborhood"
            placeholder={t("placeholders.neighborhood")}
          />
        </div>
      </Form.Set>

      <Form.Set
        legend={
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <IconCurrencyDollar className="size-3" />
            {t("sections.price_range")}
          </span>
        }
      >
        <div className="space-y-2">
          <Slider
            value={[values.min_price || 0, values.max_price || 10_000_000_000]}
            onValueChange={([min, max]) => {
              setValue("min_price", min);
              setValue("max_price", max);
            }}
            max={10_000_000_000}
            step={10_000_000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${(priceRange[0] || 0).toLocaleString(i18n.language)}</span>
            <span>
              ${(priceRange[1] || 10_000_000_000).toLocaleString(i18n.language)}
            </span>
          </div>
        </div>
      </Form.Set>

      {/* Property Type - Pills estilo hero */}
      <div>
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground pb-2">
          <IconHome className="size-3" />
          {t("sections.type_properties")}
        </span>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setValue("type", values.type === value ? undefined : value)
              }
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                values.type === value
                  ? "bg-primary text-primary-foreground border-primary scale-105 shadow-sm"
                  : "bg-background text-foreground border-border hover:border-primary/50 hover:scale-[1.02]",
              )}
              >
              <Icon className="size-3" />
              {tLanding(label)}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms y Bathrooms en grid - solo si no es terreno/lote */}
      {!isLandType && (
        <div className="grid grid-cols-2 gap-2">
          <Form.Input
            name="min_bedrooms"
            type="number"
            label={t("labels.bedrooms")}
            placeholder={t("placeholders.min_bedrooms")}
          />
          <Form.Input
            name="min_bathrooms"
            type="number"
            label={t("labels.bathrooms")}
            placeholder={t("placeholders.min_bathrooms")}
          />
        </div>
      )}

      <Form.Set
        legend={
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <IconCheckbox className="size-3" />
            {t("sections.amenities")}
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-40 overflow-y-auto">
          {amenitiesOptions.map((amenity) => (
            <div key={amenity.value} className="flex items-center gap-1.5">
              <Checkbox
                id={`amenity-${amenity.value}`}
                className="size-3.5"
                checked={values.amenities?.includes(amenity.value)}
                onCheckedChange={(checked) => {
                  const current = values.amenities || [];
                  setValue(
                    "amenities",
                    checked
                      ? [...current, amenity.value]
                      : current.filter((a) => a !== amenity.value),
                  );
                }}
              />
              <label
                htmlFor={`amenity-${amenity.value}`}
                className="text-xs cursor-pointer"
              >
                {amenity.label}
              </label>
            </div>
          ))}
        </div>
      </Form.Set>

      {values.amenities && values.amenities.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setValue("amenities", [])}
          className="w-full"
        >
          {t("actions.clear_amenities")}
        </Button>
      )}
    </Form>
  );
}
