import Image from "next/image";
import Link from "next/link";

interface CategoryTileProps {
  image: string | null;
  name: string;
  href?: string;
}

const CategoryTile = ({ image, name, href = "#" }: CategoryTileProps) => {
  return (
    <Link href={href} className="group relative block overflow-hidden aspect-[3/4]">
      <div className="absolute inset-0 bg-secondary" />
      {image && (
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-serif text-lg sm:text-xl text-primary-foreground font-medium">
          {name}
        </h3>
        <span className="font-sans text-xs tracking-luxury uppercase text-primary-foreground/70 mt-1 inline-block group-hover:translate-x-1 transition-transform duration-300">
          Explore →
        </span>
      </div>
    </Link>
  );
};

export default CategoryTile;
