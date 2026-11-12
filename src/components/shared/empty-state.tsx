import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-950/60 p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto",
        className
      )}
    >
      <div className="h-14 w-14 rounded-full bg-salon-gold/10 border border-salon-gold/30 mx-auto flex items-center justify-center text-salon-gold">
        <Icon className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {(actionText && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="gold" size="sm">
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button variant="gold" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
