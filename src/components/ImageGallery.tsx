"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const ZOOM_FACTOR = 3;
const ZOOM_PANEL_W = 700; // px — width of the right-hand zoomed panel

interface ImageGalleryProps {
  images: string[];
  alt: string;
  optionImages?: Record<string, string[]>;
  selectedOptionValue?: string;
  variantImages?: string[];
  variantId?: string;
  aspectRatio?: string;
  focalX?: number;
  focalY?: number;
  objectFit?: "cover" | "contain";
}

const ImageGallery = ({ images, alt, optionImages, selectedOptionValue, variantImages, variantId, aspectRatio = "4/5", focalX = 0.5, focalY = 0.5, objectFit = "cover" }: ImageGalleryProps) => {
  const visibleImages: string[] = (() => {
    if (variantImages && variantImages.length > 0) return variantImages;
    if (
      selectedOptionValue &&
      optionImages &&
      Object.keys(optionImages).length > 0 &&
      optionImages[selectedOptionValue]?.length > 0
    ) return optionImages[selectedOptionValue];
    return images;
  })();

  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedOptionValue, variantId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setContainerSize({ w: rect.width, h: rect.height });
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => setMousePos(null);

  // Lens dimensions — represent what the zoomed panel covers on the source image
  const lensW = containerSize.w > 0 ? ZOOM_PANEL_W / ZOOM_FACTOR : 0;
  const lensH = containerSize.h > 0 ? containerSize.h / ZOOM_FACTOR : 0;

  // Lens position clamped within the container
  const lensLeft = mousePos
    ? Math.max(0, Math.min(containerSize.w - lensW, mousePos.x - lensW / 2))
    : 0;
  const lensTop = mousePos
    ? Math.max(0, Math.min(containerSize.h - lensH, mousePos.y - lensH / 2))
    : 0;

  // Background position for the zoomed panel
  const bgX = -lensLeft * ZOOM_FACTOR;
  const bgY = -lensTop * ZOOM_FACTOR;

  const currentImage = visibleImages[activeIndex] ?? visibleImages[0];

  const objectPosition = `${focalX * 100}% ${focalY * 100}%`;

  if (visibleImages.length === 0) {
    return <div className="bg-secondary" style={{ aspectRatio }} />;
  }

  return (
    <div className="space-y-3">
      {/* Main image + zoom panel wrapper */}
      <div className="relative">
        {/* Main image */}
        <div
          className="relative bg-secondary overflow-hidden cursor-crosshair"
          style={{ aspectRatio }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={currentImage}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit, objectPosition }}
          />

          {/* Lens overlay — desktop only */}
          {mousePos && (
            <div
              className="absolute pointer-events-none hidden lg:block border border-foreground/20 bg-foreground/10"
              style={{ width: lensW, height: lensH, left: lensLeft, top: lensTop }}
            />
          )}
        </div>

        {/* Zoomed panel — appears to the right, desktop only */}
        {mousePos && (
          <div
            className="absolute top-0 z-40 hidden lg:block bg-white shadow-2xl border border-border overflow-hidden"
            style={{
              left: `calc(100% + 16px)`,
              width: ZOOM_PANEL_W,
              height: containerSize.h,
              backgroundImage: `url(${currentImage})`,
              backgroundSize: `${containerSize.w * ZOOM_FACTOR}px ${containerSize.h * ZOOM_FACTOR}px`,
              backgroundPosition: `${bgX}px ${bgY}px`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>

      {/* Thumbnails */}
      {visibleImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {visibleImages.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 h-20 overflow-hidden border-2 transition-all duration-200 ${i === activeIndex
                ? "border-foreground"
                : "border-transparent hover:border-muted-foreground"
                }`}
            >
              <Image
                src={img}
                alt={`${alt} view ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
