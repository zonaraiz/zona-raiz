import { createClient } from "@supabase/supabase-js";

export async function SupabaseBrowserClient() {
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !publishableKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey,
  );
}
