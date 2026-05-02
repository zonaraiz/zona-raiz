"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { sendContactEmailAction } from "@/application/actions/contact.actions";
import { contactSchema, ContactFormValues, defaultContactValues } from "@/application/validation/contact.schema";

export function ContactForm() {
  const { t } = useTranslation("contact");

  const form = useForm<ContactFormValues>({
    resolver: yupResolver(contactSchema) as any,
    defaultValues: defaultContactValues,
    mode: "onBlur",
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      await sendContactEmailAction(formData);
      toast.success(t("form_success"));
      form.reset(defaultContactValues);
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(t("form_error"));
    }
  };

  const isLoading = isSubmitting;

  return (
    <Card>
      <CardContent className="pt-6">
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <Form.Input
              name="name"
              label={t("form_name")}
              placeholder={t("form_name_placeholder")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Input
                name="email"
                type="email"
                label={t("form_email")}
                placeholder={t("form_email_placeholder")}
              />

              <Form.Phone
                name="phone"
                label={t("form_phone")}
                placeholder={t("form_phone_placeholder")}
              />
            </div>

            <Form.Textarea
              name="message"
              label={t("form_message")}
              placeholder={t("form_message_placeholder")}
              rows={4}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Spinner data-icon="inline-start" className="mr-2 h-4 w-4" />}
              {t("form_submit")}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}