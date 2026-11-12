import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn("flex items-center space-x-2 text-xs text-zinc-400 py-3", className)}
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-salon-gold transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={item.label} className="flex items-center space-x-2">
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="text-salon-gold font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-salon-gold transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
