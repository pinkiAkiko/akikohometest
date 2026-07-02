import { getCategories } from "@/lib/medusa-api";
import CategoryTile from "@/components/CategoryTile";
import SectionHeading from "@/components/SectionHeading";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "All Categories — Akiko Home",
  description: "Browse all our premium home textile collections — towels, bathmats, bedding, bamboo and more.",
};

export default async function CollectionsPage() {
  const categories = await getCategories().catch(() => []);

  const tiles = categories.map((cat) => ({
    name: cat.name,
    image: (cat.metadata?.image as string | undefined) ?? null,
    href: `/collections/${cat.handle}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <main className="py-20 lg:py-12 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <SectionHeading
          title="All Categories"
          subtitle="Browse our complete range of premium home textiles"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-2">
          {tiles.map((cat) => (
            <CategoryTile key={cat.name} image={cat.image} name={cat.name} href={cat.href} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
