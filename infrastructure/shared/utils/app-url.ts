export function getAppOrigin() {
  const fallbackOrigin = "http://localhost:3000";
  const rawValue = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!rawValue) return fallbackOrigin;

  try {
    const parsed = new URL(rawValue);
    return parsed.origin;
  } catch {
    return fallbackOrigin;
  }
}

