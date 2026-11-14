"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Printer,
  RotateCcw,
  Receipt,
  Eye,
  Check,
  X,
  IndianRupee,
  Calendar,
  Phone,
  User,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

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
  recordedBy?: string | null;
  createdAt: string;
}

export function PaymentsManagementHub() {
  const [payments, setPayments] = React.useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterTab, setFilterTab] = React.useState("ALL");
  const [selectedReceipt, setSelectedReceipt] = React.useState<PaymentTransaction | null>(null);

  // Offline Payment Modal State
  const [showCollectModal, setShowCollectModal] = React.useState(false);
  const [collectApptNumber, setCollectApptNumber] = React.useState("");
  const [collectAmount, setCollectAmount] = React.useState(1000);
  const [collectMethod, setCollectMethod] = React.useState<"CASH" | "UPI" | "CARD">("CASH");
  const [cashier, setCashier] = React.useState("Salon Reception Cashier");
  const [notes, setNotes] = React.useState("");
  const [collecting, setCollecting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayments = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayments(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch payments:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Financial Figures Computed from Actual Database Records
  const financialStats = React.useMemo(() => {
    let advanceReceived = 0;
    let salonCounterCollected = 0;
    let totalCollected = 0;
    let failedCount = 0;

    payments.forEach((p) => {
      if (p.status === "SUCCESS" || p.status === "CAPTURED") {
        totalCollected += p.amount;
        if (p.paymentPurpose === "ADVANCE_DEPOSIT" || p.environment === "TEST" || p.environment === "LIVE") {
          advanceReceived += p.amount;
        } else {
          salonCounterCollected += p.amount;
        }
      } else if (p.status === "FAILED") {
        failedCount++;
      }
    });

    return {
      advanceReceived,
      salonCounterCollected,
      totalCollected,
      failedCount,
      totalTransactions: payments.length,
    };
  }, [payments]);

  // Filtered Payments
  const filteredPayments = React.useMemo(() => {
    return payments.filter((p) => {
      // Tab filter
      if (filterTab === "ADVANCE") {
        if (p.paymentPurpose !== "ADVANCE_DEPOSIT") return false;
      } else if (filterTab === "COUNTER") {
        if (p.paymentPurpose === "ADVANCE_DEPOSIT") return false;
      } else if (filterTab === "RAZORPAY") {
        if (!p.razorpayOrderId && !p.razorpayPaymentId) return false;
      } else if (filterTab === "FAILED") {
        if (p.status !== "FAILED") return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.transactionRef?.toLowerCase().includes(q) ||
          p.appointmentNumber?.toLowerCase().includes(q) ||
          p.customerName?.toLowerCase().includes(q) ||
          p.customerPhone?.toLowerCase().includes(q) ||
          p.razorpayPaymentId?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payments, filterTab, search]);

  // Handle Offline Collection Submit
  const handleRecordOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectApptNumber || collectAmount <= 0) return;

    try {
      setCollecting(true);
      // Fetch appointment to get ID
      const apptRes = await fetch(`/api/admin/appointments?search=${encodeURIComponent(collectApptNumber.trim())}`);
      const apptJson = await apptRes.json();
      const appt = apptJson.data?.find(
        (a: any) => a.appointmentNumber.toLowerCase() === collectApptNumber.trim().toLowerCase()
      );

      if (!appt) {
        throw new Error(`Appointment reference "${collectApptNumber}" not found.`);
      }

      const res = await fetch("/api/bridal/payments/collect-remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appt.id,
          amount: collectAmount,
          paymentMethod: collectMethod,
          paymentDate: new Date().toISOString(),
          receivedBy: cashier,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to record payment");
      }

      setFeedback({
        type: "success",
        text: `Successfully recorded ₹${collectAmount.toLocaleString("en-IN")} for ${collectApptNumber}.`,
      });
      setShowCollectModal(false);
      setCollectApptNumber("");
      setNotes("");
      fetchPayments();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to record payment" });
    } finally {
      setCollecting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Transaction ID,Booking ID,Customer,Phone,Amount,Purpose,Method,Status,Date"];
    const rows = filteredPayments.map((p) =>
      [
        `"${p.transactionRef}"`,
        `"${p.appointmentNumber}"`,
        `"${p.customerName}"`,
        `"${p.customerPhone}"`,
        p.amount,
        `"${p.paymentPurpose}"`,
        `"${p.paymentMethod}"`,
        `"${p.status}"`,
        `"${p.createdAt}"`,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jawed-habib-payments-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="gold">Financial Ledger</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Razorpay Online & Salon Counter</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <CreditCard className="h-7 w-7 text-salon-gold" />
            <span>Payment Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete transaction history, advance deposits, counter collections, receipts, and Razorpay reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/settings/payment-gateway">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5 border-salon-gold/40 text-salon-gold hover:border-salon-gold hover:text-white"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Gateway Settings</span>
            </Button>
          </Link>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setShowCollectModal(true)}
            className="text-xs h-9 gap-1.5 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Record Counter Payment</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9 gap-1.5 border-zinc-700 hover:text-white"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            className="text-xs h-9 border-zinc-700 hover:text-white"
            title="Refresh"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-zinc-400 font-medium">Total Collected</p>
          <p className="font-serif text-2xl font-bold text-white mt-1">
            ₹{financialStats.totalCollected.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Online + Salon Counter</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-salon-gold font-medium">Advance Received</p>
          <p className="font-serif text-2xl font-bold text-salon-gold mt-1">
            ₹{financialStats.advanceReceived.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Via Razorpay Gateway</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-purple-400 font-medium">Collected at Salon</p>
          <p className="font-serif text-2xl font-bold text-purple-400 mt-1">
            ₹{financialStats.salonCounterCollected.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Cash, UPI & Card Counter</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-blue-400 font-medium">Total Transactions</p>
          <p className="font-serif text-2xl font-bold text-blue-400 mt-1">
            {financialStats.totalTransactions}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">{financialStats.failedCount} Failed / Reversed</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-salon-richBlack/40 p-3 rounded-xl border border-salon-borderBlack">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Transactions" },
            { id: "ADVANCE", label: "Advance Deposits" },
            { id: "COUNTER", label: "Salon Counter" },
            { id: "RAZORPAY", label: "Razorpay" },
            { id: "FAILED", label: "Failed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                filterTab === tab.id
                  ? "bg-salon-gold text-black font-bold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, booking ID, customer name..."
            className="pl-8 bg-salon-black border-zinc-800 text-xs h-8 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-salon-black/80 text-zinc-400 border-b border-salon-borderBlack uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="p-3.5">Transaction Ref</th>
                <th className="p-3.5">Booking Reference</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Purpose / Method</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-salon-borderBlack/40 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin text-salon-gold" />
                      <span>Loading payment transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    No payment records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isSuccess = p.status === "SUCCESS" || p.status === "CAPTURED";
                  const isFailed = p.status === "FAILED";

                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 font-mono text-zinc-300">
                        <span className="font-semibold text-white">{p.transactionRef}</span>
                        {p.razorpayPaymentId && (
                          <div className="text-[10px] text-salon-gold font-mono truncate max-w-[120px]">
                            {p.razorpayPaymentId}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-medium text-white">{p.appointmentNumber}</td>
                      <td className="p-3.5">
                        <div className="font-medium text-white">{p.customerName || "Client"}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{p.customerPhone}</div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="font-serif text-sm font-bold text-white">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="text-zinc-300 font-medium">
                          {p.paymentPurpose ? p.paymentPurpose.replace(/_/g, " ") : "PAYMENT"}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {p.paymentMethod} • {p.environment}
                        </div>
                      </td>
                      <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                        {new Date(p.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuccess
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                              : isFailed
                              ? "bg-red-950/60 text-red-400 border border-red-800/60"
                              : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="p-1.5 rounded-md hover:bg-zinc-800 text-salon-gold hover:text-salon-goldLight"
                          title="View & Print Official Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Counter Payment Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-salon-gold" />
                  <span>Record Salon Reception Payment</span>
                </h3>
                <p className="text-xs text-zinc-400">Collect payment in Cash, UPI, or Card at front desk.</p>
              </div>
              <button onClick={() => setShowCollectModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordOfflinePayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Appointment Number (e.g. JH-LAL-2026-000131):
                </label>
                <Input
                  required
                  placeholder="JH-LAL-2026-..."
                  value={collectApptNumber}
                  onChange={(e) => setCollectApptNumber(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Amount to Collect (₹):</label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="bg-salon-black border-zinc-800 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Payment Method:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "UPI", "CARD"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCollectMethod(m)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        collectMethod === m
                          ? "border-salon-gold bg-salon-gold/15 text-salon-gold"
                          : "border-zinc-800 bg-salon-black text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Cashier / Staff Name:</label>
                <Input
                  required
                  value={cashier}
                  onChange={(e) => setCashier(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Payment Notes:</label>
                <Input
                  placeholder="e.g. Paid at reception counter via UPI"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowCollectModal(false)} disabled={collecting}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={collecting} className="gap-1.5">
                  {collecting ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save Payment & Update Balance</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-zinc-900 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 print:m-0 print:p-0">
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="font-serif text-xl font-bold tracking-tight uppercase text-zinc-950">
                The Jawed Habib Salon
              </h2>
              <p className="text-xs text-zinc-600 font-medium">Lalganj, Vaishali, Bihar – 844121</p>
              <p className="text-[11px] text-zinc-500">
                1st Floor, Tinpulwa Chowk, Above Killer Showroom • Phone: 7707000463
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-mono font-bold text-zinc-800">
                PAYMENT RECEIPT: {selectedReceipt.transactionRef}
              </div>
            </div>

            <div className="text-xs space-y-2 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-zinc-600">Booking Reference:</span>
                <span className="font-mono font-bold">{selectedReceipt.appointmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Customer Name:</span>
                <span className="font-semibold">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Customer Phone:</span>
                <span className="font-mono">{selectedReceipt.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Payment Purpose:</span>
                <span className="font-medium">{selectedReceipt.paymentPurpose.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Payment Mode:</span>
                <span className="font-semibold">{selectedReceipt.paymentMethod}</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
              <div className="flex justify-between text-zinc-900 font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-700 text-sm">
                  ₹{selectedReceipt.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Transaction Status:</span>
                <span className="font-semibold text-emerald-700">{selectedReceipt.status}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Timestamp:</span>
                <span className="font-mono">{new Date(selectedReceipt.createdAt).toLocaleString("en-IN")}</span>
              </div>
              {selectedReceipt.recordedBy && (
                <div className="flex justify-between text-zinc-600">
                  <span>Processed By:</span>
                  <span>{selectedReceipt.recordedBy}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="text-xs text-zinc-700"
              >
                Close
              </Button>
              <Button variant="gold" size="sm" onClick={() => window.print()} className="text-xs gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                <span>Print Receipt</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
