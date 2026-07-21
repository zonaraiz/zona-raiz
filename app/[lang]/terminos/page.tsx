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
      <h1 className="text-3xl font-bold mb-2">
        Términos y Condiciones de Uso – Zonaraíz
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Última actualización: 17/07/2026
      </p>

      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Aceptación</h2>
        <p className="mb-4">
          El acceso, navegación y uso de Zonaraíz implica la aceptación
          expresa e íntegra de estos términos. Si el usuario no está de
          acuerdo, deberá abstenerse de utilizar la plataforma.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          2. Naturaleza de la plataforma
        </h2>
        <p className="mb-2">
          Zonaraíz es una plataforma tecnológica de intermediación digital
          que facilita la publicación y consulta de información relacionada
          con bienes inmuebles.
        </p>
        <p className="mb-2">Zonaraíz:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>No es propietario de los inmuebles publicados</li>
          <li>No actúa como agente inmobiliario</li>
          <li>No interviene en negociaciones</li>
          <li>No representa a ninguna de las partes</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          3. Independencia de las partes
        </h2>
        <p className="mb-2">
          Toda interacción, contacto, negociación o transacción se realiza
          exclusivamente entre los usuarios.
        </p>
        <p className="mb-4">
          Zonaraíz no participa, supervisa ni garantiza dichas relaciones.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          4. Exclusión amplia de responsabilidad
        </h2>
        <p className="mb-2">
          En la máxima medida permitida por la ley, Zonaraíz no será
          responsable por:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>La veracidad, calidad, legalidad o existencia de los inmuebles</li>
          <li>La capacidad o legitimidad de los anunciantes</li>
          <li>Errores en precios, características o disponibilidad</li>
          <li>Daños directos, indirectos o lucro cesante</li>
          <li>Fraudes, estafas o incumplimientos</li>
          <li>Pérdidas económicas derivadas del uso de la plataforma</li>
        </ul>
        <p className="mb-4">
          El usuario reconoce que utiliza la plataforma bajo su propio
          riesgo.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          5. Contenido generado por usuarios
        </h2>
        <p className="mb-2">
          El usuario es el único responsable del contenido que publica.
        </p>
        <p className="mb-2">Al publicar, declara y garantiza que:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Tiene los derechos necesarios sobre el contenido</li>
          <li>La información es veraz y actualizada</li>
          <li>No infringe derechos de terceros</li>
        </ul>
        <p className="mb-4">
          Zonaraíz no está obligado a verificar el contenido, pero podrá
          eliminarlo en cualquier momento.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          6. Licencia de uso de contenido
        </h2>
        <p className="mb-2">
          Al publicar contenido en Zonaraíz, el usuario otorga una licencia:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>No exclusiva</li>
          <li>Gratuita</li>
          <li>Transferible</li>
          <li>Mundial</li>
        </ul>
        <p className="mb-4">
          Para usar, reproducir, modificar, mostrar y distribuir dicho
          contenido dentro de la plataforma y para fines promocionales.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          7. Información de fuentes públicas y terceros
        </h2>
        <p className="mb-2">
          Zonaraíz podrá recopilar, indexar, organizar y mostrar información
          proveniente de fuentes públicas o de acceso abierto, incluyendo
          datos de contacto e información comercial.
        </p>
        <p className="mb-2">
          Zonaraíz actúa como un agregador tecnológico de información
          disponible públicamente.
        </p>
        <p className="mb-2">
          Si un titular considera que algún contenido afecta sus derechos o
          no desea aparecer en la plataforma, podrá solicitar su
          modificación o eliminación mediante los canales dispuestos.
        </p>
        <p className="mb-4">
          Zonaraíz evaluará dichas solicitudes de buena fe y procederá en un
          plazo razonable, sin que esto implique reconocimiento de
          responsabilidad.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          8. Notificación y retiro de contenido
        </h2>
        <p className="mb-2">
          Cualquier persona podrá reportar contenido que considere:
        </p>
        <ul className="list-disc pl-6 mb-2">
          <li>Incorrecto</li>
          <li>Desactualizado</li>
          <li>Engañoso</li>
          <li>O que vulnere derechos</li>
        </ul>
        <p className="mb-2">Zonaraíz podrá:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Retirarlo preventivamente</li>
          <li>Solicitar información adicional</li>
          <li>Suspender publicaciones o cuentas</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">9. Uso indebido</h2>
        <p className="mb-2">Está prohibido:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Publicar información falsa</li>
          <li>Suplantar identidad</li>
          <li>Usar la plataforma para fraudes</li>
          <li>Extraer datos masivamente sin autorización</li>
          <li>Realizar actividades ilegales</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          10. Servicios actuales y futuros
        </h2>
        <p className="mb-2">
          Zonaraíz podrá ofrecer servicios gratuitos y, en el futuro,
          servicios pagos (premium).
        </p>
        <p className="mb-4">
          Las condiciones específicas de servicios pagos serán informadas
          previamente.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          11. Suspensión y terminación
        </h2>
        <p className="mb-4">
          Zonaraíz podrá suspender o eliminar cuentas o contenidos sin
          previo aviso ante cualquier incumplimiento o riesgo para la
          plataforma.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">12. Indemnidad</h2>
        <p className="mb-2">
          El usuario se obliga a mantener indemne a Zonaraíz frente a
          cualquier reclamación, demanda o daño derivado de:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Su uso de la plataforma</li>
          <li>El contenido que publique</li>
          <li>La violación de estos términos</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">13. Modificaciones</h2>
        <p className="mb-4">
          Zonaraíz podrá modificar estos términos en cualquier momento. El
          uso continuo implica aceptación.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          14. Legislación aplicable
        </h2>
        <p>
          Estos términos se rigen por la legislación de la República de
          Colombia.
        </p>
      </div>
    </div>
  );
}
