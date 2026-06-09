import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { detectLang } from "@/i18n/detect-lang";
import { createRouter } from "@/i18n/router";
import {
  COOKIE_NAMES,
  COOKIE_OPTIONS,
} from "@/infrastructure/config/constants";
import { SupabaseProfileAdapter } from "@/infrastructure/adapters/supabase/supabase-profile.adapter";

function createMutableResponse(request: NextRequest) {
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

function createSupabaseRouteClient(
  request: NextRequest,
  response: NextResponse,
) {
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !publishableKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const lang = detectLang(request);
  const routes = createRouter(lang);

  const code = searchParams.get("code");
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const sessionResponse = createMutableResponse(request);
  const supabase = createSupabaseRouteClient(request, sessionResponse);
  const profileAdapter = new SupabaseProfileAdapter(supabase);

  let userId: string | null = null;

  try {
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      userId = data.user?.id ?? null;
    } else if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
      userId = data.user?.id ?? null;
    } else if (tokenHash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as "signup" | "recovery" | "email_change" | "email",
        token_hash: tokenHash,
      });
      if (error) throw error;
      userId = data.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.redirect(
        `${origin}${routes.signin()}?error=auth_error`,
      );
    }

    const profile = await profileAdapter.getProfileByUserId(userId);
    const redirectResponse = NextResponse.redirect(
      `${origin}${routes.onboarding()}`,
    );

    sessionResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    if (profile.role) {
      redirectResponse.cookies.set(COOKIE_NAMES.ROLE, profile.role, COOKIE_OPTIONS);
    }

    return redirectResponse;
  } catch {
    return NextResponse.redirect(
      `${origin}${routes.signin()}?error=auth_error`,
    );
  }
}
