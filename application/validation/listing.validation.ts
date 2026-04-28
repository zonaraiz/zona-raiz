import * as yup from "yup";
import { ListingStatus, ListingType } from "@/domain/entities/listing.enums";
import { idSchema } from "./base/id.schema";
import { priceSchema } from "./base/price.schema";
import { Currency } from "@/domain/entities/property-listing.entity";
import i18next from "i18next";

export const createListingSchema = yup.object({
  property_id: idSchema,
  listing_type: yup
    .mixed<ListingType>()
    .oneOf(Object.values(ListingType))
    .default(ListingType.SALE)
    .required(),
  price: priceSchema.required(),
  currency: yup
    .mixed<Currency>()
    .oneOf(Object.values(Currency))
    .required()
    .default(Currency.COP),
  price_negotiable: yup.boolean().default(false),
  status: yup
    .mixed<ListingStatus>()
    .oneOf(Object.values(ListingStatus))
    .default(ListingStatus.DRAFT),
  virtual_tour_url: yup
    .string()
    .url(
      i18next.t("validations:url", {
        attribute: "virtual_tour_url",
      }),
    )
    .max(
      200,
      i18next.t("validations:max.string", {
        attribute: "virtual_tour_url",
        max: "200",
      }),
    )
    .default("")
    .optional(),
  video_url: yup
    .string()
    .url(
      i18next.t("validations:url", {
        attribute: "video_url",
      }),
    )
    .max(
      200,
      i18next.t("validations:max.string", {
        attribute: "video_url",
        max: "200",
      }),
    )
    .default("")
    .optional(),
  available_from: yup
    .date()
    .typeError(i18next.t("validations:invalid_date")) // Captura fechas irreales/mal formateadas
    .required(i18next.t("validations:required", { attribute: "available_from" })) // No permite nulos
    .nullable(),
  minimum_contract_duration: yup
    .number()
    .integer(
      i18next.t("validations:integer", {
        attribute: "minimum_contract_duration",
      }),
    )
    .max(
      120,
      i18next.t("validations:max.numeric", {
        attribute: "minimum_contract_duration",
        max: "120",
      }),
    ),
  whatsapp_contact: yup
    .string()
    .required(
      i18next.t("validations:required", {
        attribute: "whatsapp_contact",
      }),
    )
    .max(
      120,
      i18next.t("validations:max.string", {
        attribute: "whatsapp_contact",
        max: "120",
      }),
    )
    .matches(
      /^\+?[0-9\s-]+$/,
      i18next.t("forms.listing.fields.whatsapp_contact.message2"),
    ),
});

export type CreateListingInput = yup.InferType<typeof createListingSchema>;

export const defaultPropertyValues: CreateListingInput = {
  property_id: "",
  listing_type: ListingType.SALE,
  price: 50000000,
  currency: Currency.COP,
  price_negotiable: false,
  status: ListingStatus.DRAFT,
  video_url: "",
  virtual_tour_url: "",
  available_from: new Date(),
  minimum_contract_duration: 12,
  whatsapp_contact: "+57 3168314191",
};
