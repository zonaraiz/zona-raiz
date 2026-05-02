import { Lang } from "@/i18n/settings";
import { getTranslation } from "@/i18n/server";
import { LandingNav } from "@/features/landing/landing-nav";
import { LandingFooter } from "@/features/landing/landing-footer";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";

interface TermsPageProps {
  params: Promise<{ lang: Lang }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { lang } = await params;
  const { t } = await getTranslation(lang);
  const cookieStore = await cookies();
  const { sessionService, cookiesService, profileService } = await appModule(lang, {
    cookies: cookieStore,
  });

  let isAuth = false;
  let profile = null;
  const role = await cookiesService.getProfileRole();

  try {
    isAuth = await sessionService.isAuth();
    if (isAuth) {
      const userId = await sessionService.getCurrentUserId();
      if (userId) {
        profile = await profileService.getCachedProfileByUserId(userId);
      }
    }
  } catch {
    isAuth = false;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav isAuth={isAuth} role={role} profile={profile} />
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">{t("terms:title")}</h1>
            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:acceptance.title")}</h2>
                <p className="text-muted-foreground">{t("terms:acceptance.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:nature.title")}</h2>
                <p className="text-muted-foreground">{t("terms:nature.description")}</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>{t("terms:nature.point1")}</li>
                  <li>{t("terms:nature.point2")}</li>
                  <li>{t("terms:nature.point3")}</li>
                  <li>{t("terms:nature.point4")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:independence.title")}</h2>
                <p className="text-muted-foreground">{t("terms:independence.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:liability.title")}</h2>
                <p className="text-muted-foreground">{t("terms:liability.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:content.title")}</h2>
                <p className="text-muted-foreground">{t("terms:content.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:license.title")}</h2>
                <p className="text-muted-foreground">{t("terms:license.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:public.title")}</h2>
                <p className="text-muted-foreground">{t("terms:public.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:notification.title")}</h2>
                <p className="text-muted-foreground">{t("terms:notification.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:misuse.title")}</h2>
                <p className="text-muted-foreground">{t("terms:misuse.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:services.title")}</h2>
                <p className="text-muted-foreground">{t("terms:services.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:suspension.title")}</h2>
                <p className="text-muted-foreground">{t("terms:suspension.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:indemnity.title")}</h2>
                <p className="text-muted-foreground">{t("terms:indemnity.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:modifications.title")}</h2>
                <p className="text-muted-foreground">{t("terms:modifications.description")}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">{t("terms:applicable.title")}</h2>
                <p className="text-muted-foreground">{t("terms:applicable.description")}</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}