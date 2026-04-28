"use client";

import { ComponentProps, useEffect, useRef } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { useServerMutation } from "@/shared/hooks/use-server-mutation.hook";
import { flatten, cn, generateSlug } from "@/lib/utils";
import { WizardRef, WizardTab, WizardTabs } from "@/components/ui/wizard-form";
import { PropertyCeoForm } from "./property-ceo-form";
import { PropertyLocationForm } from "./property-location-form";
import { PropertyFeaturesForm } from "./property-features-form";
import { defaultPropertyValues, PropertyInput, propertySchema } from "@/application/validation/property.schema";
import { createPropertyAction, updatePropertyAction } from "@/application/actions/property.action";
import { useRouter } from "next/navigation";
import { useRoutes } from "@/i18n/client-router";

interface PropertyFormProps extends ComponentProps<"form"> {
  realEstateId: string;
  defaultValues?: PropertyInput;
  id?: string;
}

export function PropertyForm({
  className,
  realEstateId,
  defaultValues,
  id,
}: PropertyFormProps) {
  const router = useRouter()
  const routes = useRoutes()

  const { t } = useTranslation('properties');
  const isUpdateMode = Boolean(id);

  const stepFields = {
    ceo: ["title", "description", "property_type"],
    location: ["street", "city", "state", "postal_code", "country", "latitude", "longitude"],
    features: [
      "bedrooms",
      "bathrooms",
      "built_area",
      "lot_area",
      "floors",
      "year_built",
      "parking_spots",
      "amenities"
    ],
  } as const

  const form = useForm<PropertyInput>({
    resolver: yupResolver(propertySchema) as Resolver<PropertyInput>,
    defaultValues: defaultValues || defaultPropertyValues,
    mode: "onBlur",
  });

  const wizardRef = useRef<WizardRef>(null)

  const {
    trigger,
    reset,
    setError
  } = form;

  const mutation = useServerMutation({
    action: (formData: FormData) => {
      if (isUpdateMode && id) {
        return updatePropertyAction(id, formData);
      }
      return createPropertyAction(realEstateId, formData);
    },
    setError,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t(`messages.${isUpdateMode ? "updated" : "created"}`))
        if (!isUpdateMode) reset()
        wizardRef.current?.complete()
        router.push(routes.dashboard())
      }
    },
    onError: (error) => {
      console.error("property error:", error)
      toast.error(t("messages.error"))
    },
  })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (mutation.isError) mutation.reset()
    })
    return () => subscription.unsubscribe()
  }, [form, mutation])

  async function handleValidSubmit(values: PropertyInput) {
    wizardRef.current?.setBusy(true)
    try {

      const formData = new FormData();
      const data = flatten(values, "", formData);

      // Asegurar que amenities se envíe como JSON string
      if (values.amenities) {
        data.set("amenities", JSON.stringify(values.amenities));
      }

      mutation.action(data);
    } finally {
      wizardRef.current?.setBusy(false)
    }
  }

  const onSubmit = async (values: PropertyInput) => {
    // This is handled by the WizardTabs onSubmit
  }

  return (
    <Form
      form={form}
      className={cn("py-6 px-6 mx-auto space-y-8", className)}
      onSubmit={onSubmit}
    >
      <WizardTabs
        ref={wizardRef}
        onSubmit={form.handleSubmit(v => handleValidSubmit(form.getValues()))}
      >
        <WizardTab
          id="ceo"
          title={t("sections.basic_info")}
          canNext={() => trigger(stepFields.ceo)}
        >
          <PropertyCeoForm />
        </WizardTab>

        <WizardTab
          id="location"
          title={t("sections.location")}
          canNext={() => trigger(stepFields.location)}
        >
          <PropertyLocationForm />
        </WizardTab>

        <WizardTab
          id="features"
          title={t("sections.features")}
          canNext={() => trigger(stepFields.features)}
        >
          <PropertyFeaturesForm />
        </WizardTab>
      </WizardTabs>
    </Form>
  );
}
