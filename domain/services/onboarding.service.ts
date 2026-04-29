import { SessionPort } from "@/domain/ports/sesion.port";
import { ProfilePort } from "@/domain/ports/profile.port";
import { EUserRole } from "@/domain/entities/profile.entity";
import { RealEstateWithRoleEntity } from "@/domain/entities/real-estate.entity";
import { Lang } from "@/i18n/settings";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { createRouter } from "@/i18n/router";

export type OnboardingState =
  | { step: "redirect"; path: string; activeRealEstateId?: string } // Agregamos el ID opcional
  | { step: "register-real-estate" }
  | { step: "select-real-estate"; realEstates: RealEstateWithRoleEntity[] };

export class OnboardingService {
  constructor(
    private sessionPort: SessionPort,
    private profilePort: ProfilePort,
    private lang: Lang,
  ) {}

  async getOnboardingState(): Promise<OnboardingState> {
    const userId = await this.sessionPort.getCurrentUserId();
    const lang = await getLangServerSide();
    const routes = createRouter(lang);

    if (!userId) {
      return { step: "redirect", path: routes.signin() };
    }

    const profile = await this.profilePort.getProfileByUserId(userId);

    const role = profile.role;

    if (role === EUserRole.Client) {
      return { step: "redirect", path: routes.home() };
    }

    // El Admin suele tener una visión global, pero si necesita una inmobiliaria específica,
    // se podría aplicar la misma lógica que al RealEstate.
    if (role === EUserRole.Admin) {
      const realEstates = await this.sessionPort.getRealEstatesForUser();

      return { step: "select-real-estate", realEstates };
    }

    if (role === EUserRole.RealEstate) {
      const realEstates = await this.sessionPort.getRealEstatesForUser();
      const count = realEstates.length;

      if (count === 0) {
        return { step: "register-real-estate" };
      }

      if (count === 1) {
        // 🔥 AUTO-SELECCIÓN: Pasamos el ID para que el llamador lo procese
        return {
          step: "redirect",
          path: routes.dashboard(),
          activeRealEstateId: realEstates[0].real_estate.id
        };
      }

      return {
        step: "select-real-estate",
        realEstates: realEstates,
      };
    }

    return { step: "redirect", path: routes.home() };
  }
}
