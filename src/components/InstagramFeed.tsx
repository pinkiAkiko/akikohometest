import Image from "next/image";
import { Heart } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import bambooCollection from "@/assets/bamboo-collection.jpg";

interface InstagramPost {
  id: string;
  url: string;
  href: string;
}

const STATIC_FALLBACK = [
  { src: product1 },
  { src: bambooCollection },
  { src: product3 },
  { src: product5 },
  { src: product2 },
  { src: product6 },
];

async function fetchInstagramPosts(): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink&limit=12&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: { data?: any[] } = await res.json();
    const posts = (data.data ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM")
      .slice(0, 6)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => ({ id: p.id, url: p.media_url, href: p.permalink }));
    return posts.length > 0 ? posts : null;
  } catch {
    return null;
  }
}

const InstagramFeed = async () => {
  const posts = await fetchInstagramPosts();

  return (
    <section className="py-16 lg:py-24">
      <div className="text-center mb-8">
        <p className="font-sans text-xs tracking-wide-luxury uppercase text-muted-foreground mb-2">
          @akikohome.store
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground">
          Follow Us on Instagram
        </h2>
        <a
          href="https://www.instagram.com/akikohome.store/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 font-sans text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground border-b border-muted-foreground/40 hover:border-foreground pb-0.5 transition-colors duration-200"
        >
          View Profile →
        </a>
      </div>

      <div className="flex overflow-x-auto scrollbar-hide gap-0.5">
        {posts
          ? posts.map((post) => (
              <a
                key={post.id}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex-shrink-0 w-[33.33vw] sm:w-[20vw] lg:w-[16.66vw] aspect-square overflow-hidden"
              >
                <Image
                  src={post.url}
                  alt="Akiko Home on Instagram"
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 17vw"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 text-primary-foreground font-sans text-sm">
                    <Heart size={16} className="fill-primary-foreground" />
                    View
                  </span>
                </div>
              </a>
            ))
          : STATIC_FALLBACK.map((img, i) => (
              <a
                key={i}
                href="https://www.instagram.com/akikohome.store/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex-shrink-0 w-[33.33vw] sm:w-[20vw] lg:w-[16.66vw] aspect-square overflow-hidden"
              >
                <Image
                  src={img.src}
                  alt="Akiko Home lifestyle"
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 17vw"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 text-primary-foreground font-sans text-sm">
                    <Heart size={16} className="fill-primary-foreground" />
                    Follow
                  </span>
                </div>
              </a>
            ))}
      </div>
    </section>
  );
};

export default InstagramFeed;
