"use client";

import {
  EnquiryEntity,
  enquirySourceLabels,
  enquiryStatusLabels,
} from "@/domain/entities/enquiry.entity";
import { EnquiryStatus } from "@/domain/entities/enquiry.enums";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EnquiryRowActions } from "./enquiry-row-actions";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRoutes } from "@/i18n/client-router";
import { useTranslation } from "react-i18next";

export type EnquiryRow = EnquiryEntity;

function statusVariant(status: EnquiryStatus) {
  switch (status) {
    case EnquiryStatus.NEW:
      return "outline";
    case EnquiryStatus.CONTACTED:
      return "secondary";
    case EnquiryStatus.QUALIFIED:
      return "default";
    case EnquiryStatus.CONVERTED:
      return "default";
    case EnquiryStatus.LOST:
      return "destructive";
    default:
      return "outline";
  }
}

export function useEnquiryColumns(
  realEstateId: string,
): ColumnDef<EnquiryRow>[] {
  const routes = useRoutes();
  const { t } = useTranslation("enquiries");

  return [
    {
      accessorKey: "name",
      header: () => t("columns.headers.name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name || "—"}</span>
      ),
    },
    {
      accessorKey: "email",
      header: () => t("columns.headers.email"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.email || "—"}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: () => t("columns.headers.phone"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "source",
      header: () => t("columns.headers.source"),
      cell: ({ row }) => {
        const label =
          enquirySourceLabels[row.original.source] || row.original.source;
        return <Badge variant="secondary">{label}</Badge>;
      },
    },
    {
      accessorKey: "listing",
      header: () => t("columns.headers.listing"),
      cell: ({ row }) => {
        const prop = row.original.listing;

        if (!prop) {
          return (
            <span className="text-sm text-muted-foreground italic">
              {t("columns.labels.no_property")}
            </span>
          );
        }
        return (
          <Link
            href={routes.listing(prop.id)}
            className="text-sm hover:underline"
          >
            {prop.title || t("columns.labels.no_title")}
          </Link>
        );
      },
    },
    {
      accessorKey: "assigned_to_profile",
      header: () => t("columns.headers.assigned_to"),
      cell: ({ row }) => {
        const agent = row.original.assigned_to_profile;
        if (!agent) {
          return (
            <span className="text-sm text-muted-foreground italic">
              {t("columns.labels.unassigned")}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={agent.avatar_url || ""}
                alt={agent.full_name || "Agent"}
              />
              <AvatarFallback>
                {agent.full_name?.substring(0, 2).toUpperCase() || "AG"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate max-w-24">
              {agent.full_name || t("columns.labels.agent")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => t("columns.headers.status"),
      cell: ({ row }) => {
        const label =
          enquiryStatusLabels[row.original.status] || row.original.status;
        return (
          <Badge variant={statusVariant(row.original.status)}>{label}</Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => t("columns.headers.created_at"),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString()} · {date.toLocaleTimeString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <EnquiryRowActions
          inquiryId={row.original.id}
          realEstateId={realEstateId}
        />
      ),
    },
  ];
}
