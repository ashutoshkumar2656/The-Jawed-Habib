import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In | The Jawed Habib Salon Lalganj",
  description: "Executive Management Portal Sign In for The Jawed Habib Salon – Lalganj, Vaishali, Bihar.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-salon-black text-salon-ivory antialiased">
      {children}
    </div>
  );
}
