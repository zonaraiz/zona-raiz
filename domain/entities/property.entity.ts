import { PropertyImageEntity } from "./property-image.entity";
import { AmenitiesType, PropertyType } from "./property.enums";

export interface AmenitieType {
  label: string;
  value: AmenitiesType;
}

export interface PropertyEntity {
  id: string;
  real_estate_id: string;
  title: string;
  slug: string;
  description: string | null;
  property_type: PropertyType;

  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  neighborhood: string | null;

  bedrooms: number | null;
  bathrooms: number | null;
  built_area: number | null;
  lot_area: number | null;
  floors: number | null;
  year_built: number | null;
  parking_spots: number | null;
  amenities: AmenitieType[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  property_images: PropertyImageEntity[];
  real_estate?: {
    id: string;
    name: string;
  };
}

export const propertyTypeOptions = [
  { label: "Casa", value: PropertyType.House },
  { label: "Apartamento", value: PropertyType.Apartment },
  { label: "Condominio", value: PropertyType.Condo },
  { label: "Casa adosada", value: PropertyType.TownHouse },
  { label: "Terreno", value: PropertyType.Land },
  { label: "Finca", value: PropertyType.State },
  { label: "Comercial", value: PropertyType.Commercial },
  { label: "Oficina", value: PropertyType.Office },
  { label: "Bodega", value: PropertyType.Warehouse },
  { label: "Otro", value: PropertyType.Other },
];

export const propertyTypeLabels: Record<PropertyType, string> = {
  [PropertyType.House]: "Casa",
  [PropertyType.Apartment]: "Apartamento",
  [PropertyType.Condo]: "Condominio",
  [PropertyType.TownHouse]: "Townhouse",
  [PropertyType.Land]: "Terreno",
  [PropertyType.Commercial]: "Comercial",
  [PropertyType.Office]: "Oficina",
  [PropertyType.Warehouse]: "Bodega",
  [PropertyType.State]: "Finca",
  [PropertyType.Other]: "Otro",
};

export const amenitiesOptions = [
  { label: "Piscina", value: AmenitiesType.Pool },
  { label: "Gimnasio", value: AmenitiesType.Gym },
  { label: "Estacionamiento", value: AmenitiesType.Parking },
  { label: "Ascensor", value: AmenitiesType.Elevator },
  { label: "Seguridad", value: AmenitiesType.Security },
  { label: "Jardín", value: AmenitiesType.Garden },
  { label: "Balcón", value: AmenitiesType.Balcony },
  { label: "Aire acondicionado", value: AmenitiesType.AirConditioning },
  { label: "Calefacción", value: AmenitiesType.Heating },
];
