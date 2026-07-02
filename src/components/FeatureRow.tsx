import Image, { StaticImageData } from "next/image";
import { type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon | StaticImageData;
  title: string;
  description: string;
  iconClassName?: string;
}

interface FeatureRowProps {
  features: Feature[];
  className?: string;
}

const FeatureRow = ({ features, className = "" }: FeatureRowProps) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 ${className}`}>
      {features.map((feature) => (
        <div key={feature.title} className="text-center">
          <div className="h-16 mx-auto mb-4 flex items-end justify-center">
            {typeof feature.icon === "function" ? (
              <feature.icon size={28} strokeWidth={1.5} className="text-muted-foreground" />
            ) : (
              <Image
                src={feature.icon}
                alt={feature.title}
                className={feature.iconClassName ?? "w-16 h-16 object-contain"}
              />
            )}
          </div>
          <h3 className="font-sans text-sm font-medium tracking-wide uppercase text-foreground mb-2">
            {feature.title}
          </h3>
          <p className="font-sans text-xs text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeatureRow;
