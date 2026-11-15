"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/80 text-zinc-300 shadow-xl backdrop-blur-md hover:border-salon-gold hover:text-salon-gold hover:scale-105 active:scale-95 transition-all duration-300"
      )}
      aria-label="Scroll to top of page"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
