"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function LoginForm() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, isLoading, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(redirect);
    } catch {
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors";

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 text-center">
        Welcome back
      </h1>
      <p className="font-sans text-sm text-muted-foreground text-center mb-10">
        Sign in to your Akiko Home account
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
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-foreground text-background py-4 font-sans text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
        >
          {submitting ? <span className="flex items-center justify-center gap-2"><Spinner />Signing in...</span> : "Sign In"}
        </button>
      </form>

      <p className="font-sans text-sm text-muted-foreground text-center mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline hover:text-muted-foreground transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <Suspense>
        <LoginForm />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
