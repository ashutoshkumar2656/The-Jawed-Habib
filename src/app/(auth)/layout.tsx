import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal & Authentication | The Jawed Habib Salon Lalganj",
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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
