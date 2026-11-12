"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastProvider, useToast } from "@/components/ui/toast";
import {
  Award,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { BrandLogo } from "@/components/ui/brand-logo";

function RegisterFormInner() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      toast({
        type: "error",
        title: "Required Fields",
        message: "Please fill in all mandatory fields.",
      });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast({
        type: "error",
        title: "Invalid Mobile Number",
        message: "Please enter a valid 10-digit Indian phone number.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: cleanPhone,
          email: email || undefined,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          type: "error",
          title: "Registration Failed",
          message: data.error || "Could not register account. Please check details.",
        });
        return;
      }

      toast({
        type: "success",
        title: "Registration Complete!",
        message: "100 Welcome Points credited to your account. Redirecting...",
      });
      router.push("/booking");
    } catch {
      toast({
        type: "error",
        title: "Connection Error",
        message: "Could not reach registration server. Please try again.",
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
          <span>New Client Privilege</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
          Create Your Account
        </h1>

        <div className="p-2.5 rounded-xl bg-salon-gold/10 border border-salon-gold/30 flex items-center justify-center gap-2 text-xs text-salon-goldLight">
          <Award className="h-4 w-4 text-salon-gold shrink-0" />
          <span>Earn 100 Welcome Loyalty Points (₹100 Value)</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]">
            Full Name *
          </label>
          <div className="relative">
            <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              required
              placeholder="e.g. Anjali Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-salon-gold focus:ring-salon-gold/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]">
            10-Digit Mobile Number *
          </label>
          <div className="relative">
            <Phone className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              required
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-salon-gold focus:ring-salon-gold/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]">
            Email Address (Optional)
          </label>
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              type="email"
              placeholder="e.g. anjali@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-salon-gold focus:ring-salon-gold/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]">
            Choose Password *
          </label>
          <div className="relative">
            <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Minimum 6 characters"
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full text-xs font-bold tracking-wider uppercase text-salon-richBlack shadow-[0_0_20px_rgba(198,165,107,0.3)] hover:shadow-[0_0_30px_rgba(198,165,107,0.5)]"
            disabled={loading}
          >
            {loading ? "Creating Privilege Account..." : "Create Account & Claim 100 Pts"}
          </Button>
        </div>
      </form>

      <div className="border-t border-zinc-800/80 pt-5 text-center space-y-3 text-xs text-zinc-400">
        <p>
          Already registered?{" "}
          <Link href="/login" className="text-salon-gold font-bold hover:underline">
            Sign In Here
          </Link>
        </p>

        <div className="pt-1 flex items-center justify-between text-[11px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Salon Website</span>
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-salon-gold hover:text-salon-goldLight transition-colors font-medium"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-salon-gold" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen relative flex items-center justify-center bg-salon-black px-4 py-12 overflow-hidden selection:bg-salon-gold selection:text-black">
        {/* Ambient Luxury Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-salon-gold/20 via-salon-gold/5 to-transparent pointer-events-none blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-salon-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-red-950/10 rounded-full blur-3xl pointer-events-none" />

        <RegisterFormInner />
      </div>
    </ToastProvider>
  );
}
