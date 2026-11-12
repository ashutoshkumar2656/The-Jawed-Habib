"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  isOpen = false,
  onToggle,
  className,
}: AccordionItemProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-950/70 transition-all duration-300 overflow-hidden",
        isOpen && "border-salon-gold/50 shadow-[0_0_20px_rgba(198,165,107,0.1)]",
        className
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:text-salon-gold"
        aria-expanded={isOpen}
      >
        <span className="font-serif text-base sm:text-lg font-semibold text-white">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-salon-gold transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/80 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  items: { title: string; content: React.ReactNode; id?: string }[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = React.useState<number[]>([0]);

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, idx) => (
        <AccordionItem
          key={item.id || idx}
          title={item.title}
          isOpen={openIndexes.includes(idx)}
          onToggle={() => handleToggle(idx)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
