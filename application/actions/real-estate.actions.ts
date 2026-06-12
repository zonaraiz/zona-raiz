"use server";

import { withServerAction } from "@/shared/hooks/with-server-action";
import {
  logoRealEstateSchema,
  realEstateSchema,
} from "@/application/validation/real-estate.validation";
import { idSchema } from "@/application/validation/base/id.schema";
import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/infrastructure/config/constants";
import { mapRealEstateRowToDomain } from "../mappers/real-estate.mapper";
import { revalidatePath, revalidateTag } from "next/cache";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { appModule } from "../modules/app.module";
import { createRouter } from "@/i18n/router";
import { initI18n } from "@/i18n/server";
import { CACHE_TAGS } from "@/infrastructure/config/constants";
import { EAgentRole } from "@/domain/entities/real-estate-agent.entity";

export const createRealEstateAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { realEstateService, cookiesService, sessionService, agentService } =
      await appModule(lang, {
        cookies: cookieStore,
      });

    const input = await realEstateSchema
      .validate(Object.fromEntries(formData), {
        abortEarly: false,
        stripUnknown: true,
      })
      .catch((error) => {
        throw new Error(error.message);
      });

    const profileId = await sessionService.getCurrentUserId(); // user->id si same profile->id

    if (!profileId) throw new Error(t("common:exceptions.unauthorized"));

    const id = await realEstateService.create(mapRealEstateRowToDomain(input));

    if (!id) throw new Error(t("real-estates:exceptions.register_error"));

    await agentService.addAgent(id, profileId, EAgentRole.Coordinator);

    cookiesService.setSession(COOKIE_NAMES.REAL_ESTATE, id);
    cookiesService.setSession(
      COOKIE_NAMES.REAL_ESTATE_ROLE,
      EAgentRole.Coordinator,
    );

    revalidatePath(routes.dashboard());
    revalidatePath(routes.realEstates());

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.REAL_ESTATE.PRINCIPAL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.ALL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.COUNT);
  },
);

export const updateRealEstateAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { realEstateService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const id = formData.get("id") as string;

    const input = await realEstateSchema.validate(
      Object.fromEntries(formData),
      { abortEarly: false },
    );

    await realEstateService.update(id, mapRealEstateRowToDomain(input));

    revalidatePath(routes.realEstates());
    revalidatePath(routes.realEstate(id));

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.REAL_ESTATE.PRINCIPAL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.ALL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.DETAIL(id));
    revalidateTag(CACHE_TAGS.REAL_ESTATE.COUNT);
  },
);

export const deleteRealEstateAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { realEstateService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const id = await idSchema.validate(Object.fromEntries(formData), {
      abortEarly: false,
    });
    await realEstateService.delete(id);

    revalidatePath(routes.realEstate(id));
    revalidatePath(routes.realEstates());
    revalidatePath(routes.dashboard());

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.REAL_ESTATE.PRINCIPAL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.ALL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.DETAIL(id));
    revalidateTag(CACHE_TAGS.REAL_ESTATE.COUNT);
  },
);

export const uploadRealEstateLogoAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { realEstateService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const { id, logo } = await logoRealEstateSchema.validate(
      Object.fromEntries(formData),
      { abortEarly: false },
    );

    await realEstateService.uploadLogo(id, logo);

    revalidatePath(routes.realEstate(id));
    revalidatePath(routes.realEstates());
    revalidatePath(routes.dashboard());

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.REAL_ESTATE.PRINCIPAL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.ALL);
    revalidateTag(CACHE_TAGS.REAL_ESTATE.DETAIL(id));
  },
);

export const setRealEstateAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);

    const { cookiesService } = await appModule(lang, { cookies: cookieStore });

    const realEstateId = formData.get("realEstateId") as string;

    cookiesService.setSession(COOKIE_NAMES.REAL_ESTATE, realEstateId);
    revalidatePath(routes.dashboard());
  },
);
