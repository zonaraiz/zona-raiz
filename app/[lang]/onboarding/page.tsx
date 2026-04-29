import { appModule } from "@/application/modules/app.module";
import { OnboardingWrapper } from "@/features/onboarding/onboarding-wrapper";
import { Lang } from "@/i18n/settings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface props {
  params: Promise<{ lang: Lang }>;
}

export default async function page({ params }: props) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const { onboardingService } = await appModule(lang, {
    cookies: cookieStore,
  });

  const state = await onboardingService.getOnboardingState();
  if (state.step === "redirect") {
    // Si el servicio nos da un ID para auto-seleccionar, lo guardamos ahora
    if (state.activeRealEstateId) {
      redirect(`/api/onboarding/set-real-estate?id=${state.activeRealEstateId}`);
    }
  }

  return (
    <div className="flex items-center">
      <OnboardingWrapper initialState={state} />
    </div>
  );
}
