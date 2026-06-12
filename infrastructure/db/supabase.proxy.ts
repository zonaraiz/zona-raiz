import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { EUserRole } from "@/domain/entities/profile.entity";
import { COOKIE_NAMES } from "../config/constants";
import { ROUTES } from "../config/routes";
import { appModule } from "@/application/modules/app.module";
import { detectLang } from "@/i18n/detect-lang";
import { createRouter } from "@/i18n/router";
import { Lang } from "@/i18n/settings";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lang = detectLang(request);
  const routes = createRouter(lang);

  if (isPublicRoute(pathname, lang)) {
    return NextResponse.next();
  }

  const response = createMutableResponse(request);

  const supabase = SupabaseServerClient(request, response);

  const { sessionService, cookiesService, profileService } = await appModule(lang, {
    request,
    response,
  });
  // =========================
  // AUTH
  // =========================
  const isAuth = await sessionService.isAuth();
  if (!isAuth) {
    return redirectTo(routes.signin(), request);
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return redirectTo(routes.signin(), request);
  }

  let role = await cookiesService.getProfileRole();

  if (!role) {
    const profile = await profileService
      .getProfileByUserId(user.id)
      .catch(() => null);

    if (!profile?.role) {
      return redirectTo(routes.signin(), request);
    }

    role = profile.role;
    cookiesService.setSession(COOKIE_NAMES.ROLE, role);
  }

  const realEstateId = await cookiesService.getRealEstateId();

  // =========================
  // CLIENT
  // =========================
  if (role === EUserRole.Client) {
    const { res, cookiesService: cs } = await redirect(routes.home());
    cs.setSession(COOKIE_NAMES.REAL_ESTATE_ROLE, EUserRole.Client);
    return res;
  }

  // =========================
  // ADMIN
  // =========================
  if (role === EUserRole.Admin) {
    cookiesService.setSession(COOKIE_NAMES.REAL_ESTATE_ROLE, EUserRole.Admin);

    if (isRoute(pathname, routes.dashboard())) {
      return response;
    }

    return redirectTo(routes.dashboard(), request);
  }

  // =========================
  // REAL ESTATE
  // =========================
  if (role !== EUserRole.RealEstate) {
    return redirectTo(routes.home(), request);
  }

  // 🔁 Sin contexto — delega lógica al OnboardingService
  if (!realEstateId) {
    if (!isRoute(pathname, routes.onboarding())) {
      return redirectTo(routes.onboarding(), request);
    }

    return response;
  }

  // =========================
  // CONTEXTO ACTIVO
  // =========================
  const realEstates = await sessionService.getRealEstatesForUser();
  const current = realEstates.find((r) => r.real_estate.id === realEstateId);

  if (current) {
    cookiesService.setSession(COOKIE_NAMES.REAL_ESTATE_ROLE, current.role);
  }

  if (isRoute(pathname, routes.onboarding())) {
    return redirectTo(routes.dashboard(), request);
  }

  return response;

  // ==========================================
  // HELPERS (inner scope)
  // ==========================================
  async function redirect(path: string) {
    const res = redirectTo(path, request);
    const { cookiesService } = await appModule(lang, {
      request,
      response: res,
    });
    return { res, cookiesService };
  }
}

// ==========================================
// HELPERS
// ==========================================

function createMutableResponse(request: NextRequest) {
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

function SupabaseServerClient(request: NextRequest, response: NextResponse) {
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

function isPublicRoute(pathname: string, lang: Lang) {
  const publicKeys: (keyof typeof ROUTES)[] = [
    "base",
    "home",
    "contact",
    "listings_public",
    "about",
    "signin",
    "signup",
    "signout",
    "otp",
    "callback",
    "search",
  ];

  return publicKeys
    .map((key) => ROUTES[key][lang])
    .some((route) => isRoute(pathname, route));
}

function isRoute(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/");
}

function redirectTo(path: string, request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url);
}
