"use client";

import { ListingType } from "@/domain/entities/listing.enums";
import { cn } from "@/lib/utils";

interface PropertyPricingFormProps {
  price: number;
  listingType: ListingType;
  onPriceChange: (price: number) => void;
  onListingTypeChange: (type: ListingType) => void;
}

const LISTING_TYPE_OPTIONS = [
  { value: ListingType.RENT, label: "Arriendo" },
  { value: ListingType.SALE, label: "Venta" },
];

export function PropertyPricingForm({
  price,
  listingType,
  onPriceChange,
  onListingTypeChange,
}: PropertyPricingFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-medium">Tipo de publicación</span>
        <div className="flex rounded-lg border overflow-hidden">
          {LISTING_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onListingTypeChange(opt.value)}
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

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="pricing-price">
          Precio (COP)
        </label>
        <input
          id="pricing-price"
          type="number"
          min={0}
          value={price || ""}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          placeholder="Ej: 500000000"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}
