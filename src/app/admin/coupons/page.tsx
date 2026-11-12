"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle,
  Copy,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    code: "",
    description: "",
    discountType: "FIXED_AMOUNT" as "FIXED_AMOUNT" | "PERCENTAGE",
    discountValue: 100,
    minOrderValue: 499,
    maxDiscount: null as number | null,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
  });

  const fetchCoupons = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCoupons(json.data);
      }
    } catch (e) {
      console.error("Failed to load coupons:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("New coupon code created!");
        setShowModal(false);
        fetchCoupons();
      } else {
        alert(json.error || "Failed to create coupon");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Coupon deleted");
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Discounts</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Codes: {coupons.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Promo Codes & Coupons
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Generate and manage coupon voucher codes with minimum spend and discount rules
          </p>
        </div>

        <Button variant="gold" onClick={() => setShowModal(true)} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </Button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Coupons Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          No coupon codes generated yet.
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">Coupon Code</th>
                  <th className="p-3.5">Benefit</th>
                  <th className="p-3.5">Min Order Value</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-mono font-bold text-salon-gold text-sm">
                      {c.code}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-semibold text-white">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-zinc-400">
                      ₹{c.minOrderValue}
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-zinc-400">
                      {c.description || "—"}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          c.isActive
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                            : "bg-zinc-900 text-zinc-500 border-zinc-800"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                Create Promo Coupon Code
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Coupon Code (Uppercase) *</label>
                <Input
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-zinc-900 border-zinc-800 font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="FIXED_AMOUNT">FLAT AMOUNT (₹)</option>
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Discount Value *</label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Minimum Order (₹)</label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Valid Until</label>
                  <Input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description / Campaign Purpose</label>
                <Input
                  placeholder="e.g. Valid on appointments above ₹499"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Creating..." : "Save Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
