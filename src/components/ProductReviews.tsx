"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProductReviews,
  submitReview,
  findOrderWithProduct,
  Review,
} from "@/lib/medusa-api";
import { toast } from "sonner";

function StarRow({ rating, size = 16, interactive = false, onChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = interactive ? (hover || rating) >= n : rating >= n;
        return (
          <Star
            key={n}
            size={size}
            className={`${filled ? "text-amber-500 fill-amber-500" : "text-border"} ${interactive ? "cursor-pointer" : ""}`}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(n)}
          />
        );
      })}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkingOrder, setCheckingOrder] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProductReviews(productId).then(setReviews).finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setCheckingOrder(true);
    findOrderWithProduct(productId)
      .then(setOrderId)
      .finally(() => setCheckingOrder(false));
  }, [isAuthenticated, productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    const result = await submitReview({
      product_id: productId,
      order_id: orderId,
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
    });
    setSubmitting(false);
    if (result.ok) {
      setSubmitted(true);
      toast.success("Review submitted — it will appear after moderation.");
    } else {
      toast.error(result.message ?? "Failed to submit review.");
    }
  }

  // Summary stats
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({
    n,
    pct: count > 0 ? Math.round((reviews.filter((r) => r.rating === n).length / count) * 100) : 0,
  }));

  const inputClass =
    "w-full border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors";

  return (
    <section className="mt-20 lg:mt-28 border-t border-border pt-16">
      <h2 className="font-serif text-2xl text-foreground mb-10">Customer Reviews</h2>

      {/* Summary */}
      {count > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-12">
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <p className="font-serif text-5xl text-foreground mb-1">{avg.toFixed(1)}</p>
            <StarRow rating={Math.round(avg)} size={14} />
            <p className="font-sans text-xs text-muted-foreground mt-1">{count} review{count !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-2">
            {breakdown.map(({ n, pct }) => (
              <div key={n} className="flex items-center gap-3">
                <span className="font-sans text-xs text-muted-foreground w-4">{n}</span>
                <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-sans text-xs text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Reviews list */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="font-sans text-sm text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>
          ) : (
            <div className="divide-y divide-border">
              {reviews.map((review) => (
                <div key={review.id} className="py-6 first:pt-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <StarRow rating={review.rating} size={14} />
                    <span className="font-sans text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  {review.title && (
                    <p className="font-sans text-sm font-medium text-foreground mb-1">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review form */}
        <div>
          <h3 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-6">Write a Review</h3>

          {!isAuthenticated ? (
            <p className="font-sans text-sm text-muted-foreground">
              <Link href="/login" className="text-foreground underline hover:no-underline">Sign in</Link> to leave a review.
            </p>
          ) : checkingOrder ? (
            <p className="font-sans text-xs text-muted-foreground">Checking your orders...</p>
          ) : !orderId ? (
            <p className="font-sans text-sm text-muted-foreground">
              Purchase this product to leave a review.
            </p>
          ) : submitted ? (
            <div className="border border-border p-6">
              <p className="font-sans text-sm text-foreground font-medium mb-1">Thank you!</p>
              <p className="font-sans text-xs text-muted-foreground">Your review has been submitted and will appear after moderation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-muted-foreground mb-2">Your Rating *</label>
                <StarRow rating={rating} size={22} interactive onChange={setRating} />
              </div>
              <div>
                <label className="block font-sans text-xs text-muted-foreground mb-1">Title</label>
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarise your experience"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-muted-foreground mb-1">Review</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What did you think of this product?"
                  maxLength={1000}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full font-sans text-xs tracking-[0.15em] uppercase bg-foreground text-background py-3 hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
