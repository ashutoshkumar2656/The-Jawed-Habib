/**
 * Official Brand and Business Information
 * The Jawed Habib Salon – Lalganj
 */

export const BRAND_CONFIG = {
  name: "The Jawed Habib Salon",
  branch: "Lalganj",
  fullName: "The Jawed Habib Salon – Lalganj",
  tagline: "Hair, Beauty & Luxury Experience",
  established: "2024",

  location: {
    city: "Lalganj",
    district: "Vaishali",
    state: "Bihar",
    country: "India",
    pinCode: "844121",
    addressLine1: "1st Floor, Tinpulwa Chowk",
    landmark: "Above Killer Showroom, Opposite Manglam Mart",
    fullAddress:
      "1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121",
    coordinates: {
      lat: 25.8675,
      lng: 85.1764,
    },
    googleMapsUrl: "https://maps.app.goo.gl/TVx48xoWEu8dMvXT9",
  },

  contact: {
    phones: ["7707000463", "9831722983", "9580000175"],
    primaryPhone: "7707000463",
    secondaryPhone: "9831722983",
    tertiaryPhone: "9580000175",
    whatsappPhone: "7707000463",
    whatsappFormatted: "+91 77070 00463",
    email: "contact@jawedhabib-lalganj.in",
    instagramUrl: "https://www.instagram.com/the_jawedhabib_lalganj/",
    instagramHandle: "@the_jawedhabib_lalganj",
  },

  hours: {
    days: "Monday to Sunday",
    open: "10:00 AM",
    close: "10:00 PM",
    openMilitary: "10:00",
    closeMilitary: "22:00",
    display: "Monday – Sunday: 10:00 AM – 10:00 PM",
  },

  assets: {
    logoPrimary: "/brand/jawed-habib/logo-primary.svg",
    logoPrimaryPng: "/brand/jawed-habib/logo-primary.png",
    logoPrimaryDark: "/brand/jawed-habib/logo-primary-dark.png",
    logoWhite: "/brand/jawed-habib/logo-white.svg",
    logoWhitePng: "/brand/jawed-habib/logo-white.png",
    logoStacked: "/brand/jawed-habib/logo-stacked.png",
    logoStackedColor: "/brand/jawed-habib/logo-stacked-color.png",
    logoIcon: "/brand/jawed-habib/logo-icon.svg",
    logoIconPng: "/brand/jawed-habib/logo-icon.png",
    logoIconWhite: "/brand/jawed-habib/logo-icon-white.png",
    favicon: "/brand/jawed-habib/favicon.png",
    brandPreview: "/brand/jawed-habib/brand-preview.webp",
    salonInteriorMain: "/images/salon/interior/jh-lalganj-salon-interior-main.webp",
    salonTripleStations: "/images/salon/interior/jh-lalganj-triple-styling-stations.webp",
    salonReceptionDesk: "/images/salon/interior/jh-lalganj-reception-desk.webp",
    salonBridalSuite: "/images/salon/interior/jh-lalganj-bridal-makeup-room.webp",
    salonPedicureThrone: "/images/salon/interior/jh-lalganj-pedicure-spa-throne.webp",
    salonMastercut: "/images/salon/services/jh-lalganj-jawed-habib-mastercut.webp",
    salonTeam: "/images/salon/opening/jh-lalganj-jawed-habib-team.webp",
  },

  theme: {
    colors: {
      brandRed: "#C62628",
      brandRedDark: "#A81E20",
      brandRedLight: "#E03B3D",
      luxuryBlack: "#111111",
      richBlack: "#0B0B0B",
      champagneGold: "#C6A56B",
      goldLight: "#DFCA9E",
      goldDark: "#9E7E44",
      ivory: "#F7F4EE",
      white: "#FFFFFF",
      mutedGrey: "#777777",
    },
  },
} as const;
