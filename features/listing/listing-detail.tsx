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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-12 w-full overflow-hidden">
            <PropertyCarouselGallery images={imageUrls} />
          </div>
          <div className="lg:col-span-6 order-last w-full overflow-hidden">
            <div className="space-y-2">
              <ListingPricing listing={listing} />
              <ListingActions listing={listing} isFavInitial={isFavInitial} />
            </div>
            {property.real_estate_id && (
              <EnquiryForm
                listingId={listing.id}
                realEstateId={property.real_estate_id}
              />
            )}
          </div>
          <div className="lg:col-span-6 w-full">
            <div className="lg:sticky lg:top-8 pt-8">
              <PropertyDetail data={propertyDetail} />
              <ListingDetailInfo listing={listing} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
