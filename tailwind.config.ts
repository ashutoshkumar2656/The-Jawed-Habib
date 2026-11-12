import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        salon: {
          red: "#C62628",
          redDark: "#A81E20",
          redLight: "#E03B3D",
          redBg: "rgba(198, 38, 40, 0.12)",
          black: "#111111",
          richBlack: "#0B0B0B",
          cardBlack: "#181818",
          borderBlack: "#2A2A2A",
          gold: "#C6A56B",
          goldLight: "#DFCA9E",
          goldDark: "#9E7E44",
          ivory: "#F7F4EE",
          ivoryDark: "#ECE7DC",
          grey: "#777777",
          mutedGrey: "#8E8E93",
          lightGrey: "#E5E5EA",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "'Playfair Display'", "Georgia", "serif"],
        sans: ["var(--font-sans)", "'Inter'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #DFCA9E 0%, #C6A56B 50%, #9E7E44 100%)",
        "gold-shimmer": "linear-gradient(90deg, transparent, rgba(198, 165, 107, 0.25), transparent)",
        "luxury-dark": "linear-gradient(180deg, #111111 0%, #0B0B0B 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gold-pulse": {
          "0%, 100%": { borderColor: "#C6A56B", boxShadow: "0 0 15px rgba(198, 165, 107, 0.2)" },
          "50%": { borderColor: "#DFCA9E", boxShadow: "0 0 25px rgba(223, 202, 158, 0.4)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "gold-pulse": "gold-pulse 3s infinite ease-in-out",
        marquee: "marquee 35s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
