"use client";

import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

function formatPrice(amount: number) {
  return `₹${(Math.round(amount * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

const CartDrawer = () => {
  const { items, cartTotal, itemDiscount, discountedSubtotal, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart, isLoading } = useCart();
  const [isProceeding, setIsProceeding] = useState(false);
  const router = useRouter();

  const handleCheckout = () => {
    setIsProceeding(true);
    router.push("/checkout");
    // Small delay allows the user to see the loading text before drawer slide-out animation finishes
    setTimeout(() => {
      setDrawerOpen(false);
      setIsProceeding(false);
    }, 400);
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-serif text-lg text-foreground">
            Your Bag ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <ShoppingBag size={40} className="text-muted-foreground/40" />
            <p className="font-sans text-sm text-muted-foreground">Your bag is empty</p>
            <button
              onClick={() => setDrawerOpen(false)}
              className="font-sans text-xs tracking-luxury uppercase underline text-foreground hover:text-muted-foreground transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-24 flex-shrink-0 bg-secondary overflow-hidden">
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={item.title} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-sm text-foreground leading-tight">{item.title}</h3>
                        {item.variant_title && (
                          <p className="font-sans text-[11px] text-muted-foreground mt-0.5">{item.variant_title}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={isLoading}
                        className="text-muted-foreground hover:text-foreground transition-colors p-0.5 disabled:opacity-40"
                        aria-label="Remove item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading}
                          className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                          aria-label="Decrease"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center font-sans text-xs border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= 10}
                          className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
                          aria-label="Increase"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-sans text-sm text-foreground">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-xs tracking-luxury uppercase text-muted-foreground">Subtotal</span>
                  <span className={`font-sans text-sm ${itemDiscount > 0 ? "text-muted-foreground line-through" : "text-foreground text-base"}`}>
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                {itemDiscount > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-xs tracking-luxury uppercase text-green-700">Discount</span>
                      <span className="font-sans text-sm text-green-700">-{formatPrice(itemDiscount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-xs tracking-luxury uppercase text-muted-foreground">Total</span>
                      <span className="font-sans text-base text-foreground">{formatPrice(discountedSubtotal)}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="font-sans text-[11px] text-muted-foreground">Shipping and taxes calculated at checkout</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCheckout}
                  disabled={isProceeding}
                  className="w-full bg-foreground text-background flex items-center justify-center py-3.5 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors disabled:opacity-70"
                >
                  {isProceeding ? <span className="flex items-center gap-2"><Spinner /> Please wait...</span> : "Checkout"}
                </button>
                <Link
                  href="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full border border-border text-foreground flex items-center justify-center py-3.5 font-sans text-xs tracking-luxury uppercase hover:bg-secondary transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
