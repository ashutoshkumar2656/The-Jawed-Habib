"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Plus,
  CheckCircle,
  UserCheck,
  Lock,
  KeyRound,
  Shield,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  roleType: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    roleType: "MANAGER" as "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF",
  });

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      }
    } catch (e) {
      console.error("Failed to load admin users:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`Admin user account created for ${json.data?.name}`);
        setShowModal(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          password: "",
          roleType: "MANAGER",
        });
        fetchUsers();
      } else {
        alert(json.error || "Failed to create user account");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Access Control</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Privileged Users: {users.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Admin Users & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage manager logins, administrative privileges, and staff roles
          </p>
        </div>

        <Button variant="gold" onClick={() => setShowModal(true)} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>Create Admin User</span>
        </Button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Role Hierarchy Reference Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="border-l-2 border-salon-gold pl-3">
          <span className="font-bold text-white block">SUPER_ADMIN</span>
          <span className="text-[11px] text-zinc-400">Full control over financials, users, settings, and branches</span>
        </div>
        <div className="border-l-2 border-emerald-500 pl-3">
          <span className="font-bold text-white block">ADMIN</span>
          <span className="text-[11px] text-zinc-400">Daily management, service pricing, refunds, and team rosters</span>
        </div>
        <div className="border-l-2 border-blue-500 pl-3">
          <span className="font-bold text-white block">MANAGER</span>
          <span className="text-[11px] text-zinc-400">Floor operations, chair bookings, customer CRM, and reviews</span>
        </div>
        <div className="border-l-2 border-purple-500 pl-3">
          <span className="font-bold text-white block">STAFF</span>
          <span className="text-[11px] text-zinc-400">View personal chair schedules and mark appointments completed</span>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading user accounts...
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Contact Phone</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((u) => {
                  let roleBadge = "bg-zinc-800 text-zinc-300 border-zinc-700";
                  if (u.roleType === "SUPER_ADMIN") roleBadge = "bg-salon-gold/20 text-salon-gold border-salon-gold/40";
                  if (u.roleType === "ADMIN") roleBadge = "bg-emerald-950/60 text-emerald-300 border-emerald-800";
                  if (u.roleType === "MANAGER") roleBadge = "bg-blue-950/60 text-blue-300 border-blue-800";
                  if (u.roleType === "STAFF") roleBadge = "bg-purple-950/60 text-purple-300 border-purple-800";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-medium text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-salon-gold/20 text-salon-gold font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-zinc-300">
                        {u.phone}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-zinc-400">
                        {u.email || "—"}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleBadge}`}>
                          {u.roleType}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Active
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                        {typeof u.createdAt === "string" ? u.createdAt.split("T")[0] : ""}
                      </td>
                    </tr>
                  );
                })}
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
                Create Administrative User
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">10-Digit Phone *</label>
                  <Input
                    required
                    placeholder="e.g. 9831722983"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Email (Optional)</label>
                  <Input
                    type="email"
                    placeholder="e.g. ramesh@jawedhabib-lalganj.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Password (min 6 chars) *</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Role / Privilege Level *</label>
                <select
                  value={formData.roleType}
                  onChange={(e) => setFormData({ ...formData, roleType: e.target.value as any })}
                  className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-300 focus:outline-none"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Branch Control)</option>
                  <option value="ADMIN">ADMIN (Operations & Catalogs)</option>
                  <option value="MANAGER">MANAGER (Floor & Schedule)</option>
                  <option value="STAFF">STAFF (Stylist Schedule Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
