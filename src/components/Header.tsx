"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ChevronDown, User, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import akikoLogo from "@/assets/akiko-logo.png";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getCategories, StoreCategory } from "@/lib/medusa-api";

const leadingNavLinks = [{ label: "Bestseller", href: "/collections/best-sellers" }];

const trailingNavLinks = [{ label: "About", href: "/about" }];

type NavLink = { label: string; href: string; children?: NavLink[] };

// Fallback nav groups shown while categories load or if fetch fails.
// Update metadata.nav_group on categories in Medusa Admin to control grouping.
const fallbackNavGroups: { title: string; links: NavLink[] }[] = [
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

/** Build nav groups from Medusa categories.
 *  - metadata.nav_group on a root category picks which main-nav heading it sits under.
 *  - metadata.nav_parent (another category's handle) nests a category under it as a
 *    submenu/sub-submenu — used instead of Medusa's native parent field, since the
 *    Admin category edit form here has no Parent category field. Any depth works:
 *    a category can itself be the nav_parent target of further categories.
 *  - Real Medusa parent/child relationships (category_children) also nest, if ever set. */
function buildNavGroups(categories: StoreCategory[]) {
  const metaChildrenByParentHandle: Record<string, StoreCategory[]> = {};
  for (const cat of categories) {
    const parentHandle = cat.metadata?.nav_parent as string | undefined;
    if (parentHandle) {
      (metaChildrenByParentHandle[parentHandle] ??= []).push(cat);
    }
  }

  function categoryToNavLink(cat: StoreCategory): NavLink {
    const children = [
      ...(cat.category_children || []),
      ...(metaChildrenByParentHandle[cat.handle] || []),
    ].map(categoryToNavLink);
    return {
      label: cat.name,
      href: `/collections/${cat.handle}`,
      ...(children.length > 0 ? { children } : {}),
    };
  }

  const groupMap: Record<string, NavLink[]> = {};
  const groupOrder: string[] = [];

  for (const cat of categories) {
    const isNested = cat.parent_category_id !== null || !!cat.metadata?.nav_parent;
    if (isNested) continue; // rendered as a child under its parent instead of as a root

    const group: string = (cat.metadata?.nav_group as string | undefined) ?? "Other";
    if (!groupMap[group]) {
      groupMap[group] = [];
      groupOrder.push(group);
    }
    groupMap[group].push(categoryToNavLink(cat));
  }

  return groupOrder.map((title) => ({ title, links: groupMap[title] }));
}

/** Desktop dropdown panel. Plain vertical list when nothing has children (unchanged
 *  behavior for simple groups); a mega-menu of columns — one per link, children always
 *  visible underneath, no extra hover step — when any link in the group has children.
 *  Column headings are styled distinctly (uppercase/muted) from their children so the
 *  parent/child relationship reads clearly at a glance, not just by font-weight. */
function DesktopDropdownPanel({ links }: { links: NavLink[] }) {
  const isMegaMenu = links.some((l) => l.children?.length);

  if (!isMegaMenu) {
    return (
      <ul className="space-y-3 py-5 px-6">
        {links.map((link) => (
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
    );
  }

  return (
    <div className="flex divide-x divide-border py-6">
      {links.map((link) => (
        <div key={link.label} className="min-w-40 px-12">
          <Link
            href={link.href}
            className="block font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4 whitespace-nowrap"
          >
            {link.label}
          </Link>
          {!!link.children?.length && (
            <ul className="space-y-3">
              {link.children.map((child) => (
                <DesktopMegaMenuItem key={child.label} link={child} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/** One entry inside a mega-menu column — recurses, indenting one step further each level. */
function DesktopMegaMenuItem({ link }: { link: NavLink }) {
  return (
    <li>
      <Link
        href={link.href}
        className="font-sans text-sm text-foreground hover:text-muted-foreground transition-colors duration-200 whitespace-nowrap"
      >
        {link.label}
      </Link>
      {!!link.children?.length && (
        <ul className="mt-3 ml-4 space-y-2.5 border-l border-border/40 pl-4">
          {link.children.map((grandchild) => (
            <DesktopMegaMenuItem key={grandchild.label} link={grandchild} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Mobile drawer link — uses native <details>/<summary> so nesting is free (no extra state). */
function MobileNavLinkItem({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  const hasChildren = !!link.children?.length;

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={link.href}
          className="block font-sans text-sm text-foreground hover:text-muted-foreground transition-colors"
          onClick={onNavigate}
        >
          {link.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <details className="group/item">
        <summary className="flex items-center justify-between cursor-pointer list-none font-sans text-sm text-foreground hover:text-muted-foreground transition-colors">
          {link.label}
          <ChevronDown size={14} className="transition-transform duration-200 group-open/item:rotate-180" />
        </summary>
        <ul className="mt-3 ml-4 space-y-3">
          {link.children!.map((child) => (
            <MobileNavLinkItem key={child.label} link={child} onNavigate={onNavigate} />
          ))}
        </ul>
      </details>
    </li>
  );
}

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navGroups, setNavGroups] = useState(fallbackNavGroups);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRowRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
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

  const activeNavGroup = navGroups.find((g) => g.title === activeGroup) ?? null;

  // Align the shared dropdown under its trigger, clamped so it never runs
  // past the edges of the nav row (and therefore never past the viewport).
  useLayoutEffect(() => {
    const container = navRowRef.current;
    const trigger = activeGroup ? triggerRefs.current[activeGroup] : null;
    const panel = dropdownPanelRef.current;
    if (!container || !trigger || !panel) return;

    const containerRect = container.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const panelWidth = panel.offsetWidth;

    const centered = triggerRect.left - containerRect.left + triggerRect.width / 2 - panelWidth / 2;
    const clamped = Math.max(0, Math.min(centered, containerRect.width - panelWidth));
    setDropdownLeft(clamped);
  }, [activeGroup, navGroups]);

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
        <div
          ref={navRowRef}
          className="relative max-w-7xl mx-auto px-8 lg:px-16"
          onMouseLeave={() => setActiveGroup(null)}
        >
          <nav className="flex items-center justify-between h-12">
            {leadingNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-sans font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 h-full flex items-center"
              >
                {link.label}
              </Link>
            ))}

            {navGroups.map((group) => (
              <div
                key={group.title}
                ref={(el) => { triggerRefs.current[group.title] = el; }}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveGroup(group.title)}
              >
                <button className="text-xs font-sans font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1 h-full">
                  {group.title}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${activeGroup === group.title ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            ))}

            {trailingNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-sans font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 h-full flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Shared dropdown — measured against its trigger, then clamped to the
              nav row's own bounds so it's centered under the active item without
              ever overflowing past the page edge. */}
          {activeNavGroup && (
            <div
              className="absolute top-full z-20 pointer-events-auto"
              style={{ left: dropdownLeft }}
            >
              <div
                ref={dropdownPanelRef}
                className="bg-secondary border border-border shadow-lg min-w-44 max-w-[calc(100vw-4rem)] overflow-x-auto"
              >
                <DesktopDropdownPanel links={activeNavGroup.links} />
              </div>
            </div>
          )}
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
            {leadingNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-base font-sans text-foreground hover:text-muted-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {navGroups.map((group) => (
              <details key={group.title} className="group/root">
                <summary className="flex items-center justify-between w-full cursor-pointer list-none text-base font-sans text-foreground hover:text-muted-foreground transition-colors">
                  {group.title}
                  <ChevronDown size={16} className="transition-transform duration-200 group-open/root:rotate-180" />
                </summary>
                <ul className="mt-3 ml-4 space-y-3">
                  {group.links.map((link) => (
                    <MobileNavLinkItem key={link.label} link={link} onNavigate={() => setMobileOpen(false)} />
                  ))}
                </ul>
              </details>
            ))}

            {trailingNavLinks.map((link) => (
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
