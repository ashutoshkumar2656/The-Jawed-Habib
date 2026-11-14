import { BRAND_CONFIG } from "@/lib/constants/brand";

export const siteConfig = {
  name: BRAND_CONFIG.fullName,
  shortName: BRAND_CONFIG.name,
  description:
    "The Jawed Habib Salon in Lalganj, Vaishali, Bihar. Premier destination for haircut, hair spa, bridal makeover, beard styling, and luxury skin care treatments.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://www.thejawedhabibsalons.in",
  ogImage: "https://www.thejawedhabibsalons.in/brand/jawed-habib/brand-preview.webp",
  links: {
    instagram: BRAND_CONFIG.contact.instagramUrl,
    maps: BRAND_CONFIG.location.googleMapsUrl,
    whatsapp: `https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}`,
    phone: `tel:+91${BRAND_CONFIG.contact.primaryPhone}`,
  },
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Bridal", href: "/bridal" },
    { title: "Services", href: "/#services" },
    { title: "Packages", href: "/#packages" },
    { title: "Gallery", href: "/#gallery" },
    { title: "Reviews", href: "/#reviews" },
    { title: "Contact", href: "/#contact" },
  ],
  secondaryNav: [
    { title: "Pricing", href: "/pricing" },
    { title: "Offers", href: "/offers" },
    { title: "Stylists", href: "/team" },
    { title: "Consultation", href: "/consultation" },
    { title: "FAQ", href: "/faq" },
  ],
  adminNav: [
    { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
    { title: "Appointments", href: "/admin/appointments", icon: "Calendar" },
    { title: "Enquiries", href: "/admin/enquiries", icon: "Mail" },
    { title: "Customers", href: "/admin/customers", icon: "Users" },
    { title: "Services & Pricing", href: "/admin/services", icon: "Scissors" },
    { title: "Staff & Stylists", href: "/admin/staff", icon: "UserCheck" },
    { title: "Transformations", href: "/admin/transformations", icon: "Sparkles" },
    { title: "Gallery", href: "/admin/gallery", icon: "Image" },
    { title: "Videos", href: "/admin/videos", icon: "Video" },
    { title: "Brands", href: "/admin/brands", icon: "Award" },
    { title: "Reviews", href: "/admin/reviews", icon: "Star" },
    { title: "Offers & Coupons", href: "/admin/offers", icon: "Tag" },
    { title: "FAQs", href: "/admin/faqs", icon: "HelpCircle" },
    { title: "Analytics", href: "/admin/analytics", icon: "TrendingUp" },
    { title: "Settings", href: "/admin/settings", icon: "Settings" },
  ],
};
