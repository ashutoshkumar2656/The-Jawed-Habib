import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-salon-gold focus:ring-offset-2",
  {
    variants: {
      variant: {
        gold: "border-salon-gold/50 bg-salon-gold/10 text-salon-goldLight",
        default: "border-transparent bg-salon-gold text-black",
        secondary: "border-zinc-800 bg-zinc-900 text-zinc-300",
        destructive: "border-transparent bg-red-900 text-red-100",
        outline: "text-salon-ivory border-zinc-700",
      },
    },
    defaultVariants: {
      variant: "gold",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
