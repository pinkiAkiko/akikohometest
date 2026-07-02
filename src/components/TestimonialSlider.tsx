"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  product?: string;
  rating?: number;
}

interface Props {
  testimonials: Testimonial[];
}

const TestimonialCard = ({ quote, author, product, rating = 5 }: Testimonial) => {
  const initials = author
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex-[0_0_300px] sm:flex-[0_0_340px] min-h-[260px] min-w-0 bg-background border border-border rounded-sm p-7 flex flex-col gap-5 shadow-sm">
      {/* Quote */}
      <p className="font-sans text-sm text-foreground leading-relaxed flex-1">
        {quote}
      </p>

      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "fill-green-500 text-green-500" : "fill-muted text-muted-foreground/20"}
          />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <span className="font-sans text-xs font-semibold text-muted-foreground">
            {initials}
          </span>
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-foreground leading-tight">{author}</p>
          {product && (
            <p className="font-sans text-xs text-muted-foreground mt-0.5">{product}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TestimonialSlider = ({ testimonials }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    const interval = setInterval(() => emblaApi.scrollNext(), 2000);
    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 lg:py-28 bg-secondary/40">
      <div className="max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* Left: title + nav */}
          <div className="lg:w-64 shrink-0 flex flex-col justify-between">
            <div>
              <div className="font-serif text-7xl text-muted-foreground/25 leading-none mb-4 select-none">&ldquo;&ldquo;</div>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground leading-snug">
                What our customers are saying
              </h2>
            </div>

            {/* Arrows + line */}
            <div className="flex items-center gap-4 mt-10 lg:mt-0">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
                className="text-foreground hover:text-muted-foreground disabled:opacity-30 transition-colors"
                aria-label="Previous"
              >
                ←
              </button>
              <div className="flex-1 h-px bg-border" />
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
                className="text-foreground hover:text-muted-foreground disabled:opacity-30 transition-colors"
                aria-label="Next"
              >
                →
              </button>
            </div>
          </div>

          {/* Right: sliding cards */}
          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {testimonials.map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;
