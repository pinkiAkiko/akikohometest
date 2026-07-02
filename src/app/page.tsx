// import Image from "next/image";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import SectionHeading from "@/components/SectionHeading";
import CategorySlider from "@/components/CategorySlider";
import ProductCard from "@/components/ProductCard";
import EditorialSplit from "@/components/EditorialSplit";
import EditorialCarousel from "@/components/EditorialCarousel";
import FeatureRow from "@/components/FeatureRow";
import TestimonialSlider from "@/components/TestimonialSlider";
import NewsletterBlock from "@/components/NewsletterBlock";
import SiteFooter from "@/components/SiteFooter";
import ScrollReveal from "@/components/ScrollReveal";
import InstagramFeed from "@/components/InstagramFeed";
// import BundleHighlight from "@/components/BundleHighlight";
import BackToTop from "@/components/BackToTop";
import cottonIcon from "@/assets/icons/Cotton.png";
import heiqIcon from "@/assets/icons/HeiQ.png";
import oekoIcon from "@/assets/icons/Oeko tek.png";
import heartIcon from "@/assets/icons/Heart.png";

import { getProductsByTag, getCategories, getBanners, getTestimonials, getStoreSetting } from "@/lib/medusa-api";

const materialFeatures = [
  { icon: cottonIcon, title: "100% Combed Cotton", description: "Exceptionally soft fibers for a luxurious feel against your skin" },
  { icon: heiqIcon,   title: "Swiss HeiQ Technology", description: "Advanced freshness technology that keeps towels hygienic longer", iconClassName: "w-36 h-16 object-contain" },
  { icon: oekoIcon,   title: "OEKO-TEX Certified", description: "Tested and verified free from harmful substances, safe for all" },
  { icon: heartIcon,  title: "Crafted for Comfort", description: "Thoughtfully designed for everyday luxury in every detail" },
];


// Local fallback testimonials — replaced by API data once seed-dynamic-content.ts is run
const fallbackTestimonials = [
  { quote: "The softest towels I've ever owned. They feel like a spa experience every single day.", author: "Priya M.", product: "Classic Bath Towel Set" },
  { quote: "The bamboo collection is incredible — so smooth and they dry beautifully. Worth every rupee.", author: "Ankit R.", product: "Bamboo Bath Towel" },
  { quote: "Bought these as a housewarming gift. The packaging was beautiful and the quality spoke for itself.", author: "Sneha K.", product: "Premium Gift Set" },
];

export default async function Home() {
  // Fetch all dynamic content in parallel
  const [newArrivals, , categories, banners, editorialBanners, testimonialData, bambooImg] = await Promise.all([
    getProductsByTag("new-arrival", 4).catch(() => []),
    getProductsByTag("bestseller", 4).catch(() => []),
    getCategories().catch(() => []),
    getBanners("hero").catch(() => []),
    getBanners("editorial").catch(() => []),
    getTestimonials().catch(() => []),
    getStoreSetting("editorial_bamboo_image").catch(() => null),
    getStoreSetting("editorial_kids_image").catch(() => null),
    getStoreSetting("editorial_lifestyle_image").catch(() => null),
  ]);

  // Map testimonials from API shape to TestimonialCard props shape
  const testimonials =
    testimonialData.length > 0
      ? testimonialData.map((t) => ({ quote: t.quote, author: t.author_name, product: t.product_handle ?? "" }))
      : fallbackTestimonials;

  // Build category tiles from Medusa data
  const categoryTiles = categories.map((cat) => ({
    name: cat.name,
    image: (cat.metadata?.image as string | undefined) ?? null,
    href: `/collections/${cat.handle}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      {/* Hero Carousel */}
      <HeroBanner banners={banners} />

      {/* Shop by Category */}
      <section className="py-20 lg:py-28">
        <div className="px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto mb-8">
          <ScrollReveal variant="soft">
            <SectionHeading title="Shop by Category" subtitle="Explore our curated range of premium home textiles" />
          </ScrollReveal>
        </div>
        <div className="px-6 sm:px-8 lg:px-16">
          <CategorySlider tiles={categoryTiles} />
        </div>
        <div className="mt-10 text-center">
          <a
            href="/collections"
            className="inline-block font-sans text-sm tracking-luxury uppercase text-foreground border-b border-foreground pb-0.5 hover:text-muted-foreground hover:border-muted-foreground transition-colors duration-300"
          >
            View All Categories
          </a>
        </div>
      </section>

      {/* Editorial carousel — managed from Admin → Banners (type: editorial) */}
      <ScrollReveal variant="fade">
        <EditorialCarousel
          banners={editorialBanners}
          fallback={
            <EditorialSplit
              image={bambooImg}
              imageAlt="Bamboo towels in sage and cream on marble countertop"
              eyebrow="Featured Collection"
              title="India's First HeiQ Pure™ Cotton Towels"
              description="Elevate your daily routine with ultra-soft combed cotton towels enhanced with HeiQ Pure Silver Ion Technology. Designed to help keep towels fresh, hygienic, and odor-resistant between washes, they bring Swiss textile innovation to Indian homes for the very first time. Crafted for superior softness, absorbency, and long-lasting performance, this collection redefines everyday comfort."
              ctaText="EXPLORE NOW"
              ctaHref="/collections/bamboo"
            />
          }
        />
      </ScrollReveal>

      {/* New Arrivals */}
      <section className="py-20 lg:py-28 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <ScrollReveal variant="soft">
          <SectionHeading title="New Arrivals" subtitle="The latest additions to our collection" />
        </ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product, i) => (
            <ScrollReveal key={product.slug} delay={i * 90}>
              <ProductCard
                slug={product.slug}
                image={product.thumbnail}
                name={product.name}
                material={product.material}
                price={product.price}
                originalPrice={product.originalPrice}
                discountPct={product.discountPct || undefined}
                badge={product.badge}
                variants={product.variants}
                options={product.options}
              />
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a href="/collections/new-arrivals" className="font-sans text-sm tracking-luxury uppercase text-foreground border-b border-foreground pb-0.5 hover:text-muted-foreground hover:border-muted-foreground transition-colors duration-300">
            View All New Arrivals
          </a>
        </div>
      </section>

      {/* Crafted with Care + Why Akiko Home — unified */}
      <section className="py-20 lg:py-28 px-6 sm:px-8 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal variant="soft">
            <SectionHeading
              title="Crafted with Purpose"
              subtitle="Premium materials, thoughtful design — and a promise that lasts"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade" delay={100}>
            <FeatureRow features={materialFeatures} />
          </ScrollReveal>
        </div>
      </section>

      {/* Best Sellers — commented out
      <section className="py-20 lg:py-28 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <ScrollReveal variant="soft">
          <SectionHeading title="Most Loved" subtitle="Our customers' favorites, tried and adored" />
        </ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product, i) => (
            <ScrollReveal key={product.slug} delay={i * 90}>
              <ProductCard ... />
            </ScrollReveal>
          ))}
        </div>
      </section>
      */}

      {/* Bundle / Gift Set Highlight — commented out
      <ScrollReveal variant="fade">
        <BundleHighlight viewAllHref="/collections/gift-sets" />
      </ScrollReveal>
      */}

      {/* Lifestyle Editorial Banner — commented out
      <ScrollReveal variant="fade">
        <section className="relative w-full h-[50vh] lg:h-[60vh] overflow-hidden bg-secondary">
          Transform Your Everyday Rituals
        </section>
      </ScrollReveal>
      */}

      {/* Kids Collection Editorial — commented out
      <ScrollReveal variant="fade">
        <EditorialSplit
          image={kidsImg}
          eyebrow="PREMIUM BATHMAT COLLECTION"
          title="Designed for Comfort. Crafted for Luxury."
          ctaText="EXPLORE COLLECTION"
          ctaHref="/collections/kids"
          reverse
        />
      </ScrollReveal>
      */}


      {/* Testimonials */}
      <ScrollReveal variant="soft">
        <TestimonialSlider testimonials={testimonials} />
      </ScrollReveal>

      {/* Instagram Feed */}
      <ScrollReveal variant="fade">
        <InstagramFeed />
      </ScrollReveal>

      {/* Newsletter */}
      <NewsletterBlock />

      {/* Footer */}
      <SiteFooter />

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}
