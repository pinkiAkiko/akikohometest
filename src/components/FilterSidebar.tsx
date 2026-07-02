"use client";

import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterSidebarProps {
  materials: string[];
  selectedMaterials: string[];
  onMaterialChange: (materials: string[]) => void;
  colors: { name: string; hex: string }[];
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FilterContent = ({
  materials,
  selectedMaterials,
  onMaterialChange,
  colors,
  selectedColors,
  onColorChange,
}: Pick<FilterSidebarProps, "materials" | "selectedMaterials" | "onMaterialChange" | "colors" | "selectedColors" | "onColorChange">) => {
  const toggleMaterial = (mat: string) => {
    onMaterialChange(
      selectedMaterials.includes(mat)
        ? selectedMaterials.filter((m) => m !== mat)
        : [...selectedMaterials, mat]
    );
  };

  const toggleColor = (color: string) => {
    onColorChange(
      selectedColors.includes(color)
        ? selectedColors.filter((c) => c !== color)
        : [...selectedColors, color]
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-sans text-xs font-semibold tracking-luxury uppercase text-muted-foreground mb-4">
          Material
        </h3>
        <div className="space-y-3">
          {materials.map((mat) => (
            <label key={mat} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedMaterials.includes(mat)}
                onCheckedChange={() => toggleMaterial(mat)}
              />
              <span className="font-sans text-sm text-foreground group-hover:text-muted-foreground transition-colors">
                {mat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {colors.length > 0 && (
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-luxury uppercase text-muted-foreground mb-4">
            Color
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                  selectedColors.includes(color.name)
                    ? "border-foreground scale-110"
                    : "border-border hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** Mobile trigger button — render this in the toolbar */
export const MobileFilterTrigger = ({
  onClick,
  activeCount,
}: {
  onClick: () => void;
  activeCount: number;
}) => (
  <button
    onClick={onClick}
    className="lg:hidden flex items-center gap-2 font-sans text-xs tracking-luxury uppercase text-foreground border border-border px-4 py-2.5 hover:bg-secondary transition-colors"
  >
    <SlidersHorizontal size={14} />
    Filters
    {activeCount > 0 && (
      <span className="w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center">
        {activeCount}
      </span>
    )}
  </button>
);

const FilterSidebar = (props: FilterSidebarProps) => {
  const hasFilters = props.selectedMaterials.length > 0 || props.selectedColors.length > 0;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 pr-8 border-r border-border">
        <div className="sticky top-32">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-sans text-xs font-semibold tracking-luxury uppercase text-foreground">
              Filters
            </h2>
            {hasFilters && (
              <button
                onClick={() => {
                  props.onMaterialChange([]);
                  props.onColorChange([]);
                }}
                className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterContent {...props} />
        </div>
      </aside>

      {/* Mobile sheet */}
      <Sheet open={props.open} onOpenChange={props.onOpenChange}>
        <SheetContent side="left" className="w-80 bg-background">
          <SheetHeader>
            <SheetTitle className="font-serif text-lg">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent {...props} />
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                props.onMaterialChange([]);
                props.onColorChange([]);
              }}
              className="mt-8 w-full font-sans text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Clear all filters
            </button>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FilterSidebar;
