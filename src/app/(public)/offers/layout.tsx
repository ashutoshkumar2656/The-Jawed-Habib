import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salon Offers, Discount Coupons & Bridal Deals in Lalganj | Jawed Habib",
  description:
    "Enjoy seasonal discounts, first-time client privileges, and festive bridal offers at The Jawed Habib Salon, Lalganj. Grab coupon codes and save on salon treatments.",
  alternates: {
    canonical: "/offers",
  },
  openGraph: {
    title: "Exclusive Salon Offers & Privileges | The Jawed Habib Salon Lalganj",
    description:
      "Exclusive seasonal discounts, privilege club coupons, and bridal packages in Lalganj, Bihar.",
    url: "https://www.thejawedhabibsalons.in/offers",
  },
};

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
