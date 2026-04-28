import { appModule } from "@/application/modules/app.module";
import { OnboardingWrapper } from "@/features/onboarding/onboarding-wrapper";
import { Lang } from "@/i18n/settings";
import { COOKIE_NAMES } from "@/infrastructure/config/constants";
import { cookies } from "next/headers";

interface props {
  params: Promise<{ lang: Lang }>;
}

export default async function page({ params }: props) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const { onboardingService, cookiesService } = await appModule(lang, {
    cookies: cookieStore,
  });

  const state = await onboardingService.getOnboardingState();
  console.log(state)
  if (state.step === "redirect") {
    // Si el servicio nos da un ID para auto-seleccionar, lo guardamos ahora
    if (state.activeRealEstateId) {
      cookiesService.setSession(
        COOKIE_NAMES.REAL_ESTATE,
        state.activeRealEstateId,
      );
    }
  }

  return (
    <div className="flex items-center">
      <OnboardingWrapper initialState={state} />
    </div>
  );
}
