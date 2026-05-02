import { Lang } from "@/i18n/settings";
import type { Metadata } from "next";

interface PrivacyPageProps {
  params: Promise<{ lang: Lang }>;
}

export const metadata: Metadata = {
  title: "Política de Privacidad | Zonaraíz",
  description: "Política de privacidad de Zonaraíz - Tu plataforma inmobiliaria de confianza.",
  authors: [{ name: "CEO Name" }],
};

export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          En Zonaraíz, valoramos tu privacidad y estamos comprometidos a proteger tus datos personales.
          Esta política de privacidad describe cómo recopilamos, usamos y protegemos tu información.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Información que recopilamos</h2>
        <p className="mb-4">
          Recopilamos información que nos proporcionas directamente, incluyendo datos de perfil,
          preferencias de búsqueda y comunicaciones con nosotros.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Cómo usamos tu información</h2>
        <p className="mb-4">
          Utilizamos tu información para mejorar nuestros servicios, personalizar tu experiencia
          y comunicarte sobre actualizaciones relevantes.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Protección de datos</h2>
        <p className="mb-4">
          Implementamos medidas de seguridad apropiadas para proteger tus datos contra accesos
          no autorizados o modificaciones no autorizadas.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política de privacidad, contacta con nosotros.
        </p>
      </div>
    </div>
  );
}
