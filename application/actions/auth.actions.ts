"use server";

import {
  otpSchema,
  signInSchema,
  signUpSchema,
} from "@/application/validation/auth.validation";
import { withServerAction } from "@/shared/hooks/with-server-action";
import { COOKIE_NAMES } from "@/infrastructure/config/constants";
import { revalidatePath } from "next/cache";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { createRouter } from "@/i18n/router";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";
import { getAppOrigin } from "@/infrastructure/shared/utils/app-url";

export const signInWithGoogleAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const { authService, cookiesService } = await appModule(lang, { cookies: cookieStore });
    const routes = createRouter(lang);

    // Leer user_type del FormData
    const userType = formData.get("user_type") as string | null;

    // Guardar preferencias en cookie para el callback (backup)
    if (userType) {
      cookiesService.setSession(COOKIE_NAMES.OAUTH_USER_TYPE, userType);
    }

    // Incluir role en la URL de callback (client o real-estate)
    // Esta URL params es el mecanismo principal para pasar el role
    const baseRedirectTo = `${getAppOrigin()}${routes.callback()}`;
    const redirectTo = userType
      ? `${baseRedirectTo}?role=${encodeURIComponent(userType)}`
      : baseRedirectTo;

    const redirectUrl = await authService.signInWithOAuth(
      "google",
      redirectTo,
    );

    return { success: true, data: { redirectUrl } };
  },
);

function formDataToObject(fd: FormData) {
  return Object.fromEntries(fd);
}

export const signUpAction = withServerAction(async (formData: FormData) => {
  const input = await signUpSchema.validate(formDataToObject(formData), {
    abortEarly: false,
  });
  const lang = await getLangServerSide();
  const cookieStore = await cookies();
  const routes = createRouter(lang);
  const { authService } = await appModule(lang, { cookies: cookieStore });
  const redirectTo = `${getAppOrigin()}${routes.callback()}`;

  await authService.signUp(input, redirectTo);

  return { success: true };
});

export const signInAction = withServerAction(async (formData: FormData) => {
  const input = await signInSchema.validate(formDataToObject(formData), {
    abortEarly: false,
  });
  const lang = await getLangServerSide();
  const cookieStore = await cookies();
  const routes = createRouter(lang);
  const { authService, cookiesService } = await appModule(
    lang,
    {
      cookies: cookieStore,
    },
  );

  const role = await authService.signIn(input.email, input.password);
  cookiesService.setSession(COOKIE_NAMES.ROLE, role);

  return { redirectTo: routes.onboarding() };
});

export const signOutAction = withServerAction(async () => {
  const lang = await getLangServerSide();
  const routes = createRouter(lang);
  const cookieStore = await cookies();

  const { authService, cookiesService } = await appModule(lang, {
    cookies: cookieStore,
  });

  await authService.signOut();

  cookiesService.clearSession();
  revalidatePath(routes.dashboard());
});

export const sentOtpAction = withServerAction(async (formData: FormData) => {
  const input = await otpSchema.validate(formDataToObject(formData), {
    abortEarly: false,
  });

  const lang = await getLangServerSide();
  const cookieStore = await cookies();
  const routes = createRouter(lang);
  const { authService } = await appModule(lang, { cookies: cookieStore });
  const redirectTo = `${getAppOrigin()}${routes.callback()}`;

  await authService.sendOtp(input.email, redirectTo);
});
