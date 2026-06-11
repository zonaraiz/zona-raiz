import * as yup from "yup";
import i18next from "i18next";

export const passwordSchema = yup
  .string()
  .min(
    6,
    i18next.t("validations:min.string", {
      attribute: "password",
      min: "6",
    }),
  )
  .max(
    50,
    i18next.t("validations:max.string", {
      attribute: "password",
      max: "50",
    }),
  )
  .required(
    i18next.t("validations:validations:required", {
      attribute: "password",
    }),
  );
