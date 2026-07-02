"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Truck } from "lucide-react";

interface ProductAccordionProps {
  details: string[];
  careInstructions: string[];
  shippingPolicy?: string[];
}

const ProductAccordion = ({ details, careInstructions, shippingPolicy = [] }: ProductAccordionProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {details.length > 0 && (
        <AccordionItem value="details" className="border-border">
          <AccordionTrigger className="font-sans text-sm tracking-wide hover:no-underline text-foreground">
            Product Details
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {details.map((d, i) => (
                <li key={i} className="font-sans text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {careInstructions.length > 0 && (
        <AccordionItem value="care" className="border-border">
          <AccordionTrigger className="font-sans text-sm tracking-wide hover:no-underline text-foreground">
            Care Instructions
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {careInstructions.map((c, i) => (
                <li key={i} className="font-sans text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {shippingPolicy.length > 0 && (
        <AccordionItem value="shipping" className="border-border">
          <AccordionTrigger className="font-sans text-sm tracking-wide hover:no-underline text-foreground">
            Shipping &amp; Returns
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 font-sans text-sm text-muted-foreground">
              {shippingPolicy.map((line, i) => (
                i === 0 ? (
                  <div key={i} className="flex items-start gap-2">
                    <Truck size={14} className="mt-0.5 shrink-0" />
                    <p>{line}</p>
                  </div>
                ) : (
                  <p key={i}>{line}</p>
                )
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
};

export default ProductAccordion;
