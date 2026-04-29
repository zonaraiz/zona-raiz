import { notFound } from "next/navigation";
import { Metadata } from "next";
import { appModule } from "@/application/modules/app.module";
import { Lang } from "@/i18n/settings";
import { cookies } from "next/headers";
import { mapListingToDetailDTO } from "@/application/mappers/listing.mapper";
import { ListingDetail } from "@/features/listing/listing-detail";
import { EUserRole } from "@/domain/entities/profile.entity";

interface Props {
  params: Promise<{ slug: string; lang: Lang }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cookieStore = await cookies();
  const { slug, lang } = await params;
  const { listingService } = await appModule(lang, { cookies: cookieStore });
  const listing = await listingService.getCachedBySlug(slug);

  if (!listing) {
    return {
      title: "Propiedad no encontrada",
    };
  }

  const property = listing.property;
  const firstImage = property.property_images?.[0]?.public_url;
  const title = `${property.title} - ${listing.listing_type === "rent" ? "Renta" : "Venta"} en ${property.city}`;
  const description = `${property.title} en ${property.city}, ${property.state}. ${property.bedrooms ? `${property.bedrooms} dormitorios` : ""} ${property.bathrooms ? `${property.bathrooms} baños` : ""} . ${listing.currency} ${listing.price.toLocaleString("es-ES")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_ES",
      images: firstImage
        ? [
            {
              url: firstImage,
              width: 1200,
              height: 630,
              alt: property.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function page({ params }: Props) {
  const cookieStore = await cookies();
  const { slug, lang } = await params;

  const { listingService, sessionService, favoriteService, cookiesService } = await appModule(
    lang,
    { cookies: cookieStore },
  );
  const listing = await listingService.getCachedBySlug(slug);

  if (!listing) {
    notFound();
  }

  let isAuth = false;
  let role = EUserRole.Client
  try {
    isAuth = await sessionService.isAuth();
    role = isAuth ? await cookiesService.getProfileRole() || EUserRole.Client : EUserRole.Client
  } catch {}

  let isFavInitial = false;
  try {
    const userId = await sessionService.getCurrentUserId();
    if (userId) {
      isFavInitial = await favoriteService.exists(userId, listing.id);
    }
  } catch {
    isFavInitial = false;
  }

  // Transformar a DTO de presentación para UI
  const listingDetailData = mapListingToDetailDTO(listing);

  return (
    <ListingDetail
      data={listingDetailData}
      isFavInitial={isFavInitial}
      isAuth={isAuth}
      role={role}
    />
  );
}
