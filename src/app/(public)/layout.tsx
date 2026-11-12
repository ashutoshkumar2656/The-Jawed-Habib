import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { FloatingContact } from "@/components/shared/floating-contact";
import { ScrollToTop } from "@/components/shared/scroll-to-top";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-salon-black relative">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContact />
        <ScrollToTop />
      </div>
    </ToastProvider>
  );
}
