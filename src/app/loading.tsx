import { Loader2 } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";

// Shown instantly when navigating to the homepage while it fetches data.
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      {/* Hero skeleton */}
      <div className="w-full h-[60vh] lg:h-[80vh] bg-secondary animate-pulse" />

      {/* Shop by Category skeleton */}
      <section className="py-20 lg:py-28 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="h-6 w-48 bg-secondary animate-pulse mb-2" />
        <div className="h-4 w-72 bg-secondary animate-pulse mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-secondary animate-pulse" />
          ))}
        </div>
      </section>

      {/* New Arrivals skeleton */}
      <section className="py-20 lg:py-28 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="h-6 w-40 bg-secondary animate-pulse mb-2" />
        <div className="h-4 w-64 bg-secondary animate-pulse mb-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-secondary animate-pulse" />
          ))}
        </div>
      </section>

      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        <span className="font-sans text-xs tracking-wide">Loading…</span>
      </div>
    </div>
  );
}
