"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastProvider, useToast } from "@/components/ui/toast";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { BrandLogo } from "@/components/ui/brand-logo";

function LoginFormInner() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneOrEmail, setPhoneOrEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail || !password) {
      toast({
        type: "error",
        title: "Required Fields",
        message: "Please enter your phone number/email and password.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          type: "error",
          title: "Sign In Failed",
          message: data.error || "Invalid credentials. Please verify and retry.",
        });
        return;
      }

      toast({
        type: "success",
        title: "Welcome Back!",
        message: data.message || "Signing you into your client dashboard...",
      });
      router.push("/booking");
    } catch {
      toast({
        type: "error",
        title: "Connection Error",
        message: "Failed to connect to authentication server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-7 rounded-2xl border border-salon-gold/30 bg-zinc-950/85 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_60px_rgba(198,165,107,0.18)]">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="stacked-color" size="md" href="/" priority />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-salon-gold/15 border border-salon-gold/30 text-salon-goldLight text-[10px] font-bold tracking-widest uppercase">
          <Sparkles className="h-3 w-3 text-salon-gold" />
          <span>Client Privilege Portal</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
          Client Sign In
        </h1>
        <p className="text-xs text-zinc-400">
          Access your appointment history, loyalty rewards &amp; VIP bookings.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]">
            Mobile Number or Email *
          </label>
          <div className="relative">
            <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              type="text"
              required
              placeholder="e.g. 9876543210 or client@domain.com"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="pl-10 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-salon-gold focus:ring-salon-gold/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]">
              Password *
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-salon-gold hover:text-salon-goldLight hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-salon-gold focus:ring-salon-gold/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-salon-gold" />}
            </button>
          </div>
        </div>

        <div className="pt-2 space-y-2.5">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full text-xs font-bold tracking-wider uppercase text-salon-richBlack shadow-[0_0_20px_rgba(198,165,107,0.3)] hover:shadow-[0_0_30px_rgba(198,165,107,0.5)]"
            disabled={loading}
          >
            {loading ? "Authenticating Account..." : "Sign In to Client Account"}
          </Button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="border-t border-zinc-800/80 pt-5 text-center space-y-3 text-xs text-zinc-400">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-salon-gold font-bold hover:underline">
            Register (Earn 100 Reward Points)
          </Link>
        </p>

        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Salon Website</span>
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-salon-gold hover:text-salon-goldLight transition-colors font-medium"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-salon-gold" />
            <span>Staff & Admin Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen relative flex items-center justify-center bg-salon-black px-4 py-12 overflow-hidden selection:bg-salon-gold selection:text-black">
        {/* Ambient Luxury Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-salon-gold/20 via-salon-gold/5 to-transparent pointer-events-none blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-salon-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-red-950/10 rounded-full blur-3xl pointer-events-none" />

        <LoginFormInner />
      </div>
    </ToastProvider>
  );
}
