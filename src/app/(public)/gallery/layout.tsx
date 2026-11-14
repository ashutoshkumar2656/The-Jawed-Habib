import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salon Interior, Styling Lounge & Work Gallery | The Jawed Habib Salon Lalganj",
  description:
    "Browse photos of our luxury salon interior, hydraulic styling stations, private bridal suite, and client hair artistry at Tinpulwa Chowk, Lalganj.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Salon Photo Gallery | The Jawed Habib Salon Lalganj",
    description:
      "Explore the interior architecture, private bridal suite, and haircut styling stations of our Lalganj salon.",
    url: "https://www.thejawedhabibsalons.in/gallery",
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
