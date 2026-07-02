"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  updateCartAddress,
  listShippingOptions,
  addShippingMethod,
  initiatePaymentSession,
  getActivePaymentSession,
  completeCart,
  checkPincodeServiceability,
  listAddresses,
  getStoreSetting,
  Address,
  ShippingOption,
} from "@/lib/medusa-api";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { toast } from "sonner";
import Spinner from "@/components/Spinner";
import { Check } from "lucide-react";

function formatPrice(amount: number | null | undefined) {
  return `₹${(Math.round(Number(amount || 0) * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// Env var is the instant default; store_settings value overrides once fetched.
const DEFAULT_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 999);

// Returns exactly the options the customer should see:
//   cart >= threshold → Free Shipping option only (by ID; fallback: flat ₹0)
//   cart <  threshold → Shiprocket calculated only
const FREE_SHIPPING_OPTION_ID = process.env.NEXT_PUBLIC_FREE_SHIPPING_OPTION_ID;

function visibleOptions(opts: ShippingOption[], total: number, threshold: number): ShippingOption[] {
  if (total >= threshold) {
    if (FREE_SHIPPING_OPTION_ID) return opts.filter((o) => o.id === FREE_SHIPPING_OPTION_ID);
    // Fallback: flat ₹0 options (excludes calculated)
    return opts.filter((o) => o.price_type === "flat" && o.amount === 0);
  }
  return opts.filter((o) => o.price_type === "calculated");
}

function autoSelectShipping(
  opts: ShippingOption[],
  total: number,
  threshold: number,
  setter: (id: string) => void
): void {
  const visible = visibleOptions(opts, total, threshold);
  if (visible.length > 0) setter(visible[0].id);
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

export default function CheckoutPage() {
  const { cart, items, cartTotal, itemDiscount, discountedSubtotal, cartId, clearCart, refreshCart } = useCart();
  const { isAuthenticated, customer } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"address" | "shipping" | "payment">("address");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_THRESHOLD);

  // Fetch threshold from store_settings so admin panel changes take effect without a redeploy
  useEffect(() => {
    getStoreSetting("free_shipping_threshold_inr").then((val: string | null) => {
      const n = Number(val);
      if (!isNaN(n) && n > 0) setFreeShippingThreshold(n);
    });
  }, []);

  // Load saved addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      listAddresses().then((addresses) => {
        setSavedAddresses(addresses);
      }).catch(() => {
        // silently ignore error
      });
      setForm((prev) => ({ ...prev, email: prev.email || customer?.email || "" }));
    }
  }, [isAuthenticated, customer]);

  // Initiate payment session whenever payment step is active or method changes
  useEffect(() => {
    if (step !== "payment" || !cartId) return;
    const providerId = paymentMethod === "razorpay" ? "pp_razorpay_razorpay" : "pp_system_default";
    initiatePaymentSession(cartId, providerId).catch(() =>
      toast.error("Failed to initialize payment. Please try again.")
    );
  }, [step, cartId, paymentMethod]);

  // Load shipping options once cartId is available — do NOT auto-select here.
  // Rates are calculated without a destination pincode at this point and would be speculative.
  // Auto-select happens in handleAddressSubmit after the real pincode is known.
  useEffect(() => {
    if (!cartId) return;
    listShippingOptions(cartId)
      .then((opts) => setShippingOptions(opts))
      .catch(() => {/* silently ignore — will show error on submit */});
  }, [cartId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSelectedAddressId(null);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartId) { toast.error("Cart not found. Please refresh."); return; }
    setLoading(true);
    try {
      const { serviceable } = await checkPincodeServiceability(form.pincode);
      if (!serviceable) {
        toast.warning("Delivery to this PIN code may not be available. You can still proceed and we'll confirm availability.");
      }
      await updateCartAddress(cartId, form.email, {
        first_name: form.firstName,
        last_name: form.lastName,
        address_1: form.address,
        city: form.city,
        province: form.state,
        postal_code: form.pincode,
        country_code: "in",
        phone: form.phone,
      });
      const [opts] = await Promise.all([
        listShippingOptions(cartId),
        refreshCart(),
      ]);
      setShippingOptions(opts);
      autoSelectShipping(opts, cartTotal, freeShippingThreshold, setSelectedShippingId);
      setStep("shipping");
    } catch {
      toast.error("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartId || !selectedShippingId) { toast.error("Please select a shipping method."); return; }
    setLoading(true);
    try {
      await addShippingMethod(cartId, selectedShippingId);
      setStep("payment");
    } catch {
      toast.error("Failed to set shipping method. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartId) { toast.error("Cart not found. Please refresh."); return; }
    setLoading(true);
    try {
      const order = await completeCart(cartId);
      clearCart();
      router.push(`/order/confirmed/${order.id}?method=cod`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!cartId) { toast.error("Cart not found. Please refresh."); return; }
    setLoading(true);
    try {
      await loadRazorpayScript();

      const session = await getActivePaymentSession(cartId);
      if (!session?.data?.razorpay_order_id) {
        toast.error("Payment session not ready. Please wait a moment and try again.");
        return;
      }

      const razorpayData = await openRazorpayCheckout({
        orderId: session.data.razorpay_order_id as string,
        keyId: session.data.key_id as string,
        amountPaise: session.data.amount as number,
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          contact: form.phone,
        },
      });

      // Pass the payment proof to complete-sync, which stores it in the session
      // before calling completeCartWorkflow → authorizePayment verifies the signature
      const order = await completeCart(cartId, {
        razorpay_payment_id: razorpayData.razorpay_payment_id,
        razorpay_order_id: razorpayData.razorpay_order_id,
        razorpay_signature: razorpayData.razorpay_signature,
      });
      clearCart();
      router.push(`/order/confirmed/${order.id}?method=razorpay`);
    } catch (err) {
      if (err instanceof Error && err.message === "Payment cancelled") {
        toast.info("Payment cancelled. Your cart is saved.");
      } else {
        toast.error(err instanceof Error ? err.message : "Payment failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedShipping = shippingOptions.find((o) => o.id === selectedShippingId);
  // null = not yet known (show "—"); only compute once a real option is selected
  const shippingAmount = selectedShipping ? selectedShipping.amount : null;
  const taxTotal = cart?.tax_total ?? 0;
  const total = discountedSubtotal + (shippingAmount ?? 0) + taxTotal;

  const inputClass =
    "w-full bg-background border border-border px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors";

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-serif text-2xl text-foreground mb-4">Your cart is empty</h1>
          <Link href="/" className="font-sans text-sm text-muted-foreground underline hover:text-foreground transition-colors">
            Continue Shopping
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-8">

            {/* Step 1: Address */}
            {step === "address" && (
              <form onSubmit={handleAddressSubmit} className="space-y-8">
                <div>
                  <h2 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Contact Information</h2>
                  <input name="email" type="email" required placeholder="Email address" value={form.email} onChange={handleChange} className={inputClass} />
                </div>

                {savedAddresses.length > 0 && (
                  <div>
                    <h2 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Saved Addresses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              firstName: addr.first_name || "",
                              lastName: addr.last_name || "",
                              address: addr.address_1 || "",
                              city: addr.city || "",
                              state: addr.province || "",
                              pincode: addr.postal_code || "",
                              phone: addr.phone || "",
                            }));
                            setSelectedAddressId(addr.id);
                          }}
                          className={`relative border p-4 cursor-pointer transition-colors ${
                            selectedAddressId === addr.id 
                              ? "border-foreground bg-secondary/30" 
                              : "border-border hover:border-foreground/40"
                          }`}
                        >
                          <p className="font-sans text-sm text-foreground font-medium mb-1 truncate pr-6">
                            {addr.first_name} {addr.last_name}
                          </p>
                          <p className="font-sans text-xs text-muted-foreground line-clamp-2 pr-6">
                            {addr.address_1}, {addr.city}, {addr.province} {addr.postal_code}
                          </p>
                          {selectedAddressId === addr.id && (
                            <div className="absolute top-4 right-4 text-foreground">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Shipping Address</h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input name="firstName" required placeholder="First name" value={form.firstName} onChange={handleChange} className={inputClass} />
                      <input name="lastName" required placeholder="Last name" value={form.lastName} onChange={handleChange} className={inputClass} />
                    </div>
                    <input name="address" required placeholder="Address" value={form.address} onChange={handleChange} className={inputClass} />
                    <input name="city" required placeholder="City" value={form.city} onChange={handleChange} className={inputClass} />
                    <select name="state" required value={form.state} onChange={handleChange} className={inputClass}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <input name="pincode" required placeholder="PIN code" pattern="[0-9]{6}" title="6-digit PIN code" value={form.pincode} onChange={handleChange} className={inputClass} />
                      <input name="phone" type="tel" required placeholder="Phone number" value={form.phone} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full sm:w-auto bg-foreground text-background px-12 py-4 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60">
                  {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Saving...</span> : "Continue to Shipping"}
                </button>
              </form>
            )}

            {/* Step 2: Shipping Method */}
            {step === "shipping" && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground">Shipping Method</h2>
                  <button type="button" onClick={() => setStep("address")} className="font-sans text-xs text-muted-foreground underline hover:text-foreground transition-colors">Edit address</button>
                </div>

                <div className="space-y-3">
                  {visibleOptions(shippingOptions, cartTotal, freeShippingThreshold).map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between border p-4 cursor-pointer transition-colors ${
                        selectedShippingId === opt.id ? "border-foreground" : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.id}
                          checked={selectedShippingId === opt.id}
                          onChange={() => setSelectedShippingId(opt.id)}
                          className="accent-foreground"
                        />
                        <span className="font-sans text-sm text-foreground">{opt.name}</span>
                      </div>
                      <span className="font-sans text-sm text-foreground">
                        {opt.amount === 0
                          ? "Free"
                          : opt.amount == null
                            ? "Calculated at checkout"
                            : formatPrice(opt.amount)}
                      </span>
                    </label>
                  ))}
                </div>

                <button type="submit" disabled={loading || !selectedShippingId} className="w-full sm:w-auto bg-foreground text-background px-12 py-4 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60">
                  {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Saving...</span> : "Continue to Payment"}
                </button>
              </form>
            )}

            {/* Step 3: Payment */}
            {step === "payment" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground">Payment</h2>
                  <button type="button" onClick={() => setStep("shipping")} className="font-sans text-xs text-muted-foreground underline hover:text-foreground transition-colors">Edit shipping</button>
                </div>

                {/* Razorpay option */}
                <label
                  className={`flex items-start gap-4 border p-5 cursor-pointer transition-colors ${
                    paymentMethod === "razorpay" ? "border-foreground" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="mt-0.5 accent-foreground"
                  />
                  <div>
                    <span className="font-sans text-sm text-foreground font-medium">Pay Online</span>
                    <p className="font-sans text-xs text-muted-foreground mt-1">UPI · Cards · Net Banking · Wallets — powered by Razorpay</p>
                  </div>
                </label>

                {/* COD option */}
                <label
                  className={`flex items-start gap-4 border p-5 cursor-pointer transition-colors ${
                    paymentMethod === "cod" ? "border-foreground" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 accent-foreground"
                  />
                  <div>
                    <span className="font-sans text-sm text-foreground font-medium">Cash on Delivery</span>
                    <p className="font-sans text-xs text-muted-foreground mt-1">Pay when your order arrives. No prepayment required.</p>
                  </div>
                </label>

                {paymentMethod === "razorpay" ? (
                  <button
                    onClick={handleRazorpayCheckout}
                    disabled={loading}
                    className="w-full sm:w-auto bg-foreground text-background px-12 py-4 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Opening payment...</span> : `Pay Now · ${formatPrice(total)}`}
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full sm:w-auto bg-foreground text-background px-12 py-4 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? <span className="flex items-center justify-center gap-2"><Spinner />Placing order...</span> : `Place Order · ${formatPrice(total)}`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="order-first lg:order-last">
            <div className="bg-secondary p-6 sm:p-8 lg:sticky lg:top-32">
              <h2 className="font-serif text-lg text-foreground mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative flex-shrink-0 w-14 h-16 overflow-hidden bg-background">
                      {item.thumbnail && (
                        <Image src={item.thumbnail} alt={item.title} fill sizes="56px" className="object-cover" />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background text-[10px] font-sans rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-foreground truncate">{item.title}</p>
                      {item.variant_title && (
                        <p className="font-sans text-[11px] text-muted-foreground">{item.variant_title}</p>
                      )}
                    </div>
                    <span className="font-sans text-sm text-foreground flex-shrink-0">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm font-sans border-t border-border pt-4">
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
                    {shippingAmount === null ? "—" : shippingAmount === 0 ? "Free" : formatPrice(shippingAmount)}
                  </span>
                </div>
                {taxTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (GST)</span>
                    <span className="text-foreground">{formatPrice(taxTotal)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{shippingAmount === null ? "—" : formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
