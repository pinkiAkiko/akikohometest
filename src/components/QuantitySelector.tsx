"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

const QuantitySelector = ({ quantity, onChange, max = 10 }: QuantitySelectorProps) => {
  return (
    <div>
      <span className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-3 block">
        Quantity
      </span>
      <div className="inline-flex items-center border border-border">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="w-12 h-10 flex items-center justify-center font-sans text-sm text-foreground border-x border-border">
          {quantity}
        </span>
        <button
          onClick={() => onChange(Math.min(max, quantity + 1))}
          disabled={quantity >= max}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
