import { MetadataRoute } from "next";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_CONFIG.fullName,
    short_name: "Jawed Habib Lalganj",
    description:
      "Premier hair styling, restorative hair spa, keratin smoothening, and luxury bridal suites in Lalganj, Vaishali, Bihar.",
    start_url: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#C6A56B",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/brand/jawed-habib/favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/jawed-habib/logo-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
