import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { BRAND_CONFIG } from "@/lib/constants/brand";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_CONFIG.fullName} | Luxury Hair, Beauty & Grooming`,
    template: `%s | ${BRAND_CONFIG.name} Lalganj`,
  },
  description:
    "Experience world-class hair styling, restorative hair spa, royal beard grooming, and luminous bridal/skin care at The Jawed Habib Salon in Lalganj, Vaishali, Bihar.",
  keywords: [
    "Jawed Habib Lalganj",
    "Salon in Lalganj",
    "Best haircut in Lalganj Bihar",
    "Bridal makeup Lalganj Vaishali",
    "Hair spa Lalganj",
    "Men grooming salon Lalganj",
    "Beauty parlour Lalganj",
    "Jawed Habib Tinpulwa Chowk",
  ],
  authors: [{ name: "The Jawed Habib Salon Lalganj" }],
  creator: "The Jawed Habib Salon Lalganj",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/brand/jawed-habib/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/brand/jawed-habib/favicon.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: `${BRAND_CONFIG.fullName} – Premier Salon in Lalganj, Bihar`,
    description:
      "Premier hair artistry, restorative hair spa, royal beard grooming, and luminous bridal packages in Lalganj, Vaishali.",
    siteName: BRAND_CONFIG.fullName,
    images: [
      {
        url: "/brand/jawed-habib/brand-preview.webp",
        width: 1200,
        height: 630,
        alt: `${BRAND_CONFIG.fullName} – Official Branding & Luxury Salon`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_CONFIG.fullName} | Lalganj, Bihar`,
    description:
      "Premier destination for precision hair styling, bridal makeup, beard architecture, and skin treatments in Lalganj.",
    images: ["/brand/jawed-habib/brand-preview.webp"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["HairSalon", "BeautySalon", "HealthAndBeautyBusiness"],
  "@id": "https://thejawedhabib-lalganj.com/#salon",
  "name": BRAND_CONFIG.fullName,
  "alternateName": BRAND_CONFIG.name,
  "url": process.env.NEXT_PUBLIC_APP_URL || "https://thejawedhabib-lalganj.com",
  "logo": "https://thejawedhabib-lalganj.com/brand/jawed-habib/logo-primary.png",
  "telephone": `+91${BRAND_CONFIG.contact.primaryPhone}`,
  "priceRange": "₹₹",
  "image": "/images/hero/hero-salon-main.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": `${BRAND_CONFIG.location.addressLine1}, ${BRAND_CONFIG.location.landmark}`,
    "addressLocality": BRAND_CONFIG.location.city,
    "addressRegion": BRAND_CONFIG.location.state,
    "postalCode": BRAND_CONFIG.location.pinCode,
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "25.8677",
    "longitude": "85.1802"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "10:00",
      "closes": "22:00"
    }
  ],
  "sameAs": [
    BRAND_CONFIG.contact.instagramUrl,
    BRAND_CONFIG.location.googleMapsUrl
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} min-h-screen bg-salon-black text-salon-ivory flex flex-col font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
