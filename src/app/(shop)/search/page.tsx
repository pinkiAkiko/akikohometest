"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import BackToTop from "@/components/BackToTop";
import { getAllProducts, StoreProduct } from "@/lib/medusa-api";
import { Search as SearchIcon } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllProducts(200).then(setAllProducts).catch(() => {});
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);
    const url = value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search";
    window.history.replaceState(null, "", url);
  };

  const q = query.toLowerCase().trim();
  const results = q
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex items-center gap-3 border-b-2 border-foreground pb-3">
          <SearchIcon size={22} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search towels, bedding, collections..."
            className="flex-1 bg-transparent font-sans text-lg text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {q ? (
        <>
          <p className="font-sans text-sm text-muted-foreground mb-8">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.map((p) => (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  image={p.thumbnail}
                  name={p.name}
                  material={p.material}
                  price={p.price}
                  originalPrice={p.originalPrice}
                  discountPct={p.discountPct || undefined}
                  badge={p.badge}
                  variants={p.variants}
                  options={p.options}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-foreground mb-2">No results found</p>
              <p className="font-sans text-sm text-muted-foreground">Try searching for &ldquo;towels&rdquo;, &ldquo;bamboo&rdquo;, or &ldquo;bedding&rdquo;</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="font-sans text-sm text-muted-foreground">Start typing to search our collection</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <Suspense fallback={<div className="py-20 text-center font-sans text-sm text-muted-foreground">Loading...</div>}>
        <SearchContent />
      </Suspense>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
