"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import {
  lookupOrder,
  GuestOrderResult,
  OrderFulfillment,
  NativeReturn,
  NativeReturnItem,
  fetchReturnReasons,
  NativeReturnReason,
  createNativeGuestReturnRequest,
} from "@/lib/medusa-api";

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

function formatPrice(amount: number) {
  return `₹${(Math.round(amount * 100) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function guestBadgeLabel(ret: NativeReturn): string {
  if (ret.refund_issued && (ret.status === "received" || ret.status === "partially_received"))
    return "Refunded";
  return RETURN_STATUS_LABEL[ret.status] ?? ret.status;
}

function guestBadgeStyle(ret: NativeReturn): string {
  if (ret.refund_issued && (ret.status === "received" || ret.status === "partially_received"))
    return "border-green-400 text-green-700 bg-green-50";
  return RETURN_STATUS_STYLE[ret.status] ?? "";
}

function GuestReturnPageInner() {
  const searchParams = useSearchParams();

  const [lookupLoading, setLookupLoading] = useState(false);
  const [result, setResult] = useState<GuestOrderResult | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [verifiedToken, setVerifiedToken] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  const [returnReasons, setReturnReasons] = useState<NativeReturnReason[]>([]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [nativeReturn, setNativeReturn] = useState<NativeReturn | null>(null);

  const fetchOrder = useCallback(
    async (orderId: string, token: string) => {
      setLookupLoading(true);
      setNotFound(false);
      try {
        const data = await lookupOrder(orderId, { token });
        if (data) {
          setResult(data);
          setNativeReturn(data.order_return);
          setVerifiedToken(token);
          setVerifiedEmail(data.order.email ?? "");
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLookupLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchReturnReasons().then(setReturnReasons);
    const orderId = searchParams.get("order_id");
    const token = searchParams.get("token");
    if (orderId && token) {
      fetchOrder(orderId, token);
    }
  }, [searchParams, fetchOrder]);

  function toggleItem(itemId: string) {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
    );
  }

  async function submitReturn() {
    if (!result?.order) return;
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
      const nativeItems = result.order.items
        .filter((i) => selectedItems.includes(i.id))
        .map((i) => ({ id: i.id, quantity: i.quantity, reason_id: selectedReasonId }));

      const response = await createNativeGuestReturnRequest(
        result.order.id,
        nativeItems,
        { token: verifiedToken, email: verifiedEmail },
        { return_shipping_option_id: process.env.NEXT_PUBLIC_RETURN_SHIPPING_OPTION_ID, note: returnNotes || undefined }
      );

      setNativeReturn(response.return ?? {
        id: "",
        order_id: result.order.id,
        status: "requested" as const,
        items: nativeItems.map((i) => ({ id: "", item_id: i.id, quantity: i.quantity })),
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      setReturnError(e instanceof Error ? e.message : "Failed to submit return request.");
    } finally {
      setSubmitting(false);
    }
  }

  const hasLinkParams = !!(searchParams.get("order_id") && searchParams.get("token"));
  const showNoLink = !hasLinkParams && !lookupLoading && !result;
  const showNotFound = hasLinkParams && notFound && !lookupLoading && !result;

  const order = result?.order;
  const isDelivered =
    order?.fulfillments?.some((f: OrderFulfillment) => f.delivered_at != null) ?? false;

  const reasons: NativeReturnReason[] = returnReasons.length > 0
    ? returnReasons
    : [
        { id: "defective",     value: "defective",     label: "Damaged / Defective Product" },
        { id: "wrong_item",    value: "wrong_item",    label: "Wrong Item Received" },
        { id: "not_described", value: "not_described", label: "Not As Described" },
        { id: "size_quality",  value: "size_quality",  label: "Size / Quality Issue" },
        { id: "other",         value: "other",         label: "Other" },
      ];

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Request a Return</h1>
        <p className="font-sans text-sm text-muted-foreground mb-10">
          Returns are accepted within 30 days of delivery.
        </p>

        {showNoLink && (
          <div className="max-w-md space-y-4">
            <p className="font-sans text-sm text-foreground">
              To request a return, click the <strong>Request a Return</strong> link in your order confirmation email.
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

        {showNotFound && (
          <div className="max-w-md space-y-4">
            <p className="font-sans text-sm text-red-600">
              This return link is invalid or has expired.
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

        {lookupLoading && (
          <p className="font-sans text-sm text-muted-foreground">Looking up your order...</p>
        )}

        {order && !isDelivered && (
          <div className="space-y-4">
            <p className="font-sans text-sm text-muted-foreground">
              Order <strong>#{order.display_id}</strong> hasn&apos;t been delivered yet. Returns are only available after delivery.
            </p>
            <Link
              href={`/order/track?${searchParams.toString()}`}
              className="font-sans text-xs underline text-muted-foreground hover:text-foreground transition-colors"
            >
              Track your order
            </Link>
          </div>
        )}

        {/* Already submitted */}
        {order && isDelivered && nativeReturn && (
          <div className="space-y-4">
            <p className="font-sans text-sm text-muted-foreground mb-4">
              Order <strong>#{order.display_id}</strong>
            </p>
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-sans tracking-wide rounded-sm ${guestBadgeStyle(nativeReturn)}`}>
                {guestBadgeLabel(nativeReturn)}
              </div>

              {nativeReturn.refund_amount != null && nativeReturn.refund_amount > 0 && (
                <p className="font-sans text-xs text-foreground">
                  Refund amount: <span className="font-medium">{formatPrice(nativeReturn.refund_amount)}</span>
                </p>
              )}

              {(nativeReturn.items ?? []).length > 0 && (
                <div className="font-sans text-xs text-muted-foreground space-y-0.5">
                  {(nativeReturn.items ?? []).map((ri: NativeReturnItem) => {
                    const orderItem = order?.items.find((oi) => oi.id === ri.item_id)
                    if (!orderItem) return null
                    const requestedQty = ri.quantity
                    const receivedQty = ri.received_quantity
                    const showPartial = nativeReturn.status === "partially_received" && receivedQty != null
                    return (
                      <p key={ri.id}>
                        {orderItem.title}{" "}
                        {showPartial
                          ? `— ${receivedQty} of ${requestedQty} accepted`
                          : `× ${requestedQty}`}
                      </p>
                    )
                  })}
                </div>
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
                    : "We've received your returned items and are processing your refund."}
                </p>
              )}
              {nativeReturn.status === "canceled" && (
                <p className="font-sans text-xs text-muted-foreground">
                  Unfortunately your return request could not be accepted. Please contact us for assistance.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Return form */}
        {order && isDelivered && !nativeReturn && (
          <div className="space-y-2">
            <p className="font-sans text-sm text-muted-foreground mb-6">
              Order <strong>#{order.display_id}</strong>
            </p>

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

            <div className="pt-2">
              <p className="font-sans text-xs text-muted-foreground mb-2">Reason for return:</p>
              <select
                value={selectedReasonId}
                onChange={(e) => setSelectedReasonId(e.target.value)}
                className="w-full font-sans text-sm border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              >
                <option value="">Select a reason</option>
                {reasons.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
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

            <div className="flex gap-3 pt-2">
              <button
                onClick={submitReturn}
                disabled={submitting}
                className="font-sans text-xs tracking-[0.1em] uppercase border border-foreground bg-foreground text-background px-4 py-2 hover:bg-transparent hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

export default function GuestReturnPage() {
  return (
    <Suspense>
      <GuestReturnPageInner />
    </Suspense>
  );
}
