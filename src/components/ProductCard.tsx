"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { StoreVariant, StoreOption } from "@/lib/medusa-api";
import QuickAddSheet from "@/components/QuickAddSheet";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  image: string | StaticImageData | null;
  name: string;
  material: string;
  price: string;
  originalPrice?: string;
  discountPct?: number;
  badge?: string;
  slug?: string;
  variants?: StoreVariant[];
  options?: StoreOption[];
}

const ProductCard = ({ image, name, material, price, originalPrice, discountPct, badge, slug, variants = [], options = [] }: ProductCardProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = slug ? isWishlisted(slug) : false;

  const imageUrl = typeof image === "string" ? image : null;

  const cardContent = (
    <div className="group">
      <div className="relative overflow-hidden aspect-[4/5] bg-secondary mb-3">
        <Image
          src={image ?? "/placeholder.jpg"}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-sans tracking-luxury uppercase px-2.5 py-1">
            {badge}
          </span>
        )}
        <button
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:bg-background ${wishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"}`}
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (slug) toggleWishlist(slug);
          }}
        >
          <Heart size={14} className={wishlisted ? "fill-red-500 text-red-500" : "text-foreground"} />
        </button>

        {/* Quick Add */}
        <button
          className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-sm text-primary-foreground flex items-center justify-center gap-2 py-3 font-sans text-xs tracking-luxury uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 sm:translate-y-full lg:translate-y-full hover:bg-foreground"
          aria-label={`Quick add ${name} to cart`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSheetOpen(true);
          }}
        >
          <ShoppingBag size={14} />
          Quick Add
        </button>
      </div>
      <div className="space-y-1">
        <p className="font-sans text-[11px] tracking-luxury uppercase text-muted-foreground">{material}</p>
        <h3 className="font-sans text-sm font-medium text-foreground">{name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans text-sm text-foreground">{price}</span>
          {originalPrice && (
            <span className="font-sans text-xs text-muted-foreground line-through">{originalPrice}</span>
          )}
          {discountPct && discountPct > 0 ? (
            <span className="font-sans text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
              {discountPct}% off
            </span>
          ) : null}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {slug ? (
        <Link href={`/product/${slug}`} className="block">{cardContent}</Link>
      ) : (
        cardContent
      )}
      <QuickAddSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        name={name}
        image={imageUrl}
        variants={variants}
        options={options}
      />
    </>
  );
};

export default ProductCard;
