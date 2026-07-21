import { Lang } from "./settings"
import { ROUTES } from "@/infrastructure/config/routes"

// A diferencia del resto de rutas (cuya carpeta real en app/[lang]/ está
// en inglés: dashboard, auth, onboarding, listing), estas cuatro solo
// existen como carpeta en español (nosotros, contacto, terminos,
// privacidad). Su slug canónico es siempre el español, sin importar el
// idioma de la URL — si no, la versión "correcta" en español se reescribe
// hacia un slug en inglés que no tiene carpeta y termina cayendo en el
// catch-all de búsqueda.
const SPANISH_FOLDER_ROUTES = new Set(["contact", "about", "privacy", "terms"])

export function translateRoute(
  pathname: string,
  lang: Lang
) {

  for (const [key, route] of Object.entries(ROUTES)) {

    if (SPANISH_FOLDER_ROUTES.has(key)) {
      if (pathname === route.es) return pathname
      if (pathname === route.en) return route.es
      continue
    }

    const source = lang === "es" ? route.es : route.en
    const target = lang === "es" ? route.en : route.es

    const regex = new RegExp(
      "^" + source.replace(/:[^/]+/g, "([^/]+)").replace(/\//g, "\\/") + "$"
    )

    const match = pathname.match(regex)

    if (!match) continue

    let translated: string = target

    const params = source.match(/:[^/]+/g)

    if (params) {
      params.forEach((param, i) => {
        translated = translated.replace(param, match[i + 1])
      })
    }

    return translated
  }

  return pathname
}