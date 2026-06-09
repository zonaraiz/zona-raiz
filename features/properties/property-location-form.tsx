"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/form";
import countries from "@/lib/countries.json";
import { useFormContext } from "react-hook-form";
import { useParams } from "next/navigation";
import { PlaceSearch, ParsedPlace } from "../places/place-search";
import { Button } from "@/components/ui/button";

export function PropertyLocationForm() {
  const { t } = useTranslation("properties");
  const { control, setValue, watch } = useFormContext();
  const { lang } = useParams<{ lang: string }>();
  const [usePlaceSearch, setUsePlaceSearch] = useState(true);

  // Watch current values for manual mode
  const currentCountry = watch("country");
  const currentState = watch("state");
  const currentCity = watch("city");

  const handlePlaceSelect = (place: ParsedPlace) => {
    if (place.country) {
      setValue("country", place.country, { shouldValidate: true });
    }
    if (place.state) {
      setValue("state", place.state, { shouldValidate: true });
    }
    if (place.city) {
      setValue("city", place.city, { shouldValidate: true });
    }
    if (typeof place.latitude === "number") {
      setValue("latitude", place.latitude, { shouldValidate: true });
    }
    if (typeof place.longitude === "number") {
      setValue("longitude", place.longitude, { shouldValidate: true });
    }
    if (place.postal_code) {
      setValue("postal_code", place.postal_code, { shouldValidate: true });
    }
    if (place.street) {
      setValue("street", place.street, { shouldValidate: true });
    }
  };

  const handleModeChange = (mode: "search" | "manual") => {
    setUsePlaceSearch(mode === "search");
  };

  return (
    <Form.Set legend={t("sections.location")}>
      {/* Switch between PlaceSearch and Manual input */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={usePlaceSearch ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("search")}
          className="text-xs"
        >
          📍
        </Button>
        <Button
          type="button"
          variant={!usePlaceSearch ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("manual")}
          className="text-xs"
        >
          ✏️
        </Button>
      </div>

      {usePlaceSearch ? (
        <div className="space-y-4">
          <PlaceSearch
            lang={lang as "es" | "en"}
            navigate={false}
            placeholder={t("common:words.search") || "Ciudad o barrio..."}
            onSelect={handlePlaceSelect}
          />
          {/* Display selected values */}
          {(currentCountry || currentState || currentCity) && (
            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              {currentCountry && (
                <span className="bg-primary/10 px-2 py-0.5 rounded">
                  {currentCountry.toUpperCase()}
                </span>
              )}
              {currentState && (
                <span className="bg-primary/10 px-2 py-0.5 rounded">
                  {currentState}
                </span>
              )}
              {currentCity && (
                <span className="bg-primary/10 px-2 py-0.5 rounded">
                  {currentCity}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <Form.CountryStateCity
          countryName="country"
          stateName="state"
          cityName="city"
          countries={countries}
          control={control}
        />
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Form.Input
          name="postal_code"
          label={t("labels.postal_code")}
          placeholder={t("placeholders.postal_code")}
        />
        <Form.Input
          name="street"
          label={t("labels.street")}
          placeholder={t("placeholders.street")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Input
          name="latitude"
          type="number"
          step="any"
          label={t("labels.latitude")}
          placeholder={t("placeholders.latitude")}
        />
        <Form.Input
          name="longitude"
          type="number"
          step="any"
          label={t("labels.longitude")}
          placeholder={t("placeholders.longitude")}
        />
      </div>
    </Form.Set>
  );
}
