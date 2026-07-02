import Image from "next/image";
import Link from "next/link";
import { StoreBanner } from "@/lib/medusa-api";

interface FullWidthBannerProps {
  banner: StoreBanner;
  fallbackImage?: string;
}

const FullWidthBanner = ({ banner, fallbackImage }: FullWidthBannerProps) => {
  const imageSrc = banner.image_url || fallbackImage || null;

  return (
    <section className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[75vh] overflow-hidden bg-secondary">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={banner.title}
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      )}

      {/* Gradient overlay — stronger at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />

      {/* Text content — bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-12 lg:px-20 pb-12 lg:pb-16 max-w-3xl">
        {banner.eyebrow && (
          <p className="font-sans text-xs tracking-widest uppercase text-primary-foreground/70 mb-3">
            {banner.eyebrow}
          </p>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-primary-foreground leading-tight mb-4">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="font-sans text-sm sm:text-base text-primary-foreground/80 leading-relaxed mb-6 max-w-xl">
            {banner.subtitle}
          </p>
        )}
        {banner.cta_text && banner.cta_url && (
          <Link
            href={banner.cta_url}
            className="inline-block bg-primary-foreground text-primary font-sans text-sm tracking-widest uppercase px-8 py-3.5 hover:bg-primary-foreground/90 transition-all duration-300"
          >
            {banner.cta_text}
          </Link>
        )}
      </div>
    </section>
  );
};

export default FullWidthBanner;
