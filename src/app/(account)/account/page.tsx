"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AccountPage() {
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    toast.success("You've been signed out.");
    router.replace("/");
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="font-sans text-sm text-muted-foreground">Loading...</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Guest";

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="mb-10">
          <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">My Account</p>
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground">Hello, {fullName}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Orders */}
          <Link
            href="/account/orders"
            className="group border border-border p-8 hover:border-foreground transition-colors"
          >
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3 group-hover:text-foreground transition-colors">
              Orders
            </p>
            <p className="font-serif text-lg text-foreground mb-2">Your Orders</p>
            <p className="font-sans text-xs text-muted-foreground">
              Track and view all your past orders
            </p>
          </Link>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className="group border border-border p-8 hover:border-foreground transition-colors"
          >
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3 group-hover:text-foreground transition-colors">
              Wishlist
            </p>
            <p className="font-serif text-lg text-foreground mb-2">Saved Items</p>
            <p className="font-sans text-xs text-muted-foreground">
              Products you&apos;ve hearted
            </p>
          </Link>

          {/* Addresses */}
          <Link
            href="/account/addresses"
            className="group border border-border p-8 hover:border-foreground transition-colors"
          >
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3 group-hover:text-foreground transition-colors">
              Addresses
            </p>
            <p className="font-serif text-lg text-foreground mb-2">Saved Addresses</p>
            <p className="font-sans text-xs text-muted-foreground">
              Manage your delivery addresses
            </p>
          </Link>

          {/* Profile */}
          <div className="border border-border p-8">
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">
              Profile
            </p>
            <p className="font-serif text-lg text-foreground mb-1">{fullName}</p>
            <p className="font-sans text-xs text-muted-foreground">{customer.email}</p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="group border border-border p-8 text-left hover:border-foreground transition-colors"
          >
            <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3 group-hover:text-foreground transition-colors">
              Account
            </p>
            <p className="font-serif text-lg text-foreground mb-2">Sign Out</p>
            <p className="font-sans text-xs text-muted-foreground">
              Sign out of your Akiko Home account
            </p>
          </button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
