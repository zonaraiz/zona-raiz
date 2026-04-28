import { ListingStatus, ListingType } from "./listing.enums";
import { PropertyEntity } from "./property.entity";
import { ProfileEntity } from "./profile.entity";


export interface ListingEntity {
  id: string;
  property_id: string;
  agent_id: string | null;

  listing_type: ListingType;
  price: number;
  currency: string;
  price_negotiable: boolean;

  expenses_amount?: number | null;
  expenses_included: boolean;

  status: ListingStatus;
  featured: boolean;
  virtual_tourUrl?: string | null;
  video_url?: string | null;

  available_from?: string | null;
  minimum_contract_duration?: number | null;
  whatsapp_contact?: string | null;

  views_count: number;
  enquiries_count: number;
  whatsapp_clicks: number;
  published_at?: string | null;
  property: PropertyEntity;
  created_at: string;
  updated_at: string;
  agent?: ProfileEntity | null;
}

export const listingTypeOptions = [
  { label: "Renta", value: ListingType.RENT },
  { label: "Venta", value: ListingType.SALE },
];

export const listingTypeLabels: Record<ListingType, string> = {
  [ListingType.RENT]: "Renta",
  [ListingType.SALE]: "Venta",
};

export const listingStatusOptions = [
  { label: "Activa", value: ListingStatus.ACTIVE },
  { label: "Borrador", value: ListingStatus.DRAFT },
  { label: "Archivada", value: ListingStatus.ARCHIVED },
];

export const listingStatusLabels: Record<ListingStatus, string> = {
  [ListingStatus.ACTIVE]: "Activa",
  [ListingStatus.DRAFT]: "Borrador",
  [ListingStatus.ARCHIVED]: "Archivada",
};
