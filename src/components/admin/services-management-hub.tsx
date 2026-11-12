"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  IndianRupee,
  Upload,
  X,
  AlertCircle,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Check,
  PackageCheck,
  Scissors,
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailedDescription?: string | null;
  price: number;
  discountedPrice: number | null;
  durationMinutes: number;
  gender: string;
  categoryId: string;
  imageUrl: string | null;
  additionalImages?: string[];
  isBridal?: boolean;
  allowOnlineBooking?: boolean;
  allowAdvancePayment?: boolean;
  depositType?: string;
  depositValue?: number;
  minAdvanceAmount?: number;
  maxAdvanceAmount?: number;
  suggestedAdvanceOptions?: number[];
  allowCustomerSelectAdvance?: boolean;
  allowFullPayment?: boolean;
  sortOrder?: number;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconName?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function ServicesManagementHub() {
  const [activeTab, setActiveTab] = React.useState<"packages" | "services" | "categories">("packages");
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Modals
  const [editingItem, setEditingItem] = React.useState<ServiceItem | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [isPackageMode, setIsPackageMode] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    price: 5000,
    discountedPrice: 4500,
    durationMinutes: 180,
    categoryId: "",
    imageUrl: "/images/services/service-bridal-makeup.jpg",
    minAdvanceAmount: 1500,
    maxAdvanceAmount: 2500,
    isBridal: true,
    isFeatured: true,
    isPopular: true,
    isActive: true,
    depositType: "FIXED",
  });

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [srvRes, catRes] = await Promise.all([
        fetch("/api/bridal/services"),
        fetch("/api/categories"),
      ]);

      const srvJson = await srvRes.json();
      const catJson = await catRes.json();

      if (srvJson.success && Array.isArray(srvJson.data)) {
        setServices(srvJson.data);
      }
      if (catJson.success && Array.isArray(catJson.data)) {
        setCategories(catJson.data);
        if (catJson.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catJson.data[0].id }));
        }
      }
    } catch (e) {
      console.error("Failed to load catalog data:", e);
    } finally {
      setLoading(false);
    }
  }, [formData.categoryId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Packages are services marked as isBridal or categorized under bridal suites
  const packagesList = React.useMemo(() => {
    return services.filter(
      (s) =>
        (s.isBridal || s.price >= 3000 || s.durationMinutes >= 90) &&
        (search ? s.name.toLowerCase().includes(search.toLowerCase()) : true)
    );
  }, [services, search]);

  const individualServicesList = React.useMemo(() => {
    return services.filter(
      (s) =>
        (!s.isBridal && s.price < 3000 && s.durationMinutes < 90) &&
        (search ? s.name.toLowerCase().includes(search.toLowerCase()) : true)
    );
  }, [services, search]);

  // Toggle Service Active Status
  const handleToggleActive = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/bridal/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }
      setFeedback({
        type: "success",
        text: `"${service.name}" ${!service.isActive ? "published" : "unpublished"}.`,
      });
      fetchData();
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message });
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive or remove "${name}"?`)) return;
    try {
      const res = await fetch(`/api/bridal/services/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to remove item");
      }
      setFeedback({ type: "success", text: `"${name}" removed successfully.` });
      fetchData();
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message });
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      price: item.price,
      discountedPrice: item.discountedPrice || item.price,
      durationMinutes: item.durationMinutes,
      categoryId: item.categoryId || (categories[0]?.id || ""),
      imageUrl: item.imageUrl || "/images/services/service-bridal-makeup.jpg",
      minAdvanceAmount: item.minAdvanceAmount || 1000,
      maxAdvanceAmount: item.maxAdvanceAmount || 2500,
      isBridal: item.isBridal ?? true,
      isFeatured: item.isFeatured ?? false,
      isPopular: item.isPopular ?? false,
      isActive: item.isActive ?? true,
      depositType: item.depositType || "FIXED",
    });
    setShowAddModal(true);
  };

  // Save Service / Package
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url = editingItem
        ? `/api/bridal/services/${editingItem.id}`
        : "/api/bridal/services";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save service");
      }

      setFeedback({
        type: "success",
        text: `"${formData.name}" successfully ${editingItem ? "updated" : "created"}.`,
      });
      setShowAddModal(false);
      setEditingItem(null);
      fetchData();
    } catch (e: any) {
      setFeedback({ type: "error", text: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="gold">Salon Menu & Pricing</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Bridal Suites, Hair & Skin</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Crown className="h-7 w-7 text-salon-gold" />
            <span>Bridal Services & Packages</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage packages, pricing, durations, advance deposit requirements, and catalog availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsPackageMode(activeTab === "packages");
              setFormData({
                name: "",
                slug: "",
                description: "",
                price: activeTab === "packages" ? 6000 : 1500,
                discountedPrice: activeTab === "packages" ? 5000 : 1200,
                durationMinutes: activeTab === "packages" ? 180 : 45,
                categoryId: categories[0]?.id || "cat_6",
                imageUrl: "/images/services/service-bridal-makeup.jpg",
                minAdvanceAmount: activeTab === "packages" ? 1500 : 500,
                maxAdvanceAmount: activeTab === "packages" ? 2500 : 1200,
                isBridal: activeTab === "packages",
                isFeatured: true,
                isPopular: true,
                isActive: true,
                depositType: "FIXED",
              });
              setShowAddModal(true);
            }}
            className="text-xs h-9 gap-1.5 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add New {activeTab === "packages" ? "Package" : "Service"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs h-9 gap-1.5 border-zinc-700 hover:text-white"
            title="Refresh Catalog"
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

      {/* Subtabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-salon-richBlack/40 p-3 rounded-xl border border-salon-borderBlack">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "packages"
                ? "bg-salon-gold text-black font-bold shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Bridal Packages ({packagesList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "services"
                ? "bg-salon-gold text-black font-bold shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Scissors className="h-3.5 w-3.5" />
            <span>Individual Services ({individualServicesList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "categories"
                ? "bg-salon-gold text-black font-bold shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Categories ({categories.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog items..."
            className="pl-8 bg-salon-black border-zinc-800 text-xs h-8 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "categories" ? (
        /* Categories Table */
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-salon-black/80 text-zinc-400 border-b border-salon-borderBlack uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Sort Order</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-salon-borderBlack/40 text-zinc-300">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3.5 font-medium text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-salon-gold" />
                    <span>{c.name}</span>
                  </td>
                  <td className="p-3.5 font-mono text-zinc-400">{c.slug}</td>
                  <td className="p-3.5 text-zinc-400 max-w-xs truncate">{c.description || "—"}</td>
                  <td className="p-3.5 font-mono text-zinc-400">{c.sortOrder ?? 0}</td>
                  <td className="p-3.5 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards for Packages or Services */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === "packages" ? packagesList : individualServicesList).map((s) => (
            <div
              key={s.id}
              className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-md group ${
                s.isActive
                  ? "border-salon-borderBlack bg-salon-richBlack/60 hover:border-salon-gold/50"
                  : "border-red-950/40 bg-zinc-950/40 opacity-70"
              }`}
            >
              <div>
                {/* Header image preview */}
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden border-b border-zinc-800/80">
                  <Image
                    src={s.imageUrl || "/images/services/service-bridal-makeup.jpg"}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Status & Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {s.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-salon-gold text-black shadow-lg">
                        Featured
                      </span>
                    )}
                    {s.isPopular && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-purple-500 text-white shadow-lg">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`p-1.5 rounded-full shadow-lg backdrop-blur-md transition-colors ${
                        s.isActive ? "bg-emerald-950/80 text-emerald-400" : "bg-red-950/80 text-red-400"
                      }`}
                      title={s.isActive ? "Unpublish from public catalog" : "Publish to public catalog"}
                    >
                      {s.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Pricing Over Image */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Pricing</div>
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="font-serif text-xl font-bold text-white">
                          ₹{(s.discountedPrice ?? s.price).toLocaleString("en-IN")}
                        </span>
                        {s.discountedPrice && s.discountedPrice < s.price && (
                          <span className="text-xs text-zinc-400 line-through">
                            ₹{s.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-zinc-300 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-salon-gold" />
                      <span>{s.durationMinutes} min</span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <h3 className="font-serif text-base font-bold text-white group-hover:text-salon-goldLight transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {s.description || "Luxury salon styling and bridal treatment crafted for special celebrations."}
                    </p>
                  </div>

                  {/* Advance Configuration */}
                  <div className="p-2.5 rounded-lg bg-salon-black border border-zinc-800 text-[11px] space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Online Advance Deposit:</span>
                      <span className="font-mono font-semibold text-salon-gold">
                        ₹{(s.minAdvanceAmount ?? 1000).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Balance Due at Salon:</span>
                      <span className="font-mono text-purple-400 font-semibold">
                        ₹{((s.discountedPrice ?? s.price) - (s.minAdvanceAmount ?? 1000)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-zinc-800/80 bg-salon-black/40 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(s)}
                  className="text-xs h-7 flex-1 border-zinc-700 hover:text-white gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit Details</span>
                </Button>
                <button
                  onClick={() => handleDeleteService(s.id, s.name)}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Archive or Delete Service"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-salon-gold" />
                  <span>{editingItem ? "Edit Bridal Package / Service" : "Create New Bridal Package"}</span>
                </h3>
                <p className="text-xs text-zinc-400">Configure pricing, duration, advance deposit, and inclusions.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Service / Package Name:</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Rajputana Grand Bridal Suite"
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief editorial summary of inclusions..."
                  className="w-full bg-salon-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Regular Price (₹):</label>
                  <Input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="bg-salon-black border-zinc-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Discounted Price (₹):</label>
                  <Input
                    type="number"
                    required
                    value={formData.discountedPrice}
                    onChange={(e) => setFormData({ ...formData, discountedPrice: Number(e.target.value) })}
                    className="bg-salon-black border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Duration (Minutes):</label>
                  <Input
                    type="number"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="bg-salon-black border-zinc-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Online Advance Deposit (₹):</label>
                  <Input
                    type="number"
                    required
                    value={formData.minAdvanceAmount}
                    onChange={(e) => setFormData({ ...formData, minAdvanceAmount: Number(e.target.value) })}
                    className="bg-salon-black border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Image URL:</label>
                <Input
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/services/..."
                  className="bg-salon-black border-zinc-800 text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isBridal}
                    onChange={(e) => setFormData({ ...formData, isBridal: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                  />
                  <span>Bridal Suite</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                  />
                  <span>Published</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={submitting} className="gap-1.5">
                  {submitting ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>{editingItem ? "Save Changes" : "Create Item"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
