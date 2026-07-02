"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

const NewsletterBlock = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`${BACKEND_URL}/store/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUB_KEY,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); return; }
      if (data.message === "already_subscribed") { setStatus("duplicate"); return; }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-secondary py-20 lg:py-28 px-6">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">
          Join the Akiko Home World
        </h2>
        <p className="font-sans text-sm text-muted-foreground mt-3 mb-8">
          Be the first to know about new collections, exclusive offers, and home styling inspiration.
        </p>

        {status === "success" ? (
          <p className="font-sans text-sm text-foreground py-3">
            You&apos;re on the list — welcome to the Akiko Home world.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                required
                className="flex-1 px-4 py-3 text-sm font-sans bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 text-sm font-sans tracking-luxury uppercase bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {status === "loading" ? <Spinner className="mx-auto" /> : "Subscribe"}
              </button>
            </div>
            {status === "duplicate" && (
              <p className="font-sans text-xs text-muted-foreground mt-3">You&apos;re already subscribed.</p>
            )}
            {status === "error" && (
              <p className="font-sans text-xs text-red-500 mt-3">Something went wrong — please try again.</p>
            )}
          </form>
        )}

        <p className="font-sans text-[11px] text-muted-foreground mt-4">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterBlock;
