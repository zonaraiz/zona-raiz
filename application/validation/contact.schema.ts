// ============================================
// SCHEMA DE CONTACTO
// ============================================
//
// Schema para formulario de contacto general:
//   - name (requerido)
//   - email (requerido)
//   - phone (opcional)
//   - message (requerido)
// ============================================
import i18next from "i18next";
import * as yup from "yup";

const nameSchema = yup
  .string()
  .min(
    2,
    i18next.t("validations:min.string", { attribute: "name", min: "2" }),
  )
  .max(
    100,
    i18next.t("validations:max.string", { attribute: "name", max: "100" }),
  )
  .required(
    i18next.t("validations:required", { attribute: "name" }),
  );

const emailSchema = yup
  .string()
  .email(
    i18next.t("validations:email", { attribute: "email" }),
  )
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: i18next.t("validations:email", { attribute: "email" }),
  })
  .required(
    i18next.t("validations:required", { attribute: "email" }),
  );

const phoneSchema = yup
  .string()
  .matches(
    /^[\d\s\-\+\(\)]*$/,
    i18next.t("validations:phone", { attribute: "phone" }),
  )
  .max(
    30,
    i18next.t("validations:max.string", { attribute: "phone", max: "30" }),
  )
  .nullable();

const messageSchema = yup
  .string()
  .min(
    10,
    i18next.t("validations:min.string", { attribute: "message", min: "10" }),
  )
  .max(
    2000,
    i18next.t("validations:max.string", {
      attribute: "message",
      max: "2000",
    }),
  )
  .required(
    i18next.t("validations:required", { attribute: "message" }),
  );

export const contactSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: messageSchema,
});

export type ContactFormValues = yup.InferType<typeof contactSchema>;

export const defaultContactValues: Partial<ContactFormValues> = {
  name: "",
  email: "",
  phone: "",
  message: "",
};