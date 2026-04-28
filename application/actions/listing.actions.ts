"use server";

import { withServerAction } from "@/shared/hooks/with-server-action";
import { createListingSchema } from "@/application/validation/listing.validation";
import { revalidatePath, revalidateTag } from "next/cache";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { cookies } from "next/headers";
import { createRouter } from "@/i18n/router";
import { initI18n } from "@/i18n/server";
import { appModule } from "@/application/modules/app.module";
import { CACHE_TAGS } from "@/infrastructure/config/constants";

export const createListingAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyService, listingService } = await appModule(
      lang,
      { cookies: cookieStore },
    );

    const raw = Object.fromEntries(formData);

    const validated = await createListingSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const property = await propertyService.getById(validated.property_id);
    if (!property) throw new Error(t("common:exceptions.data_not_found"));

    const listing = await listingService.create({
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expenses_included: raw.expenses_included === "on",
      featured: raw.featured === "on",
      available_from: validated.available_from
        ? validated.available_from.toISOString()
        : undefined,
    });

    if (!listing) throw new Error(t("listings:exceptions.create_fail"));

    revalidatePath(routes.dashboard());
    revalidatePath(routes.listings());
    revalidatePath(routes.listing(listing.id));

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.ALL, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.DETAIL(listing.id), { expire: 0 });
    if (listing.featured) {
      revalidateTag(CACHE_TAGS.LISTING.FEATURED, { expire: 0 });
    }
    if (property.real_estate_id) {
      revalidateTag(CACHE_TAGS.REAL_ESTATE.DETAIL(property.real_estate_id), {
        expire: 0,
      });
    }
  },
);

export const updateListingAction = withServerAction(
  async (id: string, formData: FormData) => {
    const raw = Object.fromEntries(formData);

    const validated = await createListingSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { listingService, propertyService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const currentListing = await listingService.findById(id);

    if (!currentListing) throw new Error(t("common:exceptions.data_not_found"));

    const property = await propertyService.getById(currentListing.property_id);
    const realEstateId = property?.real_estate_id;

    const agent_id = currentListing.agent_id;

    const basicData = {
      minimum_contract_duration: validated.minimum_contract_duration,
      property_id: validated.property_id,
      listing_type: validated.listing_type,
      price: validated.price,
      currency: validated.currency,
      price_negotiable: validated.price_negotiable,
      status: validated.status,
      virtual_tour_url: validated.virtual_tour_url,
      video_url: validated.video_url,
      available_from: validated.available_from,
      whatsapp_contact: validated.whatsapp_contact,
    }

    const dataToUpdate = {
      ...currentListing,
      ...basicData,
      agent_id,
      updated_at: new Date().toISOString(),
      expenses_included: raw.expenses_included === "on",
      featured: raw.featured === "on",
      available_from: validated.available_from
        ? validated.available_from.toISOString()
        : currentListing.available_from,
      property_id: currentListing.property_id,
    };

    const listing = await listingService.update(id, dataToUpdate);

    if (!listing) throw new Error(t("listings:exceptions.update_fail"));

    revalidatePath(routes.dashboard());
    revalidatePath(routes.listings());
    revalidatePath(routes.listing(listing.id));

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.ALL, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.DETAIL(id), { expire: 0 });
    if (listing.featured) {
      revalidateTag(CACHE_TAGS.LISTING.FEATURED, { expire: 0 });
    }
    if (realEstateId) {
      revalidateTag(CACHE_TAGS.REAL_ESTATE.DETAIL(realEstateId), { expire: 0 });
    }
  },
);

export const deleteListingAction = withServerAction(async (formData: FormData) => {
  const lang = await getLangServerSide();
  const cookieStore = await cookies();
  const routes = createRouter(lang);
  const i18n = await initI18n(lang);
  const t = i18n.getFixedT(lang);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error(t("common:exceptions.invalid_data"));
  }

  const {
    listingService,
    propertyService,
    favoriteService,
    enquiryService,
    propertyImageService,
  } = await appModule(lang, {
    cookies: cookieStore,
  });

  const currentListing = await listingService.findById(id);
  if (!currentListing) throw new Error(t("common:exceptions.data_not_found"));

  const property = await propertyService.getById(currentListing.property_id);
  const realEstateId = property?.real_estate_id;

  // Cascade delete: limpiar datos asociados
  // 1. Eliminar favorites (referencia listing_id)
  await favoriteService.deleteByListingId(id);

  // 2. Eliminar enquiries (referencia listing_id)
  await enquiryService.deleteByListingId(id);

  // 3. Eliminar imágenes del property + archivos en storage
  if (property?.id) {
    await propertyImageService.deleteByPropertyId(property.id);
  }

  // 4. Eliminar el listing (ON DELETE CASCADE en BD limpia los FK locales de listing)
  await listingService.deleteCascade(id);

  revalidatePath(routes.dashboard());
  revalidatePath(routes.listings());

  // Invalidar tags específicos del cache
  revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
  revalidateTag(CACHE_TAGS.LISTING.ALL, { expire: 0 });
  revalidateTag(CACHE_TAGS.LISTING.COUNT, { expire: 0 });
  revalidateTag(CACHE_TAGS.LISTING.DETAIL(id), { expire: 0 });
  revalidateTag(CACHE_TAGS.FAVORITE.PRINCIPAL, { expire: 0 });
  revalidateTag(CACHE_TAGS.ENQUIRY.PRINCIPAL, { expire: 0 });
  revalidateTag(CACHE_TAGS.PROPERTY_IMAGE.PRINCIPAL, { expire: 0 });
  if (property?.id) {
    revalidateTag(CACHE_TAGS.PROPERTY_IMAGE.BY_PROPERTY(property.id), { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(property.id), { expire: 0 });
  }
  if (realEstateId) {
    revalidateTag(CACHE_TAGS.REAL_ESTATE.DETAIL(realEstateId), { expire: 0 });
  }
});
