import { PropertyColumns } from "@/features/properties/property-columns";
import PropertiesTable from "@/features/properties/property-table";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyFiltersForm } from "@/features/properties/property-form-filters";
import { Button } from "@/components/ui/button";
import { IconFilter, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { PropertySearchFormInput } from "@/application/validation/property-search.schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cookies } from "next/headers";
import { Lang } from "@/i18n/settings";
import { createRouter } from "@/i18n/router";
import { initI18n } from "@/i18n/server";
import { appModule } from "@/application/modules/app.module";
import { encodedRedirect } from "@/shared/redirect";

interface props {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<PropertySearchFormInput>;
}

export default async function page({ params, searchParams }: props) {
  const { lang } = await params;
  const filters = await searchParams;
  const i18n = await initI18n(lang);
  const t = i18n.getFixedT(lang);
  const cookieStore = await cookies();
  const routes = createRouter(lang);
  const { cookiesService, propertyService } = await appModule(lang, {
    cookies: cookieStore,
  });

  const realEstateId = await cookiesService.getRealEstateId();

  if (!realEstateId) {
    return encodedRedirect(
      "error",
      routes.onboarding(),
      t("common:exceptions.data_not_found"),
    );
  }

  const properties = propertyService.getCachedAll({
    ...filters,
    real_estate_id: realEstateId,
  });

  return (
    <main className="flex-col items-center justify-center space-y-4 px-4 lg:px-6">
      <Card>
        <CardContent className="space-y-4">
          <Collapsible className="flex-col space-y-4 space-x-1 justify-end">
            <CollapsibleTrigger asChild>
              <Button>
                <IconFilter />
              </Button>
            </CollapsibleTrigger>
            <Button asChild>
              <Link href={`${routes.properties()}/new`}>
                <IconPlus />
              </Link>
            </Button>
            <CollapsibleContent className="flex flex-col gap-2">
              <PropertyFiltersForm debounceMs={400} />
              <Separator />
            </CollapsibleContent>
          </Collapsible>
          <Suspense fallback={<Spinner />}>
            <PropertiesTable
              properties={properties}
              columns={PropertyColumns}
            />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
