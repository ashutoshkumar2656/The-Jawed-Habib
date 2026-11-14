import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Makeup in Lalganj, Vaishali | The Jawed Habib Salon",
  description:
    "Book luxury HD & Airbrush bridal makeup in Lalganj at The Jawed Habib Salon. Complete wedding packages, pre-bridal glow, dupatta draping & family styling at Tinpulwa Chowk.",
  alternates: {
    canonical: "/bridal",
  },
  openGraph: {
    title: "Bridal Makeup & Wedding Makeover in Lalganj | The Jawed Habib Salon",
    description:
      "Exclusive private bridal suite, water-resistant Airbrush makeup, HD contouring, and royal pre-bridal packages in Lalganj, Vaishali, Bihar.",
    url: "https://www.thejawedhabibsalons.in/bridal",
  },
};

export default function BridalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
