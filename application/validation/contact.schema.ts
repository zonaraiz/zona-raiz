// ============================================
// SCHEMA DE CONTACTO
// ============================================
//
// Schema para el formulario de contacto público
// ============================================
import i18next from "i18next";
import * as yup from "yup";

export const contactSchema = yup.object({
  name: yup
    .string()
    .min(
      2,
      i18next.t("validations:min.string", { attribute: "name", min: "2" }),
    )
    .max(
      100,
      i18next.t("validations:max.string", { attribute: "name", max: "100" }),
    )
    .required(i18next.t("validations:required", { attribute: "name" })),
  email: yup
    .string()
    .email(i18next.t("validations:email", { attribute: "email" }))
    .max(
      100,
      i18next.t("validations:max.string", { attribute: "email", max: "100" }),
    )
    .required(i18next.t("validations:required", { attribute: "email" })),
  phone: yup
    .string()
    .matches(
      /^[\d\s\-\+\(\)]+$/,
      i18next.t("validations:phone", { attribute: "phone" }),
    )
    .max(
      30,
      i18next.t("validations:max.string", { attribute: "phone", max: "30" }),
    )
    .nullable(),
  message: yup
    .string()
    .max(
      2000,
      i18next.t("validations:max.string", {
        attribute: "message",
        max: "2000",
      }),
    )
    .required(i18next.t("validations:required", { attribute: "message" })),
});

export type ContactFormValues = yup.InferType<typeof contactSchema>;

export const defaultContactValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
};