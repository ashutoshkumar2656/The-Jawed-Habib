import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salon-gold disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        gold: "bg-gold-gradient text-salon-richBlack font-semibold shadow-md hover:opacity-95 hover:shadow-[0_0_20px_rgba(198,165,107,0.35)] active:scale-[0.98]",
        goldOutline:
          "border border-salon-gold text-salon-gold bg-transparent hover:bg-salon-gold hover:text-black transition-colors duration-300",
        outline:
          "border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors",
        default:
          "bg-salon-gold text-black hover:bg-salon-goldLight transition-colors font-medium",
        secondary:
          "bg-salon-cardBlack text-salon-ivory border border-salon-borderBlack hover:border-salon-gold/40 hover:bg-zinc-900",
        destructive:
          "bg-red-900/80 text-white hover:bg-red-800 border border-red-700/50",
        ghost:
          "hover:bg-zinc-900 hover:text-salon-gold text-zinc-300 transition-colors",
        link: "text-salon-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs tracking-wider uppercase",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
