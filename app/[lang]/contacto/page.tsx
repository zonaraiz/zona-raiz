import { Lang } from "@/i18n/settings";
import { getTranslation } from "@/i18n/server";
import { LandingNav } from "@/features/landing/landing-nav";
import { LandingFooter } from "@/features/landing/landing-footer";
import { ContactForm } from "@/features/contact/contact-form";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";

interface ContactPageProps {
  params: Promise<{ lang: Lang }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
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
            <h1 className="text-4xl font-bold mb-4">{t("contact:title")}</h1>
            <p className="text-lg text-muted-foreground mb-12">{t("contact:subtitle")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-xl font-semibold mb-6">{t("contact:info_title")}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{t("contact:email_label")}</h3>
                    <p className="text-muted-foreground">contacto@zonaraiz.com</p>
                  </div>
                  <div>
                    <h3 className="font-medium">{t("contact:phone_label")}</h3>
                    <p className="text-muted-foreground">+57 300 123 4567</p>
                  </div>
                  <div>
                    <h3 className="font-medium">{t("contact:address_label")}</h3>
                    <p className="text-muted-foreground">{t("contact:address_value")}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">{t("contact:hours_label")}</h3>
                    <p className="text-muted-foreground">{t("contact:hours_value")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-6">{t("contact:form_title")}</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}