"use client";

import { useState, useMemo } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import FilterSidebar, { MobileFilterTrigger } from "@/components/FilterSidebar";
import ScrollReveal from "@/components/ScrollReveal";
import BackToTop from "@/components/BackToTop";
import { StoreProduct } from "@/lib/medusa-api";
import { ChevronDown } from "lucide-react";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

interface Props {
  category: string;
  initialProducts: StoreProduct[];
  categoryInfo: { title: string; description: string };
}

export default function CollectionContent({ initialProducts, categoryInfo }: Props) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const allMaterials = useMemo(
    () => Array.from(new Set(initialProducts.map((p) => p.material))),
    [initialProducts]
  );
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    initialProducts.forEach((p) => {
      // Find the option that carries swatch hex values (the visual/color option)
      const swatchOpt = p.options.find((opt) => opt.values.some((v) => v.hex));
      swatchOpt?.values.forEach((v) => { if (v.hex) map.set(v.value, v.hex); });
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (selectedMaterials.length > 0) {
      result = result.filter((p) => selectedMaterials.includes(p.material));
    }
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        const swatchOpt = p.options.find((opt) => opt.values.some((v) => v.hex));
        return swatchOpt?.values.some((v) => selectedColors.includes(v.value)) ?? false;
      });
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.priceNum - b.priceNum);
        break;
      case "price-desc":
        result.sort((a, b) => b.priceNum - a.priceNum);
        break;
      case "newest":
        result.sort((a, b) => (a.badge === "New" ? -1 : b.badge === "New" ? 1 : 0));
        break;
    }

    return result;
  }, [initialProducts, selectedMaterials, selectedColors, sort]);

  const { title, description } = categoryInfo;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      {/* Collection header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <ProductBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: title },
          ]}
        />
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground mb-3">
          {title}
        </h1>
        <p className="font-sans text-sm text-muted-foreground max-w-xl">{description}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-20 lg:pb-28">
        {/* Toolbar */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <MobileFilterTrigger
              onClick={() => setMobileFiltersOpen(true)}
              activeCount={selectedMaterials.length + selectedColors.length}
            />
            {/* count inline on desktop, hidden on mobile */}
            <span className="hidden sm:block font-sans text-xs text-muted-foreground">
              {`${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}`}
            </span>

            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-transparent font-sans text-xs tracking-luxury uppercase text-foreground border border-border pl-4 pr-10 py-2.5 cursor-pointer hover:bg-secondary transition-colors focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>
          {/* count below toolbar on mobile only */}
          <p className="sm:hidden font-sans text-xs text-muted-foreground mt-2">
            {`${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}`}
          </p>
        </div>

        {/* Content: sidebar + grid */}
        <div className="flex gap-0 lg:gap-0">
          <FilterSidebar
            materials={allMaterials}
            selectedMaterials={selectedMaterials}
            onMaterialChange={setSelectedMaterials}
            colors={allColors}
            selectedColors={selectedColors}
            onColorChange={setSelectedColors}
            open={mobileFiltersOpen}
            onOpenChange={setMobileFiltersOpen}
          />

          <div className="flex-1 lg:pl-8">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-sans text-sm text-muted-foreground mb-4">
                  {initialProducts.length === 0
                    ? "No products in this category yet."
                    : "No products match your filters."}
                </p>
                {initialProducts.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedMaterials([]);
                      setSelectedColors([]);
                    }}
                    className="font-sans text-sm text-foreground underline hover:text-muted-foreground transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product, i) => (
                  <ScrollReveal key={product.slug} delay={i * 60}>
                    <ProductCard
                      slug={product.slug}
                      image={product.thumbnail}
                      name={product.name}
                      material={product.material}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      discountPct={product.discountPct || undefined}
                      badge={product.badge}
                      variants={product.variants}
                      options={product.options}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
      <BackToTop />
    </div>
  );
}
