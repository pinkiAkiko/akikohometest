export const metadata = {
  title: "Terms of Service | Akiko Home",
  description: "Terms and conditions for purchasing from and using the Akiko Home website.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    body: [
      "By accessing or purchasing from akikohome.com, you agree to be bound by these Terms of Service.",
      "If you do not agree to these terms, please do not use our website or services.",
      "We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of the revised terms.",
    ],
  },
  {
    title: "Products & Pricing",
    body: [
      "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.",
      "We reserve the right to change prices at any time. The price at the time of your order is the price you pay.",
      "Product images are for illustrative purposes. Actual colours may vary slightly due to photography and screen settings.",
      "We reserve the right to limit quantities or discontinue products without notice.",
    ],
  },
  {
    title: "Orders",
    body: [
      "Placing an order constitutes an offer to purchase. An order is confirmed only when you receive an order confirmation email from us.",
      "We reserve the right to cancel any order for reasons including but not limited to: product unavailability, pricing errors, or suspected fraud.",
      "If we cancel your order, you will receive a full refund within 5–7 business days.",
    ],
  },
  {
    title: "Payment",
    body: [
      "We currently accept Cash on Delivery (COD). You are responsible for having the exact amount available at the time of delivery.",
      "Refusing delivery after dispatch without a valid reason may result in your ability to place future COD orders being restricted.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "All content on this website — including text, images, logos, and design — is the property of Akiko Home and protected by copyright.",
      "You may not reproduce, distribute, or use any content from this site without prior written permission.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "Akiko Home's liability is limited to the value of the order placed. We are not liable for indirect, incidental, or consequential damages.",
      "We are not responsible for delays or failures caused by events beyond our control (force majeure), including natural disasters, strikes, or courier failures.",
    ],
  },
  {
    title: "Governing Law",
    body: [
      "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For any questions regarding these terms, email us at legal@akikohome.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Legal</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="font-sans text-base text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      {/* Intro */}
      <section className="pt-16 pb-0">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            These Terms of Service govern your use of the Akiko Home website (akikohome.com) and the purchase
            of products from us. Please read them carefully before placing an order.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          {sections.map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-serif text-2xl font-medium text-foreground mb-4">{title}</h2>
              <ul className="space-y-3">
                {body.map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-sans text-muted-foreground mt-1 shrink-0">—</span>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">{line}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
