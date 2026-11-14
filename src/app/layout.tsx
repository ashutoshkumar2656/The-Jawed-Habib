import type { Metadata } from "next";
import "./globals.css";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { getLocalBusinessJsonLd, getWebsiteJsonLd, JsonLdScript } from "@/components/seo/structured-data";

const CANONICAL_BASE = "https://www.thejawedhabibsalons.in";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || CANONICAL_BASE),
  title: {
    default: `${BRAND_CONFIG.fullName} | Luxury Hair, Beauty & Bridal Salon Lalganj`,
    template: `%s | ${BRAND_CONFIG.name} Lalganj`,
  },
  description:
    "Experience world-class precision hair styling, restorative hair spa, keratin smoothening, royal beard grooming, and luxury bridal suites at The Jawed Habib Salon in Lalganj, Vaishali, Bihar.",
  keywords: [
    "Jawed Habib Lalganj",
    "The Jawed Habib Salon Lalganj",
    "Salon in Lalganj",
    "Best salon in Lalganj",
    "Hair salon in Lalganj",
    "Beauty parlour in Lalganj",
    "Bridal makeup in Lalganj",
    "Hair spa in Lalganj",
    "Keratin treatment Lalganj",
    "Men grooming salon Lalganj",
    "Jawed Habib Tinpulwa Chowk",
    "Jawed Habib Salon Vaishali",
  ],
  authors: [{ name: "The Jawed Habib Salon Lalganj" }],
  creator: "The Jawed Habib Salon Lalganj",
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
    url: CANONICAL_BASE,
    title: `${BRAND_CONFIG.fullName} – Premier Salon in Lalganj, Bihar`,
    description:
      "Premier hair artistry, restorative hair spa, royal beard grooming, and luminous bridal suites in Lalganj, Vaishali.",
    siteName: BRAND_CONFIG.fullName,
    images: [
      {
        url: `${CANONICAL_BASE}/brand/jawed-habib/brand-preview.webp`,
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
    images: [`${CANONICAL_BASE}/brand/jawed-habib/brand-preview.webp`],
  },
  verification: {
    google: "google-site-verification-placeholder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessData = getLocalBusinessJsonLd();
  const websiteData = getWebsiteJsonLd();

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        <JsonLdScript data={localBusinessData} />
        <JsonLdScript data={websiteData} />
      </head>
      <body className="min-h-screen bg-salon-black text-salon-ivory flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
