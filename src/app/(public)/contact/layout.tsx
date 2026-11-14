import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact The Jawed Habib Salon Lalganj | Address, Phone & Map Location",
  description:
    "Find address, phone numbers, WhatsApp, and Google Maps directions for The Jawed Habib Salon, Lalganj: 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact The Jawed Habib Salon Lalganj",
    description:
      "Visit us at 1st Floor, Tinpulwa Chowk, Lalganj, Bihar 844121. Call +91 7707000463 or WhatsApp for instant appointment assistance.",
    url: "https://www.thejawedhabibsalons.in/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
