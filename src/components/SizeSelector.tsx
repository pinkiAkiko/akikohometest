"use client";

import { StoreOption } from "@/lib/medusa-api";

interface SizeSelectorProps {
  option: StoreOption;
  selected: string;
  onChange: (value: string) => void;
}

const SizeSelector = ({ option, selected, onChange }: SizeSelectorProps) => {
  return (
    <div>
      <span className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-3 block">
        {option.title}
      </span>
      <div className="flex flex-wrap gap-2">
        {option.values.map(({ value }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`px-4 py-2.5 text-xs font-sans tracking-wide border transition-all duration-200 ${
              selected === value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:border-foreground"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
