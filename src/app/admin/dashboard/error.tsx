"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, CalendarCheck, CreditCard, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[ADMIN_DASHBOARD_EXCEPTION]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full rounded-2xl border border-salon-borderBlack bg-salon-cardBlack p-8 space-y-6 shadow-2xl">
        <div className="h-16 w-16 mx-auto rounded-full bg-salon-gold/10 border border-salon-gold/40 flex items-center justify-center text-salon-gold">
          <ShieldAlert className="h-8 w-8 text-salon-gold" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
            Dashboard Synchronization Notice
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The operational analytics stream encountered an unexpected format while aggregating live statistics. Salon bookings, customer profiles, and ledger records are fully operational.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-zinc-500 pt-1">
              Diagnostic Reference: <span className="text-zinc-400">{error.digest}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} variant="gold" className="w-full sm:w-auto gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Reload Analytics</span>
          </Button>

          <Link href="/admin/bookings" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-white gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span>Open Bookings</span>
            </Button>
          </Link>

          <Link href="/admin/payments" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-white gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
