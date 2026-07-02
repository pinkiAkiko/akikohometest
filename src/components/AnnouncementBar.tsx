"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getStoreSetting } from "@/lib/medusa-api";

const AnnouncementBar = () => {
  const [text, setText] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    getStoreSetting("announcement_bar_text").then((val) => {
      setText(
        val ?? `Free Shipping on Orders Above ₹${process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? "5000"} · Premium Quality, Always`
      );
    });
  }, []);

  if (!visible || text === null) return null;

  return (
    <div className="relative bg-secondary py-2.5 px-4 text-center">
      <p className="text-xs font-sans tracking-luxury uppercase text-muted-foreground pr-6">
        {text}
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
