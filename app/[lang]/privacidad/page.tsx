import { Lang } from "@/i18n/settings";
import { getTranslation } from "@/i18n/server";
import { LandingNav } from "@/features/landing/landing-nav";
import { LandingFooter } from "@/features/landing/landing-footer";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";

interface PrivacyPageProps {
  params: Promise<{ lang: Lang }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = await params;
  const { t } = await getTranslation(lang);
  const cookieStore = await cookies();
  const { sessionService, favoriteService, cookiesService, profileService } = await appModule(lang, {
    cookies: cookieStore,
  });

  let isAuth = false;
  let favoriteIds: string[] = [];
  let profile = null;
  let role = await cookiesService.getProfileRole();

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
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">{t("privacy:title")}</h1>
            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:responsible.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:responsible.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:data.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:data.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:purposes.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:purposes.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:base.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:base.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:sources.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:sources.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:sharing.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:sharing.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:security.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:security.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:rights.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:rights.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:procedure.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:procedure.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:conservation.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:conservation.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:changes.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:changes.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("privacy:applicable.title")}</h2>
                <p className="text-muted-foreground">{t("privacy:applicable.description")}</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}