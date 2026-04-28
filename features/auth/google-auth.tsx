"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { IconBrandGoogle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useServerMutation } from "@/shared/hooks/use-server-mutation.hook";
import { signInWithGoogleAction } from "@/application/actions/auth.actions";
import { toast } from "sonner";

interface GoogleAuthProps {
  disabled?: boolean;
}

export type UserType = "real-estate" | "client";

export default function GoogleAuth({ disabled }: GoogleAuthProps) {
  const { t } = useTranslation("auth");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { action: handleGoogleSignIn, isPending } = useServerMutation({
    action: signInWithGoogleAction,
    onSuccess: (response) => {
      if ("data" in response) {
        if ("redirectUrl" in response.data) {
          const url = decodeURIComponent(response.data.redirectUrl as string);
          if (url.trim().length) window.location.href = url;
        }
      }
    },
    onError: (err) => {
      toast.error(err.message || t("errors.googleSignIn"));
    },
  });

  const onClick = () => {
    // Validación: tipo requerido
    if (!userType) {
      const errorMsg = t("exceptions.user_type_required");
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append("user_type", userType);
    handleGoogleSignIn(formData);
  };

  const handleSelectChange = (value: UserType) => {
    setUserType(value);
    setError(null);
  };

  return (
    <div className="w-full">
      {/* Selector de tipo de usuario */}
      <div className="my-3">
        <label className="text-sm font-medium text-foreground mb-2 block">
          {t("labels.user_type")}
        </label>
        <div className="flex flex-col gap-2">
          <label
            className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
              userType === "real-estate"
                ? "border-primary bg-primary/10"
                : "border-input hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="user_type"
              value="real-estate"
              checked={userType === "real-estate"}
              onChange={() => handleSelectChange("real-estate")}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                userType === "real-estate"
                  ? "border-primary"
                  : "border-muted-foreground"
              }`}
            >
              {userType === "real-estate" && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </span>
            <span className="text-sm">{t("labels.user_type_real_estate")}</span>
          </label>

          <label
            className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
              userType === "client"
                ? "border-primary bg-primary/10"
                : "border-input hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="user_type"
              value="client"
              checked={userType === "client"}
              onChange={() => handleSelectChange("client")}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                userType === "client" ? "border-primary" : "border-muted-foreground"
              }`}
            >
              {userType === "client" && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </span>
            <span className="text-sm">{t("labels.user_type_client")}</span>
          </label>
        </div>
        {error && (
          <p className="text-sm text-destructive mt-2 text-center">{error}</p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full my-2"
        onClick={onClick}
        disabled={disabled || isPending}
      >
        {isPending ? (
          <Spinner className="mr-2 h-4 w-4" />
        ) : (
          <IconBrandGoogle className="mr-2 h-4 w-4" />
        )}
        {t("actions.google")}
      </Button>
    </div>
  );
}
