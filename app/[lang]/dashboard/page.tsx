import { DashboardStats } from "@/features/dashboard/dashboard-stats";
import { PropertyTypesChart } from "@/features/dashboard/property-types-chart";
import {
  ListingsByStatusChart,
  ListingsByStatusData,
} from "@/features/dashboard/listings-by-status-chart";
import { cookies } from "next/headers";
import { AgentList } from "@/features/agents/agent-list";
import { SkeletonAgentList } from "@/features/agents/skeleton-agent-list";
import { Suspense } from "react";
import { AddAgentModal } from "@/features/agents/add-agent-modal";
import { FeaturedListingsSlider } from "@/features/dashboard/featured-listings-slider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Lang } from "@/i18n/settings";
import { getTranslation } from "@/i18n/server";
import SimpleListingTable from "@/features/listing/simple-listing-table";
import { getSimpleListingColumns } from "@/features/listing/simple-listing-columns";
import { Spinner } from "@/components/ui/spinner";
import { appModule } from "@/application/modules/app.module";
import { encodedRedirect } from "@/shared/redirect";
import { createRouter } from "@/i18n/router";

function getMonthDateRange(date: Date): {
  start_date: string;
  end_date: string;
} {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  };
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

interface props {
  params: Promise<{ lang: Lang }>;
}

export default async function page({ params }: props) {
  const { lang } = await params;
  const { t } = await getTranslation(lang);
  const cookieStore = await cookies();
  const routes = createRouter(lang);

  const {
    cookiesService,
    propertyService,
    listingService,
    profileService,
    realEstateService,
    agentService,
  } = await appModule(lang, { cookies: cookieStore });

  const realEstateId = (await cookiesService.getRealEstateId()) as string;

  if (!realEstateId) {
    return encodedRedirect(
      "error",
      routes.onboarding(),
      t("common:exceptions.data_not_found"),
    );
  }

  const now = new Date();
  const currentMonthRange = getMonthDateRange(now);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthRange = getMonthDateRange(previousMonth);

  const currentMonthProperties = realEstateId
    ? await propertyService.getCachedCountByRealEstateWithDateRange(
        realEstateId,
        currentMonthRange.start_date,
        currentMonthRange.end_date,
      )
    : await propertyService.getCachedCountWithDateRange(
        currentMonthRange.start_date,
        currentMonthRange.end_date,
      );

  const previousMonthProperties = realEstateId
    ? await propertyService.getCachedCountByRealEstateWithDateRange(
        realEstateId,
        previousMonthRange.start_date,
        previousMonthRange.end_date,
      )
    : await propertyService.getCachedCountWithDateRange(
        previousMonthRange.start_date,
        previousMonthRange.end_date,
      );

  const activeProperties = currentMonthProperties;
  const activePropertiesChange = calculatePercentageChange(
    currentMonthProperties,
    previousMonthProperties,
  );

  const currentMonthListings = realEstateId
    ? await listingService.getCachedCountByRealEstateWithDateRange(
        realEstateId,
        currentMonthRange.start_date,
        currentMonthRange.end_date,
      )
    : await listingService.getCachedCountWithDateRange(
        currentMonthRange.start_date,
        currentMonthRange.end_date,
      );

  const previousMonthListings = realEstateId
    ? await listingService.getCachedCountByRealEstateWithDateRange(
        realEstateId,
        previousMonthRange.start_date,
        previousMonthRange.end_date,
      )
    : await listingService.getCachedCountWithDateRange(
        previousMonthRange.start_date,
        previousMonthRange.end_date,
      );

  const totalListings = currentMonthListings;
  const totalListingsChange = calculatePercentageChange(
    currentMonthListings,
    previousMonthListings,
  );

  const currentMonthVisits = realEstateId
    ? await listingService.getCachedCountByRealEstateWithDateRange(
        realEstateId,
        currentMonthRange.start_date,
        currentMonthRange.end_date,
      )
    : await listingService.getCachedCountWithDateRange(
        currentMonthRange.start_date,
        currentMonthRange.end_date,
      );

  const previousMonthVisits = realEstateId
    ? await listingService.getCachedCountByRealEstateWithDateRange(
        realEstateId,
        previousMonthRange.start_date,
        previousMonthRange.end_date,
      )
    : await listingService.getCachedCountWithDateRange(
        previousMonthRange.start_date,
        previousMonthRange.end_date,
      );

  const visits = currentMonthVisits;
  const visitsChange = calculatePercentageChange(
    currentMonthVisits,
    previousMonthVisits,
  );

  const currentMonthNewUsers = await profileService.getCachedCountWithDateRange(
    currentMonthRange.start_date,
    currentMonthRange.end_date,
  );
  const previousMonthNewUsers =
    await profileService.getCachedCountWithDateRange(
      previousMonthRange.start_date,
      previousMonthRange.end_date,
    );

  const newUsers = currentMonthNewUsers;
  const newUsersChange = calculatePercentageChange(
    currentMonthNewUsers,
    previousMonthNewUsers,
  );

  const currentMonthRealEstates =
    await realEstateService.getCachedCountWithDateRange(
      currentMonthRange.start_date,
      currentMonthRange.end_date,
    );
  const previousMonthRealEstates =
    await realEstateService.getCachedCountWithDateRange(
      previousMonthRange.start_date,
      previousMonthRange.end_date,
    );

  const totalRealEstates = currentMonthRealEstates;
  const totalRealEstatesChange = calculatePercentageChange(
    currentMonthRealEstates,
    previousMonthRealEstates,
  );

  const propertyTypesData =
    await propertyService.getCachedCountByTypes(realEstateId);

  const agents = await agentService.getCachedListAgents(realEstateId);

  const featuredListings = await listingService.getCachedFeatured(
    10,
    realEstateId,
  );

  const currentYear = now.getFullYear();
  const listingsByStatus = await listingService.getCachedCountByStatusAndMonth(
    currentYear,
    { real_estate_id: realEstateId },
  );
  const listings = listingService.getCachedSimplePublishedByRealEstate(
    10,
    realEstateId,
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="grid grid-cols-1 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-5 lg:auto-rows-4 px-8">
          {/* Row 1 */}
          <div className="col-span-full lg:col-span-3">
            <DashboardStats
              activeProperties={activeProperties}
              activePropertiesChange={activePropertiesChange}
              visits={visits}
              visitsChange={visitsChange}
              totalListings={totalListings}
              totalListingsChange={totalListingsChange}
              newUsers={newUsers}
              newUsersChange={newUsersChange}
              totalRealEstates={totalRealEstates}
              totalRealEstatesChange={totalRealEstatesChange}
              visibleCards={[
                "properties",
                "visits",
                "listings",
                "newUsers",
                "realEstates",
              ]}
            />
          </div>

          <div className="col-span-full lg:col-span-1">
            <PropertyTypesChart data={propertyTypesData} />
          </div>

          <div className="col-span-full lg:col-span-1">
            <Suspense fallback={<SkeletonAgentList />}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("dashboard:sections.agents")}
                  </CardTitle>
                  <CardAction>
                    <AddAgentModal realEstateId={realEstateId} />
                  </CardAction>
                </CardHeader>
                <CardContent className="border-t flex-col items-start text-sm">
                  <AgentList realEstateId={realEstateId} agents={agents} />
                </CardContent>
              </Card>
            </Suspense>
          </div>
          {/* Row 2 */}
          <div className="col-span-full lg:col-span-2">
            <ListingsByStatusChart
              className="lg:px-0 lg:mx-4 h-full"
              data={listingsByStatus as ListingsByStatusData}
            />
          </div>

          <div className="col-span-full lg:col-span-3">
            {featuredListings.length > 0 && (
              <FeaturedListingsSlider
                className="lg:px-4 h-full"
                listings={featuredListings}
              />
            )}
          </div>

          <div className="col-span-full">
            <Card>
              <CardContent>
                <div className="p-4 border-b">
                  <h1 className="text-lg font-semibold">
                    {t("dashboard:sections.last_properties_publisheds")}
                  </h1>
                </div>
                <Suspense fallback={<Spinner />}>
                  <SimpleListingTable
                    listings={listings}
                    columnsFactory={getSimpleListingColumns}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
