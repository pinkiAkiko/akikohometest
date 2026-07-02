import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { getOrder } from "@/lib/medusa-api";

function formatPrice(amount: number) {
  return `₹${(Math.round(amount * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default async function OrderConfirmedPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { method?: string }
}) {
  const order = await getOrder(params.id);
  const paymentLabel = searchParams?.method === "razorpay" ? "Paid via Razorpay" : "Cash on Delivery";

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-serif text-2xl text-foreground mb-4">Order not found</h1>
          <Link href="/" className="font-sans text-sm text-muted-foreground underline hover:text-foreground transition-colors">
            Return to Home
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Checkmark */}
        <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl text-foreground mb-2">Thank you for your order</h1>
        <p className="font-sans text-sm text-muted-foreground mb-1">
          Order #{order.display_id}
        </p>
        <p className="font-sans text-sm text-muted-foreground mb-10">
          A confirmation will be sent to <span className="text-foreground">{order.email}</span>
        </p>

        {/* Order items */}
        <div className="text-left border border-border divide-y divide-border mb-8">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-foreground">{item.title}</p>
                {item.variant_title && (
                  <p className="font-sans text-xs text-muted-foreground">{item.variant_title}</p>
                )}
                <p className="font-sans text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="font-sans text-sm text-foreground flex-shrink-0">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="text-left border border-border p-6 space-y-2 mb-10">
          <div className="flex justify-between font-sans text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(order.item_subtotal)}</span>
          </div>
          {order.discount_total > 0 && (
            <div className="flex justify-between font-sans text-sm">
              <span className="text-green-700">Discount</span>
              <span className="text-green-700">-{formatPrice(order.discount_total)}</span>
            </div>
          )}
          <div className="flex justify-between font-sans text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground">{order.shipping_subtotal === 0 ? "Free" : formatPrice(order.shipping_subtotal)}</span>
          </div>
          {order.original_tax_total > 0 && (
            <div className="flex justify-between font-sans text-sm">
              <span className="text-muted-foreground">Tax (GST)</span>
              <span className="text-foreground">{formatPrice(order.original_tax_total)}</span>
            </div>
          )}
          <div className="flex justify-between font-sans text-sm font-medium border-t border-border pt-2 mt-2">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between font-sans text-sm border-t border-border pt-2 mt-1">
            <span className="text-muted-foreground">Payment</span>
            <span className="text-foreground">{paymentLabel}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-foreground text-background px-10 py-3 font-sans text-xs tracking-luxury uppercase hover:bg-foreground/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
