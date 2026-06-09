"use server";

import { withServerAction } from "@/shared/hooks/with-server-action";
import {
  profileAvatarSchema,
  profileSchema,
} from "@/application/validation/profile.validation";
import { revalidatePath } from "next/cache";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { cookies } from "next/headers";
import { createRouter } from "@/i18n/router";
import { initI18n } from "@/i18n/server";
import { appModule } from "@/application/modules/app.module";
import * as yup from "yup";

const searchProfilesSchema = yup.object({
  email: yup.string().trim().min(2).required(),
});

export const updateProfileAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { profileService, sessionService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const raw = Object.fromEntries(formData);

    const { full_name, phone } = await profileSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const id = await sessionService.getCurrentUserId();

    if (!id) throw new Error(t("common:exceptions.unauthorized"));

    await profileService.updateProfile(id, {
      full_name,
      phone,
    });

    revalidatePath(routes.profile());
  },
);

export const uploadAvatarAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { profileService, sessionService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const raw = Object.fromEntries(formData);

    const { avatar } = await profileAvatarSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const id = await sessionService.getCurrentUserId();

    if (!id) throw new Error(t("common:exceptions.unauthorized"));

    const url = await profileService.uploadAvatar(id, avatar);
    await profileService.updatePathAvatarProfile(id, url);

    revalidatePath(routes.profile());
  },
);

export const searchProfilesByEmailAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();

    const { profileService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const { email } = await searchProfilesSchema.validate(
      Object.fromEntries(formData),
      { abortEarly: false, stripUnknown: true },
    );

    const profiles = await profileService.searchProfilesByEmail(email);
    return profiles;
  },
);
