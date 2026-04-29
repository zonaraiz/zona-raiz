import { ReactNode, Suspense } from "react";
import { encodedRedirect } from "@/shared/redirect";
import { initI18n } from "@/i18n/server";
import { createRouter } from "@/i18n/router";
import { Lang } from "@/i18n/settings";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";
import { Infographic } from "@/features/onboarding/infographic";
import { PageTransition } from "@/components/ui/page-transtion";
import { PageLoader } from "@/features/loader/page-loader";

export default async function layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = langParam as Lang;
  const cookieStore = await cookies();

  const i18n = await initI18n(lang);
  const t = i18n.getFixedT(lang);
  const routes = createRouter(lang);

  const { sessionService } = await appModule(lang, { cookies: cookieStore });
  const user = await sessionService.getCachedCurrentUser();

  if (!user) {
    return encodedRedirect("error", routes.signin(), t("exeptions.auth_error"));
  }

  return (
    <section className="flex min-h-svh flex-col items-center justify-center">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 gap-y-12 md:gap-y-16 lg:grid-cols-5">
          <div className="flex w-full flex-col justify-center gap-5 max-lg:items-center lg:col-span-3">
            <PageTransition>
              <Suspense fallback={<PageLoader />}>{children}</Suspense>
            </PageTransition>
          </div>
          <div className="w-full lg:col-span-2 flex items-center">
            <Infographic />
          </div>
        </div>
      </div>
    </section>
  );
}
