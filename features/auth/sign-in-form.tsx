"use client";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ComponentProps, useEffect } from "react";
import { useTranslation } from "react-i18next";
import GoogleAuth from "./google-auth";
import { Spinner } from "@/components/ui/spinner";
import { useServerMutation } from "@/shared/hooks/use-server-mutation.hook";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn, flatten } from "@/lib/utils";
import {
  defaultSignInValues,
  SignInFormInput,
  signInSchema,
} from "@/application/validation/auth.validation";
import { signInAction } from "@/application/actions/auth.actions";
import { useRoutes } from "@/i18n/client-router";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const hidden = {
  opacity: 0,
  transform: "translateY(10px)",
};

export function SignInForm({ className, ...props }: ComponentProps<"form">) {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const routes = useRoutes();

  const form = useForm<SignInFormInput>({
    resolver: yupResolver(signInSchema),
    defaultValues: defaultSignInValues,
    mode: "onBlur",
  });

  const {
    setError,
    formState: { isSubmitting },
  } = form;

  const mutation = useServerMutation({
    action: signInAction,
    setError,
    onSuccess: (result) => {
      if ("data" in result) {
        router.push(result.data.redirectTo);
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message || t("messages.error.sign_up"));
      console.error("Sign in error:", error);
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      if (mutation.isError) mutation.reset();
    });
    return () => subscription.unsubscribe();
  }, [form, mutation]);

  const onSubmit = (values: SignInFormInput) => {
    const formData = new FormData();
    const data = flatten(values, "", formData);
    mutation.action(data);
  };

  const isLoading = isSubmitting || mutation.isPending;

  return (
    <Form
      {...props}
      form={form}
      className={cn("py-16 px-6", className)}
      onSubmit={onSubmit}
    >
      <Form.Set className="gap-3">
        {/* Header */}
        <div
          className="flex flex-col items-center gap-2 text-center"
          style={{ ...hidden, animation: "authFadeIn 0.4s ease 0ms both" }}
        >
          <h1 className="text-2xl font-bold">{t("titles.sign_in")}</h1>
          <p className="text-muted-foreground text-balance">
            {t("subtitles.sign_in")}
          </p>
        </div>

        {/* Email */}
        <div style={{ ...hidden, animation: "authFadeIn 0.4s ease 60ms both" }}>
          <Form.Input
            name="email"
            type="email"
            label={t("labels.email")}
            placeholder={t("placeholders.email")}
            autoComplete="email"
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div
          style={{ ...hidden, animation: "authFadeIn 0.4s ease 120ms both" }}
        >
          <Form.Input
            name="password"
            type="password"
            label={t("labels.password")}
            placeholder={t("placeholders.password")}
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>

        {/* Forgot */}
        <div
          style={{ ...hidden, animation: "authFadeIn 0.4s ease 160ms both" }}
        >
          <Link
            href={routes.otp()}
            className="ml-auto block text-right text-sm underline-offset-2 hover:underline"
          >
            {t("actions.otp")}
          </Link>
        </div>

        {/* Submit */}
        <div
          style={{ ...hidden, animation: "authFadeIn 0.4s ease 200ms both" }}
        >
          <Button type="submit" className="w-full my-4" disabled={isLoading}>
            {isLoading && (
              <Spinner data-icon="inline-start" className="mr-2 h-4 w-4" />
            )}
            {t("actions.sign_in")}
          </Button>
        </div>
        <Separator />
        {/* Google */}
        <div
          style={{ ...hidden, animation: "authFadeIn 0.4s ease 240ms both" }}
        >
          <GoogleAuth disabled={isLoading} />
        </div>

        {/* Sign up link */}
        <div
          style={{ ...hidden, animation: "authFadeIn 0.4s ease 280ms both" }}
        >
          <FieldDescription className="text-center">
            <Link
              href={routes.signup()}
              className="ml-1 text-sm font-medium text-primary hover:underline"
            >
              {t("actions.sign_up")}
            </Link>
          </FieldDescription>
        </div>
      </Form.Set>

      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </Form>
  );
}
