"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AdminNavProvider } from "@/components/layout/admin-nav-context";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-salon-black text-salon-ivory">{children}</div>;
  }

  return (
    <AdminNavProvider>
      <div className="flex min-h-screen bg-salon-black text-salon-ivory overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <AdminTopbar />
          <main className="p-4 sm:p-6 md:p-8 flex-1">{children}</main>
        </div>
      </div>
    </AdminNavProvider>
  );
}
