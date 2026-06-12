import i18next from "i18next";
import * as yup from "yup";
import { requiredAddressSchema } from "./base/address.schema";
import { slugSchema } from "./base/slug.schema";
import { PropertyType } from "@/domain/entities/property.enums";
import { propertyTypeSchema } from "./base/property_type.schema";
import { latitudeSchema } from "./base/latitude.schema";
import { descriptionSchema } from "./base/description.schema";
import { titleSchema } from "./base/title.schema";
import { longitudeSchema } from "./base/longitude.schema";
import { neighborhoodSchema } from "./base/neighborhood.schema";
import { bedroomsSchema } from "./base/bedrooms.schema";
import { bathroomsSchema } from "./base/bathrooms.schema";
import { builtAreaSchema } from "./base/built_area.schema";
import { lotAreaSchema } from "./base/lot_area.schema";
import { floorsSchema } from "./base/floors.schema";
import { yearBuiltSchema } from "./base/year_built.schema";
import { parkingSpotsSchema } from "./base/parking_spots.schema";
import { amenitiesSchema } from "./base/amenities.schema";

// ============================================
// SCHEMAS DE PROPIEDADES
// ============================================

export const propertySchema = yup
  .object({
    title: titleSchema.required(
      i18next.t("validations:required", { attribute: "title" }),
    ),
    description: descriptionSchema,
    property_type: propertyTypeSchema.required(
      i18next.t("validations:required", { attribute: "property_type" }),
    ),
    latitude: latitudeSchema.nullable(),
    longitude: longitudeSchema.nullable(),
    neighborhood: neighborhoodSchema.nullable(),
    bedrooms: bedroomsSchema.nullable(),
    bathrooms: bathroomsSchema.nullable(),
    built_area: builtAreaSchema.nullable(),
    lot_area: lotAreaSchema.nullable(),
    floors: floorsSchema.nullable(),
    year_built: yearBuiltSchema.nullable(),
    parking_spots: parkingSpotsSchema.nullable(),
    amenities: amenitiesSchema,
  })
  .concat(requiredAddressSchema);

export type PropertyInput = yup.InferType<typeof propertySchema>;

export const defaultPropertyValues: PropertyInput = {
  title: "",
  description: "",
  property_type: PropertyType.Other,
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  latitude: 0,
  longitude: 0,
  neighborhood: "",
  bedrooms: 0,
  bathrooms: 0,
  built_area: 0,
  lot_area: 0,
  floors: 0,
  year_built: 2000,
  parking_spots: 0,
  amenities: [],
};

export const PropertyImageSchema = yup.object({
  file: yup
    .mixed<File>()
    .required("Archivo requerido")
    .test("fileSize", "Máximo 10MB", (value) => {
      return value && value.size <= 10 * 1024 * 1024;
    })
    .test("fileType", "Solo imágenes", (value) => {
      return value && value.type.startsWith("image/");
    }),
  is_primary: yup.boolean().default(false),
  alt_text: yup.string().max(200).nullable(),
});

export const PropertyImageInput = PropertyImageSchema.partial();
