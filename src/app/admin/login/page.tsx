"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { BrandLogo } from "@/components/ui/brand-logo";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";

  const [phoneOrEmail, setPhoneOrEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const identifier = phoneOrEmail.trim();
    if (!identifier || !password) {
      setError("Please enter your administrator phone/email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrEmail: identifier,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Invalid phone/email or password.");
        return;
      }

      setSuccess("Authentication successful! Redirecting to Management Dashboard...");
      // Safe navigation: only allow internal redirects starting with /admin
      const targetPath = redirectUrl.startsWith("/admin") ? redirectUrl : "/admin/dashboard";
      setTimeout(() => {
        router.push(targetPath);
      }, 500);
    } catch {
      setError("Unable to connect to the authentication service. Please verify your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md space-y-7 rounded-2xl border border-salon-gold/30 bg-zinc-950/85 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_60px_rgba(198,165,107,0.18)]">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="stacked-color" size="md" href="/" priority />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-salon-gold/15 border border-salon-gold/30 text-salon-goldLight text-[10px] font-bold tracking-widest uppercase">
          <ShieldCheck className="h-3 w-3 text-salon-gold" />
          <span>Executive Salon Control Center</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
          Management Sign In
        </h1>
        <p className="text-xs text-zinc-400">
          Sign in with authorized administrative credentials for {BRAND_CONFIG.name} – {BRAND_CONFIG.branch}.
        </p>
      </div>

      {/* Feedback Notifications */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-start space-x-2.5 animate-fadeIn"
        >
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-start space-x-2.5 animate-fadeIn"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{success}</span>
        </div>
      )}

      {/* Secure Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="admin-phone-or-email"
            className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]"
          >
            Admin Phone or Email *
          </label>
          <div className="relative">
            <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              id="admin-phone-or-email"
              name="phoneOrEmail"
              type="text"
              autoComplete="username"
              required
              placeholder="Registered phone number or email"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              disabled={loading}
              className="pl-10 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-salon-gold focus:ring-salon-gold/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="admin-password"
              className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]"
            >
              Security Password *
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-salon-gold hover:text-salon-goldLight transition-colors font-medium hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your security password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="pl-10 pr-10 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-salon-gold focus:ring-salon-gold/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4 text-salon-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-salon-gold/30 accent-salon-gold"
            />
            <span className="text-[11px] text-zinc-400 hover:text-zinc-300 transition-colors">
              Remember me on this secure workstation
            </span>
          </label>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={loading}
            className="w-full text-xs font-bold tracking-wider uppercase text-salon-richBlack shadow-[0_0_20px_rgba(198,165,107,0.3)] hover:shadow-[0_0_30px_rgba(198,165,107,0.5)] transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Enter Management Dashboard</span>
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="border-t border-zinc-800/80 pt-5 space-y-3 text-center text-xs text-zinc-400">
        <div className="flex items-center justify-between text-[11px]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Website</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-salon-gold hover:text-salon-goldLight transition-colors font-medium"
          >
            <span>Customer Portal Sign In</span>
          </Link>
        </div>

        <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
          Authorized Salon Personnel Only &bull; Tinpulwa Chowk, Lalganj
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-salon-black px-4 py-12 overflow-hidden selection:bg-salon-gold selection:text-black">
      {/* Ambient Luxury Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-salon-gold/15 via-salon-gold/5 to-transparent pointer-events-none blur-3xl opacity-70" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-salon-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-red-950/10 rounded-full blur-3xl pointer-events-none" />

      <React.Suspense
        fallback={
          <div className="relative w-full max-w-md rounded-2xl border border-salon-gold/30 bg-zinc-950/85 backdrop-blur-xl p-10 flex flex-col items-center justify-center space-y-4 shadow-[0_0_60px_rgba(198,165,107,0.18)]">
            <Loader2 className="h-8 w-8 text-salon-gold animate-spin" />
            <p className="text-xs text-zinc-400">Loading secure portal...</p>
          </div>
        }
      >
        <AdminLoginForm />
      </React.Suspense>
    </div>
  );
}
