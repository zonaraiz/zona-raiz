import { SiteHeader } from "@/features/navigation/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CSSProperties, ReactNode, Suspense } from "react";
import { AppSidebar } from "@/features/navigation/app-sidebar";
import { PageLoader } from "@/features/loader/page-loader";
import { encodedRedirect } from "@/shared/redirect";
import { EUserRole } from "@/domain/entities/profile.entity";
import { DashboardBottomNav } from "@/features/navigation/dashboard-bottom-nav";
import { createRouter } from "@/i18n/router";
import { Lang } from "@/i18n/settings";
import { initI18n } from "@/i18n/server";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const cookieStore = await cookies();
  const { lang: langParam } = await params;
  const lang = langParam as Lang;

  const routes = createRouter(lang);
  const i18n = await initI18n(lang);
  const t = i18n.getFixedT(lang);
  const { cookiesService, sessionService } = await appModule(lang, {
    cookies: cookieStore,
  });

  const role = await cookiesService.getProfileRole()


  const real_estate_id_cookie =
    (await cookiesService.getRealEstateId()) as string;
  let real_estate_id = real_estate_id_cookie;

  // 🛡️ SEGUNDA OPORTUNIDAD: Si la cookie no está, intentamos recuperarla de la DB
  if (!real_estate_id) {
    const realEstates = await sessionService.getRealEstatesForUser();

    if (realEstates && realEstates.length === 1) {
      real_estate_id = realEstates[0].real_estate.id;
      // Opcional: intentar setearla aquí, aunque en Server Components es limitado
    } else {
      // Si realmente no hay nada, entonces sí mandamos a onboarding
      return encodedRedirect(
        "error",
        routes.onboarding(),
        t("common:exceptions.data_not_found"),
      );
    }
  }

  if (!real_estate_id) {
    return encodedRedirect(
      "error",
      routes.onboarding(),
      t("common:exceptions.data_not_found"),
    );
  }

  const profile = await sessionService.getCachedCurrentUser();
  const menu = await sessionService.getMenuByRol();

  if (!profile) {
    return encodedRedirect(
      "error",
      routes.signin(),
      t("common:exceptions.data_not_found"),
    );
  }

  let favorites: {
    id: string;
    listing_id: string;
    created_at: string;
    listing?: any;
  }[] = [];
  try {
    const { favoriteService, listingService } = await appModule(lang, {
      cookies: cookieStore,
    });
    const isAuth = await sessionService.isAuth();
    if (isAuth) {
      const userId = await sessionService.getCurrentUserId();
      if (userId) {
        const userFavorites = await favoriteService.findByProfileId(userId);
        if (userFavorites.length > 0) {
          const listingIds = userFavorites.map((f) => f.listing_id);
          const listings = await listingService.findByIds(listingIds);
          const listingsMap = new Map(listings.map((l) => [l.id, l]));
          favorites = userFavorites.map((fav) => ({
            ...fav,
            listing: listingsMap.get(fav.listing_id),
          }));
        }
      }
    }
  } catch {
    favorites = [];
  }


  if (role == EUserRole.Client) {
    return (
      <div className="flex flex-1 flex-col bg-[radial-gradient(#ccc,transparent_1px)] bg-size-[16px_16px] h-lvh">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6  h-full">
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        menu={menu}
        profile={profile}
        favorites={favorites}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-[radial-gradient(#ccc,transparent_1px)] bg-size-[16px_16px] h-lvh">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6  h-full">
              <Suspense fallback={<PageLoader />}>{children}</Suspense>
            </div>
          </div>
        </div>
        <DashboardBottomNav items={menu} />
      </SidebarInset>
    </SidebarProvider>
  );
}
