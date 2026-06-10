"use client";

import { ComponentProps, useEffect, useRef, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { flatten, cn } from "@/lib/utils";
import { WizardRef, WizardTab, WizardTabs } from "@/components/ui/wizard-form";
import { PropertyCeoForm } from "./property-ceo-form";
import { PropertyLocationForm } from "./property-location-form";
import { PropertyFeaturesForm } from "./property-features-form";
import { defaultPropertyValues, PropertyInput, propertySchema } from "@/application/validation/property.schema";
import { createPropertyAction, updatePropertyAction } from "@/application/actions/property.action";
import { useRouter } from "next/navigation";
import { useRoutes } from "@/i18n/client-router";
import { UploadMultipleInput } from "@/features/image-manager/upload-multiple-input";

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
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    isUpdateMode ? id ?? null : null,
  );

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

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  async function submitProperty(values: PropertyInput) {
    wizardRef.current?.setBusy(true)
    try {
      const formData = new FormData();
      const data = flatten(values, "", formData);

      if (values.amenities) {
        data.set("amenities", JSON.stringify(values.amenities));
      }

      const result =
        isUpdateMode && id
          ? await updatePropertyAction(id, data)
          : await createPropertyAction(realEstateId, data);

      if (!result.success) {
        const errors =
          result.errors ?? (result.error ? [result.error] : []);

        errors.forEach((error) => {
          if (error.field) {
            setError(error.field as keyof PropertyInput, {
              type: "server",
              message: error.message,
            });
          }
        });

        toast.error(errors[0]?.message || t("messages.error"))
        return null
      }

      toast.success(t(`messages.${isUpdateMode ? "updated" : "created"}`))

      if (isUpdateMode) {
        wizardRef.current?.complete()
        router.push(routes.dashboard())
        return "updated"
      }

      const newPropertyId =
        "data" in result &&
        result.data &&
        typeof result.data === "object" &&
        "id" in result.data &&
        typeof result.data.id === "string"
          ? result.data.id
          : null

      if (!newPropertyId) {
        toast.error(t("messages.error"))
        return null
      }

      setCreatedPropertyId(newPropertyId)
      return newPropertyId
    } catch (error) {
      console.error("property error:", error)
      toast.error(t("messages.error"))
      return null
    } finally {
      wizardRef.current?.setBusy(false)
    }
  }

  async function handleValidSubmit(values: PropertyInput) {
    if (isUpdateMode) {
      await submitProperty(values)
      return
    }

    if (!createdPropertyId) {
      const propertyId = await submitProperty(values)
      if (!propertyId || propertyId === "updated") return
      wizardRef.current?.next()
      return
    }

    reset()
    wizardRef.current?.complete()
    router.push(routes.dashboard())
  }

  const onSubmit = async () => {
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
        submitText={
          isUpdateMode ? t("common:actions.save") : "Finalizar"
        }
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
          nextText={isUpdateMode ? undefined : t("actions.add_images")}
          onNext={
            isUpdateMode
              ? undefined
              : async () => {
                  const propertyId = await submitProperty(form.getValues())
                  return Boolean(propertyId)
                }
          }
        >
          <PropertyFeaturesForm />
        </WizardTab>

        {!isUpdateMode && (
          <WizardTab
            id="images"
            title={t("actions.add_images")}
            canSubmit={() => Boolean(createdPropertyId)}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{t("actions.add_images")}</h3>
                <p className="text-sm text-muted-foreground">
                  Sube las imágenes del inmueble antes de finalizar.
                </p>
              </div>

              {createdPropertyId ? (
                <UploadMultipleInput propertyId={createdPropertyId} />
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  Primero guardamos la propiedad para habilitar la subida de imágenes.
                </div>
              )}
            </div>
          </WizardTab>
        )}
      </WizardTabs>
    </Form>
  );
}
