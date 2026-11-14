import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Reviews & Client Testimonials | The Jawed Habib Salon Lalganj",
  description:
    "Read verified customer reviews for The Jawed Habib Salon in Lalganj, Vaishali. Discover client ratings for bridal makeup, haircuts, hair spa, and hospitality.",
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "Customer Reviews & Testimonials | The Jawed Habib Salon Lalganj",
    description:
      "Authentic client feedback, haircut testimonials, and bridal makeover reviews from our salon at Tinpulwa Chowk, Lalganj.",
    url: "https://www.thejawedhabibsalons.in/reviews",
  },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
