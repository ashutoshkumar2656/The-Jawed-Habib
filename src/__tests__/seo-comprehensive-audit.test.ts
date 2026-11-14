import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import manifest from "@/app/manifest";
import {
  getLocalBusinessJsonLd,
  getWebsiteJsonLd,
  getBreadcrumbJsonLd,
  getFaqPageJsonLd,
} from "@/components/seo/structured-data";
import { metadata as rootMetadata } from "@/app/layout";
import { metadata as servicesMetadata } from "@/app/(public)/services/layout";
import { metadata as bridalMetadata } from "@/app/(public)/bridal/layout";
import { metadata as packagesMetadata } from "@/app/(public)/packages/layout";
import { metadata as contactMetadata } from "@/app/(public)/contact/layout";
import { metadata as reviewsMetadata } from "@/app/(public)/reviews/layout";
import { metadata as transformationsMetadata } from "@/app/(public)/transformations/layout";
import { metadata as galleryMetadata } from "@/app/(public)/gallery/layout";
import { metadata as pricingMetadata } from "@/app/(public)/pricing/layout";
import { metadata as faqMetadata } from "@/app/(public)/faq/layout";
import { metadata as bookingMetadata } from "@/app/(public)/booking/layout";
import { metadata as teamMetadata } from "@/app/(public)/team/layout";
import { metadata as stylistsMetadata } from "@/app/(public)/stylists/layout";
import { metadata as adminMetadata } from "@/app/admin/layout";
import { metadata as authMetadata } from "@/app/(auth)/layout";
import { BRAND_CONFIG } from "@/lib/constants/brand";

describe("Complete Technical, Local & On-Page SEO Verification Suite", () => {
  const CANONICAL_DOMAIN = "https://www.thejawedhabibsalons.in";

  // ==========================================================================
  // 1. Robots.txt Directives
  // ==========================================================================
  describe("1. Robots.txt Crawler Directives", () => {
    it("allows public crawling while strictly preventing crawling of admin, auth, and private routes", () => {
      const robotsConfig = robots();
      expect(robotsConfig).toBeDefined();

      const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
      expect(rules.userAgent).toBe("*");
      expect(rules.allow).toBe("/");

      const disallowed = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
      expect(disallowed).toContain("/admin");
      expect(disallowed).toContain("/admin/*");
      expect(disallowed).toContain("/api/*");
      expect(disallowed).toContain("/login");
      expect(disallowed).toContain("/register");
      expect(disallowed).toContain("/forgot-password");

      expect(robotsConfig.sitemap).toBe(`${CANONICAL_DOMAIN}/sitemap.xml`);
    });
  });

  // ==========================================================================
  // 2. XML Sitemap Generation
  // ==========================================================================
  describe("2. XML Sitemap Generation & Route Coverage", () => {
    it("generates valid sitemap entries with canonical domain for all public pages", () => {
      const sitemapEntries = sitemap();
      expect(Array.isArray(sitemapEntries)).toBe(true);
      expect(sitemapEntries.length).toBeGreaterThanOrEqual(15);

      const urls = sitemapEntries.map((e) => e.url);

      // Verify essential public commercial and content pages are included
      expect(urls).toContain(CANONICAL_DOMAIN);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/bridal`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/services`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/packages`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/pricing`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/booking`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/transformations`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/gallery`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/reviews`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/offers`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/contact`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/about`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/faq`);
      expect(urls).toContain(`${CANONICAL_DOMAIN}/team`);

      // Verify no admin, auth, or internal API pages leaked into sitemap
      for (const url of urls) {
        expect(url).not.toContain("/admin");
        expect(url).not.toContain("/api/");
        expect(url).not.toContain("/login");
        expect(url).not.toContain("/register");
        expect(url).not.toContain("localhost");
      }

      // Verify priorities and change frequencies
      const homepageEntry = sitemapEntries.find((e) => e.url === CANONICAL_DOMAIN);
      expect(homepageEntry?.priority).toBe(1.0);
      expect(homepageEntry?.changeFrequency).toBe("daily");

      const bridalEntry = sitemapEntries.find((e) => e.url === `${CANONICAL_DOMAIN}/bridal`);
      expect(bridalEntry?.priority).toBe(1.0);
    });
  });

  // ==========================================================================
  // 3. Local Business Schema.org JSON-LD Structured Data
  // ==========================================================================
  describe("3. LocalBusiness & HairSalon Structured Data", () => {
    it("produces compliant HairSalon JSON-LD with verified salon ground truth facts", () => {
      const jsonLd = getLocalBusinessJsonLd();

      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toContain("HairSalon");
      expect(jsonLd["@id"]).toBe(`${CANONICAL_DOMAIN}/#salon`);
      expect(jsonLd.name).toBe("The Jawed Habib Salon – Lalganj");
      expect(jsonLd.url).toBe(CANONICAL_DOMAIN);
      expect(jsonLd.telephone).toBe("+917707000463");
      expect(jsonLd.currenciesAccepted).toBe("INR");
      expect(jsonLd.hasMap).toBe(BRAND_CONFIG.location.googleMapsUrl);

      // Address verification
      expect(jsonLd.address["@type"]).toBe("PostalAddress");
      expect(jsonLd.address.streetAddress).toContain("1st Floor, Tinpulwa Chowk");
      expect(jsonLd.address.addressLocality).toBe("Lalganj");
      expect(jsonLd.address.addressRegion).toBe("Bihar");
      expect(jsonLd.address.postalCode).toBe("844121");
      expect(jsonLd.address.addressCountry).toBe("IN");

      // Geo coordinates verification
      expect(jsonLd.geo["@type"]).toBe("GeoCoordinates");
      expect(jsonLd.geo.latitude).toBe(25.8675);
      expect(jsonLd.geo.longitude).toBe(85.1764);

      // Operating hours verification: 7 days, 10:00 to 22:00
      expect(Array.isArray(jsonLd.openingHoursSpecification)).toBe(true);
      const hours = jsonLd.openingHoursSpecification[0];
      expect(hours.opens).toBe("10:00");
      expect(hours.closes).toBe("22:00");
      expect(hours.dayOfWeek.length).toBe(7);

      // Social and Maps profiles
      expect(jsonLd.sameAs).toContain("https://www.instagram.com/the_jawedhabib_lalganj/");
      expect(jsonLd.sameAs).toContain(BRAND_CONFIG.location.googleMapsUrl);
    });

    it("produces valid WebSite, BreadcrumbList, and FAQPage schemas", () => {
      // WebSite Schema
      const websiteSchema = getWebsiteJsonLd();
      expect(websiteSchema["@type"]).toBe("WebSite");
      expect(websiteSchema.url).toBe(CANONICAL_DOMAIN);

      // BreadcrumbList Schema
      const breadcrumbs = getBreadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Bridal", url: "/bridal" },
      ]);
      expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
      expect(breadcrumbs.itemListElement.length).toBe(2);
      expect(breadcrumbs.itemListElement[0].position).toBe(1);
      expect(breadcrumbs.itemListElement[1].item).toBe(`${CANONICAL_DOMAIN}/bridal`);

      // FAQPage Schema
      const faqs = getFaqPageJsonLd([
        {
          question: "Where is The Jawed Habib Salon located in Lalganj?",
          answer: "We are located at 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar 844121.",
        },
      ]);
      expect(faqs["@type"]).toBe("FAQPage");
      expect(faqs.mainEntity.length).toBe(1);
      expect(faqs.mainEntity[0].name).toContain("Where is The Jawed Habib Salon located");
      expect(faqs.mainEntity[0].acceptedAnswer.text).toContain("Tinpulwa Chowk");
    });
  });

  // ==========================================================================
  // 4. Page Titles, Meta Descriptions & Canonical URLs
  // ==========================================================================
  describe("4. Page Metadata & Self-Referencing Canonical URLs", () => {
    it("verifies root layout metadata defines proper defaults and metadataBase", () => {
      expect(rootMetadata.metadataBase?.toString()).toContain(CANONICAL_DOMAIN);
      expect(rootMetadata.description).toContain("Lalganj, Vaishali");
      expect(rootMetadata.openGraph?.url).toBe(CANONICAL_DOMAIN);
    });

    it("verifies Bridal Services has unique title, description, and canonical /bridal", () => {
      expect(bridalMetadata.title).toContain("Bridal Makeup in Lalganj, Vaishali");
      expect(bridalMetadata.description).toContain("HD & Airbrush bridal makeup in Lalganj");
      expect(bridalMetadata.alternates?.canonical).toBe("/bridal");
    });

    it("verifies Services Page has unique title and canonical /services", () => {
      expect(servicesMetadata.title).toContain("Haircuts, Hair Spa, Keratin & Beauty Services in Lalganj");
      expect(servicesMetadata.description).toContain("certified master haircuts");
      expect(servicesMetadata.alternates?.canonical).toBe("/services");
    });

    it("verifies Packages Page has unique title and canonical /packages", () => {
      expect(packagesMetadata.title).toContain("Salon Packages, Pre-Bridal & Grooming Bundles in Lalganj");
      expect(packagesMetadata.alternates?.canonical).toBe("/packages");
    });

    it("verifies Contact Page has unique title and canonical /contact", () => {
      expect(contactMetadata.title).toContain("Contact The Jawed Habib Salon Lalganj");
      expect(contactMetadata.description).toContain("1st Floor, Tinpulwa Chowk");
      expect(contactMetadata.alternates?.canonical).toBe("/contact");
    });

    it("verifies Reviews Page has unique title and canonical /reviews", () => {
      expect(reviewsMetadata.title).toContain("Customer Reviews & Client Testimonials");
      expect(reviewsMetadata.alternates?.canonical).toBe("/reviews");
    });

    it("verifies Transformations Page has unique title and canonical /transformations", () => {
      expect(transformationsMetadata.title).toContain("Before & After Hair Styling & Bridal Makeover Transformations");
      expect(transformationsMetadata.alternates?.canonical).toBe("/transformations");
    });

    it("verifies Gallery Page has unique title and canonical /gallery", () => {
      expect(galleryMetadata.title).toContain("Salon Interior, Styling Lounge & Work Gallery");
      expect(galleryMetadata.alternates?.canonical).toBe("/gallery");
    });

    it("verifies Pricing Page has unique title and canonical /pricing", () => {
      expect(pricingMetadata.title).toContain("Salon Price List & Service Rate Card in Lalganj");
      expect(pricingMetadata.alternates?.canonical).toBe("/pricing");
    });

    it("verifies FAQ Page has unique title and canonical /faq", () => {
      expect(faqMetadata.title).toContain("Salon FAQs & Appointment Guide");
      expect(faqMetadata.alternates?.canonical).toBe("/faq");
    });

    it("verifies Booking Page has unique title and canonical /booking", () => {
      expect(bookingMetadata.title).toContain("Book Salon Appointment & Bridal Suite Online");
      expect(bookingMetadata.alternates?.canonical).toBe("/booking");
    });

    it("verifies Team Page has unique title and canonical /team", () => {
      expect(teamMetadata.title).toContain("Master Hair Stylists & Certified Colorists");
      expect(teamMetadata.alternates?.canonical).toBe("/team");
    });

    it("verifies Stylists Page points canonical to /team to avoid duplicate content", () => {
      expect(stylistsMetadata.alternates?.canonical).toBe("/team");
    });
  });

  // ==========================================================================
  // 5. Indexing Protection for Admin and Auth Routes
  // ==========================================================================
  describe("5. Indexing Protection for Sensitive & Private Routes", () => {
    it("enforces noindex and nofollow on Admin routes", () => {
      const robotsMeta = adminMetadata.robots as any;
      expect(robotsMeta).toBeDefined();
      expect(robotsMeta.index).toBe(false);
      expect(robotsMeta.follow).toBe(false);
      expect(robotsMeta.googleBot?.index).toBe(false);
      expect(robotsMeta.googleBot?.follow).toBe(false);
    });

    it("enforces noindex and nofollow on Authentication routes", () => {
      const robotsMeta = authMetadata.robots as any;
      expect(robotsMeta).toBeDefined();
      expect(robotsMeta.index).toBe(false);
      expect(robotsMeta.follow).toBe(false);
      expect(robotsMeta.googleBot?.index).toBe(false);
    });
  });

  // ==========================================================================
  // 6. Web Manifest & Mobile Search Experience
  // ==========================================================================
  describe("6. PWA Web App Manifest", () => {
    it("generates valid web manifest for mobile searchers and PWA installation", () => {
      const appManifest = manifest();
      expect(appManifest.name).toBe("The Jawed Habib Salon – Lalganj");
      expect(appManifest.short_name).toBe("Jawed Habib Lalganj");
      expect(appManifest.theme_color).toBe("#C6A56B");
      expect(appManifest.background_color).toBe("#111111");
      expect(appManifest.icons?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
