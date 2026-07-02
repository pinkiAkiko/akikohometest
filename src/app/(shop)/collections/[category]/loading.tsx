import { Loader2 } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";

// Shown instantly when navigation to any /collections/[category] route starts,
// replacing the previous page before CollectionContent mounts.
export default function CollectionLoading() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="h-4 w-32 bg-secondary animate-pulse mb-4" />
        <div className="h-12 w-64 bg-secondary animate-pulse mb-3" />
        <div className="h-4 w-96 bg-secondary animate-pulse" />
        <div className="flex items-center gap-2 mt-4">
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
          <span className="font-sans text-xs text-muted-foreground tracking-wide">Loading collection…</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-20 lg:pb-28">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="h-4 w-20 bg-secondary animate-pulse" />
          <div className="h-9 w-40 bg-secondary animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
