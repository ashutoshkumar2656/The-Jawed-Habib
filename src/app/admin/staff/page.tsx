"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserCheck,
  Plus,
  Star,
  Clock,
  Calendar,
  CheckCircle,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Award,
} from "lucide-react";

interface Staff {
  id: string;
  userId: string;
  name: string;
  designation: string;
  bio: string | null;
  experienceYears: number;
  specialties: string[];
  rating: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  user?: {
    name: string;
    phone: string;
    email: string | null;
  };
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
    designation: "Master Hair Stylist",
    bio: "",
    experienceYears: 5,
    specialties: "Precision Haircut, Creative Styling, Beard Contouring",
    workingDays: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
    startTime: "10:00",
    endTime: "22:00",
    isAvailable: true,
  });

  const fetchStaff = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStaffList(json.data);
      }
    } catch (e) {
      console.error("Failed to load staff:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      designation: "Master Hair Stylist",
      bio: "",
      experienceYears: 5,
      specialties: "Precision Haircut, Creative Styling, Beard Contouring",
      workingDays: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
      startTime: "10:00",
      endTime: "22:00",
      isAvailable: true,
    });
    setShowModal(true);
  };

  const openEditModal = (stf: Staff) => {
    setEditingId(stf.id);
    setFormData({
      name: stf.name || stf.user?.name || "",
      phone: stf.user?.phone || "",
      email: stf.user?.email || "",
      designation: stf.designation,
      bio: stf.bio || "",
      experienceYears: stf.experienceYears,
      specialties: Array.isArray(stf.specialties) ? stf.specialties.join(", ") : "",
      workingDays: Array.isArray(stf.workingDays) ? stf.workingDays.join(", ") : "",
      startTime: stf.startTime,
      endTime: stf.endTime,
      isAvailable: stf.isAvailable,
    });
    setShowModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        designation: formData.designation,
        bio: formData.bio || undefined,
        experienceYears: Number(formData.experienceYears),
        specialties: formData.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        workingDays: formData.workingDays.split(",").map((s) => s.trim()).filter(Boolean),
        startTime: formData.startTime,
        endTime: formData.endTime,
        isAvailable: formData.isAvailable,
      };

      const url = editingId ? `/api/admin/staff/${editingId}` : "/api/admin/staff";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "Staff details updated!" : "New staff member added!");
        setShowModal(false);
        fetchStaff();
      } else {
        alert(json.error || "Failed to save staff member");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleToggleDuty = async (stf: Staff) => {
    try {
      const res = await fetch(`/api/admin/staff/${stf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !stf.isAvailable }),
      });
      const json = await res.json();
      if (json.success) {
        fetchStaff();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove stylist "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Staff record removed");
        fetchStaff();
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
            <Badge variant="gold">Styling Team</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Stylists: {staffList.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Staff & Stylist Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Chair allocations, working hours (10:00 AM – 10:00 PM), and skill specializations
          </p>
        </div>

        <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>Add New Stylist</span>
        </Button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading stylists directory...
        </div>
      ) : staffList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs space-y-3">
          <UserCheck className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-medium text-white">No stylists currently registered</p>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Click &quot;Add Stylist&quot; above to register your master hair stylists, colorists, and beauty specialists.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">Stylist</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Hours</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Specialties</th>
                  <th className="p-3.5">Floor Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {staffList.map((stf) => {
                  const name = stf.name || stf.user?.name || "Stylist";
                  const phone = stf.user?.phone || "—";
                  return (
                    <tr key={stf.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-medium text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-salon-gold/20 text-salon-gold font-serif font-bold text-xs">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-semibold text-white">{name}</span>
                            <span className="text-[11px] text-zinc-500">{stf.experienceYears}+ yrs experience</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-zinc-300">
                        {stf.designation}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="block text-zinc-300">{phone}</span>
                        {stf.user?.email && (
                          <span className="block text-[11px] text-zinc-500">{stf.user.email}</span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-zinc-300">
                        {stf.startTime} – {stf.endTime}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-bold text-salon-gold">
                          <Star className="h-3.5 w-3.5 fill-salon-gold text-salon-gold" />
                          <span>{stf.rating.toFixed(1)}</span>
                        </span>
                      </td>
                      <td className="p-3.5 max-w-[200px] truncate text-zinc-400">
                        {Array.isArray(stf.specialties) ? stf.specialties.join(", ") : "Styling"}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleDuty(stf)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                            stf.isAvailable
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                              : "bg-zinc-900 text-zinc-500 border-zinc-800"
                          }`}
                        >
                          {stf.isAvailable ? "On Floor" : "Off Duty"}
                        </button>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => openEditModal(stf)}
                          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Stylist"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(stf.id, name)}
                          className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Remove Stylist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit Stylist Profile" : "Add New Salon Stylist"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Stylist Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Phone Number *</label>
                  <Input
                    required
                    placeholder="e.g. 9831722983"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. vikram@jawedhabib-lalganj.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Designation *</label>
                  <Input
                    required
                    placeholder="e.g. Master Hair Stylist"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Experience (Years)</label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Start Time (Opening: 10:00)</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">End Time (Closing: 22:00)</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Specialties (comma separated)</label>
                <Input
                  placeholder="e.g. Precision Haircut, Fade, Balayage, Keratin"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-0"
                  />
                  <span>Active & Available for booking</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Update Stylist" : "Add Stylist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
