import { encodedRedirect } from "@/shared/redirect";
import { Card, CardContent } from '@/components/ui/card'
import { ListingForm } from "@/features/listing/listing-form";
import { PropertyCard } from "@/features/properties/property-card";
import { Lang } from "@/i18n/settings";
import { initI18n } from "@/i18n/server";
import { cookies } from "next/headers";
import { createRouter } from "@/i18n/router";
import { appModule } from "@/application/modules/app.module";
import { redirect } from "next/navigation";

interface props {
  params: Promise<{ lang: Lang, id: string }>
}

export default async function page({ params }: props) {
  const { lang, id } = await params;
  const i18n = await initI18n(lang)
  const t = i18n.getFixedT(lang)
  const cookieStore = await cookies()
  const routes = createRouter(lang)
  const { propertyService, propertyImageService, listingService } = await appModule(lang, { cookies: cookieStore })

  const property = await propertyService.getCachedById(id)

  if (!property) {
    return encodedRedirect('error', routes.properties(), t("common:exceptions.data_not_found"))
  }

  const existingListing = await listingService.all({ property_id: id })

  if (existingListing.length > 0) {
    redirect(routes.listing(existingListing[0].id))
  }

  const images = await propertyImageService.getCachedByPropertyId(id)

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-2 space-y-2 lg:max-w-5xl w-full">
      <PropertyCard
        property={property}
        images={images ? images.map(img => img.public_url as string) : []}
      />
      <Card>
        <CardContent>
          <ListingForm
            property_id={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
