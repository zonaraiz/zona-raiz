import { Lang } from "@/i18n/settings";
import { LandingNav } from "@/features/landing/landing-nav";
import { LandingHero } from "@/features/landing/landing-hero";
import { LandingTrust } from "@/features/landing/landing-trust";
import { LandingListings } from "@/features/landing/landing-listings";
import { LandingCities } from "@/features/landing/landing-cities";
import { LandingFooter } from "@/features/landing/landing-footer";
import { getLandingData } from "@/application/actions/landing.actions";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";
import { Suspense } from "react";
import {
  HeroSkeleton,
  TrustSectionSkeleton,
  ListingsSectionSkeleton,
  CitiesSectionSkeleton,
} from "@/components/ui/skeleton";

interface HomePageProps {
  params: Promise<{ lang: Lang }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const { sessionService, favoriteService, cookiesService, profileService } = await appModule(lang, {
    cookies: cookieStore,
  });
  const landingData = await getLandingData();
  let isAuth = false; // ✅ declared in outer scope
  let favoriteIds: string[] = [];
  let profile = null;
  const role = await cookiesService.getProfileRole()

  try {
    isAuth = await sessionService.isAuth();
    if (isAuth) {
      const userId = await sessionService.getCurrentUserId();
      if (userId) {
        const favorites = await favoriteService.findByProfileId(userId);
        favoriteIds = favorites.map((f) => f.listing_id);
        profile = await profileService.getCachedProfileByUserId(userId);
      }
    }
  } catch {
    isAuth = false;
    favoriteIds = [];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav isAuth={isAuth} role={role} profile={profile} />
      <main className="flex-1">
        <Suspense fallback={<HeroSkeleton />}>
          <LandingHero lang={lang} />
        </Suspense>
        <Suspense fallback={<TrustSectionSkeleton />}>
          <LandingTrust
            stats={landingData.stats}
            agentAvatars={landingData.agents}
          />
        </Suspense>
        <Suspense fallback={<ListingsSectionSkeleton />}>
          <LandingListings
            favoriteIds={favoriteIds}
            listings={landingData.listings}
          />
        </Suspense>
        <Suspense fallback={<CitiesSectionSkeleton />}>
          <LandingCities cities={landingData.cities} />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
