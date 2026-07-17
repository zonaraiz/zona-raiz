"use client";

import { useTranslation } from "react-i18next";
import {
  IconDiscount2,
  IconBolt,
  IconEye,
  IconHeadset,
} from "@tabler/icons-react";
import { useInView } from "@/hooks/use-in-view";

const items = [
  { icon: IconDiscount2, key: "free" },
  { icon: IconBolt, key: "fast" },
  { icon: IconEye, key: "visibility" },
  { icon: IconHeadset, key: "support" },
] as const;

export function LandingValueProps() {
  const { t } = useTranslation("landing");
  const { ref, inView } = useInView();

  return (
    <section className="py-12 border-t" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map(({ icon: Icon, key }, i) => (
          <div
            key={key}
            className="flex items-start gap-3"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
            }}
          >
            <span className="shrink-0 size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm">
                {t(`value_props.${key}.title`)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(`value_props.${key}.caption`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
