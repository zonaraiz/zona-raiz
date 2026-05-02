"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IconMapPin, IconLoader2, IconX } from "@tabler/icons-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { buildSearchUrl } from "@/i18n/client-router";
import { Lang } from "@/i18n/settings";
import { slugify } from "@/lib/utils";

type Prediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: { value: string }[];
};

export type ParsedPlace = {
  city?: string;
  state?: string;
  country?: string;
  neighborhood?: string;
  label?: string;
};

interface PlaceSearchProps {
  lang: Lang;
  placeholder?: string;
  className?: string;
  navigate?: boolean;
  onSelect?: (place: ParsedPlace) => void;
}

// ─── Estado de carga del script ───────────────────────────────────────────────
type ScriptState = "idle" | "loading" | "ready" | "error";

function useGooglePlaces() {
  const [state, setState] = useState<ScriptState>(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places)
      return "ready";
    return "idle";
  });

  useEffect(() => {
    if (state === "ready") return;

    const existing = document.getElementById("google-places-script");

    const onLoad = () => setState("ready");
    const onError = () => setState("error");

    if (existing) {
      // Script ya existe pero aún cargando
      if (window.google?.maps?.places) {
        setState("ready");
        return;
      }
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };
    }

    setState("loading");
    const script = document.createElement("script");
    script.id = "google-places-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.head.appendChild(script);

    // Timeout de seguridad: si tarda más de 10s, marcar como error
    const timeout = setTimeout(() => {
      if (!window.google?.maps?.places) setState("error");
    }, 10_000);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      clearTimeout(timeout);
    };
  }, []); // solo una vez

  return state;
}

function parsePredictionTerms(prediction: Prediction): ParsedPlace {
  const terms = prediction.terms.map((t) => slugify(t.value));
  if (terms.length >= 4)
    return { neighborhood: terms[0], city: terms[1], state: terms[2] };
  if (terms.length === 3) return { city: terms[0], state: terms[1] };
  if (terms.length === 2) return { city: terms[0] };
  return { city: terms[0] };
}

// Obtener detalles con timeout propio
function getPlaceDetails(
  service: google.maps.places.PlacesService,
  placeId: string,
  timeoutMs = 5000,
): Promise<google.maps.places.PlaceResult> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("getDetails timeout")),
      timeoutMs,
    );
    service.getDetails(
      { placeId, fields: ["address_components"] },
      (result, status) => {
        clearTimeout(timer);
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Places API status: ${status}`));
        }
      },
    );
  });
}

export function PlaceSearch({
  lang,
  placeholder = "",
  className,
  navigate = true,
  onSelect,
}: PlaceSearchProps) {
  const router = useRouter();
  const { t } = useTranslation("components");
  const scriptState = useGooglePlaces();
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const mountedRef = useRef(true);

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ParsedPlace | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Inicializar servicio cuando el script esté listo
  useEffect(() => {
    if (scriptState === "ready" && !serviceRef.current) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }
  }, [scriptState]);

  // Cleanup al desmontar
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!serviceRef.current || input.length < 2) {
      setPredictions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    setLoading(true);

    debounceRef.current = setTimeout(() => {
      // Timeout de seguridad para la búsqueda de predicciones
      const safetyTimer = setTimeout(() => {
        if (mountedRef.current) setLoading(false);
      }, 5000);

      serviceRef.current!.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "co" },
          types: ["(regions)"],
        },
        (results, status) => {
          clearTimeout(safetyTimer);
          if (!mountedRef.current) return;
          setLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results as unknown as Prediction[]);
          } else {
            setPredictions([]);
          }
        },
      );
    }, 300);
  }, []);

  const handleInput = (value: string) => {
    setSelected(null);
    setQuery(value);
    setOpen(value.length >= 2);
    fetchPredictions(value);
  };

  const handleSelect = async (prediction: Prediction) => {
    setOpen(false);
    setPredictions([]);
    setLoading(true);

    const parsedFromTerms = parsePredictionTerms(prediction);
    const basePlace: ParsedPlace = {
      ...parsedFromTerms,
      label: prediction.structured_formatting.main_text,
    };

    const finalize = (place: ParsedPlace) => {
      if (!mountedRef.current) return;
      setSelected(place);
      setLoading(false);
      setQuery("");
      onSelect?.(place);
      if (navigate) {
        router.push(
          buildSearchUrl({
            lang,
            city: place.city,
            neighborhood: place.neighborhood,
          }),
        );
      }
    };

    try {
      const dummyDiv = document.createElement("div");
      const placesService = new google.maps.places.PlacesService(dummyDiv);
      const details = await getPlaceDetails(placesService, prediction.place_id);

      const components = details.address_components ?? [];
      const find = (...types: string[]) =>
        components.find((c) => types.some((t) => c.types.includes(t)));

      const place: ParsedPlace = {
        country: find("country")?.short_name?.toLowerCase(),
        state: find("administrative_area_level_1")?.long_name,
        city: find("locality", "administrative_area_level_2")?.long_name,
        neighborhood: find("sublocality_level_1", "neighborhood")?.long_name,
        label: prediction.structured_formatting.main_text,
      };

      // Limpiar undefined
      Object.keys(place).forEach(
        (k) => place[k as keyof ParsedPlace] === undefined && delete place[k as keyof ParsedPlace],
      );

      finalize(place);
    } catch (error) {
      console.warn("Place Details failed, using fallback:", error);
      finalize(basePlace);
    }
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    onSelect?.({});
  };

  // Si el script falló, mostrar input deshabilitado con mensaje
  if (scriptState === "error") {
    return (
      <div className={`relative ${className ?? ""}`}>
        <Command shouldFilter={false} className="rounded-xl border shadow-sm opacity-60">
          <div className="flex items-center px-3 gap-2 min-h-11">
            <IconMapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              {t("places.unavailable", "Búsqueda no disponible")}
            </span>
          </div>
        </Command>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Command shouldFilter={false} className="rounded-xl border shadow-sm">
        <div className="flex items-center px-3 gap-2 min-h-11">
          {loading ? (
            <IconLoader2 className="size-4 text-muted-foreground animate-spin shrink-0" />
          ) : (
            <IconMapPin className="size-4 text-muted-foreground shrink-0" />
          )}

          {selected ? (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
              <IconMapPin className="size-3" />
              <span>{selected.label}</span>
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <IconX className="size-3" />
              </button>
            </div>
          ) : (
            <CommandInput
              value={query}
              onValueChange={handleInput}
              placeholder={
                scriptState !== "ready"
                  ? t("places.loading", "Cargando…")
                  : placeholder
              }
              disabled={scriptState !== "ready"}
              className="border-0 focus:ring-0 h-10 px-0 flex-1 disabled:opacity-50"
            />
          )}
        </div>
      </Command>

      {open && (
        <div className="absolute z-50 w-full bg-popover border rounded-xl shadow-lg mt-1 overflow-hidden">
          <Command shouldFilter={false}>
            <CommandList>
              {predictions.length === 0 && !loading && (
                <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                  {t("places.no_results")}
                </CommandEmpty>
              )}
              {predictions.length > 0 && (
                <CommandGroup heading={t("places.results_heading")}>
                  {predictions.map((p) => (
                    <CommandItem
                      key={p.place_id}
                      value={p.place_id}
                      onSelect={() => handleSelect(p)}
                      className="flex items-start gap-2 py-2.5 cursor-pointer"
                    >
                      <IconMapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {p.structured_formatting.main_text}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {p.structured_formatting.secondary_text}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
