import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAMES, COOKIE_OPTIONS } from "@/infrastructure/config/constants";
import { createRouter } from "@/i18n/router";
import { appModule } from "@/application/modules/app.module";
import { detectLang } from "@/i18n/detect-lang";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const lang = detectLang(request);
  const routes = createRouter(lang);
  const cookieStore = await cookies();

  const { authService } = await appModule(lang, {
    cookies: cookieStore,
  });

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  let profile = null;

  // 1. Intercambio de tokens (PKCE o OTP)
  if (code) {
    profile = await authService.exchangeCodeForSession(code);
  } else if (token_hash && type) {
    profile = await authService.verifyOtp(token_hash, type);
  }

  if (!profile) {
    return NextResponse.redirect(`${origin}${routes.signin()}?error=auth_error`);
  }

  // 2. Seteamos el rol básico en la cookie para que el middleware/layout lo reconozca
  const response = NextResponse.redirect(`${origin}${routes.onboarding()}`);

  if (profile.role) {
    response.cookies.set(COOKIE_NAMES.ROLE, profile.role, COOKIE_OPTIONS);
  }

  return response;
}
