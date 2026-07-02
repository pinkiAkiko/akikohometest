import Image from "next/image";

interface EditorialSplitProps {
  image: string | null;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  reverse?: boolean;
}

const EditorialSplit = ({ image, imageAlt, eyebrow, title, description, ctaText, ctaHref = "#", reverse = false }: EditorialSplitProps) => {
  return (
    <section className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? "lg:direction-rtl" : ""}`}>
      <div className={`overflow-hidden ${reverse ? "lg:order-2" : ""}`}>
        <div className="relative min-h-[400px] lg:min-h-[600px] w-full bg-secondary">
          {image && (
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
      </div>
      <div className={`flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-16 lg:py-0 bg-secondary ${reverse ? "lg:order-1" : ""}`}>
        {eyebrow && (
          <p className="font-sans text-xs tracking-wide-luxury uppercase text-muted-foreground mb-4">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground leading-snug">
          {title}
        </h2>
        <p className="font-sans text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed max-w-md">
          {description}
        </p>
        <a
          href={ctaHref}
          className="mt-8 inline-block bg-primary text-primary-foreground px-8 py-3 text-sm font-sans tracking-luxury uppercase hover:opacity-90 transition-opacity duration-300 self-start"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
};

export default EditorialSplit;
