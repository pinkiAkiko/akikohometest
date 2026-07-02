"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ChevronDown, User, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import akikoLogo from "@/assets/akiko-logo.png";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getCategories, StoreCategory } from "@/lib/medusa-api";

const staticNavLinks = [
  { label: "About", href: "/about" },
];

// Fallback nav groups shown while categories load or if fetch fails.
// Update metadata.nav_group on categories in Medusa Admin to control grouping.
const fallbackNavGroups = [
  {
    title: "Bath",
    links: [
      { label: "Towels", href: "/collections/towels" },
      { label: "Bathmats", href: "/collections/bathmats" },
      { label: "Bath Accessories", href: "/collections/towels" },
    ],
  },
  {
    title: "Bedding",
    links: [
      { label: "Comforters", href: "/collections/comforters" },
      { label: "Bedsheets", href: "/collections/comforters" },
      { label: "Pillows", href: "/collections/comforters" },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "Bamboo Collection", href: "/collections/bamboo" },
      { label: "Kids Collection", href: "/collections/kids" },
    ],
  },
  {
    title: "Cleaning",
    links: [
      { label: "Cleaning Towels", href: "/collections/cleaning" },
      { label: "Makeup Removers", href: "/collections/cleaning" },
    ],
  },
];

/** Build nav groups from Medusa categories using metadata.nav_group. */
function buildNavGroups(categories: StoreCategory[]) {
  const groupMap: Record<string, { label: string; href: string }[]> = {};
  const groupOrder: string[] = [];

  for (const cat of categories) {
    const group: string = (cat.metadata?.nav_group as string | undefined) ?? "Other";
    if (!groupMap[group]) {
      groupMap[group] = [];
      groupOrder.push(group);
    }
    groupMap[group].push({ label: cat.name, href: `/collections/${cat.handle}` });
  }

  return groupOrder.map((title) => ({ title, links: groupMap[title] }));
}

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navGroups, setNavGroups] = useState(fallbackNavGroups);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cartCount, setDrawerOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        if (cats.length > 0) setNavGroups(buildNavGroups(cats));
      })
      .catch(() => {/* keep fallback */ });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md">
      {/* ── Row 1: Logo + Icons ─────────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Desktop */}
          <div className="hidden lg:grid grid-cols-3 items-center py-2">
            {/* Left: spacer */}
            <div />

            {/* Center: Logo */}
            <Link href="/" className="justify-self-center">
              <Image
                src={akikoLogo}
                alt="Akiko Home"
                className="h-[4.5rem] w-auto"
                priority
              />
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center gap-5 justify-self-end">
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search size={20} />
              </button>
              <Link href={isAuthenticated ? "/account" : "/login"} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Account">
                <User size={20} />
              </Link>
              <Link href="/account/wishlist" className="relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Wishlist">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground text-background text-[10px] font-sans font-medium rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setDrawerOpen(true)} className="relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground text-background text-[10px] font-sans font-medium rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                className="text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search size={20} />
              </button>
            </div>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image
                src={akikoLogo}
                alt="Akiko Home"
                className="h-12 sm:h-14 w-auto"
                priority
              />
            </Link>

            <div className="flex items-center gap-5">
              <Link href="/account/wishlist" className="relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Wishlist">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground text-background text-[10px] font-sans font-medium rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href={isAuthenticated ? "/account" : "/login"} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Account">
                <User size={20} />
              </Link>
              <button onClick={() => setDrawerOpen(true)} className="relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground text-background text-[10px] font-sans font-medium rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Nav bar (desktop only) ───────────────────────────────── */}
      <div className="hidden lg:block border-b border-border">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <nav className="flex items-center justify-between h-12">
            {navGroups.map((group) => (
              <div
                key={group.title}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveGroup(group.title)}
                onMouseLeave={() => setActiveGroup(null)}
              >
                <button className="text-xs font-sans font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1 h-full">
                  {group.title}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${activeGroup === group.title ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Per-group dropdown */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-0 transition-all duration-200 ${activeGroup === group.title ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="bg-secondary border border-border shadow-md min-w-44 py-4 px-5">
                    <ul className="space-y-3">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="font-sans text-sm text-foreground hover:text-muted-foreground transition-colors duration-200 whitespace-nowrap"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            {staticNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-sans font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 h-full flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Search overlay */}
      <div
        className={`absolute left-0 right-0 bg-secondary border-b border-border transition-all duration-300 overflow-hidden ${searchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
          <Search size={20} className="text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchOpen(false);
                setSearchQuery("");
              }
            }}
            placeholder="Search towels, bedding, collections..."
            className="flex-1 bg-transparent text-sm font-sans text-foreground placeholder:text-muted-foreground outline-none border-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="px-6 py-6 space-y-4">
            {navGroups.map((group) => (
              <div key={group.title}>
                <button
                  className="flex items-center justify-between w-full text-base font-sans text-foreground hover:text-muted-foreground transition-colors"
                  onClick={() => setMobileOpenGroup(mobileOpenGroup === group.title ? null : group.title)}
                >
                  {group.title}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${mobileOpenGroup === group.title ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileOpenGroup === group.title && (
                  <ul className="mt-3 ml-4 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="font-sans text-sm text-foreground hover:text-muted-foreground transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {staticNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-base font-sans text-foreground hover:text-muted-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
