export const ROUTES = {
  base: {
    es: "/",
    en: "/",
  },

  home: {
    es: "/es",
    en: "/en",
  },

  contact: {
    es: "/concto",
    en: "/contact",
  },

  about: {
    es: "/nosotros",
    en: "/about",
  },

  privacy: {
    es: "/privacidad",
    en: "/privacy",
  },

  terms: {
    es: "/terminos",
    en: "/terms",
  },

  signin: {
    es: "/autenticacion/login",
    en: "/auth/sign-in",
  },

  signup: {
    es: "/autenticacion/registro",
    en: "/auth/sign-up",
  },

  signout: {
    es: "/autenticacion/logout",
    en: "/auth/sign-out",
  },

  otp: {
    es: "/autenticacion/otp",
    en: "/auth/otp",
  },

  callback: {
    es: "/autenticacion/callback",
    en: "/auth/callback",
  },

  onboarding: {
    es: "/incorporacion",
    en: "/onboarding",
  },

  onboardingReaEstate: {
    es: "/incorporacion/registro-inmobiliaria",
    en: "/onboarding/register-real-estate",
  },

  dashboard: {
    es: "/panel",
    en: "/dashboard",
  },

  profile: {
    es: "/panel/perfil",
    en: "/dashboard/profile",
  },

  realEstates: {
    es: "/panel/inmobiliarias",
    en: "/dashboard/real-estates",
  },

  currentRealEstate: {
    es: "/panel/inmobiliaria",
    en: "/dashboard/real-estate",
  },

  realEstate: {
    es: "/panel/inmobiliarias/:id",
    en: "/dashboard/real-estates/:id",
  },

  properties: {
    es: "/panel/propiedades",
    en: "/dashboard/properties",
  },

  newProperty: {
    es: "/panel/propiedades/nuevo",
    en: "/dashboard/properties/new",
  },

  property: {
    es: "/panel/propiedades/:id",
    en: "/dashboard/properties/:id",
  },

  propertyImages: {
    es: "/panel/propiedades/:id/imagenes",
    en: "/dashboard/properties/:id/images",
  },

  propertyListing: {
    es: "/panel/propiedades/:id/publicar",
    en: "/dashboard/properties/:id/listing",
  },

  listing: {
    es: "/panel/publicaciones/:id",
    en: "/dashboard/listings/:id",
  },

  listings: {
    es: "/panel/publicaciones",
    en: "/dashboard/listings",
  },

  listings_public: {
    es: "/publicacion/:slug",
    en: "/listing/:slug",
  },

  enquiries: {
    es: "/panel/consultas",
    en: "/dashboard/enquiries",
  },

  import: {
    es: "/panel/importacion",
    en: "/dashboard/import",
  },

  favorites: {
    es: "/panel/favoritos",
    en: "/dashboard/favorites",
  },

  users: {
    es: "/panel/usuarios",
    en: "/dashboard/users",
  },

  user: {
    es: "/panel/usuarios/:id",
    en: "/dashboard/users/:id",
  },

  search: {
    es: "/apartamentos",
    en: "/apartments",
  },

  selectRealEstate: {
    es: "/autenticacion/seleccionar-inmobiliaria",
    en: "/auth/select-real-estate",
  },
} as const;

type Lang = "es" | "en";

export function getRoutes(keys: readonly (keyof typeof ROUTES)[], lang: Lang) {
  return keys.map((key) => ROUTES[key][lang]);
}
