export const metadata = {
  title: "Care Guide | Akiko Home",
  description: "How to wash and care for your Akiko Home towels, bathmats, and textiles to keep them soft and long-lasting.",
};

const cottonSteps = [
  { step: "01", title: "Wash before first use", body: "Wash your new towels 2–3 times before using them. This removes any manufacturing residue and helps the fibres open up for maximum softness and absorbency." },
  { step: "02", title: "Machine wash warm", body: "Use a gentle cycle at 40°C. Hot water can shrink fibres and weaken the weave over time. Cold water is fine for regular washes." },
  { step: "03", title: "Use mild detergent", body: "Use a mild, liquid detergent. Avoid powder detergents which can leave residue in the fibres. Use half the recommended amount — less is more with premium cotton." },
  { step: "04", title: "Skip the fabric softener", body: "Fabric softener coats cotton fibres and reduces absorbency. Instead, add ½ cup of white vinegar to the rinse cycle — it naturally softens fibres and removes detergent buildup." },
  { step: "05", title: "Tumble dry low or air dry", body: "If using a dryer, use a low heat setting. Over-drying causes fibres to become rough. Remove while slightly damp and shake out to fluff. Air drying in shade extends the life of your towels." },
  { step: "06", title: "Shake before folding", body: "Give each towel a firm shake after washing to lift the loops and restore fluffiness. Fold loosely — tight folding compresses the weave." },
];

const bambooSteps = [
  { step: "01", title: "Machine wash cold", body: "Bamboo fibres are more delicate than cotton. Always use cold water (30°C or below) and a gentle cycle to preserve the silky texture." },
  { step: "02", title: "Gentle detergent only", body: "Use a pH-neutral, gentle detergent. Avoid bleach, enzyme-based detergents, and fabric softeners — they break down bamboo fibres." },
  { step: "03", title: "Wash separately", body: "Wash bamboo towels separately from rough fabrics like denim or towels with zippers. Bamboo is prone to pilling if abraded during washing." },
  { step: "04", title: "Air dry in shade", body: "Lay flat or hang to air dry away from direct sunlight. UV exposure can weaken bamboo fibres and fade colours. If using a dryer, use the lowest heat setting." },
];

const tips = [
  { title: "Store loosely", body: "Store towels in a ventilated space. Avoid sealing them in plastic bags which traps moisture and can cause mildew." },
  { title: "Rotate your towels", body: "Using the same towels every day wears them out faster. Rotate between sets to extend their life." },
  { title: "Avoid bleach", body: "Bleach weakens cotton and bamboo fibres and fades colour. For stubborn stains, try an oxygen-based stain remover instead." },
  { title: "Wash towels every 3–4 uses", body: "Towels accumulate dead skin cells and bacteria. Washing every 3–4 uses keeps them hygienic and fresh-smelling." },
];

export default function CareGuidePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Care Guide</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground mb-4">
            How to care for your textiles
          </h1>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            A little care goes a long way. Follow these guidelines to keep your Akiko Home towels and bathmats
            soft, absorbent, and beautiful for years.
          </p>
        </div>
      </section>

      {/* Cotton Care */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-medium text-foreground mb-2">Cotton Towels & Bathmats</h2>
          <p className="font-sans text-sm text-muted-foreground mb-10">
            Applies to: Classic Bath Towels, Hand Towels, Face Towels, Bath Mats
          </p>
          <div className="space-y-6">
            {cottonSteps.map(({ step, title, body }) => (
              <div key={step} className="flex gap-6 items-start border-b border-border pb-6 last:border-0 last:pb-0">
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

      {/* Bamboo Care */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-medium text-foreground mb-2">Bamboo Textiles</h2>
          <p className="font-sans text-sm text-muted-foreground mb-10">
            Applies to: Bamboo Collection towels and accessories
          </p>
          <div className="space-y-6">
            {bambooSteps.map(({ step, title, body }) => (
              <div key={step} className="flex gap-6 items-start border-b border-border pb-6 last:border-0 last:pb-0">
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

      {/* General Tips */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-medium text-foreground mb-10">General Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tips.map(({ title, body }) => (
              <div key={title} className="bg-secondary rounded-lg p-6 border border-border">
                <h3 className="font-sans text-sm font-semibold text-foreground mb-2">{title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
