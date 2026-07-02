"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SizeSelector from "@/components/SizeSelector";
import ColorSwatch from "@/components/ColorSwatch";
import Spinner from "@/components/Spinner";
import { useCart } from "@/contexts/CartContext";
import { StoreVariant, StoreOption } from "@/lib/medusa-api";

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  name: string;
  image: string | null;
  variants: StoreVariant[];
  options: StoreOption[];
}

export default function QuickAddSheet({
  open,
  onClose,
  name,
  image,
  variants,
  options,
}: QuickAddSheetProps) {
  const { addToCart, setDrawerOpen } = useCart();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  // Initialise selection to first value of each option
  useEffect(() => {
    const init: Record<string, string> = {};
    options.forEach((opt) => { init[opt.id] = opt.values[0]?.value ?? ""; });
    setSelected(init);
    setQuantity(1);
  }, [options]);

  const matchedVariant = variants.find((v) =>
    options.every((opt) => v.optionValues[opt.id] === selected[opt.id])
  );

  const currentPrice = matchedVariant && matchedVariant.priceNum > 0 ? matchedVariant.price : null;
  const originalPrice = matchedVariant?.originalPrice;

  async function handleAdd() {
    if (!matchedVariant || matchedVariant.priceNum === 0) return;
    setLoading(true);
    try {
      await addToCart(matchedVariant.id, quantity);
      setAdded(true);
      setTimeout(() => {
        onClose();
        setDrawerOpen(true);
        setAdded(false);
      }, 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-sans text-sm font-medium tracking-wide sr-only">
            {name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex gap-4 mb-6">
          {image && (
            <div className="relative w-20 h-24 shrink-0 overflow-hidden bg-secondary rounded">
              <Image src={image} alt={name} fill sizes="80px" className="object-cover" />
            </div>
          )}
          <div className="flex flex-col justify-center gap-1">
            <p className="font-sans text-sm font-medium text-foreground">{name}</p>
            <div className="flex items-center gap-2">
              {currentPrice ? (
                <>
                  <span className="font-sans text-sm text-foreground">{currentPrice}</span>
                  {originalPrice && (
                    <span className="font-sans text-xs text-muted-foreground line-through">{originalPrice}</span>
                  )}
                </>
              ) : (
                <span className="font-sans text-xs text-muted-foreground">Unavailable</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5 mb-6">
          {options.map((opt) => {
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
          <div>
            <p className="font-sans text-[11px] tracking-luxury uppercase text-muted-foreground mb-2">Quantity</p>
            <div className="inline-flex items-center border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-10 h-9 flex items-center justify-center font-sans text-sm border-x border-border">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
                className="w-9 h-9 flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={loading || !currentPrice}
          className="w-full flex items-center justify-center gap-2.5 py-4 font-sans text-xs tracking-luxury uppercase bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Spinner size={14} className="text-background" />
          ) : added ? (
            "Added!"
          ) : !currentPrice ? (
            "Unavailable"
          ) : (
            <>
              <ShoppingBag size={14} />
              Add to Bag
            </>
          )}
        </button>
      </SheetContent>
    </Sheet>
  );
}
