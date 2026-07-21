import { Lang } from "@/i18n/settings";
import type { Metadata } from "next";

interface PrivacyPageProps {
  params: Promise<{ lang: Lang }>;
}

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales | Zonaraíz",
  description: "Política de tratamiento de datos personales de Zonaraíz.",
  authors: [{ name: "CEO Name" }],
};

export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        Política de Tratamiento de Datos Personales – Zonaraíz
      </h1>

      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Responsable</h2>
        <p className="mb-4">
          Zonaraíz es responsable del tratamiento de datos personales
          conforme a la legislación colombiana.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          2. Datos recolectados
        </h2>
        <p className="mb-2">Se podrán recolectar:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Datos de identificación</li>
          <li>Datos de contacto</li>
          <li>Información comercial</li>
          <li>Datos de navegación y uso</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">3. Finalidades</h2>
        <p className="mb-2">Los datos serán utilizados para:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Operar la plataforma</li>
          <li>Facilitar el contacto entre usuarios</li>
          <li>Personalizar contenidos</li>
          <li>Enviar comunicaciones relacionadas con el servicio</li>
          <li>Análisis estadístico y mejora del sistema</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          4. Base de tratamiento
        </h2>
        <p className="mb-2">El tratamiento se realiza con base en:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>La autorización del titular</li>
          <li>El uso de información de carácter público</li>
          <li>Interés legítimo de operación de la plataforma</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          5. Datos de fuentes públicas
        </h2>
        <p className="mb-2">
          Zonaraíz podrá tratar datos obtenidos de fuentes públicas o de
          acceso abierto, incluyendo información comercial y de contacto.
        </p>
        <p className="mb-2">En estos casos:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Se respetarán los derechos de los titulares</li>
          <li>Se permitirá la solicitud de modificación o eliminación</li>
          <li>Se actuará de buena fe y en tiempos razonables</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Compartición</h2>
        <p className="mb-2">Los datos podrán ser compartidos con:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Otros usuarios interesados</li>
          <li>Proveedores tecnológicos</li>
          <li>Herramientas de análisis</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">7. Seguridad</h2>
        <p className="mb-4">
          Zonaraíz implementa medidas razonables de seguridad, sin
          garantizar invulnerabilidad absoluta.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          8. Derechos del titular
        </h2>
        <p className="mb-2">El titular podrá:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Acceder a sus datos</li>
          <li>Rectificarlos</li>
          <li>Solicitar eliminación</li>
          <li>Revocar autorización</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          9. Procedimiento de consultas y reclamos
        </h2>
        <p className="mb-4">
          Las solicitudes podrán realizarse a través de los canales
          oficiales definidos por Zonaraíz.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">10. Conservación</h2>
        <p className="mb-4">
          Los datos se conservarán mientras sean necesarios para las
          finalidades del servicio.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">11. Modificaciones</h2>
        <p className="mb-4">
          Zonaraíz podrá modificar esta política en cualquier momento.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          12. Legislación aplicable
        </h2>
        <p>Esta política se rige por la legislación colombiana.</p>
      </div>
    </div>
  );
}
