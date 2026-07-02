"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { getAllProducts, StoreProduct } from "@/lib/medusa-api";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    getAllProducts(100).then((all) => {
      setProducts(all.filter((p) => wishlist.includes(p.slug)));
      setLoading(false);
    });
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">
              My Account
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground">Saved Items</h1>
          </div>
          <Link
            href="/account"
            className="font-sans text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Account
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-secondary mb-3" />
                <div className="h-3 bg-secondary rounded mb-2 w-2/3" />
                <div className="h-3 bg-secondary rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-foreground mb-3">No saved items yet</p>
            <p className="font-sans text-sm text-muted-foreground mb-8">
              Tap the heart icon on any product to save it here.
            </p>
            <Link
              href="/collections/all"
              className="inline-block font-sans text-xs tracking-luxury uppercase border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors"
            >
              Shop All
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                image={p.thumbnail}
                name={p.name}
                material={p.material}
                price={p.price}
                originalPrice={p.originalPrice}
                discountPct={p.discountPct || undefined}
                badge={p.badge}
                slug={p.slug}
                variants={p.variants}
                options={p.options}
              />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
