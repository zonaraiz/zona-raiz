"use client";

import { PropertyDetail } from "@/features/properties/property-details";
import { ListingDetailDTO } from "@/application/mappers/listing.mapper";
import PropertyCarouselGallery from "../properties/property-carousel-gallery";
import { LandingNav } from "../landing/landing-nav";
import { ListingBreadcrumb } from "./listing-breadcrumb";
import { ListingDetailInfo } from "./listing-detail-info";
import { EnquiryForm } from "./enquiry-form";
import { ListingPricing } from "./listing-pricing";
import { ListingActions } from "./listing-actions";
import { EUserRole } from "@/domain/entities/profile.entity";

interface ListingDetailProps {
  data: ListingDetailDTO | null | undefined;
  isFavInitial?: boolean;
  isAuth?: boolean;
  role: EUserRole
}

export function ListingDetail({
  data,
  isFavInitial = false,
  isAuth = false,
  role
}: ListingDetailProps) {
  if (!data) return null;
  const { propertyDetail, listing } = data;
  const { imageUrls, property } = propertyDetail;

  return (
    <div>
      <LandingNav isAuth={isAuth} role={role}/>
      <ListingBreadcrumb data={data} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="w-full overflow-hidden">
            <PropertyCarouselGallery images={imageUrls} />
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="order-2 w-full lg:order-1 lg:col-span-7">
              <div className="rounded-[2rem] border border-border/60 bg-card/50 p-2 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.9)]">
                <PropertyDetail data={propertyDetail} />
                <ListingDetailInfo listing={listing} />
              </div>
            </div>

            <div className="order-1 w-full lg:order-2 lg:col-span-5">
              <div className="space-y-5 lg:sticky lg:top-8">
                <div className="rounded-[2rem] border border-border/60 bg-card/60 p-6 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.95)]">
                  <div className="space-y-3">
                    <ListingPricing listing={listing} />
                    <ListingActions listing={listing} isFavInitial={isFavInitial} />
                  </div>
                </div>

                {property.real_estate_id && (
                  <div className="rounded-[2rem] border border-border/60 bg-card/60 p-1 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.95)]">
                    <EnquiryForm
                      listingId={listing.id}
                      realEstateId={property.real_estate_id}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
