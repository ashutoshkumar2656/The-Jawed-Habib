"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { HelpCircle, Phone, Calendar } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";
import { getFaqPageJsonLd, JsonLdScript } from "@/components/seo/structured-data";

interface DynamicFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function FAQPage() {
  const [faqs, setFaqs] = React.useState<DynamicFaq[]>([]);
  const [categories, setCategories] = React.useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadFaqs() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/faqs");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setFaqs(data.data);
          const uniqueCats = Array.from(new Set(data.data.map((f: DynamicFaq) => f.category))).filter(Boolean) as string[];
          if (uniqueCats.length > 1) {
            setCategories(["All", ...uniqueCats]);
          }
        }
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFaqs = React.useMemo(() => {
    if (activeCategory === "All") return faqs;
    return faqs.filter((f) => f.category.toLowerCase() === activeCategory.toLowerCase());
  }, [faqs, activeCategory]);

  const accordionItems = React.useMemo(() => {
    return filteredFaqs.map((f) => ({
      id: f.id,
      title: f.question,
      content: f.answer,
    }));
  }, [filteredFaqs]);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Frequently Asked Questions" }]} />

        {/* 1. Header Banner */}
        <div className="text-center space-y-4">
          <Badge variant="gold">Client Help &amp; Guidance</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Frequently Asked Questions | Salon &amp; Bridal Guide Lalganj
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light max-w-2xl mx-auto">
            Everything you need to know about visiting The Jawed Habib Salon at 1st Floor, Tinpulwa Chowk, Lalganj, Vaishali.
          </p>
        </div>

        {/* Structured Data FAQPage */}
        {filteredFaqs.length > 0 && (
          <JsonLdScript
            data={getFaqPageJsonLd(
              filteredFaqs.map((f) => ({ question: f.question, answer: f.answer }))
            )}
          />
        )}

        {/* 2. Category Filter Tabs if multiple exist */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-800 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-salon-gold text-black shadow"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 3. Accordion Container */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-zinc-800 bg-zinc-950 animate-pulse"
              />
            ))}
          </div>
        ) : accordionItems.length === 0 ? (
          <div className="text-center py-16 luxury-card rounded-2xl border border-zinc-800 p-8 space-y-3">
            <HelpCircle className="h-12 w-12 text-zinc-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-white">No questions in this section</h3>
            <p className="text-xs text-zinc-400">
              Please choose another category or contact our salon desk directly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Accordion items={accordionItems} allowMultiple={false} />
          </div>
        )}

        {/* 4. Direct Contact Assistance Box */}
        <div className="rounded-2xl border border-salon-gold/30 bg-zinc-950/80 p-8 text-center space-y-4">
          <HelpCircle className="h-8 w-8 text-salon-gold mx-auto" />
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Have a question that isn&apos;t answered here?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto font-light leading-relaxed">
            Our salon hospitality desk at Tinpulwa Chowk is available 7 days a week from 10:00 AM to 10:00 PM to help with custom styling advice, bridal consultations, or service questions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={`tel:${BRAND_CONFIG.contact.primaryPhone}`}
              className={cn(buttonVariants({ variant: "gold" }), "gap-2 text-xs")}
            >
              <Phone className="h-4 w-4" />
              <span>Call {BRAND_CONFIG.contact.primaryPhone}</span>
            </a>
            <Link
              href="/booking"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2 text-xs")}
            >
              <Calendar className="h-4 w-4 text-salon-gold" />
              <span>Book Appointment Online</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
