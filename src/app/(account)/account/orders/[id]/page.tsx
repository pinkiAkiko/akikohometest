"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOrder,
  fetchOrderReturns,
  PlacedOrder,
  OrderFulfillment,
  NativeReturn,
  NativeReturnItem,
  fetchReturnReasons,
  NativeReturnReason,
  createNativeReturnRequest,
} from "@/lib/medusa-api";

const INTERNAL_STATUSES = ["order created", "pickup scheduled", "pickup generated"]
const CANCELLED_STATUSES = ["cancelled", "rto initiated", "rto delivered"]

const RETURN_STATUS_LABEL: Record<NativeReturn["status"], string> = {
  requested: "Return Requested",
  received: "Return Received",
  partially_received: "Return Partially Received",
  canceled: "Return Cancelled",
}

const RETURN_STATUS_STYLE: Record<NativeReturn["status"], string> = {
  requested: "border-amber-400 text-amber-700 bg-amber-50",
  received: "border-blue-400 text-blue-700 bg-blue-50",
  partially_received: "border-blue-400 text-blue-700 bg-blue-50",
  canceled: "border-red-400 text-red-700 bg-red-50",
}

function returnBadgeLabel(ret: NativeReturn): string {
  if (ret.refund_issued && (ret.status === "received" || ret.status === "partially_received"))
    return "Refunded"
  return RETURN_STATUS_LABEL[ret.status]
}

function returnBadgeStyle(ret: NativeReturn): string {
  if (ret.refund_issued && (ret.status === "received" || ret.status === "partially_received"))
    return "border-green-400 text-green-700 bg-green-50"
  return RETURN_STATUS_STYLE[ret.status]
}

function customerStatus(orderStatus: string, fulfillmentStatus?: string): string {
  if (orderStatus === "cancelled") return "Cancelled"
  if (!fulfillmentStatus) return "Processing"
  const s = fulfillmentStatus.toLowerCase()
  if (CANCELLED_STATUSES.some((x) => s.includes(x))) return "Cancelled"
  if (INTERNAL_STATUSES.some((x) => s.includes(x))) return "Processing"
  return fulfillmentStatus
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

export default function OrderDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [fetching, setFetching] = useState(true);

  // Return state
  const [nativeReturn, setNativeReturn] = useState<NativeReturn | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReasons, setReturnReasons] = useState<NativeReturnReason[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    fetchReturnReasons().then(setReturnReasons);
  }, []);

  useEffect(() => {
    if (!params.id || !isAuthenticated) return;
    Promise.all([
      getOrder(params.id),
      fetchOrderReturns(params.id),
    ]).then(([ord, ret]) => {
      setOrder(ord);
      setNativeReturn(ret);
    }).finally(() => setFetching(false));
  }, [params.id, isAuthenticated]);

  function toggleItem(itemId: string) {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
    );
  }

  async function submitReturn() {
    if (!order) return;
    if (!selectedItems.length) {
      setReturnError("Please select at least one item to return.");
      return;
    }
    if (!selectedReasonId) {
      setReturnError("Please select a reason.");
      return;
    }
    setReturnError(null);
    setSubmitting(true);
    try {
      const nativeItems = order.items
        .filter((i) => selectedItems.includes(i.id))
        .map((i) => ({ id: i.id, quantity: i.quantity, reason_id: selectedReasonId }));

      await createNativeReturnRequest(
        order.id,
        nativeItems,
        process.env.NEXT_PUBLIC_RETURN_SHIPPING_OPTION_ID,
        returnNotes || undefined
      );

      // Fetch the canonical return state from our custom route
      const ret = await fetchOrderReturns(order.id);
      setNativeReturn(ret);
      setShowReturnForm(false);
    } catch (e) {
      setReturnError(e instanceof Error ? e.message : "Failed to submit return request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (fetching || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="font-sans text-sm text-muted-foreground">Loading order...</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="font-sans text-sm text-muted-foreground mb-4">Order not found.</p>
          <Link href="/account/orders" className="font-sans text-xs underline text-muted-foreground hover:text-foreground transition-colors">
            Back to orders
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const orderWithDate = order as PlacedOrder & { created_at?: string; shipping_address?: { first_name?: string; last_name?: string; address_1?: string; city?: string; province?: string; postal_code?: string } };

  const trackingFulfillment = order.fulfillments?.find(
    (f: OrderFulfillment) => f.data?.awb_code || f.data?.shiprocket_order_id
  ) as OrderFulfillment | undefined;
  const tracking = trackingFulfillment?.data;

  const isDeliveredViaTimestamp = order.fulfillments?.some((f: OrderFulfillment) => f.delivered_at != null) ?? false
  const rawStatus = customerStatus(
    order.status,
    isDeliveredViaTimestamp ? "Delivered" : tracking?.current_status
  )
  const currentStatus = nativeReturn?.status === "canceled" ? rawStatus : rawStatus
  const isDelivered = rawStatus.toLowerCase().includes("delivered") || isDeliveredViaTimestamp
  const canRequestReturn = isDelivered && !nativeReturn;

  // Match native return items to order items to get titles
  const returnedOrderItems = nativeReturn
    ? order.items.filter((oi) =>
        (nativeReturn.items ?? []).some((ri: NativeReturnItem) => ri.item_id === oi.id)
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/account" className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline">
            My Account
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <Link href="/account/orders" className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline">
            Orders
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="font-sans text-xs text-foreground">#{order.display_id}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">
              Order #{order.display_id}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
              {orderWithDate.created_at ? formatDate(orderWithDate.created_at) : ""}
            </h1>
          </div>
          <span className="font-sans text-xs tracking-[0.15em] uppercase px-3 py-1.5 border border-border text-muted-foreground capitalize">
            {currentStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2">
            <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-6">Items</h2>
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

            {/* Return section */}
            {(canRequestReturn || nativeReturn) && (
              <div className="mt-10 pt-8 border-t border-border">
                <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Returns</h2>

                {/* Existing return status */}
                {nativeReturn && (
                  <div className="space-y-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-sans tracking-wide rounded-sm ${returnBadgeStyle(nativeReturn)}`}>
                      {returnBadgeLabel(nativeReturn)}
                      {returnedOrderItems.length > 0 && returnedOrderItems.length < order.items.length && (
                        <span className="opacity-70">· Partial</span>
                      )}
                    </div>

                    {returnedOrderItems.length > 0 && (
                      <div className="font-sans text-xs text-muted-foreground space-y-0.5">
                        <p className="font-medium text-foreground mb-1">Items in return:</p>
                        {returnedOrderItems.map((item) => {
                          const ri = (nativeReturn.items ?? []).find((r: NativeReturnItem) => r.item_id === item.id)
                          const requestedQty = ri?.quantity ?? item.quantity
                          const receivedQty = ri?.received_quantity
                          const showPartial = nativeReturn.status === "partially_received" && receivedQty != null
                          return (
                            <p key={item.id}>
                              {item.title}{" "}
                              {showPartial
                                ? `— ${receivedQty} of ${requestedQty} accepted`
                                : `× ${requestedQty}`}
                            </p>
                          )
                        })}
                      </div>
                    )}

                    {nativeReturn.refund_amount != null && nativeReturn.refund_amount > 0 && (
                      <p className="font-sans text-xs text-foreground">
                        Refund amount: <span className="font-medium">{formatPrice(nativeReturn.refund_amount)}</span>
                      </p>
                    )}

                    {nativeReturn.status === "requested" && (
                      <p className="font-sans text-xs text-muted-foreground">
                        We&apos;ve received your return request and will be in touch shortly.
                      </p>
                    )}
                    {(nativeReturn.status === "received" || nativeReturn.status === "partially_received") && (
                      <p className="font-sans text-xs text-muted-foreground">
                        {nativeReturn.refund_issued
                          ? "Your refund has been processed. Please allow 5–7 business days for it to reflect in your account."
                          : "We’ve received your returned items and are processing your refund."}
                      </p>
                    )}
                    {nativeReturn.status === "canceled" && (
                      <p className="font-sans text-xs text-muted-foreground">
                        Unfortunately your return request could not be accepted. Please contact us for assistance.
                      </p>
                    )}
                  </div>
                )}

                {/* Request button */}
                {canRequestReturn && !showReturnForm && (
                  <button
                    onClick={() => setShowReturnForm(true)}
                    className="font-sans text-xs tracking-[0.1em] uppercase border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Request a Return
                  </button>
                )}

                {/* Return form */}
                {showReturnForm && (
                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="font-sans text-xs text-muted-foreground mb-3">Select items to return:</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleItem(item.id)}
                              className="w-4 h-4 border-border accent-foreground"
                            />
                            <span className="font-sans text-sm text-foreground group-hover:text-muted-foreground transition-colors">
                              {item.title}
                              {item.variant_title && (
                                <span className="text-muted-foreground"> — {item.variant_title}</span>
                              )}
                              <span className="text-muted-foreground text-xs ml-1">× {item.quantity}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-sans text-xs text-muted-foreground mb-2">Reason for return:</p>
                      <select
                        value={selectedReasonId}
                        onChange={(e) => setSelectedReasonId(e.target.value)}
                        className="w-full font-sans text-sm border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
                      >
                        <option value="">Select a reason</option>
                        {(returnReasons.length > 0 ? returnReasons : [
                          { id: "defective",    label: "Damaged / Defective Product" },
                          { id: "wrong_item",   label: "Wrong Item Received" },
                          { id: "not_described",label: "Not As Described" },
                          { id: "size_quality", label: "Size / Quality Issue" },
                          { id: "other",        label: "Other" },
                        ]).map((r) => (
                          <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <p className="font-sans text-xs text-muted-foreground mb-2">Additional notes (optional):</p>
                      <textarea
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        rows={3}
                        placeholder="Any additional details..."
                        className="w-full font-sans text-sm border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-foreground resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    {returnError && (
                      <p className="font-sans text-xs text-red-600">{returnError}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={submitReturn}
                        disabled={submitting}
                        className="font-sans text-xs tracking-[0.1em] uppercase border border-foreground bg-foreground text-background px-4 py-2 hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? "Submitting..." : "Submit Return Request"}
                      </button>
                      <button
                        onClick={() => {
                          setShowReturnForm(false);
                          setReturnError(null);
                          setSelectedItems([]);
                          setSelectedReasonId("");
                          setReturnNotes("");
                        }}
                        className="font-sans text-xs tracking-[0.1em] uppercase border border-border text-muted-foreground px-4 py-2 hover:border-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-8">
            <div>
              <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Order Total</h2>
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

            {orderWithDate.shipping_address && (
              <div>
                <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Shipping Address</h2>
                <div className="font-sans text-sm text-foreground space-y-0.5">
                  <p>{[orderWithDate.shipping_address.first_name, orderWithDate.shipping_address.last_name].filter(Boolean).join(" ")}</p>
                  <p className="text-muted-foreground">{orderWithDate.shipping_address.address_1}</p>
                  <p className="text-muted-foreground">
                    {[orderWithDate.shipping_address.city, orderWithDate.shipping_address.province, orderWithDate.shipping_address.postal_code].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {tracking && (
              <div>
                <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Shipment Tracking</h2>
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

      <SiteFooter />
    </div>
  );
}
