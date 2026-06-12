import { SessionPort } from "@/domain/ports/sesion.port";
import { unstable_cache } from "next/cache";
import { ProfilePort } from "../ports/profile.port";
import { MenuEntity } from "../entities/menu.entity";
import { EAgentRole } from "../entities/real-estate-agent.entity";
import { Lang } from "@/i18n/settings";
import { createRouter } from "@/i18n/router";
import { CookiesPort } from "../ports/cookies.port";
import { EUserRole } from "../entities/profile.entity";
import { initI18n } from "@/i18n/server";
import { CACHE_TAGS } from "@/infrastructure/config/constants";

export class SessionService {
  constructor(
    private sessionPort: SessionPort,
    private profiles: ProfilePort,
    private cookiesPort: CookiesPort,
    private lang: Lang,
  ) {}

  isAuth() {
    return this.sessionPort.isAuth();
  }

  getCurrentUserId() {
    return this.sessionPort.getCurrentUserId();
  }

  getCachedCurrentUserId() {
    return unstable_cache(
      async () => this.sessionPort.getCurrentUserId(),
      [CACHE_TAGS.SESSION.USER_ID],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.SESSION.SINGLE, CACHE_TAGS.SESSION.USER_ID],
      },
    )();
  }

  getCurrentUser() {
    return this.sessionPort.getCurrentUser();
  }

  getCachedCurrentUser() {
    return unstable_cache(
      async () => this.sessionPort.getCurrentUser(),
      [CACHE_TAGS.SESSION.CURRENT_USER],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.SESSION.SINGLE, CACHE_TAGS.SESSION.CURRENT_USER],
      },
    )();
  }

  getRealEstatesForUser() {
    return this.sessionPort.getRealEstatesForUser();
  }

  getCachedRealEstatesForUser() {
    return unstable_cache(
      async () => this.sessionPort.getRealEstatesForUser(),
      [CACHE_TAGS.SESSION.REAL_ESTATES],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.SESSION.SINGLE, CACHE_TAGS.SESSION.REAL_ESTATES],
      },
    )();
  }

  async getCurrentUserAgentRole(
    realEstateId: string,
  ): Promise<EAgentRole | null> {
    const userId = await this.sessionPort.getCurrentUserId();
    if (!userId) return null;
    const agentRole = await this.profiles.getAgentRoleInRealEstate(
      userId,
      realEstateId,
    );
    return agentRole?.role ?? null;
  }

  async getMenuByRol(): Promise<MenuEntity[]> {
    const routes = createRouter(this.lang);
    const i18n = await initI18n(this.lang);
    const t = i18n.getFixedT(this.lang);

    const roleProfile =
      (await this.cookiesPort.getProfileRole()) ??
      (await this.sessionPort.getCurrentUser())?.role;

    const basicRoutes = [
      {
        title: t("components:nav.dashboard"),
        url: routes.dashboard(),
        icon: "layout-dashboard",
      },
      {
        title: t("components:nav.properties"),
        url: routes.properties(),
        icon: "building-2",
      },
      {
        title: t("components:nav.listings"),
        url: routes.listings(),
        icon: "tags",
      },
      {
        title: t("components:nav.enquiries"),
        url: routes.enquiries(),
        icon: "message-square-text",
      },
    ];

    if (roleProfile == EUserRole.Admin) {
      return basicRoutes.concat([
        {
          title: t("components:nav.users"),
          url: routes.users(),
          icon: "users",
        },
        {
          title: t("components:nav.imports"),
          url: routes.import(),
          icon: "upload",
        }
      ]);
    }

    if (roleProfile == EUserRole.Client) {
      return ([
        {
          title: t("components:nav.profile"),
          url: routes.profile(),
          icon: "user",
        }
      ]);
    }

    const realEstateId = await this.cookiesPort.getRealEstateId();
    const currentAgentRole = realEstateId
      ? await this.getCurrentUserAgentRole(realEstateId)
      : ((await this.cookiesPort.getAgentRole()) as EAgentRole | null);

    switch (currentAgentRole) {
      case EAgentRole.Agent:
        return basicRoutes;
      case EAgentRole.Coordinator:
        return basicRoutes.concat([
          {
            title: t("components:nav.real_estates"),
            url: routes.realEstates(),
            icon: "building",
          },
          {
            title: t("components:nav.import"),
            url: routes.import(),
            icon: "upload",
          },
        ]);
      default:
        return basicRoutes;
    }
  }

  async isAdmin(): Promise<boolean> {
    return (await this.cookiesPort.getProfileRole()) === EUserRole.Admin;
  }

  async isCoordinator(): Promise<boolean> {
    return (await this.cookiesPort.getAgentRole()) === EAgentRole.Coordinator;
  }

  async isAgent(): Promise<boolean> {
    return (await this.cookiesPort.getAgentRole()) === EAgentRole.Agent;
  }
}
