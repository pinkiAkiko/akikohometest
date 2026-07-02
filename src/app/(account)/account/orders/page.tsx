"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { getCustomerOrders, PlacedOrder } from "@/lib/medusa-api";

const INTERNAL_STATUSES = ["order created", "pickup scheduled", "pickup generated"]
const CANCELLED_STATUSES = ["cancelled", "rto initiated", "rto delivered"]

function customerStatus(orderStatus: string, fulfillmentStatus?: string): string {
  if (orderStatus === "cancelled") return "Cancelled"
  if (!fulfillmentStatus) return "Processing"
  const s = fulfillmentStatus.toLowerCase()
  if (CANCELLED_STATUSES.some((x) => s.includes(x))) return "Cancelled"
  if (INTERNAL_STATUSES.some((x) => s.includes(x))) return "Processing"
  return fulfillmentStatus // Picked Up, In Transit, Out for Delivery, Delivered
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

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getCustomerOrders()
      .then(setOrders)
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/account"
            className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            My Account
          </Link>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="font-sans text-xs text-foreground">Orders</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-10">Your Orders</h1>

        {fetching || isLoading ? (
          <p className="font-sans text-sm text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-sans text-sm text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/"
              className="font-sans text-xs tracking-[0.15em] uppercase bg-foreground text-background px-10 py-3 hover:bg-foreground/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block border border-border p-6 hover:border-foreground transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground">
                      Order #{order.display_id}
                    </p>
                    {"created_at" in order && (
                      <p className="font-sans text-xs text-muted-foreground">
                        {formatDate((order as PlacedOrder & { created_at: string }).created_at)}
                      </p>
                    )}
                    <p className="font-sans text-sm text-foreground font-medium capitalize">
                      {customerStatus(
                        order.status,
                        order.fulfillments?.some((f) => f.delivered_at != null)
                          ? "Delivered"
                          : order.fulfillments?.[0]?.data?.current_status
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm text-muted-foreground mb-1">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="font-serif text-lg text-foreground">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
