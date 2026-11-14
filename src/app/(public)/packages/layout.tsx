import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salon Packages, Pre-Bridal & Grooming Bundles in Lalganj | Jawed Habib",
  description:
    "Curated beauty packages, pre-bridal therapies, hair spa combos, and executive groom packages at The Jawed Habib Salon, Lalganj, Vaishali. Transparent rates & maximum savings.",
  alternates: {
    canonical: "/packages",
  },
  openGraph: {
    title: "Curated Salon Packages in Lalganj | The Jawed Habib Salon",
    description:
      "Exclusive grooming packages and bridal bundles in Lalganj with transparent pricing and premium service.",
    url: "https://www.thejawedhabibsalons.in/packages",
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
