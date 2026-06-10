"use client"

import { BaseRow } from "@/components/ui/data-table"
import { PropertyEntity, propertyTypeLabels } from "@/domain/entities/property.entity"
import { type ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  IconDotsVertical,
  IconMapPin,
  IconBed,
  IconBath,
  IconRuler,
  IconCar,
  IconHome,
  IconBuilding,
  IconBuildingEstate,
  IconBuildingSkyscraper,
  IconTree,
  IconBriefcase,
  IconBuildingWarehouse
} from "@tabler/icons-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { PropertyType } from "@/domain/entities/property.enums"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "react-i18next"
import { useRoutes } from "@/i18n/client-router"
import { toast } from "sonner"
import { deletePropertyAction } from "@/application/actions/property.action"
import { useServerMutation } from "@/shared/hooks/use-server-mutation.hook"
import { EditPropertyDialog } from "@/features/properties/edit-property-dialog"
import { humanizeLocation } from "@/lib/locations"

export type PropertyRow = BaseRow & {
  created_at: string
} & PropertyEntity


export const propertyTypeIcons: Record<PropertyType, React.ReactNode> = {
  [PropertyType.House]: <IconHome className="size-4" />,
  [PropertyType.Apartment]: <IconBuilding className="size-4" />,
  [PropertyType.Condo]: <IconBuildingEstate className="size-4" />,
  [PropertyType.TownHouse]: <IconBuilding className="size-4" />,
  [PropertyType.Land]: <IconTree className="size-4" />,
  [PropertyType.Commercial]: <IconBuildingSkyscraper className="size-4" />,
  [PropertyType.Office]: <IconBriefcase className="size-4" />,
  [PropertyType.Warehouse]: <IconBuildingWarehouse className="size-4" />,
  [PropertyType.State]: <IconMapPin className="size-4" />,
  [PropertyType.Other]: <IconHome className="size-4" />,
}

function PropertyRowActions({ property }: { property: PropertyRow }) {
  const { t } = useTranslation("properties")
  const routes = useRoutes()
  const hasCoords = property.latitude !== null && property.longitude !== null

  const mutation = useServerMutation({
    action: deletePropertyAction,
    onSuccess: () => {
      toast.success(t("common:columns.words.deleted"))
    },
    onError: (error) => {
      toast.error(error.message || t("common:columns.words.error"))
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
          disabled={mutation.isPending}
        >
          <IconDotsVertical className="size-4" />
          <span className="sr-only">{t("properties:columns.actions.open_menu")}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <EditPropertyDialog property={property}>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            {t("properties:columns.actions.edit_property")}
          </DropdownMenuItem>
        </EditPropertyDialog>
        <Link href={routes.propertyListing(property.id)} passHref>
          <DropdownMenuItem>{t("properties:columns.actions.publish_property")}</DropdownMenuItem>
        </Link>
        {hasCoords ? (
          <DropdownMenuItem asChild>
            <a
              href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("properties:columns.actions.view_map")}
            </a>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            const confirmed =
              typeof window !== "undefined"
                ? window.confirm(t("common:columns.words.confirm"))
                : true

            if (!confirmed) return

            const data = new FormData()
            data.append("id", property.id)
            mutation.action(data)
          }}
        >
          {t("properties:columns.actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const PropertyColumns: ColumnDef<PropertyRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      const { t } = useTranslation("properties")
      return t("properties:columns.headers.property")
    },
    cell: ({ row }) => {
      const type = row.original.property_type
      const thumbnail = row.original.property_images && row.original.property_images[0]?.public_url
      return (
        <EditPropertyDialog property={row.original}>
          <button type="button" className="flex items-start gap-3 text-left cursor-pointer">
            <Avatar className="size-12">
              <AvatarImage
                src={
                  thumbnail ||
                  "/placeholder.png"
                }
                alt={row.original.title}
              />
              <AvatarFallback className="uppercase">{row.original.title.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate max-w-50">
                {row.original.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {propertyTypeLabels[type]}
              </span>
            </div>
          </button>
        </EditPropertyDialog>
      )
    },
  },
  {
    id: "location",
    header: ({ column }) => {
      const { t } = useTranslation("properties")
      return t("properties:columns.headers.location")
    },
    cell: ({ row }) => {
      const { city, state, neighborhood, postal_code } = row.original
      return (
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <IconMapPin className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">
              {neighborhood ? `${humanizeLocation(neighborhood)}, ` : ""}
              {humanizeLocation(city)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground pl-5 truncate max-w-45">
            {humanizeLocation(state)} {postal_code && `(${postal_code})`}
          </span>
        </div>
      )
    },
  },
  {
    id: "coords",
    header: ({ column }) => {
      const { t } = useTranslation("properties")
      return t("properties:columns.headers.coordinates")
    },
    cell: ({ row }) => {
      const { t } = useTranslation("properties")
      const { latitude, longitude } = row.original
      if (!latitude || !longitude) return (
        <span className="text-xs text-muted-foreground italic">{t("properties:columns.labels.no_location")}</span>
      )
      return (
        <div className="flex flex-col text-xs text-muted-foreground font-mono">
          <span>{t("properties:columns.labels.lat")} {latitude.toFixed(6)}</span>
          <span>{t("properties:columns.labels.lng")} {longitude.toFixed(6)}</span>
        </div>
      )
    },
  },
  {
    id: "features",
    header: ({ column }) => {
      const { t } = useTranslation("properties")
      return t("properties:columns.headers.features")
    },
    cell: ({ row }) => {
      const { t } = useTranslation("properties")
      const { bedrooms, bathrooms, built_area, floors, parking_spots } = row.original

      const features = []
      if (bedrooms !== null) features.push({ icon: IconBed, value: `${bedrooms} ${t("properties:columns.labels.bedrooms")}` })
      if (bathrooms !== null) features.push({ icon: IconBath, value: `${bathrooms} ${t("properties:columns.labels.bathrooms")}` })
      if (built_area !== null) features.push({ icon: IconRuler, value: `${built_area}m²` })
      if (parking_spots !== null) features.push({ icon: IconCar, value: `${parking_spots} ${t("properties:columns.labels.parking_spots")}` })

      if (features.length === 0) return <span className="text-xs text-muted-foreground">—</span>

      return (
        <div className="flex flex-wrap gap-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
            >
              <feature.icon className="size-3.5" />
              <span>{feature.value}</span>
            </div>
          ))}
          {floors !== null && floors > 1 && (
            <span className="text-xs text-muted-foreground">• {floors} {t("properties:columns.labels.floors")}</span>
          )}
        </div>
      )
    },
  },
  {
    id: "lot_info",
    header: ({ column }) => {
      const { t } = useTranslation("properties")
      return t("properties:columns.headers.lot_info")
    },
    cell: ({ row }) => {
      const { t } = useTranslation("properties")
      const { lot_area, year_built } = row.original
      if (!lot_area && !year_built) return <span className="text-xs text-muted-foreground">—</span>

      return (
        <div className="flex flex-col text-xs">
          {lot_area !== null && (
            <span className="text-muted-foreground">
              {lot_area} {t("properties:columns.labels.lot_area")}
            </span>
          )}
          {year_built !== null && (
            <span className="text-muted-foreground">
              {t("properties:columns.labels.year")} {year_built}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "amenities",
    header: ({ column }) => {
      const { t } = useTranslation("properties")
      return t("properties:columns.headers.amenities")
    },
    cell: ({ row }) => {
      const amenities = row.original.amenities || []
      if (amenities.length === 0) return <span className="text-xs text-muted-foreground">—</span>

      const display = amenities.slice(0, 2)
      const remaining = amenities.length - 2

      return (
        <div className="flex flex-wrap gap-1 max-w-37.5">
          {display.map((amenity) => (
            <Badge key={amenity.value} variant="secondary" className="text-xs font-normal">
              {amenity.label}
            </Badge>
          ))}
          {remaining > 0 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{remaining}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      const { t } = useTranslation("properties")
      return t("properties:columns.headers.created_at")
    },
    cell: ({ row }) => {
      const { t } = useTranslation("properties")
      const date = new Date(row.original.created_at)
      const updated = new Date(row.original.updated_at)
      const isUpdated = updated.getTime() !== date.getTime()

      return (
        <div className="flex flex-col text-xs">
          <span>{date.toLocaleDateString()}</span>
          {isUpdated && (
            <span className="text-muted-foreground">
              {t("properties:columns.actions.edit")} {updated.toLocaleDateString()}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const property = row.original

      return (
        <PropertyRowActions property={property} />
      )
    },
  },
]
