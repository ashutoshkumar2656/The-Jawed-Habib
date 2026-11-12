"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-salon-black px-4 text-center">
      <div className="space-y-4 max-w-md">
        <h2 className="font-serif text-2xl font-bold text-white">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-400">
          An unexpected error occurred while loading this page. Our salon concierge has been notified.
        </p>
        <div className="pt-2">
          <Button onClick={() => reset()} variant="gold" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
