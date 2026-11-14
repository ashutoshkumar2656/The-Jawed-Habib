import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Hair & Skin Beauty Consultation | Jawed Habib Lalganj",
  description:
    "Get customized hair and skin service recommendations with our smart beauty consultation estimator at The Jawed Habib Salon, Lalganj.",
  alternates: {
    canonical: "/consultation",
  },
  openGraph: {
    title: "Interactive Beauty Consultation | The Jawed Habib Salon Lalganj",
    description:
      "Find the perfect hair therapy, haircut, or skin treatment tailored to your face shape, hair type, and skin needs.",
    url: "https://www.thejawedhabibsalons.in/consultation",
  },
};

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
