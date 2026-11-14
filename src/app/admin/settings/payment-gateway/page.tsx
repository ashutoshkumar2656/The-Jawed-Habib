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
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  Receipt,
  X,
  ExternalLink,
  HelpCircle,
  History,
  CheckSquare,
  ShieldAlert,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

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
  defaultAdvanceAmount?: number;
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

interface PaymentTransaction {
  id: string;
  transactionRef: string;
  appointmentId: string;
  appointmentNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  currency: string;
  paymentPurpose: string;
  paymentMethod: string;
  environment: string;
  status: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  refundedAmount?: number;
  failureReason?: string | null;
  recordedBy?: string | null;
  createdAt: string;
}

interface PreflightCheckData {
  readyForLive: boolean;
  currentEnvironment: "TEST" | "LIVE";
  checks: {
    liveKeyIdConfigured: boolean;
    liveKeySecretConfigured: boolean;
    liveWebhookConfigured: boolean;
    isLiveVerified: boolean;
    domainVerified: boolean;
    httpsVerified: boolean;
    databasePersistenceVerified: boolean;
    masterKeyConfigured: boolean;
  };
  reasons: string[];
}

export default function AdminPaymentGatewaySettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"CONFIG" | "TRANSACTIONS" | "AUDIT">("CONFIG");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState<"TEST" | "LIVE" | null>(null);
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
    defaultAdvanceAmount: 1000,
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

  // Preflight Data for Live Mode Activation
  const [preflight, setPreflight] = React.useState<PreflightCheckData | null>(null);
  const [showLiveModal, setShowLiveModal] = React.useState(false);
  const [liveConsentGiven, setLiveConsentGiven] = React.useState(false);

  // Transaction Ledger State
  const [transactions, setTransactions] = React.useState<PaymentTransaction[]>([]);
  const [txLoading, setTxLoading] = React.useState(false);
  const [txFilter, setTxFilter] = React.useState<"ALL" | "TEST" | "LIVE" | "OFFLINE" | "REFUNDED">("ALL");
  const [txSearch, setTxSearch] = React.useState("");
  const [selectedReceipt, setSelectedReceipt] = React.useState<PaymentTransaction | null>(null);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = React.useState(false);
  const [refundTx, setRefundTx] = React.useState<PaymentTransaction | null>(null);
  const [refundAmount, setRefundAmount] = React.useState(0);
  const [refundReason, setRefundReason] = React.useState("Customer requested cancellation");
  const [processingRefund, setProcessingRefund] = React.useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/razorpay`
      : "https://thejawedhabibsalons.in/api/webhooks/razorpay";

  // Fetch Settings
  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment-gateway/razorpay");
      const json = await res.json();
      if (json.success && json.data) {
        setForm(json.data);
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to load Razorpay payment gateway settings." });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Preflight Status
  const fetchPreflight = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payment-gateway/razorpay/preflight");
      const json = await res.json();
      if (json.success && json.data) {
        setPreflight(json.data);
      }
    } catch (e) {
      console.warn("Could not load preflight status", e);
    }
  }, []);

  // Fetch Transactions
  const fetchTransactions = React.useCallback(async () => {
    try {
      setTxLoading(true);
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransactions(json.data);
      }
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      setTxLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
    fetchPreflight();
    fetchTransactions();
  }, [fetchSettings, fetchPreflight, fetchTransactions]);

  // Save Settings Handler
  const handleSave = async (overrideData?: Partial<RazorpaySettingsData>) => {
    setSaving(true);
    setFeedback(null);

    const targetEnv = overrideData?.environment || form.environment;

    // Strict validation if activating live mode
    if (targetEnv === "LIVE" && form.environment !== "LIVE" && !overrideData) {
      // Must open modal first
      setShowLiveModal(true);
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        gatewayName: form.gatewayName,
        isEnabled: form.isEnabled,
        environment: targetEnv,
        currency: form.currency,
        displayName: form.displayName,
        enableOnlinePayments: form.enableOnlinePayments,
        enableAdvancePayments: form.enableAdvancePayments,
        enableFullPayments: form.enableFullPayments,
        enableRemainingCollection: form.enableRemainingCollection,
        allowOfflineRecording: form.allowOfflineRecording,
        minAdvanceAmount: form.minAdvanceAmount ?? 1000,
        maxAdvanceAmount: form.maxAdvanceAmount ?? 2500,
        defaultAdvanceAmount: form.defaultAdvanceAmount ?? 1000,
        suggestedAdvanceOptions: form.suggestedAdvanceOptions || [1000, 1500, 2000, 2500],
        allowCustomerSelectAdvance: form.allowCustomerSelectAdvance ?? true,
        belowMinPolicy: form.belowMinPolicy || "CAP_AT_SERVICE_PRICE",
        testKeyId: form.testKeyId || undefined,
        liveKeyId: form.liveKeyId || undefined,
        confirmedLiveActivation: targetEnv === "LIVE",
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
        setFeedback({
          type: "success",
          text: `Settings saved successfully. AES-256-GCM encryption verified for ${targetEnv} mode.`,
        });
        await fetchPreflight();
      } else {
        setFeedback({ type: "error", text: json.error || "Failed to save settings." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Network error while saving." });
    } finally {
      setSaving(false);
      setShowLiveModal(false);
      setLiveConsentGiven(false);
    }
  };

  // Test Connection Handler
  const handleTestConnection = async (targetEnv: "TEST" | "LIVE") => {
    try {
      setTesting(targetEnv);
      setFeedback(null);

      const res = await fetch("/api/admin/payment-gateway/razorpay/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: targetEnv }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          text: `Connection test PASSED for ${targetEnv} mode! ${json.message}`,
        });
        await fetchSettings();
        await fetchPreflight();
      } else {
        setFeedback({
          type: "error",
          text: `Connection test FAILED for ${targetEnv} mode: ${json.error || "Could not verify credentials with Razorpay."}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Connection test failed due to network error." });
    } finally {
      setTesting(null);
    }
  };

  // Controlled Refund Execution
  const handleExecuteRefund = async () => {
    if (!refundTx) return;
    try {
      setProcessingRefund(true);
      const res = await fetch(`/api/admin/payments/${refundTx.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: refundAmount,
          reason: refundReason,
          isFullRefund: refundAmount === refundTx.amount,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          text: `Refund of ₹${refundAmount.toLocaleString("en-IN")} successfully processed and audited.`,
        });
        setShowRefundModal(false);
        setRefundTx(null);
        await fetchTransactions();
      } else {
        setFeedback({
          type: "error",
          text: json.error || "Failed to execute refund.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Network error during refund." });
    } finally {
      setProcessingRefund(false);
    }
  };

  const copyWebhookToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  // Financial Stats Computation
  const financialStats = React.useMemo(() => {
    let totalCollected = 0;
    let advanceCollected = 0;
    let counterCollected = 0;
    let testVolume = 0;
    let liveVolume = 0;
    let successfulCount = 0;
    let failedCount = 0;
    let totalRefunded = 0;

    transactions.forEach((tx) => {
      if (tx.status === "SUCCESS" || tx.status === "CAPTURED") {
        totalCollected += tx.amount;
        successfulCount++;
        if (tx.environment === "TEST") {
          testVolume += tx.amount;
        } else if (tx.environment === "LIVE") {
          liveVolume += tx.amount;
        }

        if (tx.paymentPurpose === "ADVANCE_DEPOSIT") {
          advanceCollected += tx.amount;
        } else if (tx.environment === "OFFLINE" || tx.paymentMethod.toLowerCase().includes("cash")) {
          counterCollected += tx.amount;
        }
      } else if (tx.status === "FAILED") {
        failedCount++;
      }

      if (tx.refundedAmount) {
        totalRefunded += tx.refundedAmount;
      }
    });

    return {
      totalCollected,
      advanceCollected,
      counterCollected,
      testVolume,
      liveVolume,
      successfulCount,
      failedCount,
      totalRefunded,
      totalTx: transactions.length,
    };
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by mode
      if (txFilter === "TEST" && tx.environment !== "TEST") return false;
      if (txFilter === "LIVE" && tx.environment !== "LIVE") return false;
      if (txFilter === "OFFLINE" && tx.environment !== "OFFLINE" && !tx.paymentMethod.toLowerCase().includes("cash")) return false;
      if (txFilter === "REFUNDED" && tx.status !== "REFUNDED" && (!tx.refundedAmount || tx.refundedAmount <= 0)) return false;

      // Filter by search
      if (txSearch.trim()) {
        const q = txSearch.toLowerCase();
        return (
          tx.customerName.toLowerCase().includes(q) ||
          tx.customerPhone.includes(q) ||
          tx.appointmentNumber.toLowerCase().includes(q) ||
          tx.transactionRef.toLowerCase().includes(q) ||
          (tx.razorpayPaymentId && tx.razorpayPaymentId.toLowerCase().includes(q)) ||
          (tx.razorpayOrderId && tx.razorpayOrderId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [transactions, txFilter, txSearch]);

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

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 text-xs">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-salon-gold mb-3" />
        <p className="font-medium text-white text-sm">Loading Payment Gateway Architecture...</p>
        <p className="text-zinc-500 text-xs mt-1">Decrypting secure key metadata from Neon PostgreSQL</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white text-xs">
      {/* Breadcrumb Header */}
      <Breadcrumbs
        items={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Payment Gateway", href: "/admin/settings/payment-gateway" },
          { label: "Razorpay Standard Checkout" },
        ]}
      />

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2.5">
              <CreditCard className="h-6 w-6 text-salon-gold" />
              Razorpay Payment Gateway Management System
            </h1>
            <Badge
              variant={form.environment === "LIVE" ? "destructive" : "gold"}
              className="text-[11px] tracking-wider uppercase font-semibold px-2.5 py-0.5"
            >
              {form.environment} MODE ACTIVE
            </Badge>
            {form.isEnabled && form.enableOnlinePayments ? (
              <Badge className="bg-emerald-950 text-emerald-300 border-emerald-700 text-[10px]">
                Accepting Online Payments
              </Badge>
            ) : (
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                Online Payments Paused
              </Badge>
            )}
          </div>
          <p className="text-zinc-400 text-xs mt-1.5 max-w-3xl">
            Authoritative payment orchestrator with strict Test vs Live isolation, authenticated AES-256-GCM encryption, dynamic advance deposit configuration, and automated webhook reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleTestConnection(form.environment)}
            disabled={testing !== null}
            className="border-zinc-700 hover:border-salon-gold text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing === form.environment ? "animate-spin text-salon-gold" : ""}`} />
            <span>{testing === form.environment ? "Testing Connection..." : `Test ${form.environment} Connection`}</span>
          </Button>

          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="text-xs gap-1.5 h-9 shadow-md"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{saving ? "Encrypting & Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/40 border-red-500/50 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Financial Statistics & Volume Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Collected</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-white font-serif">₹{financialStats.totalCollected.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">{financialStats.successfulCount} captured</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Advance Deposits</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-salon-gold font-serif">₹{financialStats.advanceCollected.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Online Prepayments</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Salon Counter</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-white font-serif">₹{financialStats.counterCollected.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Cash / UPI at Reception</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Test Mode Volume</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-amber-300 font-serif">₹{financialStats.testVolume.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">Simulated Sandbox</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Live Mode Volume</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-red-300 font-serif">₹{financialStats.liveVolume.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-red-400/80 block mt-0.5">Real Customer Funds</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Failed Attempts</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-zinc-300 font-serif">{financialStats.failedCount}</span>
            <span className="text-[10px] text-red-400 block mt-0.5">Blocked / Abandoned</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Refunds Issued</span>
          <div className="mt-2">
            <span className="text-lg font-bold text-purple-300 font-serif">₹{financialStats.totalRefunded.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-purple-400/80 block mt-0.5">Audited Refunds</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("CONFIG")}
          className={`px-4 py-2.5 font-medium text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "CONFIG"
              ? "border-salon-gold text-salon-gold font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Gateway Configuration & Credentials</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`px-4 py-2.5 font-medium text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "TRANSACTIONS"
              ? "border-salon-gold text-salon-gold font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Transaction History & Ledger ({transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AUDIT")}
          className={`px-4 py-2.5 font-medium text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "AUDIT"
              ? "border-salon-gold text-salon-gold font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Live Readiness & Security Audit</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: CONFIGURATION & CREDENTIAL MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === "CONFIG" && (
        <div className="space-y-6">
          {/* SECTION A: ENVIRONMENT SELECTOR */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Radio className="h-4 w-4 text-salon-gold" />
                <span>Section 1: Active Payment Mode Selection</span>
              </div>
              <span className="text-[11px] text-zinc-400">Strict Environment Segregation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test Mode Card */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  form.environment === "TEST"
                    ? "bg-salon-gold/10 border-salon-gold shadow-[0_0_15px_rgba(198,165,107,0.15)]"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="environment"
                      value="TEST"
                      checked={form.environment === "TEST"}
                      onChange={() => setForm({ ...form, environment: "TEST" })}
                      className="text-salon-gold focus:ring-0 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-xs text-salon-goldLight block">TEST SANDBOX MODE</span>
                      <span className="text-[10px] text-zinc-400">Safe simulated transactions for testing and verification</span>
                    </div>
                  </div>
                  {getStatusBadge(form.testStatus)}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400 space-y-1">
                  <p>• Uses test cards (e.g. 4111...) and sandbox UPI.</p>
                  <p>• Zero bank charges or real monetary debit.</p>
                  <p>• Ideal for staff training and booking flow verification.</p>
                </div>
              </label>

              {/* Live Mode Card */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  form.environment === "LIVE"
                    ? "bg-red-950/30 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="environment"
                      value="LIVE"
                      checked={form.environment === "LIVE"}
                      onChange={() => {
                        if (form.environment !== "LIVE") {
                          setShowLiveModal(true);
                        }
                      }}
                      className="text-red-500 focus:ring-0 mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                        <span>LIVE PRODUCTION MODE</span>
                        <Badge className="bg-red-950 text-red-300 border-red-700 text-[9px] py-0">REAL FUNDS</Badge>
                      </span>
                      <span className="text-[10px] text-zinc-400">Direct debit of client accounts & bank settlement</span>
                    </div>
                  </div>
                  {getStatusBadge(form.liveStatus)}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400 space-y-1">
                  <p>• Requires verified Razorpay merchant activation.</p>
                  <p>• Debits customer cards, netbanking, and UPI apps.</p>
                  <p>• Requires strict admin confirmation before activation.</p>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION B: OPERATIONAL TOGGLES */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sliders className="h-4 w-4 text-salon-gold" />
                <span>Section 2: Payment Features & Salon Checkout Controls</span>
              </div>
              <span className="text-[11px] text-zinc-400">Checkout Behavior</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: "isEnabled",
                  label: "Enable Payment Gateway",
                  desc: "Master switch to turn Razorpay payment processing on or off.",
                  checked: form.isEnabled,
                  onChange: (v: boolean) => setForm({ ...form, isEnabled: v }),
                },
                {
                  id: "enableOnlinePayments",
                  label: "Allow Online Checkout",
                  desc: "Display online digital payment option to booking clients.",
                  checked: form.enableOnlinePayments,
                  onChange: (v: boolean) => setForm({ ...form, enableOnlinePayments: v }),
                },
                {
                  id: "enableAdvancePayments",
                  label: "Advance Deposit Collection",
                  desc: "Collect configured advance booking deposit to hold appointment slot.",
                  checked: form.enableAdvancePayments,
                  onChange: (v: boolean) => setForm({ ...form, enableAdvancePayments: v }),
                },
                {
                  id: "enableFullPayments",
                  label: "Allow 100% Full Prepayment",
                  desc: "Allow clients to pay the entire service total during online booking.",
                  checked: form.enableFullPayments,
                  onChange: (v: boolean) => setForm({ ...form, enableFullPayments: v }),
                },
                {
                  id: "enableRemainingCollection",
                  label: "Online Remaining Balance",
                  desc: "Allow clients to pay their outstanding balance online prior to visit.",
                  checked: form.enableRemainingCollection,
                  onChange: (v: boolean) => setForm({ ...form, enableRemainingCollection: v }),
                },
                {
                  id: "allowOfflineRecording",
                  label: "Salon Counter Recording",
                  desc: "Allow reception staff to record cash, counter UPI, or POS cards.",
                  checked: form.allowOfflineRecording,
                  onChange: (v: boolean) => setForm({ ...form, allowOfflineRecording: v }),
                },
              ].map((toggle) => (
                <label
                  key={toggle.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/40 hover:bg-zinc-900/80 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={toggle.checked}
                    onChange={(e) => toggle.onChange(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 text-salon-gold focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-white block text-xs">{toggle.label}</span>
                    <span className="text-[11px] text-zinc-400 leading-tight mt-0.5 block">{toggle.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SECTION C: CREDENTIALS CONFIGURATION */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-3 gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Key className="h-4 w-4 text-salon-gold" />
                <span>Section 3: API Credentials (AES-256-GCM Encrypted at Rest)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1.5"
              >
                {showSecrets ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-salon-gold" />}
                <span>{showSecrets ? "Hide Secret Inputs" : "Reveal Secret Inputs"}</span>
              </button>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-3 text-[11px] text-zinc-400">
              <Lock className="h-4 w-4 text-salon-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Enterprise Cryptographic Standard:</span>
                API Secrets are encrypted server-side using authenticated <strong className="text-salon-gold font-mono">AES-256-GCM</strong>. Plaintext secrets are never stored in PostgreSQL or returned to the browser.
              </div>
            </div>

            {/* Test Mode Credentials Card */}
            <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-salon-goldLight">A. TEST MODE CREDENTIALS</span>
                  <span className="text-[10px] text-zinc-500 font-mono">rzp_test_...</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(form.testStatus)}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection("TEST")}
                    disabled={testing !== null}
                    className="text-[10px] h-7 px-2.5 border-zinc-700"
                  >
                    Probe Test API
                  </Button>
                </div>
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
                    placeholder={form.isTestConfigured ? "•••••••••••• (Encrypted in DB)" : "Enter Test Secret"}
                    className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Test Webhook Secret</label>
                  <Input
                    type={showSecrets ? "text" : "password"}
                    value={form.testWebhookSecret}
                    onChange={(e) => setForm({ ...form, testWebhookSecret: e.target.value })}
                    placeholder={form.testWebhookSecret ? "•••••••••••• (Encrypted in DB)" : "Enter Test Webhook Secret"}
                    className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Live Mode Credentials Card */}
            <div className="rounded-xl border border-red-950/60 bg-red-950/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-red-300">B. LIVE PRODUCTION CREDENTIALS</span>
                  <span className="text-[10px] text-zinc-500 font-mono">rzp_live_...</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(form.liveStatus)}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection("LIVE")}
                    disabled={testing !== null}
                    className="text-[10px] h-7 px-2.5 border-zinc-700"
                  >
                    Probe Live API
                  </Button>
                </div>
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
                    placeholder={form.isLiveConfigured ? "•••••••••••• (Encrypted in DB)" : "Enter Live Secret"}
                    className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Live Webhook Secret</label>
                  <Input
                    type={showSecrets ? "text" : "password"}
                    value={form.liveWebhookSecret}
                    onChange={(e) => setForm({ ...form, liveWebhookSecret: e.target.value })}
                    placeholder={form.liveWebhookSecret ? "•••••••••••• (Encrypted in DB)" : "Enter Live Webhook Secret"}
                    className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: ADVANCE AMOUNT & LIMITS */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <DollarSign className="h-4 w-4 text-salon-gold" />
                <span>Section 4: Advance Deposit Business Policy & Monetary Boundaries</span>
              </div>
              <span className="text-[11px] text-zinc-400">Server-Side Limits</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Minimum Booking Advance Deposit (₹)
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

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Maximum Booking Advance Deposit (₹)
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

              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                  Policy When Service Cost &lt; Minimum Advance
                </label>
                <select
                  value={form.belowMinPolicy || "CAP_AT_SERVICE_PRICE"}
                  onChange={(e) => setForm({ ...form, belowMinPolicy: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900 text-xs text-white focus:outline-none focus:border-salon-gold"
                >
                  <option value="CAP_AT_SERVICE_PRICE">Cap Advance at Service Total (₹)</option>
                  <option value="CHARGE_FULL_PRICE">Require 100% Full Prepayment</option>
                </select>
                <span className="text-[10px] text-zinc-500 mt-1 block">Prevents advance from exceeding total invoice</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-medium text-white block text-xs">Allow Customer to Choose Advance Amount</span>
                <span className="text-[11px] text-zinc-400">
                  Customers can select custom deposit within [₹{form.minAdvanceAmount ?? 1000} – ₹{form.maxAdvanceAmount ?? 2500}] range.
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowCustomerSelectAdvance ?? true}
                  onChange={(e) => setForm({ ...form, allowCustomerSelectAdvance: e.target.checked })}
                  className="rounded border-zinc-700 text-salon-gold focus:ring-0"
                />
                <span className="text-xs text-zinc-300">Allow Customer Selection</span>
              </label>
            </div>
          </div>

          {/* SECTION E: WEBHOOK RECONCILIATION */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Server className="h-4 w-4 text-salon-gold" />
                <span>Section 5: Autonomous Webhook Reconciliation Engine</span>
              </div>
              <span className="text-[11px] text-zinc-400">Event Idempotency</span>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5">
                Production Webhook Endpoint (Configure in your Razorpay Dashboard → Settings → Webhooks):
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
                  <span>{copiedWebhook ? "Copied!" : "Copy Webhook URL"}</span>
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-300 block">
                Required Razorpay Webhook Event Subscriptions:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {["order.paid", "payment.captured", "payment.failed", "refund.processed"].map((evt) => (
                  <div key={evt} className="flex items-center gap-1.5 text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-salon-gold shrink-0" />
                    <span className="font-mono text-xs">{evt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="gold"
              size="lg"
              disabled={saving}
              onClick={() => handleSave()}
              className="text-xs gap-2 shadow-lg h-10 px-6"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{saving ? "Saving Changes..." : "Save Payment Gateway Configuration"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: TRANSACTION LEDGER & MONITORING */}
      {/* ==================================================================== */}
      {activeTab === "TRANSACTIONS" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/70">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "ALL", label: "All Transactions" },
                { id: "TEST", label: "Test Sandbox Mode" },
                { id: "LIVE", label: "Live Mode" },
                { id: "OFFLINE", label: "Counter Cash/UPI" },
                { id: "REFUNDED", label: "Refunds" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTxFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    txFilter === f.id
                      ? "bg-salon-gold text-black font-semibold shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                <Input
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Search booking ref, name, phone, payment ID..."
                  className="pl-8 bg-zinc-900 border-zinc-800 text-xs w-64 text-white"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                disabled={txLoading}
                className="border-zinc-800 h-9"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${txLoading ? "animate-spin text-salon-gold" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 text-[11px]">
                    <th className="p-3 font-semibold">Date & Time</th>
                    <th className="p-3 font-semibold">Booking Ref</th>
                    <th className="p-3 font-semibold">Client Name</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold">Purpose</th>
                    <th className="p-3 font-semibold">Method</th>
                    <th className="p-3 font-semibold">Environment</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-zinc-500 text-xs">
                        No transactions found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="p-3 text-zinc-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3 font-mono font-medium text-salon-goldLight">{tx.appointmentNumber}</td>
                        <td className="p-3">
                          <span className="font-medium text-white block">{tx.customerName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{tx.customerPhone}</span>
                        </td>
                        <td className="p-3 font-bold font-serif text-white">
                          ₹{tx.amount.toLocaleString("en-IN")}
                          {tx.refundedAmount && tx.refundedAmount > 0 ? (
                            <span className="text-[10px] text-purple-400 block font-sans font-normal">
                              -₹{tx.refundedAmount.toLocaleString("en-IN")} refunded
                            </span>
                          ) : null}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] border-zinc-700">
                            {tx.paymentPurpose.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3 text-zinc-300">{tx.paymentMethod}</td>
                        <td className="p-3">
                          <Badge
                            variant={tx.environment === "LIVE" ? "destructive" : "gold"}
                            className="text-[9px] uppercase"
                          >
                            {tx.environment}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {tx.status === "SUCCESS" || tx.status === "CAPTURED" ? (
                            <Badge className="bg-emerald-950 text-emerald-300 border-emerald-700 text-[10px]">
                              CAPTURED
                            </Badge>
                          ) : tx.status === "FAILED" ? (
                            <Badge className="bg-red-950 text-red-300 border-red-700 text-[10px]">
                              FAILED
                            </Badge>
                          ) : tx.status === "REFUNDED" ? (
                            <Badge className="bg-purple-950 text-purple-300 border-purple-700 text-[10px]">
                              REFUNDED
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-950 text-amber-300 border-amber-700 text-[10px]">
                              PENDING
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReceipt(tx)}
                              className="text-[10px] h-7 px-2 border-zinc-800 hover:border-salon-gold"
                            >
                              <Receipt className="h-3 w-3 mr-1 text-salon-gold" />
                              Receipt
                            </Button>
                            {(tx.status === "SUCCESS" || tx.status === "CAPTURED") &&
                              (!tx.refundedAmount || tx.refundedAmount < tx.amount) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRefundTx(tx);
                                    setRefundAmount(tx.amount - (tx.refundedAmount || 0));
                                    setShowRefundModal(true);
                                  }}
                                  className="text-[10px] h-7 px-2 border-zinc-800 hover:border-purple-500 text-purple-300"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1 text-purple-400" />
                                  Refund
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: LIVE READINESS CHECKLIST & SECURITY AUDIT */}
      {/* ==================================================================== */}
      {activeTab === "AUDIT" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-salon-gold" />
                <span>Live Mode Production Readiness Scorecard</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchPreflight}
                className="text-xs h-8 border-zinc-800"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Re-assess Readiness
              </Button>
            </div>

            {preflight && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  preflight.readyForLive
                    ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                    : "bg-amber-950/30 border-amber-500/50 text-amber-200"
                }`}>
                  <div className="flex items-center gap-3">
                    {preflight.readyForLive ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {preflight.readyForLive
                          ? "All Prerequisites Satisfied for Live Mode Activation"
                          : "Prerequisites Pending Before Live Mode Activation"}
                      </h4>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        {preflight.readyForLive
                          ? "Live Key ID, Live Secret, and Webhook Secret are verified and encrypted in PostgreSQL."
                          : `Please address: ${preflight.reasons.join(", ")}.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {[
                    { label: "Live Key ID (rzp_live_...)", valid: preflight.checks.liveKeyIdConfigured },
                    { label: "Live Secret Encrypted (AES-256-GCM)", valid: preflight.checks.liveKeySecretConfigured },
                    { label: "Live Webhook Secret Configured", valid: preflight.checks.liveWebhookConfigured },
                    { label: "Live REST API Connection Verified", valid: preflight.checks.isLiveVerified },
                    { label: "Official Salon Domain (thejawedhabibsalons.in)", valid: preflight.checks.domainVerified },
                    { label: "HTTPS Transport Security Active", valid: preflight.checks.httpsVerified },
                    { label: "Neon PostgreSQL Persistence Online", valid: preflight.checks.databasePersistenceVerified },
                    { label: "Master Encryption Key Configured", valid: preflight.checks.masterKeyConfigured },
                  ].map((chk, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/40"
                    >
                      <span className="text-xs text-zinc-300">{chk.label}</span>
                      {chk.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Rotation Protocol */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 space-y-3">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-salon-gold" />
              <span>Key Rotation & Disaster Recovery Protocol</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To rotate Razorpay credentials securely without downtime:
            </p>
            <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-1.5 pl-2">
              <li>Generate a secondary API Key in the official Razorpay Dashboard.</li>
              <li>Enter the new Key ID and Secret into Section 3 above and click <em>Probe Live API</em> to verify authentication.</li>
              <li>Click <em>Save Settings & Encrypt</em> to permanently update the database record.</li>
              <li>Once verified with a test transaction, revoke the old key in the Razorpay Dashboard.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: LIVE MODE ACTIVATION CONFIRMATION */}
      {/* ==================================================================== */}
      {showLiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="rounded-2xl border border-red-500/70 bg-zinc-950 p-6 max-w-lg w-full space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.25)]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-red-950/80 border border-red-500 text-red-400 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">
                  Confirm Activation of Live Mode
                </h3>
                <p className="text-xs text-red-300 mt-1 font-medium">
                  CAUTION: Live Mode processes REAL financial transactions.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/60 text-xs text-zinc-300 space-y-2">
              <p>
                By switching to <strong>LIVE Mode</strong>, any client booking appointments through the salon website will be prompted to make actual payments using real UPI apps, credit/debit cards, and netbanking.
              </p>
              <p className="text-[11px] text-zinc-400">
                • Funds will be settled directly into the salon’s registered Indian merchant bank account.
                <br />
                • Test sandbox cards will be rejected by the payment gateway.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 cursor-pointer">
              <input
                type="checkbox"
                checked={liveConsentGiven}
                onChange={(e) => setLiveConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 text-red-500 focus:ring-0"
              />
              <span className="text-xs text-zinc-200">
                I have verified the Live Key ID, Secret, and Webhooks, and I explicitly authorize real payment processing.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLiveModal(false);
                  setLiveConsentGiven(false);
                }}
                className="border-zinc-800 text-xs"
              >
                Cancel & Keep Test Mode
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={!liveConsentGiven || saving}
                onClick={() => handleSave({ environment: "LIVE" })}
                className="text-xs font-semibold gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Confirm & Activate Live Mode</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: RECEIPT VIEW & PRINT */}
      {/* ==================================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-salon-gold/40 bg-zinc-950 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-salon-gold" />
                <h3 className="font-serif text-base font-bold text-white">Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-center p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block">{BRAND_CONFIG.fullName}</span>
                <span className="text-2xl font-bold font-serif text-salon-goldLight block mt-1">
                  ₹{selectedReceipt.amount.toLocaleString("en-IN")}
                </span>
                <Badge variant={selectedReceipt.environment === "LIVE" ? "destructive" : "gold"} className="mt-1 text-[9px]">
                  {selectedReceipt.environment} PAYMENT
                </Badge>
              </div>

              <div className="space-y-2 divide-y divide-zinc-800/60 pt-2">
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Booking Reference:</span>
                  <span className="font-mono font-medium text-white">{selectedReceipt.appointmentNumber}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Client Name:</span>
                  <span className="text-white font-medium">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Phone:</span>
                  <span className="font-mono text-zinc-300">{selectedReceipt.customerPhone}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Payment Purpose:</span>
                  <span className="text-white">{selectedReceipt.paymentPurpose.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Method:</span>
                  <span className="text-white">{selectedReceipt.paymentMethod}</span>
                </div>
                {selectedReceipt.razorpayPaymentId && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-400">Razorpay ID:</span>
                    <span className="font-mono text-salon-goldLight text-[11px]">{selectedReceipt.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Date:</span>
                  <span className="text-zinc-300">{new Date(selectedReceipt.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="border-zinc-800 text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-salon-gold" />
                <span>Print Receipt</span>
              </Button>
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CONTROLLED REFUND PROCESSING */}
      {/* ==================================================================== */}
      {showRefundModal && refundTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-purple-500/50 bg-zinc-950 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-purple-400" />
                <h3 className="font-serif text-base font-bold text-white">Process Controlled Refund</h3>
              </div>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundTx(null);
                }}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-zinc-400">
                  <span>Captured Payment:</span>
                  <span className="text-white font-bold">₹{refundTx.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-zinc-400 mt-1">
                  <span>Remaining Refundable:</span>
                  <span className="text-purple-300 font-bold">
                    ₹{(refundTx.amount - (refundTx.refundedAmount || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Refund Amount (₹):</label>
                <Input
                  type="number"
                  min="1"
                  max={refundTx.amount - (refundTx.refundedAmount || 0)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Reason for Refund:</label>
                <Input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer cancelled appointment with sufficient notice"
                  className="bg-zinc-900 border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundTx(null);
                }}
                className="border-zinc-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={processingRefund || refundAmount <= 0}
                onClick={handleExecuteRefund}
                className="text-xs bg-purple-600 hover:bg-purple-700"
              >
                {processingRefund ? "Processing Refund..." : `Confirm Refund of ₹${refundAmount}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
