"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ProductBreadcrumb from "@/components/ProductBreadcrumb";
import ImageGallery from "@/components/ImageGallery";
import ColorSwatch from "@/components/ColorSwatch";
import SizeSelector from "@/components/SizeSelector";
import QuantitySelector from "@/components/QuantitySelector";
import ProductAccordion from "@/components/ProductAccordion";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import ScrollReveal from "@/components/ScrollReveal";
import BackToTop from "@/components/BackToTop";
import { getProductByHandle, getAllProducts, getStoreSetting, StoreProduct } from "@/lib/medusa-api";
import ProductReviews from "@/components/ProductReviews";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { ShoppingBag, Heart } from "lucide-react";
import Spinner from "@/components/Spinner";

const categoryTitles: Record<string, string> = {
  towels: "Towels",
  bathmats: "Bathmats",
  comforters: "Comforters",
  bamboo: "Bamboo Collection",
  cleaning: "Cleaning Towels",
  kids: "Kids Collection",
};

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [product, setProduct] = useState<StoreProduct | null | undefined>(undefined);
  const [related, setRelated] = useState<StoreProduct[]>([]);
  const [shippingPolicy, setShippingPolicy] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
    setProduct(undefined);
    getProductByHandle(slug).then(setProduct);
    getAllProducts(8).then((all) =>
      setRelated(all.filter((p) => p.handle !== slug).slice(0, 4))
    );
    getStoreSetting("shipping_policy").then((val) => {
      if (val) setShippingPolicy(val.split("|").map((s) => s.trim()).filter(Boolean));
    });
  }, [slug]);

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(slug);
  const { addToCart, setDrawerOpen } = useCart();

  useEffect(() => {
    if (product) {
      const init: Record<string, string> = {};
      product.options.forEach((opt) => { init[opt.id] = opt.values[0]?.value ?? ""; });
      setSelected(init);
      setQuantity(1);
    }
  }, [product]);

  // Loading
  if (product === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="aspect-square bg-secondary animate-pulse" />
            <div className="space-y-4 lg:py-4">
              <div className="h-4 bg-secondary animate-pulse w-1/3" />
              <div className="h-8 bg-secondary animate-pulse w-2/3" />
              <div className="h-6 bg-secondary animate-pulse w-1/4" />
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // Not found
  if (product === null) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-serif text-2xl text-foreground mb-4">Product not found</h1>
          <Link
            href="/"
            className="font-sans text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Return to Home
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const catTitle = categoryTitles[product.category] || product.category;

  const exactVariantMatch = product.variants.find((v) =>
    product.options.every((opt) => v.optionValues[opt.id] === selected[opt.id])
  );
  const isAvailable = Boolean(exactVariantMatch && exactVariantMatch.priceNum > 0);
  const currentPrice = isAvailable ? exactVariantMatch!.price : "Unavailable";
  const currentOriginalPrice = isAvailable ? exactVariantMatch!.originalPrice : undefined;
  const discountPct = isAvailable ? (exactVariantMatch!.discountPct ?? 0) : (product.discountPct ?? 0);

  // Value of the image option (drives gallery filtering)
  const imageOptionValue = product.imageOptionId ? selected[product.imageOptionId] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 lg:pb-28">
        <ProductBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: catTitle, href: `/collections/${product.category}` },
            { label: product.name },
          ]}
        />

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <ImageGallery
            images={product.images}
            alt={product.name}
            optionImages={product.optionImages}
            selectedOptionValue={imageOptionValue}
            variantImages={exactVariantMatch?.id ? product.variantImages[exactVariantMatch.id] : undefined}
            variantId={exactVariantMatch?.id}
            aspectRatio={(product.metadata?.image_aspect_ratio as string) ?? "4/5"}
            focalX={(product.metadata?.image_focal_x as number) ?? 0.5}
            focalY={(product.metadata?.image_focal_y as number) ?? 0.5}
            objectFit={(product.metadata?.image_object_fit as "cover" | "contain") ?? "cover"}
          />

          {/* Product info */}
          <div className="lg:py-4">
            {product.badge && (
              <span className="inline-block bg-accent text-accent-foreground text-[10px] font-sans tracking-luxury uppercase px-2.5 py-1 mb-4">
                {product.badge}
              </span>
            )}

            <p className="font-sans text-[11px] tracking-luxury uppercase text-muted-foreground mb-2">
              {product.material}
            </p>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className={`font-sans text-xl ${!isAvailable ? 'text-muted-foreground' : 'text-foreground'}`}>{currentPrice}</span>
              {isAvailable && currentOriginalPrice && (
                <span className="font-sans text-sm text-muted-foreground line-through">
                  {currentOriginalPrice}
                </span>
              )}
              {isAvailable && discountPct > 0 && (
                <span className="font-sans text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                  {discountPct}% off
                </span>
              )}
            </div>

            <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8 text-justify">
              {product.description}
            </p>

            <div className="space-y-6 mb-8">
              {product.options.map((opt) => {
                const hasSwatch = opt.values.some((v) => v.hex);
                return hasSwatch ? (
                  <ColorSwatch
                    key={opt.id}
                    option={opt}
                    selected={selected[opt.id] ?? ""}
                    onChange={(val) => setSelected((prev) => ({ ...prev, [opt.id]: val }))}
                  />
                ) : (
                  <SizeSelector
                    key={opt.id}
                    option={opt}
                    selected={selected[opt.id] ?? ""}
                    onChange={(val) => setSelected((prev) => ({ ...prev, [opt.id]: val }))}
                  />
                );
              })}
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={async () => {
                  if (!exactVariantMatch || !isAvailable) return;
                  setIsAdding(true);
                  try {
                    await addToCart(exactVariantMatch.id, quantity);
                    const selectionSummary = product.options
                      .map((opt) => selected[opt.id])
                      .filter(Boolean)
                      .join(" · ");
                    toast.success("Added to bag", {
                      description: `${product.name}${selectionSummary ? ` · ${selectionSummary}` : ""}`,
                    });
                    setDrawerOpen(true);
                  } catch {
                    toast.error("Could not add to bag. Please try again.");
                  } finally {
                    setIsAdding(false);
                  }
                }}
                disabled={!isAvailable || isAdding}
                className={`flex-1 flex items-center justify-center gap-2.5 py-4 font-sans text-xs tracking-luxury uppercase transition-colors ${
                  isAvailable 
                    ? "bg-foreground text-background hover:bg-foreground/90 disabled:opacity-70" 
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isAdding ? (
                  <span className="flex items-center gap-2"><Spinner /> Adding...</span>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    {isAvailable ? "Add to Bag" : "Unavailable"}
                  </>
                )}
              </button>
              <button
                className={`w-14 border flex items-center justify-center transition-colors ${wishlisted ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-border hover:bg-secondary"}`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => toggleWishlist(slug)}
              >
                <Heart size={18} className={wishlisted ? "fill-red-500 text-red-500" : "text-foreground"} />
              </button>
            </div>

            {/* Accordion */}
            <ProductAccordion
              details={product.details}
              careInstructions={product.careInstructions}
              shippingPolicy={shippingPolicy}
            />
          </div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20 lg:mt-28">
            <ScrollReveal variant="soft">
              <SectionHeading title="You May Also Like" />
            </ScrollReveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ScrollReveal key={p.slug} delay={i * 80}>
                  <ProductCard
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
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
      <BackToTop />
    </div>
  );
}
