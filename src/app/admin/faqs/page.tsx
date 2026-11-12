"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Plus, Trash2, CheckCircle2, Edit2 } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = React.useState<FaqItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    question: "",
    answer: "",
    category: "General",
    sortOrder: 1,
    isActive: true,
  });

  const fetchFaqs = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faqs");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFaqs(json.data);
      }
    } catch (e) {
      console.error("Failed to load FAQs:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      question: "",
      answer: "",
      category: "General",
      sortOrder: faqs.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (f: FaqItem) => {
    setEditingId(f.id);
    setFormData({
      question: f.question,
      answer: f.answer,
      category: f.category,
      sortOrder: f.sortOrder,
      isActive: f.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      const url = editingId ? `/api/admin/faqs/${editingId}` : "/api/admin/faqs";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "FAQ question updated!" : "New FAQ question added!");
        setShowModal(false);
        fetchFaqs();
      } else {
        alert(json.error || "Failed to save FAQ");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("FAQ deleted");
        fetchFaqs();
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
            <Badge variant="gold">Customer Support</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total FAQs: {faqs.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Frequently Asked Questions (FAQ) Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage salon queries, booking guidelines, walk-in policies, and treatment explanations
          </p>
        </div>

        <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>Add New FAQ</span>
        </Button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* FAQs List */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading FAQs...
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
              No FAQs recorded yet. Click &quot;Add New FAQ&quot; above to create one.
            </div>
          ) : (
            faqs.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-salon-borderBlack bg-salon-cardBlack p-4 flex items-start justify-between gap-4 hover:border-salon-gold/50 transition-all text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-salon-gold/15 text-salon-gold font-semibold text-[10px]">
                      {f.category}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">#{f.sortOrder}</span>
                    <h3 className="font-serif text-sm font-bold text-white">{f.question}</h3>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed pl-1">{f.answer}</p>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(f)}
                    className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit FAQ Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit FAQ Question" : "Add Frequently Asked Question"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Question *</label>
                <Input
                  required
                  placeholder="e.g. Do I need an advance appointment for haircuts?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-300 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Hair Styling">Hair Styling</option>
                    <option value="Bridal & Groom">Bridal & Groom</option>
                    <option value="Appointments">Appointments</option>
                    <option value="Pricing & Payment">Pricing & Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Display Sort Order</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Answer *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Comprehensive, helpful answer for visitors..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Save Changes" : "Create FAQ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
