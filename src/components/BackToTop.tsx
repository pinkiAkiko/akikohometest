"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-foreground/90 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <ChevronUp size={20} />
    </button>
  );
};

export default BackToTop;
