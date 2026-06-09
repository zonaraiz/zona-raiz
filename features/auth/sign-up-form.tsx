"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { cn, flatten } from "@/lib/utils";
import { Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ComponentProps, useEffect } from "react";
import { useTranslation } from "react-i18next";
import GoogleAuth from "./google-auth";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useServerMutation } from "@/shared/hooks/use-server-mutation.hook";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  defaultSignUpValues,
  SignUpFormInput,
  signUpSchema,
} from "@/application/validation/auth.validation";
import { signUpAction } from "@/application/actions/auth.actions";
import { useRoutes } from "@/i18n/client-router";
import { Separator } from "@/components/ui/separator";

export function SignUpForm({ className, ...props }: ComponentProps<"form">) {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const routes = useRoutes();

  const form = useForm<SignUpFormInput>({
    resolver: yupResolver(signUpSchema) as Resolver<SignUpFormInput>,
    defaultValues: defaultSignUpValues,
    mode: "onBlur",
  });

  const {
    setError,
    formState: { isSubmitting },
  } = form;

  const mutation = useServerMutation({
    action: signUpAction,
    setError,
    onSuccess: () => {
      toast.success(t("messages.success.sign_up"));
      router.push(routes.signin());
    },
    onError: (error) => {
      toast.error(error.message || t("messages.error.sign_up"));
      console.error("Sign up error:", error);
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      if (mutation.isError) mutation.reset();
    });
    return () => subscription.unsubscribe();
  }, [form, mutation]);

  const onSubmit = async (values: SignUpFormInput) => {
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
      <Form.Set className="gap-2">
        {/* Header */}
        <div
          className="flex flex-col items-center gap-1 text-center my-2"
          style={{ animation: "authFadeIn 0.4s ease 0ms both" }}
        >
          <h1 className="text-2xl font-bold">{t("titles.sign_up")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("subtitles.sign_up")}
          </p>
        </div>

        {[
          <Form.Input
            key="full_name"
            name="full_name"
            label={t("labels.full_name")}
            placeholder={t("placeholders.full_name")}
            autoComplete="name"
            disabled={isLoading}
          />,
          <Form.Input
            key="email"
            name="email"
            type="email"
            label={t("labels.email")}
            placeholder={t("placeholders.email")}
            autoComplete="email"
            disabled={isLoading}
          />,
          <Form.Phone
            key="phone"
            name="phone"
            label={t("labels.phone")}
            placeholder={t("placeholders.phone")}
          />,
          <Form.Input
            key="password"
            name="password"
            type="password"
            label={t("labels.password")}
            placeholder={t("placeholders.password")}
            autoComplete="new-password"
            disabled={isLoading}
          />,
          <Form.Input
            key="password_confirmation"
            name="password_confirmation"
            type="password"
            label={t("labels.password_confirmation")}
            placeholder={t("placeholders.password_confirmation")}
            autoComplete="new-password"
            disabled={isLoading}
          />,
        ].map((field, i) => (
          <div
            key={i}
            style={{ animation: `authFadeIn 0.4s ease ${(i + 1) * 50}ms both` }}
          >
            {field}
          </div>
        ))}

        {/* Checkbox */}
        <div style={{ animation: "authFadeIn 0.4s ease 320ms both" }}>
          <div className="flex justify-start gap-2 p-2">
            <Form.Checkbox
              name="type_register"
              label={
                <span className="font-normal text-sm">
                  {t("labels.type_register")}
                </span>
              }
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ animation: "authFadeIn 0.4s ease 360ms both" }}>
          <Button type="submit" disabled={isLoading} className="w-full my-4">
            {isLoading && <Spinner data-icon="inline-start" className="mr-2" />}
            {t("actions.sign_up")}
          </Button>
        </div>
        <Separator />
        {/* Google + link */}
        <div style={{ animation: "authFadeIn 0.4s ease 400ms both" }}>
          <Field className="py-4">
            <GoogleAuth disabled={isLoading} />
            <FieldDescription className="text-center">
              <Link
                href={routes.signin()}
                className="ml-1 text-sm font-medium text-primary underline-offset-0"
              >
                {t("actions.sign_in")}
              </Link>
            </FieldDescription>
          </Field>
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
