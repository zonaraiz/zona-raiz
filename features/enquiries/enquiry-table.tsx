"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EnquiryRow } from "./enquiry-columns";
import { use } from "react";
import { useEnquiryColumns } from "./enquiry-columns";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface EnquiryTableProps {
  enquiries: Promise<EnquiryRow[]>;
  realEstateId: string;
  columns?: ColumnDef<EnquiryRow>[];
}

export default function InquiryTable({
  enquiries,
  realEstateId,
  columns,
}: EnquiryTableProps) {
  const { t } = useTranslation("enquiries");
  const data = use(enquiries);
  const defaultCols = useEnquiryColumns(realEstateId);
  const cols = columns ?? defaultCols;

  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center space-y-2">
          <h3 className="text-xl font-semibold">{t("empty.title")}</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {t("empty.description")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DataTable
      data={data}
      columns={cols}
      enableRowSelection={false}
      enableDrag={false}
    />
  );
}
