"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { ArrowLeft, CheckCircle2, KeyRound, Phone, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

function ForgotPasswordInner() {
  const { toast } = useToast();
  const [phone, setPhone] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast({
        type: "error",
        title: "Phone Required",
        message: "Please enter your registered 10-digit mobile number.",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast({
        type: "success",
        title: "OTP Dispatched",
        message: `A verification code has been dispatched to ${phone}.`,
      });
    }, 600);
  };

  return (
    <div className="w-full max-w-md space-y-7 rounded-2xl border border-salon-gold/30 bg-zinc-950/85 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_60px_rgba(198,165,107,0.18)]">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="stacked-color" size="md" href="/" priority />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-salon-gold/15 border border-salon-gold/30 text-salon-goldLight text-[10px] font-bold tracking-widest uppercase">
          <KeyRound className="h-3 w-3 text-salon-gold" />
          <span>Account Recovery</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
          Reset Your Password
        </h1>
        <p className="text-xs text-zinc-400">
          Enter your registered mobile number to receive a one-time verification PIN.
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4 py-4">
          <div className="h-14 w-14 rounded-full bg-emerald-950/70 border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-xs text-zinc-300">
            A temporary verification link has been sent to{" "}
            <span className="text-salon-gold font-semibold">+91 {phone}</span>.
          </p>
          <div className="space-y-2 pt-2">
            <Link href="/login">
              <Button variant="gold" size="sm" className="w-full text-xs font-bold uppercase tracking-wider">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-medium uppercase tracking-wider text-[11px]">
              Registered Mobile Number *
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

          <div className="pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full text-xs font-bold tracking-wider uppercase text-salon-richBlack shadow-[0_0_20px_rgba(198,165,107,0.3)] hover:shadow-[0_0_30px_rgba(198,165,107,0.5)]"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send Verification OTP"}
            </Button>
          </div>
        </form>
      )}

      <div className="border-t border-zinc-800/80 pt-5 text-center flex items-center justify-between text-[11px] text-zinc-400">
        <Link href="/login" className="text-salon-gold hover:underline font-medium">
          Remember Password? Sign In
        </Link>
        <Link href="/" className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-3 w-3" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen relative flex items-center justify-center bg-salon-black px-4 py-12 overflow-hidden selection:bg-salon-gold selection:text-black">
        {/* Ambient Luxury Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-salon-gold/20 via-salon-gold/5 to-transparent pointer-events-none blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-salon-gold/5 rounded-full blur-3xl pointer-events-none" />

        <ForgotPasswordInner />
      </div>
    </ToastProvider>
  );
}
