"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function PropertyCarouselGallery({
  images,
}: {
  images: string[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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

  return (
    <div className="p-8 container">
      {/* Imagen principal */}
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image}>
              <div className="relative w-full aspect-video max-w-180 mx-auto">
                <Image
                  alt="property-image"
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={image}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Thumbnails */}
      <Carousel className="mt-4 max-w-xl mx-auto">
        <CarouselContent className="my-1 max-w-lg mx-auto">
          {images.map((image, index) => (
            <CarouselItem
              className={cn(
                "basis-1/4 cursor-pointer transition-opacity",
                current === index + 1 ? "opacity-100" : "opacity-50"
              )}
              key={image}
              onClick={() => handleThumbClick(index)}
            >
              <div className="relative w-full aspect-video">
                <Image
                  alt="property-thumb"
                  fill
                  className="rounded-xl object-cover"
                  src={image}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
