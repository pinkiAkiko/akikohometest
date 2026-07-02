"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryTile from "./CategoryTile";

interface CategorySliderProps {
  tiles: { name: string; image: string | null; href: string }[];
}

const AUTO_INTERVAL = 2000;

const CategorySlider = ({ tiles }: CategorySliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = tiles.length;

  const scrollTo = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement | undefined;
    if (!card) return;
    container.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setCurrent(index);
  }, []);

  const prev = () => scrollTo((current - 1 + total) % total);
  const next = useCallback(() => scrollTo((current + 1) % total), [current, total, scrollTo]);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Prev */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden"
      >
        {tiles.map((cat) => (
          <div
            key={cat.name}
            className="shrink-0 w-[calc(33.333%-11px)] max-sm:w-[85%]"
          >
            <CategoryTile image={cat.image} name={cat.name} href={cat.href} />
          </div>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>

    </div>
  );
};

export default CategorySlider;
