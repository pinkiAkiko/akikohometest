"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { lookupOrder, GuestOrderResult, OrderFulfillment, NativeReturn } from "@/lib/medusa-api";

const INTERNAL_STATUSES = ["order created", "pickup scheduled", "pickup generated"];
const CANCELLED_STATUSES = ["cancelled", "rto initiated", "rto delivered"];

const RETURN_STATUS_LABEL: Record<string, string> = {
  requested: "Return Requested",
  received: "Return Received",
  partially_received: "Return Partially Received",
  canceled: "Return Cancelled",
};

const RETURN_STATUS_STYLE: Record<string, string> = {
  requested: "border-amber-400 text-amber-700 bg-amber-50",
  received: "border-blue-400 text-blue-700 bg-blue-50",
  partially_received: "border-blue-400 text-blue-700 bg-blue-50",
  canceled: "border-red-400 text-red-700 bg-red-50",
};

function customerStatus(orderStatus: string, fulfillmentStatus?: string): string {
  if (orderStatus === "cancelled") return "Cancelled";
  if (!fulfillmentStatus) return "Processing";
  const s = fulfillmentStatus.toLowerCase();
  if (CANCELLED_STATUSES.some((x) => s.includes(x))) return "Cancelled";
  if (INTERNAL_STATUSES.some((x) => s.includes(x))) return "Processing";
  return fulfillmentStatus;
}

function formatPrice(amount: number) {
  return `₹${(Math.round(amount * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TrackOrderPageInner() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuestOrderResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(
    async (orderId: string, token: string) => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await lookupOrder(orderId, { token });
        if (data) {
          setResult(data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-fetch when token + order_id are present in URL (email link path)
  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const token = searchParams.get("token");
    if (orderId && token) {
      fetchOrder(orderId, token);
    }
  }, [searchParams, fetchOrder]);

  const order = result?.order;
  const returnRequest: NativeReturn | null = result?.order_return ?? null;

  const trackingFulfillment = order?.fulfillments?.find(
    (f: OrderFulfillment) => f.data?.awb_code || f.data?.shiprocket_order_id
  ) as OrderFulfillment | undefined;
  const tracking = trackingFulfillment?.data;

  const isDeliveredViaTimestamp = order?.fulfillments?.some((f: OrderFulfillment) => f.delivered_at != null) ?? false;
  const rawStatus = order
    ? customerStatus(order.status, isDeliveredViaTimestamp ? "Delivered" : tracking?.current_status)
    : "";
  const currentStatus = rawStatus;

  const hasLinkParams = !!(searchParams.get("order_id") && searchParams.get("token"));
  const showNoLink = !hasLinkParams && !loading && !result;
  const showNotFound = hasLinkParams && notFound && !loading && !result;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Track Your Order</h1>
        <p className="font-sans text-sm text-muted-foreground mb-10">
          Use the tracking link in your order confirmation email.
        </p>

        {/* No token in URL — guide user to email */}
        {showNoLink && (
          <div className="max-w-md space-y-4">
            <p className="font-sans text-sm text-foreground">
              To track your order, click the <strong>Track your order</strong> link in your order confirmation email.
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              Can&apos;t find the email? Check your spam folder, or{" "}
              <a href="mailto:care@akikohome.in" className="underline hover:text-foreground transition-colors">
                contact us
              </a>{" "}
              with your order details.
            </p>
          </div>
        )}

        {/* Invalid / expired link */}
        {showNotFound && (
          <div className="max-w-md space-y-4">
            <p className="font-sans text-sm text-red-600">
              This tracking link is invalid or has expired.
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              Please use the link in your original order confirmation email, or{" "}
              <a href="mailto:care@akikohome.in" className="underline hover:text-foreground transition-colors">
                contact us
              </a>{" "}
              for help.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="font-sans text-sm text-muted-foreground">Looking up your order...</p>
        )}

        {/* Order detail */}
        {order && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">
                  Order #{order.display_id}
                </p>
                {order.created_at && (
                  <h2 className="font-serif text-xl text-foreground">
                    {formatDate(order.created_at)}
                  </h2>
                )}
              </div>
              <span className="font-sans text-xs tracking-[0.15em] uppercase px-3 py-1.5 border border-border text-muted-foreground">
                {currentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Items */}
              <div className="lg:col-span-2">
                <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-6">Items</h3>
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative flex-shrink-0 w-16 h-20 bg-secondary overflow-hidden">
                        {item.thumbnail && (
                          <Image src={item.thumbnail} alt={item.title} fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-foreground font-medium truncate">{item.title}</p>
                        {item.variant_title && (
                          <p className="font-sans text-xs text-muted-foreground mt-0.5">{item.variant_title}</p>
                        )}
                        <p className="font-sans text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-sans text-sm text-foreground flex-shrink-0">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Return status (read-only — full return form is at /order/return) */}
                {returnRequest && (
                  <div className="mt-10 pt-8 border-t border-border">
                    <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Returns</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-sans tracking-wide rounded-sm ${RETURN_STATUS_STYLE[returnRequest.status]}`}>
                      {RETURN_STATUS_LABEL[returnRequest.status]}
                    </div>
                    {(returnRequest.status === "received" || returnRequest.status === "partially_received") && (
                      <p className="font-sans text-xs text-muted-foreground mt-2">
                        We&apos;ve received your returned items and are processing your refund.
                      </p>
                    )}
                    {returnRequest.status === "requested" && (
                      <p className="font-sans text-xs text-muted-foreground mt-2">
                        We&apos;ve received your return request and will be in touch shortly.
                      </p>
                    )}
                  </div>
                )}

                {/* Request return CTA — links to /order/return with same token */}
                {!returnRequest && (isDeliveredViaTimestamp || rawStatus.toLowerCase().includes("delivered")) && (
                  <div className="mt-10 pt-8 border-t border-border">
                    <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Returns</h3>
                    <Link
                      href={`/order/return?${searchParams.toString()}`}
                      className="font-sans text-xs tracking-[0.1em] uppercase border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors inline-block"
                    >
                      Request a Return
                    </Link>
                  </div>
                )}
              </div>

              {/* Summary sidebar */}
              <div className="space-y-8">
                <div>
                  <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Order Total</h3>
                  <div className="space-y-2 font-sans text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(order.item_subtotal)}</span>
                    </div>
                    {(order.discount_total ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Discount</span>
                        <span className="text-green-700">-{formatPrice(order.discount_total)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {order.shipping_subtotal === 0 ? "Free" : formatPrice(order.shipping_subtotal)}
                      </span>
                    </div>
                    {(order.original_tax_total ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (GST)</span>
                        <span className="text-foreground">{formatPrice(order.original_tax_total)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between font-medium">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {order.shipping_address && (
                  <div>
                    <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Shipping Address</h3>
                    <div className="font-sans text-sm text-foreground space-y-0.5">
                      <p>{[order.shipping_address.first_name, order.shipping_address.last_name].filter(Boolean).join(" ")}</p>
                      <p className="text-muted-foreground">{order.shipping_address.address_1}</p>
                      <p className="text-muted-foreground">
                        {[order.shipping_address.city, order.shipping_address.province, order.shipping_address.postal_code].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {tracking && (
                  <div>
                    <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Shipment Tracking</h3>
                    <div className="font-sans text-sm space-y-2">
                      {tracking.current_status && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <span className="text-foreground capitalize">{tracking.current_status}</span>
                        </div>
                      )}
                      {tracking.courier_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Courier</span>
                          <span className="text-foreground">{tracking.courier_name}</span>
                        </div>
                      )}
                      {tracking.awb_code && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">AWB</span>
                          <a
                            href={`https://shiprocket.co/tracking/${tracking.awb_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground underline hover:text-muted-foreground transition-colors"
                          >
                            {tracking.awb_code}
                          </a>
                        </div>
                      )}
                      {!tracking.awb_code && (
                        <p className="text-muted-foreground text-xs">AWB will appear once shipment is picked up.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderPageInner />
    </Suspense>
  );
}
