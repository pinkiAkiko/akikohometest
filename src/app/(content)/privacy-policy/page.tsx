export const metadata = {
  title: "Privacy Policy | Akiko Home",
  description: "How Akiko Home collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "Name, email address, phone number, and shipping/billing address when you place an order or create an account.",
      "Payment information: We do not store card or UPI details. Payment is processed securely through our payment provider.",
      "Order history and browsing behaviour on our website (pages visited, products viewed, cart contents).",
      "Device and browser information for analytics and fraud prevention (IP address, browser type, operating system).",
      "Communications you send us via email or our contact form.",
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "To process and fulfil your orders, including sending order confirmations and shipping updates.",
      "To manage your account and provide customer support.",
      "To send transactional emails (order confirmation, password reset). We will only send marketing emails if you have opted in.",
      "To improve our website and product offerings using aggregated, anonymised analytics data.",
      "To detect and prevent fraud.",
    ],
  },
  {
    title: "Sharing Your Information",
    body: [
      "We do not sell your personal data to third parties.",
      "We share data with trusted service providers who help us operate our business: courier partners (for delivery), email service providers (for transactional emails), and payment processors.",
      "All third-party partners are contractually required to handle your data securely and only for the purpose stated.",
      "We may disclose information if required by law or to protect the rights and safety of Akiko Home and its customers.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "We use essential cookies to keep your cart and session active. These cannot be disabled.",
      "We use analytics cookies (Google Analytics) to understand how visitors use our site. You can opt out via your browser settings.",
      "We do not use advertising or tracking cookies at this time.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We retain order and account data for 3 years for legal and accounting purposes.",
      "If you request account deletion, we will remove your personal data within 30 days, retaining only what is required by law.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "You have the right to access the personal data we hold about you.",
      "You can request correction of inaccurate data or deletion of your account.",
      "You can opt out of marketing emails at any time via the unsubscribe link in any email or by contacting us.",
      "To exercise any of these rights, email us at privacy@akikohome.com.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use HTTPS encryption for all data in transit.",
      "Access to customer data is restricted to authorised personnel only.",
      "While we take all reasonable precautions, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "We may update this policy from time to time. The date at the top of this page reflects when it was last revised.",
      "We will notify registered customers of material changes via email.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Legal</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="font-sans text-base text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      {/* Intro */}
      <section className="pt-16 pb-0">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            Akiko Home (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains what
            personal data we collect, why we collect it, and how we use it when you visit{" "}
            <span className="text-foreground">akikohome.com</span> or purchase from us.
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

          <div className="border-t border-border pt-8">
            <p className="font-sans text-sm text-muted-foreground">
              Questions about this policy? Email{" "}
              <a href="mailto:privacy@akikohome.com" className="underline hover:text-foreground transition-colors">
                privacy@akikohome.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
