"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/account");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(form.email, form.password, form.firstName, form.lastName);
      toast.success("Account created! Welcome to Akiko Home.");
      router.replace("/account");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("exists") || msg.includes("409")) {
        toast.error("An account with this email already exists.");
      } else {
        toast.error("Could not create account. Please try again.");
      }
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
          Create an account
        </h1>
        <p className="font-sans text-sm text-muted-foreground text-center mb-10">
          Join Akiko Home for order tracking and a seamless checkout
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="firstName"
              required
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              name="lastName"
              required
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Password (min. 8 characters)"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="confirm"
            type="password"
            required
            placeholder="Confirm password"
            value={form.confirm}
            onChange={handleChange}
            className={inputClass}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground text-background py-4 font-sans text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
          >
            {submitting ? <span className="flex items-center justify-center gap-2"><Spinner />Creating account...</span> : "Create Account"}
          </button>
        </form>

        <p className="font-sans text-sm text-muted-foreground text-center mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline hover:text-muted-foreground transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
