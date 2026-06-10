"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  propertyImageSchema,
  propertyImageUpdateSchema,
} from "@/application/validation/property-image.validation";
import sizeOf from "image-size";
import { pickDefined } from "@/shared/utils/object";
import { withServerAction } from "@/shared/hooks/with-server-action";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { cookies } from "next/headers";
import { createRouter } from "@/i18n/router";
import { initI18n } from "@/i18n/server";
import { appModule } from "@/application/modules/app.module";
import { CACHE_TAGS } from "@/infrastructure/config/constants";

export const createPropertyImageAction = withServerAction(
  async (propertyId: string, formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const raw = Object.fromEntries(formData);
    const validated = await propertyImageSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { file } = validated;

    const buffer = Buffer.from(await validated?.file.arrayBuffer());
    const dimensions = sizeOf(buffer);

    const width = dimensions.width ?? 0;
    const height = dimensions.height ?? 0;

    if (width < 400 || height < 300)
      throw new Error(t("properties:exceptions.max_size_pixels"));

    const propertyImage = await propertyImageService.create(propertyId, {
      filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      width: dimensions.width ?? 0,
      height: dimensions.height ?? 0,
      display_order: validated.display_order ?? 0,
      is_primary: validated.is_primary,
      alt_text: validated.alt_text ?? file.name,
      caption: validated.caption ?? file.name,
    });

    const slug = file.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const url = await propertyImageService.uploadFile(propertyId, slug, file);

    await propertyImageService.updatePath(propertyImage.id ?? "", url);

    revalidatePath(routes.properties());
    revalidatePath(routes.property(propertyId));
    revalidatePath(routes.propertyImages(propertyId));

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(propertyId), { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
  },
);

/**
 * UPDATE
 */
export const updatePropertyImageAction = withServerAction(
  async (id: string, formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const raw = Object.fromEntries(formData);

    const validated = await propertyImageUpdateSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const payload = pickDefined(validated);

    await propertyImageService.update(id, payload);

    revalidatePath(routes.properties());
    revalidatePath(routes.property(id));

    // Invalidar tags generales (sin propertyId específico)
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
  },
);

/**
 * DELETE
 */
export const deletePropertyImageAction = withServerAction(
  async (id: string) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    await propertyImageService.delete(id);

    revalidatePath(routes.dashboard());
    revalidatePath(routes.properties());
    revalidatePath(routes.property(id));

    // Invalidar tags generales
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
  },
);

/**
 * UPDATE IMAGE BY FORM DATA (for useServerMutation)
 */
export const updatePropertyImageFormAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const id = formData.get("id") as string;
    if (!id) throw new Error(t("validations:required", { attribute: "ID" }));

    // Remove id from formData for validation
    const raw = Object.fromEntries(formData);
    delete raw.id;

    const validated = await propertyImageUpdateSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const payload = pickDefined(validated);

    await propertyImageService.update(id, payload);

    revalidatePath(routes.properties());
    revalidatePath(routes.property(id));

    // Invalidar tags generales (sin propertyId específico)
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
  },
);

/**
 * DELETE IMAGE BY FORM DATA (for useServerMutation)
 */
export const deletePropertyImageFormAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const id = formData.get("id") as string;
    if (!id) throw new Error(t("validations:required", { attribute: "ID" }));

    await propertyImageService.delete(id);

    revalidatePath(routes.dashboard());
    revalidatePath(routes.properties());
    revalidatePath(routes.property(id));

    // Invalidar tags generales
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
  },
);

/**
 * REORDER IMAGES - Batch update display order
 * Recibe array de { id, display_order } y actualiza todos en batch
 */
export const reorderPropertyImagesAction = withServerAction(
  async (
    updates: Array<{ id: string; display_order: number }>,
    propertyId: string,
  ) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    if (!updates || updates.length === 0) {
      throw new Error(t("validations:required", { attribute: "updates" }));
    }

    await propertyImageService.updateDisplayOrder(updates);

    revalidatePath(routes.properties());
    revalidatePath(routes.property(propertyId));

    // Invalidar tags específicos
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(propertyId), { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
  },
);

/**
 * REORDER IMAGES FORM ACTION - Wrapper para useServerMutation
 * Recibe FormData con updates (JSON stringify) y propertyId
 */
export const reorderPropertyImagesFormAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const updatesJson = formData.get("updates") as string;
    const propertyId = formData.get("propertyId") as string;

    if (!updatesJson) {
      throw new Error(t("validations:required", { attribute: "updates" }));
    }

    if (!propertyId) {
      throw new Error(t("validations:required", { attribute: "propertyId" }));
    }

    const updates = JSON.parse(updatesJson) as Array<{
      id: string;
      display_order: number;
    }>;

    await propertyImageService.updateDisplayOrder(updates);

    revalidatePath(routes.properties());
    revalidatePath(routes.property(propertyId));

    // Invalidar tags específicos
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(propertyId), { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
  },
);

/**
 * SET PRIMARY IMAGE - Establece una imagen como primaria
 * Desmarca todas las demás imágenes del mismo property
 */
export const setPropertyImagePrimaryAction = withServerAction(
  async (propertyId: string, imageId: string) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    if (!propertyId) {
      throw new Error(t("validations:required", { attribute: "propertyId" }));
    }

    if (!imageId) {
      throw new Error(t("validations:required", { attribute: "imageId" }));
    }

    await propertyImageService.setPrimary(propertyId, imageId);

    revalidatePath(routes.properties());
    revalidatePath(routes.property(propertyId));

    // Invalidar tags específicos
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(propertyId), { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
  },
);

/**
 * SET PRIMARY IMAGE FORM ACTION - Wrapper para useServerMutation
 * Recibe FormData con propertyId e imageId
 */
export const setPropertyImagePrimaryFormAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyImageService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const propertyId = formData.get("propertyId") as string;
    const imageId = formData.get("imageId") as string;

    if (!propertyId) {
      throw new Error(t("validations:required", { attribute: "propertyId" }));
    }

    if (!imageId) {
      throw new Error(t("validations:required", { attribute: "imageId" }));
    }

    await propertyImageService.setPrimary(propertyId, imageId);

    revalidatePath(routes.properties());
    revalidatePath(routes.property(propertyId));

    // Invalidar tags específicos
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(propertyId), { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
  },
);
