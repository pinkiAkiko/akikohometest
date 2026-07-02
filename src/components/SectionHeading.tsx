interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}

const SectionHeading = ({ title, subtitle, className = "", align = "center" }: SectionHeadingProps) => {
  return (
    <div className={`${align === "center" ? "text-center" : "text-left"} mb-10 lg:mb-14 ${className}`}>
      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
