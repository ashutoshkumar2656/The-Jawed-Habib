import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/ui/brand-logo";

export function LoadingSpinner({
  className,
  text = "Loading luxury salon experience...",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 space-y-4 text-center",
        className
      )}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-salon-gold/20 border-t-salon-gold animate-spin" />
        <BrandLogo variant="icon" width={28} height={28} href={false} className="animate-pulse" />
      </div>
      <p className="text-xs uppercase tracking-widest text-salon-gold font-medium">
        {text}
      </p>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="h-44 w-full rounded-xl bg-zinc-900" />
      <div className="h-4 w-3/4 rounded bg-zinc-900" />
      <div className="h-3 w-1/2 rounded bg-zinc-900" />
      <div className="h-8 w-full rounded bg-zinc-900 pt-2" />
    </div>
  );
}
