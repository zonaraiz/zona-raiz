"use server";

import { withServerAction } from "@/shared/hooks/with-server-action";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { initI18n } from "@/i18n/server";
import { contactSchema } from "@/application/validation/contact.schema";

export const sendContactEmailAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const i18n = await initI18n(lang);
    const t = i18n.getFixedT(lang);

    const raw = Object.fromEntries(formData);

    const input = await contactSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Log the contact form submission
    // TODO: Integrate with email provider (Resend/SendGrid)
    console.log(`
📧 Nuevo contacto recibido
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${input.name}
Email: ${input.email}
Teléfono: ${input.phone || "No proporcionado"}
Mensaje: ${input.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    return {
      success: true,
      message: t("contact:form_success"),
    };
  },
);