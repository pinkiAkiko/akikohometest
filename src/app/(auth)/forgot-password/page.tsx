"use client";

import { useState } from "react";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { requestPasswordReset } from "@/lib/medusa-api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 text-center">
          Reset your password
        </h1>

        {sent ? (
          <div className="text-center mt-8 space-y-4">
            <p className="font-sans text-sm text-foreground">
              If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
            </p>
            <p className="font-sans text-xs text-muted-foreground">
              Check your spam folder if you don&apos;t see it within a few minutes.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="font-sans text-sm text-muted-foreground text-center mb-10">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-foreground text-background py-4 font-sans text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="font-sans text-sm text-muted-foreground text-center mt-8">
              Remembered it?{" "}
              <Link href="/login" className="text-foreground underline hover:text-muted-foreground transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
