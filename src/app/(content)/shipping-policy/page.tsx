export const metadata = {
  title: "Shipping Policy | Akiko Home",
  description: "Delivery timelines, shipping charges, and serviceable areas for Akiko Home orders.",
};

const sections = [
  {
    title: "Shipping Charges",
    body: [
      "Free shipping on all orders above ₹999.",
      "A flat shipping charge of ₹79 applies to orders below ₹999.",
      "No hidden charges. What you see at checkout is what you pay.",
    ],
  },
  {
    title: "Delivery Timelines",
    body: [
      "Standard delivery: 5–7 business days from the date of dispatch.",
      "Metro cities (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata, Pune): typically 3–5 business days.",
      "Remote areas and Tier-3 cities may take up to 10 business days.",
      "Orders placed before 12 PM IST on business days are dispatched the same day. Orders placed after 12 PM are dispatched the next business day.",
    ],
  },
  {
    title: "Order Tracking",
    body: [
      "Once your order is dispatched, you will receive a shipping confirmation email with a tracking link.",
      "You can also track your order from My Account → Orders if you have an account with us.",
      "If you have not received a tracking update within 3 business days of placing your order, please contact us at support@akikohome.com.",
    ],
  },
  {
    title: "Serviceable Areas",
    body: [
      "We currently ship to all serviceable pin codes across India.",
      "If your pin code is not serviceable at checkout, please contact us — we will try to find an alternative courier.",
      "We do not ship outside India at this time. International shipping is planned for a future phase.",
    ],
  },
  {
    title: "Delayed or Lost Shipments",
    body: [
      "If your order has not arrived within the estimated delivery window, please email us at support@akikohome.com with your order number.",
      "In the rare case of a lost shipment confirmed by the courier, we will reship your order or issue a full refund — your choice.",
    ],
  },
  {
    title: "Undelivered Orders",
    body: [
      "If a delivery attempt is made and you are unavailable, the courier will make up to 2 more attempts.",
      "After 3 failed attempts, the package will be returned to our warehouse. We will contact you to reschedule delivery. A re-shipping charge may apply.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Shipping</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Shipping Policy
          </h1>
          <p className="font-sans text-base text-muted-foreground">
            Last updated: April 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
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

          <div className="border-t border-border pt-8">
            <p className="font-sans text-sm text-muted-foreground">
              Questions? Email us at{" "}
              <a href="mailto:support@akikohome.com" className="underline hover:text-foreground transition-colors">
                support@akikohome.com
              </a>{" "}
              or visit our{" "}
              <a href="/contact" className="underline hover:text-foreground transition-colors">
                Contact page
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
