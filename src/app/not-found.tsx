import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-salon-black px-4 text-center">
      <div className="space-y-4">
        <span className="font-serif text-8xl font-bold text-salon-gold/30">404</span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white md:text-4xl">
          Page Not Found
        </h1>
        <p className="mx-auto max-w-md text-sm text-zinc-400">
          The salon page or treatment you are seeking might have been moved or is currently unavailable.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="gold" className="gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Explore Services</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
