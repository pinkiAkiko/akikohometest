export const metadata = {
  title: "Returns & Exchanges | Akiko Home",
  description: "Akiko Home's return and exchange policy. Easy 30-day returns for unused items.",
};

const steps = [
  { step: "01", title: "Email us", body: 'Send an email to support@akikohome.com with your order number, the item(s) you wish to return, and the reason. We aim to respond within 1 business day.' },
  { step: "02", title: "We arrange pickup", body: "Once your return request is approved, we will arrange a courier pickup from your address at no cost to you (for orders above ₹999). For smaller orders, a ₹79 return shipping charge may apply." },
  { step: "03", title: "Item inspection", body: "Once we receive the item, we inspect it to confirm it is unused, unwashed, and in original condition. This typically takes 1–2 business days." },
  { step: "04", title: "Refund or exchange", body: "Refunds are processed to the original payment method within 5–7 business days. For COD orders, refunds are via bank transfer — please share your account details when raising the request. Exchanges are dispatched within 2 business days of receiving the original item." },
];

const eligible = [
  "Items returned within 30 days of delivery",
  "Unused and unwashed — no signs of use",
  "Original packaging intact (tags attached, original bag/box)",
  "Accompanied by order number or proof of purchase",
];

const notEligible = [
  "Items that have been washed, used, or altered",
  "Items returned after 30 days",
  "Sale or clearance items (marked final sale at checkout)",
  "Customised or personalised gifting sets",
];

export default function ReturnsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Returns</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Returns & Exchanges
          </h1>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            Not happy with your order? We will make it right. Easy 30-day returns, no hassle.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-medium text-foreground mb-10">What can be returned?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary rounded-lg p-6 border border-border">
              <h3 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Eligible for Return</h3>
              <ul className="space-y-3">
                {eligible.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-accent-foreground mt-0.5 shrink-0">✓</span>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-background rounded-lg p-6 border border-border">
              <h3 className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Not Eligible</h3>
              <ul className="space-y-3">
                {notEligible.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-muted-foreground mt-0.5 shrink-0">✕</span>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-medium text-foreground mb-10">How to return</h2>
          <div className="space-y-6">
            {steps.map(({ step, title, body }) => (
              <div key={step} className="flex gap-6 items-start bg-background rounded-lg p-6 border border-border">
                <span className="font-serif text-3xl font-medium text-muted-foreground/40 leading-none shrink-0 w-10">
                  {step}
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-foreground mb-1">{title}</h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Damaged / Wrong Items */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-medium text-foreground mb-4">Received a damaged or wrong item?</h2>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
            We sincerely apologise. Email us at{" "}
            <a href="mailto:support@akikohome.com" className="underline hover:text-foreground transition-colors">
              support@akikohome.com
            </a>{" "}
            with a photo of the item and your order number. We will send a replacement or issue a full refund
            immediately — no questions asked, no return required.
          </p>
          <a
            href="/contact"
            className="inline-block font-sans text-sm tracking-luxury uppercase border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            Contact Support
          </a>
        </div>
      </section>
    </>
  );
}
