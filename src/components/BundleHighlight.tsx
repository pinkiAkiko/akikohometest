"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { getProductsByTag, StoreProduct } from "@/lib/medusa-api";

interface BundleItem {
  id: string;
  slug: string;
  image: string | null;
  name: string;
  items: string;
  price: string;
  originalPrice?: string;
}

function mapBundleProduct(p: StoreProduct): BundleItem {
  return {
    id: p.id,
    slug: `/product/${p.slug}`,
    image: p.thumbnail ?? null,
    name: p.name,
    items: (p.metadata?.bundle_items as string | undefined) ?? "",
    price: p.price,
    originalPrice: p.variants[0]?.originalPrice,
  };
}

const BundleHighlight = ({ viewAllHref }: { viewAllHref?: string }) => {
  const [bundles, setBundles] = useState<BundleItem[]>([]);

  useEffect(() => {
    getProductsByTag("bundle", 3)
      .then((products) => {
        if (products.length > 0) {
          setBundles(products.map((p) => mapBundleProduct(p)));
        }
      })
      .catch(() => {});
  }, []);

  if (bundles.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 px-6 sm:px-8 lg:px-12 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="Curated Gift Sets"
          subtitle="Thoughtfully bundled for gifting or treating yourself — save more together"
        />
        {viewAllHref && (
          <div className="mt-0 mb-6 text-right">
            <a href={viewAllHref} className="font-sans text-sm tracking-luxury uppercase text-foreground border-b border-foreground pb-0.5 hover:text-muted-foreground hover:border-muted-foreground transition-colors duration-300">
              View All Gift Sets
            </a>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="group bg-background overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                {bundle.image && (
                  <Image
                    src={bundle.image}
                    alt={bundle.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                )}
                <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-sans tracking-luxury uppercase px-2.5 py-1">
                  Save More
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-sans text-sm font-medium text-foreground">{bundle.name}</h3>
                <p className="font-sans text-xs text-muted-foreground">{bundle.items}</p>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-medium text-foreground">{bundle.price}</span>
                  {bundle.originalPrice && (
                    <span className="font-sans text-xs text-muted-foreground line-through">{bundle.originalPrice}</span>
                  )}
                </div>
                <a
                  href={bundle.slug}
                  className="inline-block mt-2 font-sans text-xs tracking-luxury uppercase text-foreground border-b border-foreground pb-0.5 hover:text-muted-foreground hover:border-muted-foreground transition-colors duration-300"
                >
                  Shop Bundle
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BundleHighlight;
