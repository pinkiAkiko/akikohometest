import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "FAQs | Akiko Home",
  description: "Answers to common questions about Akiko Home products, orders, shipping, and returns.",
};

const faqs = [
  {
    category: "Products",
    items: [
      {
        q: "What materials do you use?",
        a: "We use premium long-staple combed cotton and bamboo blends. Long-staple cotton produces stronger, smoother fibres that get softer with every wash. Our bamboo blends add natural antibacterial properties and a silky feel.",
      },
      {
        q: "What does GSM mean and why does it matter?",
        a: "GSM (grams per square metre) measures the density and weight of a towel. Higher GSM (500–600) means a thicker, more absorbent towel. Our Classic range is 500 GSM — the sweet spot between plush softness and quick drying.",
      },
      {
        q: "Will the towels get softer over time?",
        a: "Yes. Premium long-staple cotton opens up with washing. We recommend washing your towels 2–3 times before first use. Avoid fabric softener — it coats the fibres and reduces absorbency over time.",
      },
      {
        q: "Are your products safe for sensitive skin?",
        a: "All our products are free from harsh chemicals and azo dyes. Our bamboo range is particularly suited for sensitive or baby skin due to its natural hypoallergenic properties.",
      },
    ],
  },
  {
    category: "Orders & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We currently accept Cash on Delivery (COD). Online payment via UPI, cards, and net banking is coming soon.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be cancelled within 2 hours of placement by contacting us at support@akikohome.com. Once dispatched, cancellations are not possible but you can initiate a return after delivery.",
      },
      {
        q: "How will I know my order was placed successfully?",
        a: "You will receive a confirmation email at the address you provided at checkout. If you have an account, you can also view your order under My Orders.",
      },
    ],
  },
  {
    category: "Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 5–7 business days across India. We are working on express delivery options — check the shipping policy page for the latest.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes — free shipping on all orders above ₹999. A flat ₹79 shipping charge applies to orders below ₹999.",
      },
      {
        q: "Do you ship outside India?",
        a: "Not yet. We currently ship only within India. International shipping is planned for a future phase.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 30 days of delivery. Items must be unused, unwashed, and in original packaging. See our Returns page for the full process.",
      },
      {
        q: "How do I initiate a return?",
        a: "Email us at support@akikohome.com with your order number and reason for return. We will arrange a pickup and process your refund within 5–7 business days of receiving the item.",
      },
      {
        q: "What if I receive a damaged or wrong item?",
        a: "We sincerely apologise. Email us at support@akikohome.com with a photo of the item and your order number. We will replace it or issue a full refund — no questions asked.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Help Centre</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-base text-muted-foreground">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href="/contact" className="underline hover:text-foreground transition-colors">
              Contact us
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          {faqs.map(({ category, items }) => (
            <div key={category}>
              <h2 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-6">
                {category}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {items.map(({ q, a }) => (
                  <AccordionItem key={q} value={q} className="border border-border rounded-md px-5">
                    <AccordionTrigger className="font-sans text-sm font-medium text-foreground text-left hover:no-underline py-4">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed pb-4">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
