import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Salon Appointment & Bridal Suite Online | The Jawed Habib Salon Lalganj",
  description:
    "Reserve your appointment or bridal suite at The Jawed Habib Salon, Lalganj with instant online booking and secure advance confirmation. Open Monday to Sunday, 10 AM to 10 PM.",
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Book Appointment Online | The Jawed Habib Salon Lalganj",
    description:
      "Select your date, choose your bridal suite or salon service, and confirm your booking with instant Razorpay advance verification.",
    url: "https://www.thejawedhabibsalons.in/booking",
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
