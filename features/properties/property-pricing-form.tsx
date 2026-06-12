"use client";

import { useFormContext } from "react-hook-form";
import { PropertyInput } from "@/application/validation/property.schema";
import { ListingType } from "@/domain/entities/listing.enums";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LISTING_TYPE_OPTIONS = [
  { value: ListingType.RENT, label: "Arriendo" },
  { value: ListingType.SALE, label: "Venta" },
];

export function PropertyPricingForm() {
  const { setValue, watch } = useFormContext<PropertyInput>();
  const { t } = useTranslation("common");
  const listingType = watch("listing_type");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-medium">{t("words.listing_type") || "Tipo de publicación"}</span>
        <div className="flex rounded-lg border overflow-hidden">
          {LISTING_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("listing_type", opt.value)}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-all",
                listingType === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Form.Input
        name="price"
        type="number"
        label="Precio (COP)"
        placeholder="Ej: 500000000"
      />
    </div>
  );
}
