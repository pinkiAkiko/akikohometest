"use client";

import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import BackToTop from "@/components/BackToTop";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { getStoreSetting } from "@/lib/medusa-api";

function formatPrice(amount: number) {
  return `₹${(Math.round(amount * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const { items, cartTotal, itemDiscount, discountedSubtotal, updateQuantity, removeFromCart, isLoading } = useCart();
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);
  const [isProceeding, setIsProceeding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getStoreSetting("free_shipping_threshold_inr").then((val: string | null) => {
      const n = Number(val ?? process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 999);
      setFreeShippingThreshold(isNaN(n) || n <= 0 ? 999 : n);
    });
  }, []);

  // null = still loading; 0 = free; -1 = below threshold (calculated at checkout)
  const shippingCost = freeShippingThreshold === null
    ? null
    : discountedSubtotal >= freeShippingThreshold ? 0 : -1;
  const total = shippingCost === 0 ? discountedSubtotal : null;

  const handleProceed = () => {
    setIsProceeding(true);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-10">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-sans text-sm text-muted-foreground mb-6">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block bg-foreground text-background px-8 py-3.5 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="hidden sm:grid grid-cols-[1fr_120px_120px_40px] gap-4 pb-4 border-b border-border mb-6">
                <span className="font-sans text-[11px] tracking-luxury uppercase text-muted-foreground">Product</span>
                <span className="font-sans text-[11px] tracking-luxury uppercase text-muted-foreground text-center">Quantity</span>
                <span className="font-sans text-[11px] tracking-luxury uppercase text-muted-foreground text-right">Total</span>
                <span />
              </div>

              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 sm:grid sm:grid-cols-[1fr_120px_120px_40px] sm:items-center sm:gap-4 pb-6 border-b border-border"
                  >
                    <div className="flex gap-4 flex-1 sm:flex-none">
                      <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-secondary overflow-hidden">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} fill sizes="96px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif text-sm text-foreground">{item.title}</h3>
                        {item.variant_title && (
                          <p className="font-sans text-[11px] text-muted-foreground mt-1">{item.variant_title}</p>
                        )}
                        <p className="font-sans text-sm text-foreground mt-1 sm:hidden">
                          {formatPrice(item.unit_price)}
                        </p>
                        <div className="sm:hidden mt-3 inline-flex items-center border border-border">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={isLoading} className="w-8 h-8 flex items-center justify-center hover:bg-secondary disabled:opacity-40"><Minus size={12} /></button>
                          <span className="w-10 h-8 flex items-center justify-center font-sans text-xs border-x border-border">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={isLoading || item.quantity >= 10} className="w-8 h-8 flex items-center justify-center hover:bg-secondary disabled:opacity-30"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex justify-center">
                      <div className="inline-flex items-center border border-border">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={isLoading} className="w-8 h-8 flex items-center justify-center hover:bg-secondary disabled:opacity-40"><Minus size={12} /></button>
                        <span className="w-10 h-8 flex items-center justify-center font-sans text-xs border-x border-border">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={isLoading || item.quantity >= 10} className="w-8 h-8 flex items-center justify-center hover:bg-secondary disabled:opacity-30"><Plus size={12} /></button>
                      </div>
                    </div>

                    <span className="hidden sm:block font-sans text-sm text-foreground text-right">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={isLoading}
                      className="self-start sm:self-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                      aria-label="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-32 h-fit">
              <div className="bg-secondary p-6 sm:p-8">
                <h2 className="font-serif text-lg text-foreground mb-6">Order Summary</h2>
                <div className="space-y-3 text-sm font-sans">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className={itemDiscount > 0 ? "text-muted-foreground line-through" : "text-foreground"}>
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  {itemDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Discount</span>
                      <span className="text-green-700">-{formatPrice(itemDiscount)}</span>
                    </div>
                  )}
                  {itemDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After Discount</span>
                      <span className="text-foreground">{formatPrice(discountedSubtotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shippingCost === null
                        ? "—"
                        : shippingCost === 0
                          ? "Free"
                          : "Calculated at checkout"}
                    </span>
                  </div>
                  {shippingCost === -1 && freeShippingThreshold !== null && (
                    <p className="text-[11px] text-muted-foreground">Free shipping on orders above {formatPrice(freeShippingThreshold)}</p>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between font-medium">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{total === null ? "—" : formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleProceed}
                  disabled={isProceeding}
                  className="mt-6 w-full bg-foreground text-background flex items-center justify-center py-3.5 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors disabled:opacity-70"
                >
                  {isProceeding ? <span className="flex items-center gap-2"><Spinner /> Please wait...</span> : "Proceed to Checkout"}
                </button>
                <Link
                  href="/"
                  className="mt-3 w-full text-center block font-sans text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
      <BackToTop />
    </div>
  );
}
