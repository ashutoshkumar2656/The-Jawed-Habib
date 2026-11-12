"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Sliders,
  DollarSign,
  Activity,
  Server,
  Radio,
  FileCheck,
  AlertCircle,
} from "lucide-react";

interface RazorpaySettingsData {
  gatewayName: string;
  isEnabled: boolean;
  environment: "TEST" | "LIVE";
  currency: string;
  displayName: string;
  enableOnlinePayments: boolean;
  enableAdvancePayments: boolean;
  enableFullPayments: boolean;
  enableRemainingCollection: boolean;
  allowOfflineRecording: boolean;
  minAdvanceAmount?: number;
  maxAdvanceAmount?: number;
  suggestedAdvanceOptions?: number[];
  allowCustomerSelectAdvance?: boolean;
  belowMinPolicy?: "CAP_AT_SERVICE_PRICE" | "CHARGE_FULL_PRICE";
  testKeyId: string;
  testKeySecret: string;
  testWebhookSecret: string;
  isTestConfigured: boolean;
  isTestVerified: boolean;
  testStatus: "NOT_CONFIGURED" | "CONFIGURED" | "CONNECTION_VERIFIED" | "CONFIGURATION_ERROR";
  liveKeyId: string;
  liveKeySecret: string;
  liveWebhookSecret: string;
  isLiveConfigured: boolean;
  isLiveVerified: boolean;
  liveStatus: "NOT_CONFIGURED" | "CONFIGURED" | "CONNECTION_VERIFIED" | "CONFIGURATION_ERROR";
  lastConnectionTestAt: string | null;
  lastConnectionStatus: string | null;
  lastConnectionError: string | null;
  lastWebhookReceivedAt: string | null;
  lastWebhookStatus: string | null;
  lastWebhookError: string | null;
}

export default function AdminRazorpaySettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);
  const [showSecrets, setShowSecrets] = React.useState(false);

  // Form State
  const [form, setForm] = React.useState<RazorpaySettingsData>({
    gatewayName: "Razorpay",
    isEnabled: true,
    environment: "TEST",
    currency: "INR",
    displayName: "The Jawed Habib Salon - Lalganj",
    enableOnlinePayments: true,
    enableAdvancePayments: true,
    enableFullPayments: true,
    enableRemainingCollection: true,
    allowOfflineRecording: true,
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2500,
    suggestedAdvanceOptions: [1000, 1500, 2000, 2500],
    allowCustomerSelectAdvance: true,
    belowMinPolicy: "CAP_AT_SERVICE_PRICE",
    testKeyId: "",
    testKeySecret: "",
    testWebhookSecret: "",
    isTestConfigured: false,
    isTestVerified: false,
    testStatus: "NOT_CONFIGURED",
    liveKeyId: "",
    liveKeySecret: "",
    liveWebhookSecret: "",
    isLiveConfigured: false,
    isLiveVerified: false,
    liveStatus: "NOT_CONFIGURED",
    lastConnectionTestAt: null,
    lastConnectionStatus: null,
    lastConnectionError: null,
    lastWebhookReceivedAt: null,
    lastWebhookStatus: null,
    lastWebhookError: null,
  });

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/razorpay`
      : "https://thejawedhabib-lalganj.com/api/webhooks/razorpay";

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment-gateway/razorpay");
      const json = await res.json();
      if (json.success && json.data) {
        setForm(json.data);
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to load Razorpay settings" });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // Live mode safety gate check
    if (form.environment === "LIVE" && (!form.liveKeyId || form.liveStatus === "NOT_CONFIGURED")) {
      setFeedback({
        type: "error",
        text: "Cannot enable Live Mode. Live Key ID and Live Secret must be configured and tested first.",
      });
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        gatewayName: form.gatewayName,
        isEnabled: form.isEnabled,
        environment: form.environment,
        currency: form.currency,
        displayName: form.displayName,
        enableOnlinePayments: form.enableOnlinePayments,
        enableAdvancePayments: form.enableAdvancePayments,
        enableFullPayments: form.enableFullPayments,
        enableRemainingCollection: form.enableRemainingCollection,
        allowOfflineRecording: form.allowOfflineRecording,
        minAdvanceAmount: form.minAdvanceAmount ?? 1000,
        maxAdvanceAmount: form.maxAdvanceAmount ?? 2500,
        suggestedAdvanceOptions: form.suggestedAdvanceOptions || [1000, 1500, 2000, 2500],
        allowCustomerSelectAdvance: form.allowCustomerSelectAdvance ?? true,
        belowMinPolicy: form.belowMinPolicy || "CAP_AT_SERVICE_PRICE",
        testKeyId: form.testKeyId || undefined,
        liveKeyId: form.liveKeyId || undefined,
      };

      // Only send secret updates if entered
      if (form.testKeySecret && !form.testKeySecret.includes("••••")) {
        payload.testKeySecret = form.testKeySecret;
      }
      if (form.testWebhookSecret && !form.testWebhookSecret.includes("••••")) {
        payload.testWebhookSecret = form.testWebhookSecret;
      }
      if (form.liveKeySecret && !form.liveKeySecret.includes("••••")) {
        payload.liveKeySecret = form.liveKeySecret;
      }
      if (form.liveWebhookSecret && !form.liveWebhookSecret.includes("••••")) {
        payload.liveWebhookSecret = form.liveWebhookSecret;
      }

      const res = await fetch("/api/admin/payment-gateway/razorpay", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setForm(json.data);
        setFeedback({ type: "success", text: "Razorpay settings successfully saved and encrypted." });
      } else {
        setFeedback({ type: "error", text: json.error || "Failed to save settings." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setFeedback(null);

      const res = await fetch("/api/admin/payment-gateway/razorpay/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: form.environment }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          text: `Connection test PASSED for ${form.environment} mode! ${json.message}`,
        });
        await fetchSettings();
      } else {
        setFeedback({
          type: "error",
          text: `Connection test FAILED: ${json.error || "Could not verify credentials with Razorpay."}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Connection test failed due to network error." });
    } finally {
      setTesting(false);
    }
  };

  const copyWebhookToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-salon-gold mb-2" />
        Loading Razorpay Payment Gateway Configuration...
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONNECTION_VERIFIED":
        return <Badge className="bg-emerald-950 text-emerald-300 border-emerald-700">Verified & Active</Badge>;
      case "CONFIGURED":
        return <Badge className="bg-amber-950 text-amber-300 border-amber-700">Configured (Untested)</Badge>;
      case "CONFIGURATION_ERROR":
        return <Badge className="bg-red-950 text-red-300 border-red-700">Configuration Error</Badge>;
      default:
        return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">Not Configured</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-white text-xs">
      {/* Breadcrumb Header */}
      <Breadcrumbs
        items={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Payment Gateway", href: "/admin/settings/razorpay" },
          { label: "Razorpay" },
        ]}
      />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-serif text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-salon-gold" />
              Razorpay Payment Gateway Settings
            </h1>
            <Badge
              variant={form.environment === "LIVE" ? "destructive" : "gold"}
              className="text-[10px] tracking-wider uppercase font-semibold"
            >
              {form.environment} MODE
            </Badge>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            Configure official Razorpay Standard Checkout, automated signature verification, and secure webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing}
            className="border-zinc-700 hover:border-salon-gold text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin text-salon-gold" : ""}`} />
            <span>{testing ? "Testing..." : "Test Razorpay Connection"}</span>
          </Button>

          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{saving ? "Encrypting & Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/40 border-red-500/50 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ============================================================= */}
        {/* SECTION A: GENERAL PAYMENT SETTINGS */}
        {/* ============================================================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="h-4 w-4 text-salon-gold" />
              <span>Section A: General Payment Settings</span>
            </div>
            <span className="text-[11px] text-zinc-500">Core Engine Rules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gateway Name */}
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Payment Gateway Name</label>
              <Input
                value={form.gatewayName}
                disabled
                className="bg-zinc-900 border-zinc-800 text-zinc-400 text-xs"
              />
            </div>

            {/* Default Currency */}
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Default Settlement Currency</label>
              <Input
                value={`${form.currency} (Indian Rupee - ₹)`}
                disabled
                className="bg-zinc-900 border-zinc-800 text-zinc-400 text-xs"
              />
            </div>

            {/* Display Name */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                Checkout Display Name (Shown on Razorpay Popup)
              </label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="The Jawed Habib Salon - Lalganj"
                className="bg-zinc-900/90 border-zinc-800 text-xs text-white"
              />
            </div>
          </div>

          {/* Environment Switcher */}
          <div className="pt-2 border-t border-zinc-800/60">
            <label className="text-[11px] font-medium text-zinc-300 block mb-2">
              Payment Environment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                  form.environment === "TEST"
                    ? "bg-salon-gold/10 border-salon-gold text-white"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <input
                  type="radio"
                  name="environment"
                  value="TEST"
                  checked={form.environment === "TEST"}
                  onChange={() => setForm({ ...form, environment: "TEST" })}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1.5 text-salon-goldLight">
                    <span>Test Sandbox Mode</span>
                    <Badge variant="gold" className="text-[9px] py-0">Recommended for Testing</Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Process simulated payments safely using Razorpay test cards, mock UPI, and sandbox IDs.
                  </p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                  form.environment === "LIVE"
                    ? "bg-red-950/20 border-red-500 text-white"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <input
                  type="radio"
                  name="environment"
                  value="LIVE"
                  checked={form.environment === "LIVE"}
                  onChange={() => {
                    if (!form.liveKeyId || form.liveStatus === "NOT_CONFIGURED") {
                      alert("Configure and verify Live Key ID and Live Secret in Section B before switching to Live Mode.");
                      return;
                    }
                    setForm({ ...form, environment: "LIVE" });
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1.5 text-red-300">
                    <span>Live Production Mode</span>
                    <Badge className="bg-red-950 text-red-300 border-red-700 text-[9px] py-0">Real Money</Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Charges actual client bank accounts, cards, and UPI apps. Requires verified merchant account.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Operational Toggles */}
          <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                id: "isEnabled",
                label: "Enable Gateway",
                desc: "Turn Razorpay gateway integration on or off.",
                checked: form.isEnabled,
                onChange: (v: boolean) => setForm({ ...form, isEnabled: v }),
              },
              {
                id: "enableOnlinePayments",
                label: "Allow Online Checkout",
                desc: "Display online payment option to booking clients.",
                checked: form.enableOnlinePayments,
                onChange: (v: boolean) => setForm({ ...form, enableOnlinePayments: v }),
              },
              {
                id: "enableAdvancePayments",
                label: "Advance Deposit Collection",
                desc: "Collect configured advance booking deposit.",
                checked: form.enableAdvancePayments,
                onChange: (v: boolean) => setForm({ ...form, enableAdvancePayments: v }),
              },
              {
                id: "enableFullPayments",
                label: "Full Online Payments",
                desc: "Allow clients to prepay 100% of their service bill.",
                checked: form.enableFullPayments,
                onChange: (v: boolean) => setForm({ ...form, enableFullPayments: v }),
              },
              {
                id: "enableRemainingCollection",
                label: "Collect Remaining Balance",
                desc: "Allow clients to pay remaining balance online.",
                checked: form.enableRemainingCollection,
                onChange: (v: boolean) => setForm({ ...form, enableRemainingCollection: v }),
              },
              {
                id: "allowOfflineRecording",
                label: "Offline Salon Recording",
                desc: "Enable reception staff to record cash/UPI at counter.",
                checked: form.allowOfflineRecording,
                onChange: (v: boolean) => setForm({ ...form, allowOfflineRecording: v }),
              },
            ].map((toggle) => (
              <label
                key={toggle.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800/90 bg-zinc-900/40 hover:bg-zinc-900/80 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={toggle.checked}
                  onChange={(e) => toggle.onChange(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 text-salon-gold focus:ring-0"
                />
                <div>
                  <span className="font-medium text-white block text-xs">{toggle.label}</span>
                  <span className="text-[11px] text-zinc-400">{toggle.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION B: RAZORPAY API CREDENTIALS */}
        {/* ============================================================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-3 gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Key className="h-4 w-4 text-salon-gold" />
              <span>Section B: Razorpay API Credentials</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
              >
                {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3 text-salon-gold" />}
                <span>{showSecrets ? "Hide Plaintext Inputs" : "Reveal Input Fields"}</span>
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg flex items-start gap-2.5 text-[11px] text-zinc-400">
            <Lock className="h-4 w-4 text-salon-gold shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Security Standard:</strong> All API secrets are encrypted server-side with{" "}
              <span className="text-salon-gold font-mono">AES-256-GCM</span> authenticated encryption. Saved secret values are never transmitted back to the browser or stored in plaintext.
            </p>
          </div>

          {/* Test Mode Card */}
          <div className="rounded-lg border border-zinc-800 p-4 space-y-3 bg-zinc-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-salon-goldLight">TEST MODE CREDENTIALS</span>
                <span className="text-[10px] text-zinc-500 font-mono">rzp_test_...</span>
              </div>
              {getStatusBadge(form.testStatus)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Test Key ID</label>
                <Input
                  value={form.testKeyId}
                  onChange={(e) => setForm({ ...form, testKeyId: e.target.value })}
                  placeholder="rzp_test_..."
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Test Key Secret</label>
                <Input
                  type={showSecrets ? "text" : "password"}
                  value={form.testKeySecret}
                  onChange={(e) => setForm({ ...form, testKeySecret: e.target.value })}
                  placeholder={form.isTestConfigured ? "•••••••••••• (Encrypted)" : "Enter Secret"}
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Test Webhook Secret</label>
                <Input
                  type={showSecrets ? "text" : "password"}
                  value={form.testWebhookSecret}
                  onChange={(e) => setForm({ ...form, testWebhookSecret: e.target.value })}
                  placeholder={form.testWebhookSecret ? "•••••••••••• (Encrypted)" : "Enter Webhook Secret"}
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Live Mode Card */}
          <div className="rounded-lg border border-zinc-800 p-4 space-y-3 bg-zinc-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-red-300">LIVE PRODUCTION CREDENTIALS</span>
                <span className="text-[10px] text-zinc-500 font-mono">rzp_live_...</span>
              </div>
              {getStatusBadge(form.liveStatus)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Live Key ID</label>
                <Input
                  value={form.liveKeyId}
                  onChange={(e) => setForm({ ...form, liveKeyId: e.target.value })}
                  placeholder="rzp_live_..."
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Live Key Secret</label>
                <Input
                  type={showSecrets ? "text" : "password"}
                  value={form.liveKeySecret}
                  onChange={(e) => setForm({ ...form, liveKeySecret: e.target.value })}
                  placeholder={form.isLiveConfigured ? "•••••••••••• (Encrypted)" : "Enter Live Secret"}
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Live Webhook Secret</label>
                <Input
                  type={showSecrets ? "text" : "password"}
                  value={form.liveWebhookSecret}
                  onChange={(e) => setForm({ ...form, liveWebhookSecret: e.target.value })}
                  placeholder={form.liveWebhookSecret ? "•••••••••••• (Encrypted)" : "Enter Live Webhook Secret"}
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION C: RAZORPAY CONNECTION TEST */}
        {/* ============================================================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Activity className="h-4 w-4 text-salon-gold" />
              <span>Section C: Razorpay Connection Test</span>
            </div>
            <span className="text-[11px] text-zinc-500">Live Health Probe</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">Target Probe:</span>
                <Badge variant={form.environment === "LIVE" ? "destructive" : "gold"} className="text-[9px]">
                  {form.environment} ENVIRONMENT
                </Badge>
                {form.lastConnectionStatus === "SUCCESS" ? (
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : form.lastConnectionStatus === "FAILED" ? (
                  <span className="text-red-400 text-[11px] flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Verification Failed
                  </span>
                ) : (
                  <span className="text-zinc-500 text-[11px]">Untested</span>
                )}
              </div>

              <p className="text-[11px] text-zinc-400">
                {form.lastConnectionTestAt
                  ? `Last verified on ${new Date(form.lastConnectionTestAt).toLocaleString("en-IN")}`
                  : "No connection probe recorded yet."}
              </p>

              {form.lastConnectionError && (
                <p className="text-[11px] text-red-300 bg-red-950/30 p-2 rounded border border-red-900 mt-1">
                  Error Details: {form.lastConnectionError}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing}
              className="gap-2 border-zinc-700 hover:border-salon-gold shrink-0 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin text-salon-gold" : ""}`} />
              <span>{testing ? "Testing Credentials..." : "Test Razorpay Connection"}</span>
            </Button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION D: WEBHOOK CONFIGURATION */}
        {/* ============================================================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Server className="h-4 w-4 text-salon-gold" />
              <span>Section D: Webhook Configuration</span>
            </div>
            <span className="text-[11px] text-zinc-500">Autonomous Payment Reconciliation</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Your Public Webhook Endpoint (Add this in your Razorpay Dashboard)
              </label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-salon-goldLight flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyWebhookToClipboard}
                  className="border-zinc-800 text-xs gap-1.5 shrink-0"
                >
                  {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedWebhook ? "Copied!" : "Copy URL"}</span>
                </Button>
              </div>
            </div>

            {/* Configured Events */}
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-300 block">
                Required Razorpay Webhook Events:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {["order.paid", "payment.captured", "payment.failed", "refund.processed"].map((evt) => (
                  <div key={evt} className="flex items-center gap-1.5 text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-salon-gold shrink-0" />
                    <span className="font-mono">{evt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook Activity Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 text-[11px] text-zinc-400 gap-2">
              <div>
                <span>Last Webhook Delivery: </span>
                <span className="text-white font-medium">
                  {form.lastWebhookReceivedAt
                    ? new Date(form.lastWebhookReceivedAt).toLocaleString("en-IN")
                    : "No webhooks received yet"}
                </span>
              </div>
              <div>
                <span>Delivery Status: </span>
                {form.lastWebhookStatus === "SUCCESS" ? (
                  <Badge className="bg-emerald-950 text-emerald-300 border-emerald-700 text-[10px]">Healthy</Badge>
                ) : form.lastWebhookStatus === "ERROR" ? (
                  <Badge className="bg-red-950 text-red-300 border-red-700 text-[10px]">Delivery Error</Badge>
                ) : (
                  <Badge className="bg-zinc-800 text-zinc-400 text-[10px]">Idle</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION E: ADVANCE PAYMENT SETTINGS & BUSINESS POLICY */}
        {/* ============================================================= */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <DollarSign className="h-4 w-4 text-salon-gold" />
              <span>Section E: Advance Deposit Rules & Limits (Business Policy)</span>
            </div>
            <span className="text-[11px] text-zinc-500">Bridal & Service Policies</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Minimum Advance */}
            <div>
              <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                Default Minimum Advance Deposit (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={form.minAdvanceAmount ?? 1000}
                onChange={(e) => setForm({ ...form, minAdvanceAmount: Number(e.target.value) })}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Default salon policy: ₹1,000</span>
            </div>

            {/* Maximum Advance */}
            <div>
              <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                Default Maximum Advance Deposit (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={form.maxAdvanceAmount ?? 2500}
                onChange={(e) => setForm({ ...form, maxAdvanceAmount: Number(e.target.value) })}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Default salon policy: ₹2,500</span>
            </div>

            {/* Under Minimum Policy */}
            <div>
              <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                Rule When Service Cost &lt; Minimum Advance
              </label>
              <select
                value={form.belowMinPolicy || "CAP_AT_SERVICE_PRICE"}
                onChange={(e) => setForm({ ...form, belowMinPolicy: e.target.value as any })}
                className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900 text-xs text-white focus:outline-none focus:border-salon-gold"
              >
                <option value="CAP_AT_SERVICE_PRICE">Cap Advance at Total Service Price</option>
                <option value="CHARGE_FULL_PRICE">Require 100% Full Prepayment</option>
              </select>
              <span className="text-[10px] text-zinc-500 mt-1 block">Prevents advance from exceeding total price</span>
            </div>
          </div>

          {/* Customer Choice Toggle */}
          <div className="pt-2 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-medium text-white block text-xs">Allow Customer to Choose Advance Amount</span>
              <span className="text-[11px] text-zinc-400">
                Customers can pick an advance amount within the [₹{form.minAdvanceAmount ?? 1000} – ₹{form.maxAdvanceAmount ?? 2500}] range or select predefined denominations.
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowCustomerSelectAdvance ?? true}
                onChange={(e) => setForm({ ...form, allowCustomerSelectAdvance: e.target.checked })}
                className="rounded border-zinc-700 text-salon-gold focus:ring-0"
              />
              <span className="text-xs text-zinc-300">Enabled</span>
            </label>
          </div>

          {/* Package Specific Override Notice */}
          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">
              Need package-specific advance rules? You can set custom deposit thresholds for individual bridal packages.
            </span>
            <a
              href="/admin/bridal/services"
              className="text-salon-gold hover:underline font-medium shrink-0 ml-2"
            >
              Configure Bridal Packages →
            </a>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={saving}
            className="text-xs gap-2 shadow-lg"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{saving ? "Saving Changes..." : "Save Razorpay Configuration"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
