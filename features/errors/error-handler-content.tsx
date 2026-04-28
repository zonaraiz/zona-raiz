"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function ErrorHandlerContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorKey = searchParams.get("error");
    if (errorKey) {

      const message = t(errorKey);
      toast.error(t("common:error_title", "¡Ups! Algo salió mal"), {
        description: message,
        duration: 5000,
      });

      // 2. Limpiamos la URL para que el toast no vuelva a salir si el usuario refresca
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const newQuery = params.toString();
      const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "");

      router.replace(cleanUrl);
    }
  }, [searchParams, t, router]);

  return null;
}

export function AuthErrorHandler() {
  return (
    <Suspense fallback={null}>
      <ErrorHandlerContent />
    </Suspense>
  );
}
