import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Hair Stylists & Certified Colorists | The Jawed Habib Salon Lalganj",
  description:
    "Meet the creative director, master hair stylists, and bridal beauty specialists at The Jawed Habib Salon, Lalganj, Vaishali.",
  alternates: {
    canonical: "/team", // Consolidated canonical prevents duplicate content
  },
};

export default function StylistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
