"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { StoreBanner } from "@/lib/medusa-api";

// Keyboard animation class cycles through the 3 CSS keyframes
const motionClasses = ["animate-hero-kb-1", "animate-hero-kb-2", "animate-hero-kb-3"];

interface Props {
  banners?: StoreBanner[];
}

const HeroBanner = ({ banners }: Props) => {
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
    return <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] bg-secondary" />;
  }

  const slides = banners.map((b, i) => ({
    id: b.id,
    image_url: b.image_url,
    alt: b.title ?? "",
    eyebrow: b.eyebrow ?? "",
    title: b.title ?? "",
    subtitle: b.subtitle ?? "",
    cta_text: b.cta_text ?? "",
    cta_url: b.cta_url ?? "",
    position: b.position,
    motionClass: motionClasses[i % 3],
  }));

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-full">
              <div className="absolute inset-0 overflow-hidden bg-secondary">
                {slide.image_url && (
                  <Image
                    src={slide.image_url}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      animation:
                        i === activeIndex
                          ? `${slide.motionClass.replace("animate-", "")} 6s cubic-bezier(0.4, 0, 0.2, 1) forwards`
                          : "none",
                      willChange: i === activeIndex ? "transform" : "auto",
                    }}
                  />
                )}
              </div>
              {(slide.eyebrow || slide.title || slide.subtitle || slide.cta_text) && (
                <div className="absolute inset-0 bg-foreground/20" />
              )}
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                {slide.eyebrow && (
                  <p className="font-sans text-xs tracking-wide-luxury uppercase text-primary-foreground/80 mb-4">
                    {slide.eyebrow}
                  </p>
                )}
                {slide.title && (
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-medium text-primary-foreground leading-tight max-w-3xl">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="font-sans text-sm sm:text-base text-primary-foreground/80 mt-4 max-w-lg">
                    {slide.subtitle}
                  </p>
                )}
                {slide.cta_text && slide.cta_url && (
                  <a
                    href={slide.cta_url}
                    className="mt-8 inline-block bg-primary-foreground text-primary px-8 py-3.5 text-sm font-sans tracking-luxury uppercase hover:bg-primary-foreground/90 transition-all duration-300"
                  >
                    {slide.cta_text}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-primary-foreground/15 hover:bg-primary-foreground/30 text-primary-foreground backdrop-blur-sm transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-primary-foreground/15 hover:bg-primary-foreground/30 text-primary-foreground backdrop-blur-sm transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? "bg-primary-foreground w-6" : "bg-primary-foreground/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
