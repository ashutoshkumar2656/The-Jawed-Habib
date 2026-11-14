import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Before & After Hair Styling & Bridal Makeover Transformations | Jawed Habib Lalganj",
  description:
    "See real salon transformations from The Jawed Habib Salon in Lalganj, Vaishali. Hair smoothening, balayage highlights, bridal makeovers, and precision cuts.",
  alternates: {
    canonical: "/transformations",
  },
  openGraph: {
    title: "Before & After Hair & Bridal Transformations | The Jawed Habib Salon Lalganj",
    description:
      "Real client transformations from our salon at Tinpulwa Chowk, Lalganj. Precision haircuts, balayage, and royal bridal makeovers.",
    url: "https://www.thejawedhabibsalons.in/transformations",
  },
};

export default function TransformationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
