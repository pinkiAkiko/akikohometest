"use client";

import { useState } from "react";
import { Mail, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: wire to an email API (Resend) or a form service
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent! We'll get back to you within 1 business day.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSubmitting(false);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-4">Contact</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            We are a small team and we read every message. Expect a reply within 1 business day.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-medium text-foreground mb-6">Contact Information</h2>
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center shrink-0 border border-border">
                    <Mail size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-1">Email</p>
                    <a href="mailto:support@akikohome.com" className="font-sans text-sm text-foreground hover:text-muted-foreground transition-colors">
                      support@akikohome.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center shrink-0 border border-border">
                    <Clock size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-1">Response Time</p>
                    <p className="font-sans text-sm text-foreground">Within 1 business day</p>
                    <p className="font-sans text-xs text-muted-foreground">Mon–Sat, 10 AM – 6 PM IST</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center shrink-0 border border-border">
                    <MapPin size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-luxury uppercase text-muted-foreground mb-1">Based in</p>
                    <p className="font-sans text-sm text-foreground">Mumbai, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-6 border border-border">
              <h3 className="font-sans text-sm font-semibold text-foreground mb-3">Common questions</h3>
              <ul className="space-y-2">
                {[
                  { label: "Order or shipping issue", href: "/faq#orders" },
                  { label: "Return or exchange", href: "/returns" },
                  { label: "Care instructions", href: "/care-guide" },
                  { label: "General FAQs", href: "/faq" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-sans text-xs tracking-luxury uppercase text-muted-foreground block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground rounded-md"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs tracking-luxury uppercase text-muted-foreground block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-border bg-background px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground rounded-md"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="font-sans text-xs tracking-luxury uppercase text-muted-foreground block mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground rounded-md"
                  placeholder="e.g. Order issue, Return request"
                />
              </div>
              <div>
                <label className="font-sans text-xs tracking-luxury uppercase text-muted-foreground block mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground rounded-md resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full font-sans text-sm tracking-luxury uppercase bg-foreground text-background py-3.5 hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
