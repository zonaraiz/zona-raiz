"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRoutes } from "@/i18n/client-router";

export default function BackButton({
  ...props
}: React.ComponentProps<"button">) {
  const router = useRouter();
  const routes = useRoutes();
  const { t } = useTranslation("common");

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={() => router.push(routes.home())}
      {...props}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t("words.back")}
    </Button>
  );
}
