"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home, CalendarCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[ADMIN_OPERATIONAL_EXCEPTION]", error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-2xl border border-salon-borderBlack bg-salon-cardBlack p-8 space-y-6 shadow-2xl">
        <div className="h-16 w-16 mx-auto rounded-full bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-white tracking-wide">
            Admin Module Recovery Notice
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            An unexpected error occurred while rendering this administrative section. All salon database records remain safe and secure.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-zinc-500 pt-1">
              Error Digest: <span className="text-zinc-400">{error.digest}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} variant="gold" className="w-full sm:w-auto gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Retry Section</span>
          </Button>

          <Link href="/admin/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-white gap-2">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>

        <div className="border-t border-zinc-800/80 pt-4 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>The Jawed Habib Salon Lalganj</span>
          <Link href="/admin/bookings" className="text-salon-gold hover:underline">
            Go to Bookings →
          </Link>
        </div>
      </div>
    </div>
  );
}
