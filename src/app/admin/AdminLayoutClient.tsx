"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AdminNavProvider } from "@/components/layout/admin-nav-context";

// Dynamically import the administrative chrome so that the login page (/admin/login)
// is completely decoupled from dashboard navigation bundles and heavy icon sets.
const AdminSidebar = dynamic(
  () => import("@/components/layout/admin-sidebar").then((m) => m.AdminSidebar),
  { ssr: true }
);

const AdminTopbar = dynamic(
  () => import("@/components/layout/admin-topbar").then((m) => m.AdminTopbar),
  { ssr: true }
);

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login");

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
