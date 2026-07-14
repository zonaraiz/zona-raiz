"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRoutes } from "@/i18n/client-router";
import { IconHome, IconUsers, IconMessageCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";

const steps = [
  { icon: IconHome, key: "publish" },
  { icon: IconUsers, key: "reach" },
  { icon: IconMessageCircle, key: "contact" },
] as const;

export function LandingPublishCta() {
  const { t } = useTranslation("landing");
  const routes = useRoutes();
  const { ref, inView } = useInView();

  return (
    <section className="py-16 bg-primary/5" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {t("publish_cta.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {t("publish_cta.title")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10">
            {t("publish_cta.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {steps.map(({ icon: Icon, key }, i) => (
            <div
              key={key}
              className="bg-card border rounded-2xl p-6 text-left"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
              }}
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold mb-1">
                {t(`publish_cta.steps.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`publish_cta.steps.${key}.description`)}
              </p>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="rounded-full">
          <Link href={routes.signin()}>{t("nav.publish_free")}</Link>
        </Button>
      </div>
    </section>
  );
}
