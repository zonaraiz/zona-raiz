"use client";

import {
  useState,
  ReactNode,
  ReactElement,
  Children,
  isValidElement,
  cloneElement,
  forwardRef,
  useImperativeHandle,
} from "react";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import i18next from "i18next";

export interface WizardRef {
  complete: () => void;
  reset: () => void;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
  setBusy: (value: boolean) => void;
}

interface WizardTabProps {
  id: string;
  title: string;
  icon?: React.ElementType;
  nextText?: string;
  canNext?: () => boolean | Promise<boolean>;
  onNext?: () => boolean | Promise<boolean>;
  canBack?: () => boolean | Promise<boolean>;
  canSubmit?: () => boolean | Promise<boolean>;
  children: ReactNode;
}

export function WizardTab({ children }: WizardTabProps) {
  return <>{children}</>;
}

interface WizardTabsProps {
  children: ReactNode;
  submitText?: string;
  onSubmit?: () => void;
}

export const WizardTabs = forwardRef<WizardRef, WizardTabsProps>(
  ({ children, submitText = i18next.t("common:actions.save"), onSubmit }, ref) => {
    const tabs = Children.toArray(children).filter(
      isValidElement,
    ) as ReactElement<WizardTabProps>[];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [busy, setBusy] = useState(false);

    const total = tabs.length;
    const isLast = currentIndex === total - 1;
    const currentTab = tabs[currentIndex];

    const complete = () => {
      setSubmitted(true);
    };

    const reset = () => {
      setSubmitted(false);
      setCurrentIndex(0);
    };

    const next = () =>
      !isLast && setCurrentIndex((i) => Math.min(i + 1, total - 1));
    const back = () =>
      currentIndex > 0 && setCurrentIndex((i) => Math.max(i - 1, 0));
    const goTo = (index: number) => !busy && setCurrentIndex(index);

    useImperativeHandle(ref, () => ({
      complete,
      reset,
      next,
      back,
      goTo,
      setBusy,
    }));

    const canBack = currentTab.props.canBack?.() ?? true;

    const handleNext = async () => {
      if (busy) return;

      if (currentTab.props.canNext) {
        const ok = await currentTab.props.canNext();
        if (!ok) return;
      }

      if (currentTab.props.onNext) {
        const ok = await currentTab.props.onNext();
        if (!ok) return;
      }

      next();
    };

    const handleSubmitClick = async () => {
      if (busy) return;

      if (currentTab.props.canSubmit) {
        const ok = await currentTab.props.canSubmit();
        if (!ok) return;
      }
      await onSubmit?.();
    };

    if (submitted) {
      return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">{i18next.t("common:labels.created_at")}</h2>
          <Button
            variant="outline"
            className="mt-2"
            onClick={reset}
            type="button"
          >
            {i18next.t("common:actions.reset")}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8">
        {/* Tabs Indicator (idéntico al tuyo) */}
        <div className="flex items-center justify-center gap-3">
          {tabs.map((tab, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const TabIcon = tab.props.icon;

            return (
              <div
                key={tab.props.id}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => goTo(index)}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary bg-background text-primary",
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted-foreground/30 bg-background text-muted-foreground/50",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : TabIcon ? (
                      <TabIcon className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isCurrent ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {tab.props.title}
                  </span>
                </div>

                {index < tabs.length - 1 && (
                  <div
                    className={cn(
                      "mb-5 h-0.5 w-16 rounded-full transition-colors duration-300",
                      currentIndex > index
                        ? "bg-primary"
                        : "bg-muted-foreground/20",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="h-auto">{cloneElement(currentTab)}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-5">
          <Button
            variant="ghost"
            onClick={back}
            disabled={busy || !canBack || currentIndex === 0}
            className="gap-1.5"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            {i18next.t("common:actions.previous")}
          </Button>

          {!isLast ? (
            <Button
              onClick={handleNext}
              disabled={busy}
              className="gap-1.5"
              type="button"
            >
              {currentTab.props.nextText ?? i18next.t("common:actions.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmitClick}
              disabled={busy}
              className="gap-1.5"
            >
              {busy ? "Guardando..." : submitText}
            </Button>
          )}
        </div>
      </div>
    );
  },
);
WizardTabs.displayName = "WizardTabs"; // ← agrega esta línea
