"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

const WISHLIST_KEY = "akiko_wishlist";

interface WishlistContextType {
  wishlist: string[];
  count: number;
  isWishlisted: (slug: string) => boolean;
  toggleWishlist: (slug: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) setWishlist(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, count: wishlist.length, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
