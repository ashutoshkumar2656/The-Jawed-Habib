import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salon FAQs & Appointment Guide | The Jawed Habib Salon Lalganj",
  description:
    "Got questions about hair spa, bridal packages, timings, advance bookings, or products used? Read frequently asked questions about The Jawed Habib Salon in Lalganj.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | The Jawed Habib Salon Lalganj",
    description:
      "Answers to popular client queries about salon services, hygiene protocols, wedding appointments, and pricing in Lalganj.",
    url: "https://www.thejawedhabibsalons.in/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
