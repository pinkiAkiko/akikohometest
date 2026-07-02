"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  MedusaCart,
  MedusaLineItem,
  createCart,
  getCart,
  addLineItem as apiAddLineItem,
  updateLineItem as apiUpdateLineItem,
  deleteLineItem as apiDeleteLineItem,
} from "@/lib/medusa-api";

const CART_ID_KEY = "akiko_cart_id";

interface CartContextType {
  cart: MedusaCart | null;
  cartId: string | null;
  items: MedusaLineItem[];
  cartCount: number;
  cartTotal: number;
  /** Pure item-level discount (no tax component). cartTotal - discountedSubtotal. */
  itemDiscount: number;
  /** After-discount, before-tax subtotal. item_total - item_tax_total. */
  discountedSubtotal: number;
  discountTotal: number;
  drawerOpen: boolean;
  isLoading: boolean;
  setDrawerOpen: (open: boolean) => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (lineItemId: string) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Restore cart from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem(CART_ID_KEY);
    if (!storedId) return;
    getCart(storedId).then((c) => {
      if (c) {
        setCart(c);
      } else {
        localStorage.removeItem(CART_ID_KEY);
      }
    }).catch(() => localStorage.removeItem(CART_ID_KEY));
  }, []);

  const items: MedusaLineItem[] = cart?.items ?? [];
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  // unit_price and cartTotal are in rupees (Medusa v2 major units)
  const cartTotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const discountTotal = cart?.discount_total ?? 0;
  // after-discount before-tax subtotal: item_total (disc+tax) minus item_tax_total (tax only)
  const discountedSubtotal = cart ? (cart.item_total - cart.item_tax_total) : cartTotal;
  const itemDiscount = cartTotal > discountedSubtotal ? cartTotal - discountedSubtotal : 0;

  const getOrCreateCart = useCallback(async (): Promise<MedusaCart> => {
    // Use in-memory cart if available — avoids an extra round trip to Supabase
    if (cart) return cart;
    const storedId = localStorage.getItem(CART_ID_KEY);
    if (storedId) {
      const existing = await getCart(storedId);
      if (existing) return existing;
    }
    const fresh = await createCart();
    localStorage.setItem(CART_ID_KEY, fresh.id);
    return fresh;
  }, [cart]);

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      const c = await getOrCreateCart();
      localStorage.setItem(CART_ID_KEY, c.id);
      const updated = await apiAddLineItem(c.id, variantId, quantity);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  }, [getOrCreateCart]);

  const removeFromCart = useCallback(async (lineItemId: string) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiDeleteLineItem(cart.id, lineItemId);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    if (!cart) return;
    if (quantity <= 0) {
      await removeFromCart(lineItemId);
      return;
    }
    setIsLoading(true);
    try {
      const updated = await apiUpdateLineItem(cart.id, lineItemId, quantity);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  }, [cart, removeFromCart]);

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY);
    setCart(null);
  }, []);

  const refreshCart = useCallback(async () => {
    const id = cart?.id ?? localStorage.getItem(CART_ID_KEY);
    if (!id) return;
    const updated = await getCart(id);
    if (updated) setCart(updated);
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart, cartId: cart?.id ?? null, items, cartCount, cartTotal,
      itemDiscount, discountedSubtotal, discountTotal,
      drawerOpen, isLoading,
      setDrawerOpen, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
