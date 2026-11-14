import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Hair Stylists & Certified Colorists | The Jawed Habib Salon Lalganj",
  description:
    "Meet the creative director, master hair stylists, and bridal beauty specialists at The Jawed Habib Salon, Lalganj, Vaishali.",
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    title: "Our Master Stylists & Team | The Jawed Habib Salon Lalganj",
    description:
      "Certified Jawed Habib professionals bringing international precision geometric haircutting and coloring to Lalganj, Bihar.",
    url: "https://www.thejawedhabibsalons.in/team",
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
