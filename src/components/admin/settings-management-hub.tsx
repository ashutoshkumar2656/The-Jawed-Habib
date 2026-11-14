"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  CreditCard,
  Building2,
  Phone,
  Clock,
  ShieldCheck,
  Users,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export function SettingsManagementHub() {
  const [activeTab, setActiveTab] = React.useState<"salon" | "razorpay" | "booking" | "users" | "staff">("salon");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tab 1: Salon Info State
  const [salonInfo, setSalonInfo] = React.useState({
    salonName: "The Jawed Habib Salon",
    branch: "Lalganj, Vaishali, Bihar, India",
    address: "1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121",
    primaryPhone: "7707000463",
    secondaryPhone: "9831722983",
    tertiaryPhone: "9580000175",
    whatsappPhone: "917707000463",
    instagramUrl: "https://www.instagram.com/the_jawedhabib_lalganj/",
    googleMapsUrl: "https://maps.app.goo.gl/TVx48xoWEu8dMvXT9",
    openingHours: "Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)",
  });

  // Tab 2: Razorpay State
  const [razorpaySettings, setRazorpaySettings] = React.useState({
    environment: "TEST" as "TEST" | "LIVE",
    isEnabled: true,
    testKeyId: "",
    testKeySecret: "••••••••••••••••",
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2500,
    allowCustomerSelectAdvance: true,
    isTestVerified: true,
  });

  // Tab 4: Admin Users State
  const [adminUsers, setAdminUsers] = React.useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = React.useState(false);
  const [newUserData, setNewUserData] = React.useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    roleType: "MANAGER",
  });

  // Tab 5: Staff State
  const [staffList, setStaffList] = React.useState<any[]>([]);

  const fetchSettingsData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [rzpRes, usersRes, staffRes] = await Promise.all([
        fetch("/api/admin/payment-gateway/razorpay"),
        fetch("/api/admin/users"),
        fetch("/api/admin/staff"),
      ]);

      const rzpJson = await rzpRes.json();
      const usersJson = await usersRes.json();
      const staffJson = await staffRes.json();

      if (rzpJson.success && rzpJson.data) {
        setRazorpaySettings((prev) => ({
          ...prev,
          environment: rzpJson.data.environment || "TEST",
          isEnabled: rzpJson.data.isEnabled ?? true,
          testKeyId: rzpJson.data.testKeyId || "",
          minAdvanceAmount: rzpJson.data.minAdvanceAmount || 1000,
          maxAdvanceAmount: rzpJson.data.maxAdvanceAmount || 2500,
          isTestVerified: rzpJson.data.isTestVerified ?? true,
        }));
      }

      if (usersJson.success && Array.isArray(usersJson.data)) {
        setAdminUsers(usersJson.data);
      }

      if (staffJson.success && Array.isArray(staffJson.data)) {
        setStaffList(staffJson.data);
      }
    } catch (e) {
      console.error("Failed to load settings data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

  // Save Salon Info
  const handleSaveSalonInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SALON_NAME: salonInfo.salonName,
          ADDRESS: salonInfo.address,
          PHONE_PRIMARY: salonInfo.primaryPhone,
          PHONE_SECONDARY: salonInfo.secondaryPhone,
          PHONE_TERTIARY: salonInfo.tertiaryPhone,
          OPENING_HOURS: salonInfo.openingHours,
          INSTAGRAM_URL: salonInfo.instagramUrl,
          MAPS_URL: salonInfo.googleMapsUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save settings");
      }
      setFeedback({ type: "success", text: "Salon business coordinates saved successfully!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  // Save Razorpay Settings
  const handleSaveRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/payment-gateway/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(razorpaySettings),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update Razorpay configuration");
      }
      setFeedback({ type: "success", text: "Razorpay payment gateway settings updated!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to update" });
    } finally {
      setSaving(false);
    }
  };

  // Test Razorpay Connection
  const handleTestRazorpay = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/payment-gateway/razorpay/test-connection", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", text: "Razorpay Connection Verified: API keys are live and authentic." });
      } else {
        setFeedback({ type: "error", text: json.error || "Connection test failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Create Admin User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create administrator");
      }
      setFeedback({ type: "success", text: `Admin user "${newUserData.name}" created.` });
      setShowAddUserModal(false);
      setNewUserData({ name: "", phone: "", email: "", password: "", roleType: "MANAGER" });
      fetchSettingsData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="gold">System Configuration</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Security, Gateway & Branch Coordinates</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-salon-gold" />
            <span>Salon Settings & Administration</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Official Lalganj branch identity, Razorpay gateway credentials, operational preferences, and staff profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettingsData}
            className="text-xs h-9 border-zinc-700 hover:text-white"
            title="Reload settings"
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

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1.5 border-b border-salon-borderBlack overflow-x-auto pb-1 text-xs">
        {[
          { id: "salon", label: "Salon & Branch Coordinates", icon: Building2 },
          { id: "razorpay", label: "Razorpay Gateway", icon: CreditCard },
          { id: "booking", label: "Booking & Notifications", icon: Bell },
          { id: "users", label: `Admin Accounts (${adminUsers.length})`, icon: ShieldCheck },
          { id: "staff", label: `Stylists & Staff (${staffList.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-salon-gold text-salon-gold bg-salon-gold/10 font-bold"
                  : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SALON & BRANCH INFO */}
      {activeTab === "salon" && (
        <form onSubmit={handleSaveSalonInfo} className="space-y-5 text-xs">
          <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-salon-gold" />
                  <span>Ground Truth Business Identity</span>
                </h3>
                <p className="text-xs text-zinc-400">Strictly governs footers, receipts, and client confirmations.</p>
              </div>
              <Badge variant="gold">Lalganj Branch</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Official Business Name:</label>
                <Input
                  required
                  value={salonInfo.salonName}
                  onChange={(e) => setSalonInfo({ ...salonInfo, salonName: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Branch Region:</label>
                <Input
                  required
                  value={salonInfo.branch}
                  onChange={(e) => setSalonInfo({ ...salonInfo, branch: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Physical Address:</label>
              <Input
                required
                value={salonInfo.address}
                onChange={(e) => setSalonInfo({ ...salonInfo, address: e.target.value })}
                className="bg-salon-black border-zinc-800 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Primary Phone Line:</label>
                <Input
                  required
                  value={salonInfo.primaryPhone}
                  onChange={(e) => setSalonInfo({ ...salonInfo, primaryPhone: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Secondary Contact Phone:</label>
                <Input
                  required
                  value={salonInfo.secondaryPhone}
                  onChange={(e) => setSalonInfo({ ...salonInfo, secondaryPhone: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Tertiary Support Line:</label>
                <Input
                  required
                  value={salonInfo.tertiaryPhone}
                  onChange={(e) => setSalonInfo({ ...salonInfo, tertiaryPhone: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Official Instagram Link:</label>
                <Input
                  required
                  value={salonInfo.instagramUrl}
                  onChange={(e) => setSalonInfo({ ...salonInfo, instagramUrl: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Google Maps Direct Link:</label>
                <Input
                  required
                  value={salonInfo.googleMapsUrl}
                  onChange={(e) => setSalonInfo({ ...salonInfo, googleMapsUrl: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <Button type="submit" variant="gold" disabled={saving} className="gap-1.5 shadow-md">
                {saving ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Business Information</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: RAZORPAY GATEWAY */}
      {activeTab === "razorpay" && (
        <form onSubmit={handleSaveRazorpay} className="space-y-5 text-xs">
          <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-salon-gold" />
                  <span>Razorpay Payment Gateway Credentials</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Authoritative online payments with AES-256-GCM encrypted secret key storage.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestRazorpay}
                  disabled={saving}
                  className="text-xs h-8 border-salon-gold/40 text-salon-goldLight gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Test Connection</span>
                </Button>
                <Link href="/admin/settings/payment-gateway">
                  <Button variant="outline" size="sm" className="text-xs h-8 gap-1 border-zinc-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Dedicated Gateway Portal</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Environment:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["TEST", "LIVE"] as const).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setRazorpaySettings({ ...razorpaySettings, environment: env })}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        razorpaySettings.environment === env
                          ? "border-salon-gold bg-salon-gold/15 text-salon-gold"
                          : "border-zinc-800 bg-salon-black text-zinc-400 hover:text-white"
                      }`}
                    >
                      {env} Mode
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Gateway Status:</label>
                <div className="p-2.5 rounded-lg bg-salon-black border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">Online Payments Enabled</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Razorpay Key ID:</label>
                <Input
                  required
                  value={razorpaySettings.testKeyId}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, testKeyId: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Secret Key (Encrypted at Rest):</label>
                <Input
                  disabled
                  value="••••••••••••••••••••••••"
                  className="bg-salon-black border-zinc-800 text-zinc-500 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Default Minimum Advance (₹):</label>
                <Input
                  type="number"
                  min={500}
                  max={5000}
                  value={razorpaySettings.minAdvanceAmount}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, minAdvanceAmount: Number(e.target.value) })}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Default Maximum Advance (₹):</label>
                <Input
                  type="number"
                  min={1000}
                  max={10000}
                  value={razorpaySettings.maxAdvanceAmount}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, maxAdvanceAmount: Number(e.target.value) })}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <Button type="submit" variant="gold" disabled={saving} className="gap-1.5 shadow-md">
                {saving ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Razorpay Configuration</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: BOOKING RULES */}
      {activeTab === "booking" && (
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-5 shadow-lg space-y-4 text-xs">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-salon-gold" />
            <span>Booking & Notification Preferences</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-salon-black border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Instant WhatsApp Confirmation Messages</p>
                <p className="text-[11px] text-zinc-400">
                  Pre-generate customized WhatsApp reservation strings with booking reference & salon phone.
                </p>
              </div>
              <span className="text-emerald-400 font-bold">ENABLED</span>
            </div>

            <div className="p-3.5 rounded-lg bg-salon-black border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Cancellation Policy Window</p>
                <p className="text-[11px] text-zinc-400">
                  Customers may cancel reservations up to 2 hours prior to start time.
                </p>
              </div>
              <span className="font-mono text-salon-gold font-bold">2 Hours</span>
            </div>

            <div className="p-3.5 rounded-lg bg-salon-black border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Double-Submission Cooldown</p>
                <p className="text-[11px] text-zinc-400">
                  Blocks rapid repeated clicks from the same client phone and slot within 60 seconds.
                </p>
              </div>
              <span className="font-mono text-emerald-400 font-bold">60 Seconds</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN USERS */}
      {activeTab === "users" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Authorized Salon Administrators</span>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setShowAddUserModal(true)}
              className="h-8 gap-1.5 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Administrator</span>
            </Button>
          </div>

          <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-black/80 text-zinc-400 border-b border-salon-borderBlack uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-borderBlack/40 text-zinc-300">
                {adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/40">
                    <td className="p-3.5 font-medium text-white flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-salon-gold" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">{u.phone}</td>
                    <td className="p-3.5 text-zinc-400">{u.email || "—"}</td>
                    <td className="p-3.5 font-mono text-salon-gold font-bold">{u.roleType}</td>
                    <td className="p-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STAFF */}
      {activeTab === "staff" && (
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-4 shadow-lg space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-salon-gold" />
              <span>Lalganj Salon Stylists & Master Artists ({staffList.length})</span>
            </h3>
            <span className="text-zinc-500 text-[11px]">Assigned to bridal suites & styling stations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staffList.map((stf) => (
              <div
                key={stf.id}
                className="p-3 rounded-lg bg-salon-black border border-zinc-800 flex items-start justify-between"
              >
                <div>
                  <h4 className="font-semibold text-white">{stf.name}</h4>
                  <p className="text-[11px] text-salon-gold mt-0.5">{stf.designation}</p>
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                    Hours: {stf.startTime} – {stf.endTime} (All 7 Days)
                  </p>
                </div>
                <Badge variant="gold">Stylist</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-salon-gold" />
                  <span>Create Admin Account</span>
                </h3>
                <p className="text-xs text-zinc-400">Grant administrative access to salon management tools.</p>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Full Name:</label>
                <Input
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Phone Number (Login ID):</label>
                <Input
                  required
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  placeholder="e.g. 7707000463"
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Email Address:</label>
                <Input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="admin@jawedhabib-lalganj.in"
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Initial Password:</label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Role Type:</label>
                <select
                  value={newUserData.roleType}
                  onChange={(e) => setNewUserData({ ...newUserData, roleType: e.target.value })}
                  className="w-full bg-salon-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full salon & financial access)</option>
                  <option value="ADMIN">ADMIN (Bookings, content & staff)</option>
                  <option value="MANAGER">MANAGER (Operations & floor management)</option>
                  <option value="STAFF">STAFF (Stylist appointment view)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowAddUserModal(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={saving} className="gap-1.5">
                  {saving ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Create Account</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
