"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StoreBanner } from "@/lib/medusa-api";

interface Props {
  banners: StoreBanner[];
  fallback?: React.ReactNode;
}

const EditorialCarousel = ({ banners, fallback }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!banners || banners.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <section className="group/carousel relative w-full h-[220px] sm:h-[300px] lg:h-[420px] overflow-hidden">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {banners.map((banner, i) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-full">
              {/* Image */}
              <div className="absolute inset-0 bg-secondary">
                {banner.image_url && (
                  <Image
                    src={banner.image_url}
                    alt={banner.title ?? ""}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 to-transparent" />

              {/* Text — bottom right */}
              <div className="absolute bottom-0 right-0 z-10 px-8 sm:px-12 lg:px-20 pb-14 lg:pb-16 max-w-3xl text-right">
                {banner.eyebrow && (
                  <p className="font-sans text-xs tracking-widest uppercase text-primary-foreground/70 mb-3">
                    {banner.eyebrow}
                  </p>
                )}
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-primary-foreground leading-tight mb-4">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="font-sans text-sm sm:text-base text-primary-foreground/80 leading-relaxed mb-6 max-w-xl">
                    {banner.subtitle}
                  </p>
                )}
                {banner.cta_text && banner.cta_url && (
                  <Link
                    href={banner.cta_url}
                    className="inline-block bg-primary-foreground text-primary font-sans text-sm tracking-widest uppercase px-8 py-3.5 hover:bg-primary-foreground/90 transition-all duration-300"
                  >
                    {banner.cta_text}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-primary-foreground/15 hover:bg-primary-foreground/30 text-primary-foreground backdrop-blur-sm transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-primary-foreground/15 hover:bg-primary-foreground/30 text-primary-foreground backdrop-blur-sm transition-all duration-200 opacity-0 group-hover/carousel:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 right-8 sm:right-12 lg:right-20 z-20 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-0.5 transition-all duration-300 bg-primary-foreground/70 hover:bg-primary-foreground ${i === activeIndex ? "w-8 bg-primary-foreground" : "w-4"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default EditorialCarousel;
