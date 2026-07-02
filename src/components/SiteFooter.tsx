"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories, StoreCategory } from "@/lib/medusa-api";

// Static footer sections that don't come from Medusa (content pages, support links)
const staticFooterSections = {
  About: [
    { label: "Our Story", href: "/about" },
    { label: "Care Guide", href: "/care-guide" },
    { label: "FAQs", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  "Customer Care": [
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

// Fallback shown while categories load or if fetch fails
const fallbackShopLinks = [
  { label: "Towels", href: "/collections/towels" },
  { label: "Bathmats", href: "/collections/bathmats" },
  { label: "Comforters", href: "/collections/comforters" },
  { label: "Cleaning Towels", href: "/collections/cleaning" },
  { label: "Bamboo Collection", href: "/collections/bamboo" },
];

const fallbackCollectionLinks = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
  { label: "Gift Sets", href: "/collections/gift-sets" },
  { label: "Bamboo Collection", href: "/collections/bamboo" },
  { label: "Kids Collection", href: "/collections/kids" },
];

function buildFooterLinks(categories: StoreCategory[]) {
  const shopLinks = categories.map((cat) => ({
    label: cat.name,
    href: `/collections/${cat.handle}`,
  }));
  return shopLinks;
}

const SiteFooter = () => {
  const [shopLinks, setShopLinks] = useState(fallbackShopLinks);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        if (cats.length > 0) setShopLinks(buildFooterLinks(cats));
      })
      .catch(() => {/* keep fallback */});
  }, []);

  const footerSections: Record<string, { label: string; href: string }[]> = {
    Shop: shopLinks,
    Collections: fallbackCollectionLinks,
    ...staticFooterSections,
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <h3 className="font-serif text-xl tracking-luxury font-semibold mb-4">AKIKO HOME</h3>
            <p className="font-sans text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Premium home textiles crafted for everyday softness and lasting comfort.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {Object.entries(footerSections).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-sans text-xs tracking-luxury uppercase font-medium text-primary-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="font-sans text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-primary-foreground/50">
            © 2026 Akiko Home. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="font-sans text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-sans text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
