import { Lang } from "@/i18n/settings";
import { getTranslation } from "@/i18n/server";
import { LandingNav } from "@/features/landing/landing-nav";
import { LandingFooter } from "@/features/landing/landing-footer";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";
import type { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{ lang: Lang }>;
}

export const metadata: Metadata = {
  title: "Sobre Nosotros | Zonaraíz",
  description: "Conoce más sobre Zonaraíz, nuestra misión, visión y valores.",
  authors: [{ name: "CEO Name" }],
};

export default async function AboutPage({ params }: AboutPageProps) {
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
            <h1 className="text-4xl font-bold mb-8">{t("about:title")}</h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6">{t("about:intro")}</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">{t("about:mission.title")}</h2>
              <p className="text-muted-foreground">{t("about:mission.description")}</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">{t("about:vision.title")}</h2>
              <p className="text-muted-foreground">{t("about:vision.description")}</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">{t("about:values.title")}</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t("about:values.trust")}</li>
                <li>{t("about:values.transparency")}</li>
                <li>{t("about:values.innovation")}</li>
                <li>{t("about:values.commitment")}</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
