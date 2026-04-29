// shared/utils/object.ts
// Object utilities

export const isEmpty = (v: unknown) =>
  !v || v === undefined || v === null || v === "" || Number.isNaN(v);

export const toNumber = (v: string | null) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function removeNullish<T extends Record<string, any>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => isEmpty(value)),
  ) as Partial<T>;
}

export const flatten = (obj: any, prefix = "", formData: FormData) => {
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value instanceof File) {
      formData.append(fullKey, value);
    } else if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Date)
    ) {
      formData.append(fullKey, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(fullKey, String(value));
    }
  });
  return formData;
};

export function pickDefined<T extends object>(
  obj: T,
): {
  [K in keyof T as T[K] extends null | undefined ? never : K]: Exclude<
    T[K],
    null | undefined
  >;
} {
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== null && value !== undefined && value.toString().trim().length > 0) {
      result[key] = value;
    }
  }
  return result;
}
