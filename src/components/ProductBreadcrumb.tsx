import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const ProductBreadcrumb = ({ items, className }: ProductBreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className={`mb-4 lg:mb-5 ${className || ''}`}>
      <ol className="flex items-center gap-1.5 text-xs font-sans tracking-wide">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-muted-foreground" />}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-luxury"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground uppercase tracking-luxury">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ProductBreadcrumb;
