"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Grid2x2,
  ImageIcon,
  Maximize2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function PropertyCarouselGallery({
  images,
}: {
  images: string[];
}) {
  const { t } = useTranslation("listings");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleThumbClick = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const handlePrevious = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const handleNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  useEffect(() => {
    if (!isFullscreenOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") handlePrevious();
      if (event.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrevious, isFullscreenOpen]);

  if (!images.length) {
    return (
      <div className="rounded-[2rem] border border-border/60 bg-card/60 p-8 md:p-12">
        <div className="flex aspect-[16/9] items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-muted/20">
          <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
            <ImageIcon className="size-10" />
            <p className="text-sm font-medium">
              {t("detail.gallery.empty")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-border/60 bg-card/50 p-4 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.9)] md:p-6">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image}>
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/40">
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 md:p-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                    <Grid2x2 className="size-3.5" />
                    {current}/{images.length}
                  </div>
                  <Button
                    className="h-10 rounded-full border border-white/10 bg-black/45 px-4 text-white backdrop-blur-md hover:bg-black/60"
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => setIsFullscreenOpen(true)}
                  >
                    <Maximize2 className="mr-2 size-4" />
                    {t("detail.gallery.fullscreen")}
                  </Button>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-5 pt-16">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
                    <Expand className="size-3.5" />
                    {t("detail.gallery.open_image", { index: index + 1 })}
                  </div>
                </div>

                <div className="absolute inset-y-0 left-3 z-10 hidden items-center md:flex">
                  <CarouselPrevious className="static translate-y-0 border-white/15 bg-black/45 text-white hover:bg-black/70" />
                </div>
                <div className="absolute inset-y-0 right-3 z-10 hidden items-center md:flex">
                  <CarouselNext className="static translate-y-0 border-white/15 bg-black/45 text-white hover:bg-black/70" />
                </div>

                <div className="relative aspect-[16/10] w-full md:aspect-[16/9]">
                  <Image
                    alt="property-image"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02] cursor-zoom-in"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 1200px"
                    src={image}
                    onClick={() => setIsFullscreenOpen(true)}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Carousel className="mx-auto mt-5 max-w-5xl">
        <CarouselContent className="-ml-2">
          {images.map((image, index) => (
            <CarouselItem
              className={cn(
                "basis-1/2 pl-2 sm:basis-1/4 lg:basis-1/5 cursor-pointer transition-all",
                current === index + 1 ? "opacity-100" : "opacity-70 hover:opacity-100"
              )}
              key={image}
              onClick={() => handleThumbClick(index)}
            >
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted/20",
                  current === index + 1
                    ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary))]"
                    : "border-border/60"
                )}
              >
                <Image
                  alt="property-thumb"
                  fill
                  className="object-cover"
                  src={image}
                />
                <div
                  className={cn(
                    "absolute inset-0 transition-colors",
                    current === index + 1 ? "bg-black/10" : "bg-black/30"
                  )}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="h-[100dvh] max-h-[100dvh] w-[100vw] max-w-[100vw] border-0 bg-black/95 p-0 sm:rounded-none">
          <DialogTitle className="sr-only">
            {t("detail.gallery.title")}
          </DialogTitle>

          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
              <div className="text-sm font-medium text-white">
                {t("detail.gallery.title")}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                {current}/{images.length}
              </div>
            </div>

            <div className="relative flex-1 px-3 py-3 md:px-6 md:py-5">
              <div className="absolute inset-y-0 left-2 z-10 flex items-center md:left-6">
                <Button
                  className="h-11 w-11 rounded-full border border-white/10 bg-black/55 text-white hover:bg-black/80"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="size-5" />
                </Button>
              </div>

              <div className="absolute inset-y-0 right-2 z-10 flex items-center md:right-6">
                <Button
                  className="h-11 w-11 rounded-full border border-white/10 bg-black/55 text-white hover:bg-black/80"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={handleNext}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>

              <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-black">
                {images[current - 1] ? (
                  <Image
                    alt="property-image-fullscreen"
                    fill
                    className="object-contain"
                    sizes="100vw"
                    src={images[current - 1]}
                  />
                ) : null}
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4 md:px-6">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={cn(
                      "relative h-20 min-w-28 overflow-hidden rounded-xl border transition-all",
                      current === index + 1
                        ? "border-primary"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    )}
                    type="button"
                    onClick={() => handleThumbClick(index)}
                  >
                    <Image
                      alt={`property-thumb-fullscreen-${index + 1}`}
                      fill
                      className="object-cover"
                      src={image}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
