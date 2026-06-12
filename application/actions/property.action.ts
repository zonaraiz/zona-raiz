"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { propertySchema } from "@/application/validation/property.schema";
import { PropertyType } from "@/domain/entities/property.enums";
import { ListingType, ListingStatus } from "@/domain/entities/listing.enums";
import { Currency } from "@/domain/entities/property-listing.entity";
import { CreateListingInput } from "@/domain/services/listing.service";
import { withServerAction } from "@/shared/hooks/with-server-action";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { createRouter } from "@/i18n/router";
import { initI18n } from "@/i18n/server";
import { appModule } from "../modules/app.module";
import { CACHE_TAGS } from "@/infrastructure/config/constants";
import { AmenitieType } from "@/domain/entities/property.entity";

export const createPropertyAction = withServerAction(
  async (realEstateId: string, formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { sessionService, propertyService, listingService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const raw = Object.fromEntries(formData);

    const input = await propertySchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const userId = await sessionService.getCurrentUserId();

    if (!userId) throw new Error(t("common:exceptions.unauthorized"));

    const property_type = input.property_type as PropertyType;
    const amenities = input.amenities.map((a) => a as AmenitieType);
    const { price, listing_type, ...propertyFields } = input;

    const property = await propertyService.create(realEstateId, {
      ...propertyFields,
      property_type,
      amenities,
      created_by: userId,
    });

    await listingService.create({
      property_id: property.id,
      listing_type: (listing_type ?? ListingType.SALE) as ListingType,
      price: price ?? 0,
      currency: Currency.COP as string,
      price_negotiable: false,
      status: ListingStatus.ACTIVE,
      featured: false,
      expenses_included: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as CreateListingInput);

    revalidatePath(routes.dashboard());
    revalidatePath(routes.properties());

    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.ALL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    revalidateTag(CACHE_TAGS.REAL_ESTATE.DETAIL(realEstateId), { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.ALL, { expire: 0 });
    revalidateTag(CACHE_TAGS.LISTING.COUNT, { expire: 0 });

    return property;
  },
);

export const updatePropertyAction = withServerAction(
  async (id: string, formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();
    const routes = createRouter(lang);
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const { propertyService } = await appModule(lang, { cookies: cookieStore });

    const raw = Object.fromEntries(formData);

    const input = await propertySchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentProperty = await propertyService.getById(id);
    if (!currentProperty)
      throw new Error(t("common:exceptions.data_not_found"));

    const property_type = input.property_type as PropertyType;
    const amenities = input.amenities.map((a) => a as AmenitieType);
    const { price: _price, listing_type: _listing_type, ...updateFields } = input;

    await propertyService.update(id, {
      ...updateFields,
      property_type,
      amenities,
    });

    revalidatePath(routes.dashboard());
    revalidatePath(routes.properties());
    revalidatePath(routes.property(id));

    // Invalidar tags específicos del cache
    revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.ALL, { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(id), { expire: 0 });
    revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
    if (currentProperty.real_estate_id) {
      revalidateTag(
        CACHE_TAGS.REAL_ESTATE.DETAIL(currentProperty.real_estate_id),
        { expire: 0 },
      );
    }
  },
);

export const deletePropertyAction = withServerAction(async (formData: FormData) => {
  const lang = await getLangServerSide();
  const cookieStore = await cookies();
  const routes = createRouter(lang);
  const i18n = await initI18n(lang);
  const t = i18n.getFixedT(lang);

  const { propertyService } = await appModule(lang, { cookies: cookieStore });

  const id = formData.get("id") as string;
  if (!id) throw new Error(t("common:exceptions.data_not_found"));

  const currentProperty = await propertyService.getById(id);
  if (!currentProperty) throw new Error(t("common:exceptions.data_not_found"));

  await propertyService.delete(id);

  revalidatePath(routes.dashboard());
  revalidatePath(routes.properties());
  revalidatePath(routes.property(id));

  // Invalidar tags específicos del cache
  revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });
  revalidateTag(CACHE_TAGS.PROPERTY.ALL, { expire: 0 });
  revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(id), { expire: 0 });
  revalidateTag(CACHE_TAGS.PROPERTY.COUNT, { expire: 0 });
  if (currentProperty.real_estate_id) {
    revalidateTag(
      CACHE_TAGS.REAL_ESTATE.DETAIL(currentProperty.real_estate_id),
      { expire: 0 },
    );
  }
});
