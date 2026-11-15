import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thejawedhabibsalons.in";
  const lastUpdated = new Date("2026-11-14T00:00:00.000Z");

  const publicRoutes: {
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/bridal", priority: 1.0, changeFrequency: "daily" },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/booking", priority: 0.9, changeFrequency: "daily" },
    { path: "/packages", priority: 0.8, changeFrequency: "weekly" },
    { path: "/offers", priority: 0.8, changeFrequency: "weekly" },
    { path: "/transformations", priority: 0.8, changeFrequency: "weekly" },
    { path: "/gallery", priority: 0.8, changeFrequency: "monthly" },
    { path: "/reviews", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/consultation", priority: 0.7, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/team", priority: 0.6, changeFrequency: "monthly" },
    { path: "/terms-and-conditions", priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.4, changeFrequency: "monthly" },
    { path: "/cancellation-refund-policy", priority: 0.4, changeFrequency: "monthly" },
    { path: "/shipping-delivery-policy", priority: 0.4, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: lastUpdated,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
