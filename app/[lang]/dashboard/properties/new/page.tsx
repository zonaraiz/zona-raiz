import { PropertyForm } from "@/features/properties/property-form";
import { COOKIE_NAMES } from "@/infrastructure/config/constants";
import { cookies } from "next/headers";
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { initI18n } from "@/i18n/server";
import { createRouter } from "@/i18n/router";
import { appModule } from "@/application/modules/app.module";
import { encodedRedirect } from "@/shared/redirect";
import { Lang } from "@/i18n/settings";

interface props {
  params: Promise<{ lang: Lang }>
}

export default async function page({ params }: props) {
  const { lang } = await params;
  const i18n = await initI18n(lang)
  const t = i18n.getFixedT(lang)
  const cookieStore = await cookies()
  const routes = createRouter(lang)
  const { cookiesService } = await appModule(lang, { cookies: cookieStore })

  const realEstateId = await cookiesService.getRealEstateId()

  if (!realEstateId) {
    return encodedRedirect('error', routes.onboarding(), t("common:exceptions.data_not_found"))
  }

  return (
    <div className='flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8'>
      <Suspense fallback={<Spinner />}>
        <Card className='w-full sm:max-w-3xl'>
          <CardContent>
            <PropertyForm
              realEstateId={realEstateId}
            />
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
