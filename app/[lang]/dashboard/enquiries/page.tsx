import InquiryTable from "@/features/enquiries/enquiry-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnquiryFiltersForm } from "@/features/enquiries/enquiry-filters-form";
import { Button } from "@/components/ui/button";
import { IconFilter } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Lang } from "@/i18n/settings";
import { EnquirySearchFormInput } from "@/application/validation/enquiry-search.schema";
import { cookies } from "next/headers";
import { appModule } from "@/application/modules/app.module";
import { encodedRedirect } from "@/shared/redirect";
import { createRouter } from "@/i18n/router";
import { initI18n } from "@/i18n/server";
import { EnquiryStatus } from "@/domain/entities/enquiry.enums";

interface props {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<EnquirySearchFormInput>;
}

export default async function page({ params, searchParams }: props) {
  const filters = await searchParams;
  const { lang } = await params;
  const i18n = await initI18n(lang);
  const t = i18n.getFixedT(lang);
  const cookieStore = await cookies();
  const routes = createRouter(lang);

  const { enquiryService, cookiesService } = await appModule(lang, {
    cookies: cookieStore,
  });

  const realEstateId = (await cookiesService.getRealEstateId()) as string;

  if (!realEstateId) {
    encodedRedirect(
      "error",
      routes.enquiries(),
      t("common:exceptions.data_not_found"),
    );
    return;
  }

  const enquiryRows = await enquiryService.all(filters);
  const newCount = enquiryRows.filter(
    (enquiry) => enquiry.status === EnquiryStatus.NEW,
  ).length;
  const contactedCount = enquiryRows.filter(
    (enquiry) => enquiry.status === EnquiryStatus.CONTACTED,
  ).length;
  const unassignedCount = enquiryRows.filter(
    (enquiry) => !enquiry.assigned_to,
  ).length;

  return (
    <main className="flex-col items-center justify-center space-y-4 px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardDescription>{t("dashboard.cards.total")}</CardDescription>
            <CardTitle className="text-3xl">{enquiryRows.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardDescription>{t("dashboard.cards.new")}</CardDescription>
            <CardTitle className="text-3xl">{newCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardDescription>{t("dashboard.cards.contacted")}</CardDescription>
            <CardTitle className="text-3xl">{contactedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardDescription>{t("dashboard.cards.unassigned")}</CardDescription>
            <CardTitle className="text-3xl">{unassignedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.helper")}
            </p>
          </div>
          <Collapsible className="flex-col space-y-4 space-x-1 justify-end">
            <CollapsibleTrigger asChild>
              <Button>
                <IconFilter />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-2">
              <EnquiryFiltersForm />
              <Separator />
            </CollapsibleContent>
          </Collapsible>
          <InquiryTable
            enquiries={Promise.resolve(enquiryRows)}
            realEstateId={realEstateId}
          />
        </CardContent>
      </Card>
    </main>
  );
}
