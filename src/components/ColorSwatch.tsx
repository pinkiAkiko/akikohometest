"use client";

import { StoreOption } from "@/lib/medusa-api";

interface ColorSwatchProps {
  option: StoreOption;
  selected: string;
  onChange: (value: string) => void;
}

const ColorSwatch = ({ option, selected, onChange }: ColorSwatchProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-sans text-xs tracking-luxury uppercase text-muted-foreground">{option.title}</span>
        <span className="font-sans text-xs text-foreground">— {selected}</span>
      </div>
      <div className="flex gap-2.5">
        {option.values.map(({ value, hex }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              selected === value
                ? "border-foreground scale-110"
                : "border-border hover:border-muted-foreground"
            }`}
            style={{ backgroundColor: hex ?? "#888888" }}
            aria-label={value}
            title={value}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSwatch;
