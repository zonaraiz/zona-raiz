"use server";

import { withServerAction } from "@/shared/hooks/with-server-action";
import { cookies } from "next/headers";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { appModule } from "@/application/modules/app.module";
import { contactSchema } from "@/application/validation/contact.schema";
import { COOKIE_NAMES } from "@/infrastructure/config/constants";

interface ContactEmailData {
  type: "contact";
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

export const sendContactEmailAction = withServerAction(
  async (formData: FormData) => {
    const lang = await getLangServerSide();
    const cookieStore = await cookies();

    const { cookiesService } = await appModule(lang, {
      cookies: cookieStore,
    });

    const raw = Object.fromEntries(formData);

    const hasIP = await cookiesService.hasIP();
    if (!hasIP) {
      cookiesService.setSession(COOKIE_NAMES.IP_CLIENT, raw?.ip as string);
    }

    const input = await contactSchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });

    const ip = raw?.ip as string;

    // Obtener email del admin/configuración
    const adminEmail = process.env.CONTACT_EMAIL || "info@zona_raiz.com";

    // Enviar email de contacto
    await sendContactEmail({
      type: "contact",
      name: input.name as string,
      email: input.email as string,
      phone: input.phone as string | null,
      message: input.message as string,
    }, adminEmail, ip);

    return { success: true };
  },
);

/**
 * Envía el email de contacto usando el servicio de notificaciones
 */
async function sendContactEmail(
  data: ContactEmailData,
  adminEmail: string,
  ip?: string,
): Promise<void> {
  const { name, email, phone, message } = data;

  // Log de desarrollo
  console.log(`
📧 Email de Contacto Enviado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
De: ${name} <${email}>
Teléfono: ${phone || "No proporcionado"}
Mensaje: ${message}
IP: ${ip || "No registrada"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  // TODO: Integrar con Resend/SendGrid en producción
  // Ejemplo con Resend:
  // await resend.emails.send({
  //   from: 'contacto@zona_raiz.com',
  //   to: adminEmail,
  //   subject: `Nuevo contacto de ${name}`,
  //   html: `
  //     <h1>Nuevo mensaje de contacto</h1>
  //     <p><strong>Nombre:</strong> ${name}</p>
  //     <p><strong>Email:</strong> ${email}</p>
  //     <p><strong>Teléfono:</strong> ${phone || "No proporcionado"}</p>
  //     <p><strong>Mensaje:</strong></p>
  //     <p>${message}</p>
  //   `
  // });
}