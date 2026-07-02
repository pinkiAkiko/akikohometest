"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "fade" | "soft";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms for stagger effects */
  delay?: number;
  /** Animation variant */
  variant?: RevealVariant;
}

const variantStyles: Record<RevealVariant, { hidden: string; visible: string }> = {
  up: {
    hidden: "opacity-0 translate-y-4 sm:translate-y-5",
    visible: "opacity-100 translate-y-0",
  },
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  soft: {
    hidden: "opacity-0 translate-y-2",
    visible: "opacity-100 translate-y-0",
  },
};

const ScrollReveal = ({ children, className, delay = 0, variant = "up" }: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal(0.08);
  const styles = variantStyles[variant];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? styles.visible : styles.hidden,
        className
      )}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
