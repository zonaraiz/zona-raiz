import { Lang } from "@/i18n/settings";
import type { Metadata } from "next";

interface TermsPageProps {
  params: Promise<{ lang: Lang }>;
}

export const metadata: Metadata = {
  title: "Términos y Condiciones | Zonaraíz",
  description: "Términos y condiciones de uso de la plataforma Zonaraíz.",
  authors: [{ name: "CEO Name" }],
};

export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { lang } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          Bienvenido a Zonaraíz. Al acceder y utilizar nuestra plataforma, aceptas los siguientes
          términos y condiciones.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Uso del servicio</h2>
        <p className="mb-4">
          Nuestra plataforma está diseñada para ayudarte a encontrar propiedades inmobiliarias.
          Debes usar el servicio de manera lawful y respetuosa.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Cuentas de usuario</h2>
        <p className="mb-4">
          Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
          Nos reservamos el derecho de suspender cuentas que violen nuestros términos.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Propiedad intelectual</h2>
        <p className="mb-4">
          Todo el contenido en nuestra plataforma, incluyendo textos, gráficos, logos e imágenes,
          es propiedad de Zonaraíz o sus licenciantes.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Limitación de responsabilidad</h2>
        <p className="mb-4">
          Zonaraíz no garantiza la exactitud de la información de las propiedades listadas
          por terceros usuarios.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento.
          El uso continuo de la plataforma constituye aceptación de los términos modificados.
        </p>
      </div>
    </div>
  );
}
