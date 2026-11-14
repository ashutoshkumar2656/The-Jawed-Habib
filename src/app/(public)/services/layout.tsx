import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haircuts, Hair Spa, Keratin & Beauty Services in Lalganj | The Jawed Habib Salon",
  description:
    "Explore certified master haircuts, L'Oreal hair spa, keratin smoothening, global hair coloring, and glowing facials at The Jawed Habib Salon, Lalganj. View transparent prices and book today.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Haircuts, Hair Spa & Beauty Services in Lalganj | The Jawed Habib Salon",
    description:
      "Precision hair styling, restorative hair spa, keratin treatments, and luxury skin therapies in Lalganj, Vaishali.",
    url: "https://www.thejawedhabibsalons.in/services",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
