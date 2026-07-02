import { getProductsByCategory, getCategoryByHandle, getProductsByTag, getAllProducts, StoreProduct } from "@/lib/medusa-api";
import CollectionContent from "./CollectionContent";

// Virtual collections driven by product tags (not Medusa categories)
const VIRTUAL_COLLECTIONS: Record<string, { tag?: string; title: string; description: string }> = {
  "new-arrivals":  { tag: "new-arrival", title: "New Arrivals",      description: "The latest additions to our collection — fresh styles and seasonal drops." },
  "best-sellers":  {                     title: "Bestsellers",       description: "Our customers' all-time favourites, tried and adored across India." },
  "gift-sets":     { tag: "bundle",      title: "Curated Gift Sets", description: "Thoughtfully bundled for gifting or treating yourself — save more together." },
  "all":           {                     title: "All Products",       description: "Explore our complete range of premium home textiles." },
};

// Server component — fetches products so that loading.tsx activates instantly on navigation
// (client components never suspend, so loading.tsx only works with async server components).
export default async function CollectionPage({ params }: { params: { category: string } }) {
  const { category } = params;

  let products: StoreProduct[] = [];
  let categoryInfo = { title: "All Products", description: "Explore our complete range of premium home textiles." };

  const virtual = VIRTUAL_COLLECTIONS[category];
  if (virtual) {
    products = await (virtual.tag ? getProductsByTag(virtual.tag, 200) : getAllProducts(200)).catch(() => []);
    categoryInfo = { title: virtual.title, description: virtual.description };
  } else {
    const [prods, cat] = await Promise.all([
      getProductsByCategory(category).catch(() => []),
      getCategoryByHandle(category).catch(() => null),
    ]);
    products = prods;
    if (cat) {
      categoryInfo = {
        title: cat.name,
        description: cat.description ?? "Explore our complete range of premium home textiles.",
      };
    }
  }

  return (
    <CollectionContent
      category={category}
      initialProducts={products}
      categoryInfo={categoryInfo}
    />
  );
}
