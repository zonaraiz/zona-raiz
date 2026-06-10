"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropertyForm } from "@/features/properties/property-form";
import { PropertyInput } from "@/application/validation/property.schema";
import { PropertyEntity } from "@/domain/entities/property.entity";

type EditableProperty = PropertyEntity & {
  created_at: string;
};

interface EditPropertyDialogProps {
  property: EditableProperty;
  children: React.ReactNode;
}

export function EditPropertyDialog({
  property,
  children,
}: EditPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const defaultValues = useMemo<PropertyInput>(
    () => ({
      title: property.title,
      description: property.description ?? "",
      property_type: property.property_type,
      street: property.street,
      city: property.city,
      state: property.state,
      postal_code: property.postal_code,
      country: property.country,
      latitude: property.latitude ?? 0,
      longitude: property.longitude ?? 0,
      neighborhood: property.neighborhood ?? "",
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      built_area: property.built_area ?? 0,
      lot_area: property.lot_area ?? 0,
      floors: property.floors ?? 0,
      year_built: property.year_built ?? 2000,
      parking_spots: property.parking_spots ?? 0,
      amenities: property.amenities ?? [],
    }),
    [property],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[96vw] max-w-6xl max-h-[92vh] overflow-y-auto p-0">
        <div className="px-6 pt-6">
          <DialogTitle>Editar propiedad</DialogTitle>
        </div>

        <PropertyForm
          id={property.id}
          realEstateId={property.real_estate_id}
          defaultValues={defaultValues}
          initialImages={property.property_images ?? []}
          onCompleted={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
