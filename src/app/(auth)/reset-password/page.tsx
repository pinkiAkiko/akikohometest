"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { resetPassword } from "@/lib/medusa-api";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      toast.success("Password updated! You can now sign in.");
      router.replace("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors";

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center">
        <h1 className="font-serif text-2xl text-foreground mb-4">Invalid link</h1>
        <p className="font-sans text-sm text-muted-foreground mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="font-sans text-xs tracking-[0.15em] uppercase underline text-foreground hover:text-muted-foreground transition-colors"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 text-center">
        Choose a new password
      </h1>
      <p className="font-sans text-sm text-muted-foreground text-center mb-10">
        Your new password must be at least 8 characters
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          minLength={8}
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-foreground text-background py-4 font-sans text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
        >
          {submitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
