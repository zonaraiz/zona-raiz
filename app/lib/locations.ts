import locations from "./countries.json";

export const STATES_SET = new Set(
  locations.flatMap((country) => country.states.map((s) => s.value)),
);

export const CITIES_SET = new Set(
  locations.flatMap((country) =>
    country.states.flatMap((state) => state.cities.map((c) => c.value)),
  ),
);

export const CITY_TO_STATE: Record<string, string> = Object.fromEntries(
  locations.flatMap((country) =>
    country.states.flatMap((state) =>
      state.cities.map((city) => [city.value, state.value]),
    ),
  ),
);

export const STATE_LABELS: Record<string, string> = Object.fromEntries(
  locations.flatMap((country) => country.states.map((s) => [s.value, s.label])),
);

export const CITY_LABELS: Record<string, string> = Object.fromEntries(
  locations.flatMap((country) =>
    country.states.flatMap((state) =>
      state.cities.map((c) => [c.value, c.label]),
    ),
  ),
);

export function humanizeLocation(value?: string | null): string {
  if (!value) return "";

  if (CITY_LABELS[value]) return CITY_LABELS[value];
  if (STATE_LABELS[value]) return STATE_LABELS[value];

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
