import i18next from "i18next";
import * as yup from "yup";

export const descriptionSchema = yup
  .string()
  .transform((value) => (typeof value === "string" ? value.trim() : value))
  .default("")
  .optional()
  .max(
    2000,
    i18next.t("validations:max.string", {
      attribute: "description",
      max: "2000",
    }),
  )
  .test(
    "description-min-if-present",
    i18next.t("validations:min.string", {
      attribute: "description",
      min: "10",
    }),
    (value) => !value || value.length === 0 || value.length >= 10,
  );
