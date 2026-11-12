"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Save,
  CheckCircle,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  Globe,
  Share2,
  Video,
  Image as ImageIcon,
  Tag,
  HelpCircle,
  Layers,
  ArrowRight,
  ExternalLink,
  Upload,
  Crown,
  AlertCircle,
} from "lucide-react";

type CmsTab = "header" | "hero" | "promos" | "highlights" | "booking" | "steps" | "faqs" | "contact" | "footer";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = React.useState<CmsTab>("header");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const [content, setContent] = React.useState({
    // Module 1: Header & Announcement Bar
    header_announcement: "✨ Wedding Season Booking Open • Reserve Your Bridal Suite in Lalganj with Instant Advance Confirmation",
    header_tagline: "The Benchmark of Luxury Salon & Bridal Styling in Lalganj",
    header_cta_label: "Book Appointment",
    header_cta_link: "/booking",

    // Module 2: Hero Section
    hero_headline: "Discover Your Perfect Look.",
    hero_eyebrow: "The Jawed Habib Salon • Lalganj",
    hero_subtitle: "Experience professional hair styling, bespoke bridal artistry, and luxury haircare therapies at The Jawed Habib Salon, Lalganj.",
    hero_primary_cta: "Explore Bridal Packages",
    hero_primary_cta_link: "/booking",
    hero_secondary_cta: "View Transformations",
    hero_secondary_cta_link: "/transformations",

    // Module 3: Hero Video
    hero_video_url: "/brand/jawed-habib/hero-video.mp4",
    hero_video_autoplay: "true",
    hero_video_muted: "true",
    hero_video_loop: "true",

    // Module 4: Hero Poster Image
    hero_poster_image: "/images/hero/hero-bg.webp",

    // Module 5: Promotional Banners
    banner_active: "true",
    banner_headline: "Exclusive Wedding Season Offer",
    banner_subtext: "Book your complete bridal package and receive complimentary pre-bridal luxury glow facial",
    banner_discount: "20% OFF",
    banner_code: "JHBRIDAL2026",
    banner_cta_link: "/booking",

    // Module 6: Wedding Highlights
    wedding_highlights_title: "Crafted Exclusively for the Bihar Bride",
    wedding_highlights_desc: "From intricate morning Haldi ceremonies to grand Reception galas, our master artists curate custom hair, makeup, and draping looks tailored to your skin tone and bridal attire.",
    wedding_highlights_badge: "Wedding Season 2026",

    // Module 7: Booking CTA
    booking_cta_headline: "Reserve Your Exclusive Bridal Session Today",
    booking_cta_subtext: "Lock your appointment date with a small advance deposit and pay the remaining balance at our salon counter.",
    booking_cta_btn: "Reserve Appointment Slot",

    // Module 8: How It Works
    how_it_works_title: "Seamless 4-Step Bridal Booking Experience",
    how_it_works_step1: "Select Bridal Package",
    how_it_works_step2: "Pick Appointment Date & Time",
    how_it_works_step3: "Pay Advance Deposit Online",
    how_it_works_step4: "Visit Lalganj Salon & Glow",

    // Module 9: Contact Details & Social Links
    physical_address: "1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121",
    primary_phone: "7707000463",
    secondary_phone: "9831722983",
    tertiary_phone: "9580000175",
    whatsapp_number: "917707000463",
    contact_email: "support@jawedhabib-lalganj.com",
    opening_hours: "Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)",
    google_maps_url: "https://maps.app.goo.gl/TVx48xoWEu8dMvXT9",
    instagram_url: "https://www.instagram.com/the_jawedhabib_lalganj/",
    facebook_url: "https://www.facebook.com/jawedhabibsalon/",
    youtube_url: "https://www.youtube.com/@jawedhabib",

    // Module 11: Footer
    footer_content: "© 2026 The Jawed Habib Salon – Lalganj. All rights reserved. Premium Hair Styling, Keratin Treatments & Luxury Bridal Artistry in Vaishali, Bihar.",
    business_introduction: "The Jawed Habib Salon – Lalganj delivers an exceptional luxury grooming experience in the heart of Vaishali. Led by seasoned master stylists trained in Habib precision techniques, we combine international aesthetics with tailor-made haircare and skin therapies.",
  });

  React.useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/content");
        const json = await res.json();
        if (json.success && json.data) {
          setContent((prev) => ({ ...prev, ...json.data }));
        }
      } catch (e) {
        console.error("Failed to load content settings:", e);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Website content updated successfully and synced to live site!");
      } else {
        alert(json.error || "Failed to update content");
      }
    } catch (e: any) {
      alert(e.message || "Failed to save content");
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string, folder = "general") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setContent((prev) => ({ ...prev, [targetField]: json.data.url }));
        setFeedback(`Uploaded file saved to ${json.data.url}`);
      } else {
        alert(json.error || "Upload failed");
      }
    } catch (err: any) {
      alert(err.message || "Upload error");
    } finally {
      setUploading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const tabs: { id: CmsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "header", label: "1. Header & Announcement", icon: Globe },
    { id: "hero", label: "2. Hero & Video", icon: Sparkles },
    { id: "promos", label: "3. Promo Banners", icon: Tag },
    { id: "highlights", label: "4. Wedding Highlights", icon: Crown },
    { id: "booking", label: "5. Booking CTA", icon: ArrowRight },
    { id: "steps", label: "6. How It Works", icon: Layers },
    { id: "faqs", label: "7. Salon FAQs", icon: HelpCircle },
    { id: "contact", label: "8. Contact & Social", icon: Phone },
    { id: "footer", label: "9. Footer & Brand Copy", icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">CMS Control Hub</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">11 Dynamic Modules</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Dynamic Website Content Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage every public-facing section without code deployments. Changes reflect immediately across the entire salon platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Button
            onClick={() => handleSave()}
            disabled={saving}
            variant="gold"
            className="gap-2 shadow"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving All..." : "Publish All Changes"}</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-salon-gold/15 text-salon-goldLight border border-salon-gold/30 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-salon-gold" : "text-zinc-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading CMS content modules...
        </div>
      ) : (
        <div className="space-y-6 text-xs">
          {/* TAB 1: HEADER & ANNOUNCEMENT */}
          {activeTab === "header" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-salon-gold" />
                  <span>Module 1: Website Header &amp; Announcement Bar</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Top promotional alert ticker and primary navigation action button
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Top Announcement Bar Text *</label>
                <Input
                  value={content.header_announcement}
                  onChange={(e) => setContent({ ...content, header_announcement: e.target.value })}
                  placeholder="e.g. Wedding Season Booking Open • Reserve Your Bridal Suite..."
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Brand Tagline (Header Subtitle) *</label>
                <Input
                  value={content.header_tagline}
                  onChange={(e) => setContent({ ...content, header_tagline: e.target.value })}
                  placeholder="e.g. The Benchmark of Luxury Salon & Bridal Styling in Lalganj"
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Header CTA Button Text *</label>
                  <Input
                    value={content.header_cta_label}
                    onChange={(e) => setContent({ ...content, header_cta_label: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Header CTA Link Path *</label>
                  <Input
                    value={content.header_cta_link}
                    onChange={(e) => setContent({ ...content, header_cta_link: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO & VIDEO */}
          {activeTab === "hero" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-5">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-salon-gold" />
                  <span>Modules 2, 3 &amp; 4: Hero Showcase, Video Experience &amp; Poster</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  High-editorial headline, background video stream, and fallback poster image
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Hero Eyebrow Badge</label>
                  <Input
                    value={content.hero_eyebrow}
                    onChange={(e) => setContent({ ...content, hero_eyebrow: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-salon-gold font-medium"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Hero Main Headline *</label>
                  <Input
                    value={content.hero_headline}
                    onChange={(e) => setContent({ ...content, hero_headline: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-serif font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Hero Subtitle / Description *</label>
                <textarea
                  rows={3}
                  value={content.hero_subtitle}
                  onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 focus:outline-none"
                />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/60 pt-4">
                <div className="space-y-2">
                  <span className="font-semibold text-salon-gold block">Primary Action Button</span>
                  <Input
                    placeholder="Label (e.g. Explore Bridal Packages)"
                    value={content.hero_primary_cta}
                    onChange={(e) => setContent({ ...content, hero_primary_cta: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                  <Input
                    placeholder="Link (e.g. /booking)"
                    value={content.hero_primary_cta_link}
                    onChange={(e) => setContent({ ...content, hero_primary_cta_link: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-zinc-300"
                  />
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-zinc-300 block">Secondary Action Button</span>
                  <Input
                    placeholder="Label (e.g. View Transformations)"
                    value={content.hero_secondary_cta}
                    onChange={(e) => setContent({ ...content, hero_secondary_cta: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                  <Input
                    placeholder="Link (e.g. /transformations)"
                    value={content.hero_secondary_cta_link}
                    onChange={(e) => setContent({ ...content, hero_secondary_cta_link: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-zinc-300"
                  />
                </div>
              </div>

              {/* Hero Video & Poster Upload */}
              <div className="border-t border-zinc-800/60 pt-4 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Video className="h-4 w-4 text-salon-gold" />
                  <span>Hero Video &amp; Poster Image Stream</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Video URL */}
                  <div className="space-y-2">
                    <label className="block text-zinc-400 font-medium">Hero Video URL / Path (MP4/WEBM)</label>
                    <div className="flex gap-2">
                      <Input
                        value={content.hero_video_url}
                        onChange={(e) => setContent({ ...content, hero_video_url: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 font-mono text-white"
                      />
                      <label className="cursor-pointer shrink-0 px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "hero_video_url", "hero")}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Poster Image */}
                  <div className="space-y-2">
                    <label className="block text-zinc-400 font-medium">Hero Poster Image URL (Fallback)</label>
                    <div className="flex gap-2">
                      <Input
                        value={content.hero_poster_image}
                        onChange={(e) => setContent({ ...content, hero_poster_image: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 font-mono text-white"
                      />
                      <label className="cursor-pointer shrink-0 px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "hero_poster_image", "hero")}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-zinc-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.hero_video_autoplay === "true"}
                      onChange={(e) => setContent({ ...content, hero_video_autoplay: e.target.checked ? "true" : "false" })}
                      className="rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                    />
                    <span>Autoplay Video</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.hero_video_muted === "true"}
                      onChange={(e) => setContent({ ...content, hero_video_muted: e.target.checked ? "true" : "false" })}
                      className="rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                    />
                    <span>Mute Audio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.hero_video_loop === "true"}
                      onChange={(e) => setContent({ ...content, hero_video_loop: e.target.checked ? "true" : "false" })}
                      className="rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                    />
                    <span>Loop Continuously</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROMOTIONAL BANNERS */}
          {activeTab === "promos" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <Tag className="h-4 w-4 text-salon-gold" />
                    <span>Module 5: Promotional Banners &amp; Flash Sales</span>
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Highlight wedding discounts, seasonal offers, and coupon codes across the site
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-zinc-300 font-medium">Banner Active:</span>
                  <input
                    type="checkbox"
                    checked={content.banner_active === "true"}
                    onChange={(e) => setContent({ ...content, banner_active: e.target.checked ? "true" : "false" })}
                    className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Banner Headline *</label>
                  <Input
                    value={content.banner_headline}
                    onChange={(e) => setContent({ ...content, banner_headline: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Discount Badge Tag</label>
                  <Input
                    value={content.banner_discount}
                    onChange={(e) => setContent({ ...content, banner_discount: e.target.value })}
                    placeholder="e.g. 20% OFF or FLAT ₹500 OFF"
                    className="bg-zinc-900 border-zinc-800 text-salon-gold font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Banner Subtext / Terms</label>
                <textarea
                  rows={2}
                  value={content.banner_subtext}
                  onChange={(e) => setContent({ ...content, banner_subtext: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Coupon Promo Code</label>
                  <Input
                    value={content.banner_code}
                    onChange={(e) => setContent({ ...content, banner_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. JHBRIDAL2026"
                    className="bg-zinc-900 border-zinc-800 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Action Link URL</label>
                  <Input
                    value={content.banner_cta_link}
                    onChange={(e) => setContent({ ...content, banner_cta_link: e.target.value })}
                    placeholder="e.g. /booking"
                    className="bg-zinc-900 border-zinc-800 font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEDDING HIGHLIGHTS */}
          {activeTab === "highlights" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Crown className="h-4 w-4 text-salon-gold" />
                  <span>Module 6: Wedding Highlights Showcase</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Bespoke editorial spotlight tailored for brides in Lalganj and Vaishali
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Badge Text</label>
                  <Input
                    value={content.wedding_highlights_badge}
                    onChange={(e) => setContent({ ...content, wedding_highlights_badge: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-salon-gold font-medium"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Section Title *</label>
                  <Input
                    value={content.wedding_highlights_title}
                    onChange={(e) => setContent({ ...content, wedding_highlights_title: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white font-serif font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Editorial Description *</label>
                <textarea
                  rows={3}
                  value={content.wedding_highlights_desc}
                  onChange={(e) => setContent({ ...content, wedding_highlights_desc: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: BOOKING CTA */}
          {activeTab === "booking" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-salon-gold" />
                  <span>Module 7: Booking Call-To-Action (CTA) Section</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  High-conversion booking prompt displayed across key landing pages
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">CTA Headline *</label>
                <Input
                  value={content.booking_cta_headline}
                  onChange={(e) => setContent({ ...content, booking_cta_headline: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 font-serif font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">CTA Subtext / Trust Reassurance *</label>
                <textarea
                  rows={2}
                  value={content.booking_cta_subtext}
                  onChange={(e) => setContent({ ...content, booking_cta_subtext: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Button Label *</label>
                <Input
                  value={content.booking_cta_btn}
                  onChange={(e) => setContent({ ...content, booking_cta_btn: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 6: HOW IT WORKS */}
          {activeTab === "steps" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-salon-gold" />
                  <span>Module 8: How It Works (4 Simple Steps)</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Explain the dynamic online appointment &amp; advance deposit booking process
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Section Title *</label>
                <Input
                  value={content.how_it_works_title}
                  onChange={(e) => setContent({ ...content, how_it_works_title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 font-serif font-bold text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Step 1</label>
                  <Input
                    value={content.how_it_works_step1}
                    onChange={(e) => setContent({ ...content, how_it_works_step1: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Step 2</label>
                  <Input
                    value={content.how_it_works_step2}
                    onChange={(e) => setContent({ ...content, how_it_works_step2: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Step 3</label>
                  <Input
                    value={content.how_it_works_step3}
                    onChange={(e) => setContent({ ...content, how_it_works_step3: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Step 4</label>
                  <Input
                    value={content.how_it_works_step4}
                    onChange={(e) => setContent({ ...content, how_it_works_step4: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SALON FAQS */}
          {activeTab === "faqs" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-salon-gold" />
                    <span>Module 9: Frequently Asked Questions (FAQs)</span>
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Clear answers regarding advance payments, walk-ins, genuine products, and timings
                  </p>
                </div>

                <Link
                  href="/admin/faqs"
                  className="text-xs text-salon-gold hover:underline flex items-center gap-1"
                >
                  <span>Full FAQ Manager</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs space-y-1">
                  <span className="font-bold text-white">Q1: Where is The Jawed Habib Salon located in Lalganj?</span>
                  <p className="text-zinc-400">1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs space-y-1">
                  <span className="font-bold text-white">Q2: What are your operating hours?</span>
                  <p className="text-zinc-400">Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days of the week).</p>
                </div>
                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs space-y-1">
                  <span className="font-bold text-white">Q3: How does advance payment and remaining balance work?</span>
                  <p className="text-zinc-400">Customers pay a small advance deposit (e.g. ₹1,000 to ₹2,500) online via Razorpay to lock the slot, and pay the remaining balance at the salon counter after service completion.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CONTACT DETAILS & SOCIAL */}
          {activeTab === "contact" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Phone className="h-4 w-4 text-salon-gold" />
                  <span>Module 10: Permanent Contact Details &amp; Social Links</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Official Lalganj branch coordinates, telephone numbers, and map coordinates
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Primary Phone *</label>
                  <Input
                    required
                    value={content.primary_phone}
                    onChange={(e) => setContent({ ...content, primary_phone: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Secondary Phone</label>
                  <Input
                    value={content.secondary_phone}
                    onChange={(e) => setContent({ ...content, secondary_phone: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Tertiary Phone</label>
                  <Input
                    value={content.tertiary_phone}
                    onChange={(e) => setContent({ ...content, tertiary_phone: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">WhatsApp Booking Number *</label>
                  <Input
                    required
                    value={content.whatsapp_number}
                    onChange={(e) => setContent({ ...content, whatsapp_number: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Support Email Address</label>
                  <Input
                    type="email"
                    value={content.contact_email}
                    onChange={(e) => setContent({ ...content, contact_email: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Opening Hours *</label>
                  <Input
                    required
                    value={content.opening_hours}
                    onChange={(e) => setContent({ ...content, opening_hours: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Full Physical Address *</label>
                <Input
                  required
                  value={content.physical_address}
                  onChange={(e) => setContent({ ...content, physical_address: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Google Maps Location Link *</label>
                  <Input
                    value={content.google_maps_url}
                    onChange={(e) => setContent({ ...content, google_maps_url: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Official Instagram Link</label>
                  <Input
                    value={content.instagram_url}
                    onChange={(e) => setContent({ ...content, instagram_url: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Facebook Page Link</label>
                  <Input
                    value={content.facebook_url}
                    onChange={(e) => setContent({ ...content, facebook_url: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">YouTube Channel Link</label>
                  <Input
                    value={content.youtube_url}
                    onChange={(e) => setContent({ ...content, youtube_url: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono text-white text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FOOTER & BRAND COPY */}
          {activeTab === "footer" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-salon-gold" />
                  <span>Module 11: Footer &amp; Business Summary</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  About story and copyright disclaimer visible at the bottom of every page
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Business Introduction / About Summary *</label>
                <textarea
                  rows={4}
                  required
                  value={content.business_introduction}
                  onChange={(e) => setContent({ ...content, business_introduction: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Footer Copyright Disclaimer *</label>
                <Input
                  required
                  value={content.footer_content}
                  onChange={(e) => setContent({ ...content, footer_content: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              variant="gold"
              className="gap-2 shadow-lg px-6"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving All Changes..." : "Save & Publish All Modules"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
