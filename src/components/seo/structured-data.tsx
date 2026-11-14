import React from "react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

const CANONICAL_BASE = "https://www.thejawedhabibsalons.in";

export function getLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "BeautySalon", "HealthAndBeautyBusiness"],
    "@id": `${CANONICAL_BASE}/#salon`,
    name: BRAND_CONFIG.fullName,
    alternateName: [
      BRAND_CONFIG.name,
      "Jawed Habib Lalganj",
      "The Jawed Habib Salon Lalganj",
      "Jawed Habib Salon Vaishali",
      "Jawed Habib Hair & Beauty Salon Lalganj",
    ],
    url: CANONICAL_BASE,
    logo: `${CANONICAL_BASE}/brand/jawed-habib/logo-primary.png`,
    image: [
      `${CANONICAL_BASE}/images/salon/interior/jh-lalganj-salon-interior-main.webp`,
      `${CANONICAL_BASE}/images/salon/interior/jh-lalganj-triple-styling-stations.webp`,
      `${CANONICAL_BASE}/images/salon/interior/jh-lalganj-bridal-makeup-room.webp`,
    ],
    telephone: `+91${BRAND_CONFIG.contact.primaryPhone}`,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Net Banking",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${BRAND_CONFIG.location.addressLine1}, ${BRAND_CONFIG.location.landmark}`,
      addressLocality: BRAND_CONFIG.location.city,
      addressRegion: BRAND_CONFIG.location.state,
      postalCode: BRAND_CONFIG.location.pinCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BRAND_CONFIG.location.coordinates.lat,
      longitude: BRAND_CONFIG.location.coordinates.lng,
    },
    hasMap: BRAND_CONFIG.location.googleMapsUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "22:00",
      },
    ],
    sameAs: [
      BRAND_CONFIG.contact.instagramUrl,
      BRAND_CONFIG.location.googleMapsUrl,
    ],
    areaServed: [
      { "@type": "City", name: "Lalganj" },
      { "@type": "AdministrativeArea", name: "Vaishali" },
      { "@type": "AdministrativeArea", name: "Bihar" },
    ],
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${CANONICAL_BASE}/#website`,
    name: BRAND_CONFIG.fullName,
    alternateName: "Jawed Habib Lalganj",
    url: CANONICAL_BASE,
    publisher: {
      "@id": `${CANONICAL_BASE}/#salon`,
    },
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${CANONICAL_BASE}${item.url}`,
    })),
  };
}

export function getFaqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function JsonLdScript({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
