import { Leaf, Heart, Shield, Sparkles } from "lucide-react";

export const metadata = {
  title: "Our Story | Akiko Home",
  description: "Premium home textiles born from a love of softness and craft. Learn about Akiko Home's journey, values, and commitment to quality.",
};

const values = [
  {
    icon: Leaf,
    title: "Sustainably Minded",
    description:
      "We source natural fibres responsibly and work with manufacturers who share our commitment to reducing environmental impact — from farm to finished product.",
  },
  {
    icon: Sparkles,
    title: "Uncompromising Quality",
    description:
      "Every towel, bathmat, and gifting set is made from carefully selected long-staple cotton and bamboo blends, woven for lasting softness and durability.",
  },
  {
    icon: Heart,
    title: "Designed for Everyday Life",
    description:
      "We believe luxury shouldn't live in a drawer. Our textiles are made to be used every day — soft enough for the first wash, beautiful enough to keep forever.",
  },
  {
    icon: Shield,
    title: "Honest Pricing",
    description:
      "By selling directly to you, we cut out middlemen and retail markups. You get premium-quality textiles at prices that reflect the product, not the packaging.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Our Story</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-6">
            Softness you can feel,<br />quality you can trust.
          </h1>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            Akiko Home was founded with a single belief: that the everyday rituals of bathing and resting deserve
            better than compromise. We set out to bring the kind of quiet luxury that premium hotels offer —
            into Indian homes, at honest prices.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-6 font-sans text-base text-muted-foreground leading-relaxed">
          <p>
            We started small — sourcing our first bath towels from a weaving cluster in Gujarat, obsessing over
            GSM counts, thread densities, and loop structures that most people never think about. We washed each
            sample dozens of times before we were satisfied. That rigor became our standard.
          </p>
          <p>
            Today, Akiko Home offers a carefully curated range of bath towels, hand towels, face towels, bath mats,
            and gifting sets — all crafted from premium long-staple cotton and bamboo blends. Each product is
            designed to improve with every wash, developing a softness that mass-market alternatives simply cannot match.
          </p>
          <p>
            We sell directly to you — no retail markups, no middlemen. Every rupee you spend goes toward better
            materials, better manufacturing, and a better experience for you.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-medium text-foreground">What we stand for</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-background rounded-lg p-8 border border-border">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Icon size={18} className="text-foreground" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-3">{title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl font-medium text-foreground mb-6">The Akiko Promise</h2>
          <p className="font-sans text-base text-muted-foreground leading-relaxed mb-8">
            If you are ever unhappy with a product — for any reason — we will make it right. That is not a
            policy statement. It is how we think about our relationship with you.
          </p>
          <a
            href="/contact"
            className="inline-block font-sans text-sm tracking-luxury uppercase border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </>
  );
}
