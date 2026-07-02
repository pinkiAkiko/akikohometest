import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  product?: string;
  rating?: number;
}

const TestimonialCard = ({ quote, author, product, rating = 5 }: TestimonialCardProps) => {
  return (
    <div className="bg-secondary p-8 flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-foreground text-foreground" />
        ))}
      </div>
      <blockquote className="font-serif text-base sm:text-lg italic text-foreground leading-relaxed flex-1">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="mt-6 pt-4 border-t border-border">
        <p className="font-sans text-sm font-medium text-foreground">{author}</p>
        {product && (
          <p className="font-sans text-xs text-muted-foreground mt-0.5">{product}</p>
        )}
      </div>
    </div>
  );
};

export default TestimonialCard;
