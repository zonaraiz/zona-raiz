import { Lang } from "@/i18n/settings";
import type { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{ lang: Lang }>;
}

export const metadata: Metadata = {
  title: "Sobre Nosotros | Zonaraíz",
  description: "Conoce más sobre Zonaraíz, tu plataforma inmobiliaria de confianza.",
  authors: [{ name: "CEO Name" }],
};

export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Sobre Nosotros</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          Zonaraíz es una plataforma inmobiliaria innovadora que conecta compradores,
          vendedores y profesionales del sector inmobiliario en un mismo espacio digital.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Nuestra misión</h2>
        <p className="mb-4">
          Democratizar el acceso a la información inmobiliaria y simplificar el proceso
          de búsqueda y transacción de propiedades para todos los usuarios.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Nuestra visión</h2>
        <p className="mb-4">
          Convertirnos en la plataforma líder de bienes raíces en Latinoamérica,
          innovando constantemente para mejorar la experiencia de nuestros usuarios.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Nuestros valores</h2>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Transparencia en todas nuestras operaciones</li>
          <li className="mb-2">Innovación tecnológica constante</li>
          <li className="mb-2">Compromiso con la satisfacción del usuario</li>
          <li className="mb-2">Integridad y ética profesional</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-3">Equipo</h2>
        <p className="mb-4">
          Contamos con un equipo multidisciplinario de profesionales apasionados por
          el sector inmobiliario y la tecnología, trabajando día a día para mejorar
          la plataforma.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Contacto</h2>
        <p>
          ¿Tienes preguntas o sugerencias? Nos encantaría escucharte.
          Contáctanos a través de nuestra plataforma.
        </p>
      </div>
    </div>
  );
}
