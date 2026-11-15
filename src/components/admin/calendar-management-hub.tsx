"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  Clock,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Plus,
  Ban,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Calendar as CalendarIcon,
  Filter,
  RotateCcw,
  Save,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

interface AppointmentCalendarItem {
  id: string;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  customerProfile?: {
    user?: {
      name: string;
      phone: string;
    };
  };
  package?: {
    name: string;
  } | null;
  appointmentServices?: {
    service: {
      name: string;
    };
  }[];
}

interface BlockedDateItem {
  id: string;
  date: string;
  reason: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
}

export function CalendarManagementHub() {
  const [activeTab, setActiveTab] = React.useState<"interactive" | "hours" | "holidays">("interactive");
  const [appointments, setAppointments] = React.useState<AppointmentCalendarItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState<"day" | "week" | "month">("week");

  // Weekly Hours State (All 7 Days: 10:00 AM – 10:00 PM)
  const [weeklyHours, setWeeklyHours] = React.useState([
    { day: "Monday", isOpen: true, openingTime: "10:00", closingTime: "22:00" },
    { day: "Tuesday", isOpen: true, openingTime: "10:00", closingTime: "22:00" },
    { day: "Wednesday", isOpen: true, openingTime: "10:00", closingTime: "22:00" },
    { day: "Thursday", isOpen: true, openingTime: "10:00", closingTime: "22:00" },
    { day: "Friday", isOpen: true, openingTime: "10:00", closingTime: "22:00" },
    { day: "Saturday", isOpen: true, openingTime: "10:00", closingTime: "22:00" },
    { day: "Sunday", isOpen: true, openingTime: "10:00", closingTime: "22:00" },
  ]);

  const [slotInterval, setSlotInterval] = React.useState<number>(30);
  const [bufferTime, setBufferTime] = React.useState<number>(15);
  const [maxPerSlot, setMaxPerSlot] = React.useState<number>(2);
  const [maxPerDay, setMaxPerDay] = React.useState<number>(8);
  const [advanceBookingDays, setAdvanceBookingDays] = React.useState<number>(30);

  // Holidays / Blocked dates
  const [blockedDates, setBlockedDates] = React.useState<BlockedDateItem[]>([
    { id: "b1", date: "2026-11-25", reason: "Salon Deep Sanitation & Studio Maintenance", isFullDay: true },
  ]);
  const [newBlockedDate, setNewBlockedDate] = React.useState("");
  const [newBlockedReason, setNewBlockedReason] = React.useState("");

  const [savingSettings, setSavingSettings] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCalendarData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/appointments");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAppointments(json.data);
      }
    } catch (e) {
      console.error("Failed to load appointments for calendar:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Navigate dates
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "day") next.setDate(next.getDate() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "day") next.setDate(next.getDate() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      // Persist to calendar settings API
      const res = await fetch("/api/admin/calendar-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyHours,
          slotInterval,
          bufferTime,
          maxPerSlot,
          maxPerDay,
          advanceBookingDays,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save calendar settings");
      }

      setFeedback({ type: "success", text: "Salon calendar and working hours updated successfully!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save settings" });
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Blocked Holiday Date
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate || !newBlockedReason) return;
    setBlockedDates([
      ...blockedDates,
      {
        id: `b_${Date.now()}`,
        date: newBlockedDate,
        reason: newBlockedReason,
        isFullDay: true,
      },
    ]);
    setNewBlockedDate("");
    setNewBlockedReason("");
    setFeedback({ type: "success", text: `Date ${newBlockedDate} marked as closed.` });
  };

  const handleRemoveBlockedDate = (id: string) => {
    setBlockedDates(blockedDates.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="gold">Scheduling Engine</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">10:00 AM – 10:00 PM (All 7 Days)</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <CalendarDays className="h-7 w-7 text-salon-gold" />
            <span>Calendar & Availability Settings</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visual booking calendar, operational hours, slot intervals, holidays, and capacity management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCalendarData}
            className="text-xs h-9 border-zinc-700 hover:text-white"
            title="Refresh Calendar"
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

      {/* Main Tabs */}
      <div className="flex items-center gap-1.5 border-b border-salon-borderBlack overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab("interactive")}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "interactive"
              ? "border-salon-gold text-salon-gold bg-salon-gold/10 font-bold"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
          }`}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Interactive Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab("hours")}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "hours"
              ? "border-salon-gold text-salon-gold bg-salon-gold/10 font-bold"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Operating Hours (All 7 Days)</span>
        </button>
        <button
          onClick={() => setActiveTab("holidays")}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "holidays"
              ? "border-salon-gold text-salon-gold bg-salon-gold/10 font-bold"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
          }`}
        >
          <Ban className="h-4 w-4" />
          <span>Closed Dates & Capacity ({blockedDates.length})</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE CALENDAR */}
      {activeTab === "interactive" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-salon-richBlack/40 p-3 rounded-xl border border-salon-borderBlack text-xs">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} className="h-8 w-8 p-0 border-zinc-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="h-8 px-2.5 border-zinc-700">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} className="h-8 w-8 p-0 border-zinc-700">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="font-serif text-sm font-bold text-white ml-2">
                {currentDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                    viewMode === mode
                      ? "bg-salon-gold text-black font-bold shadow-md"
                      : "bg-salon-black border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments Grid Summary */}
          <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-salon-gold" />
                <span>Scheduled Salon Visits ({appointments.length} Total)</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">10:00 AM – 10:00 PM</span>
            </div>

            <div className="divide-y divide-zinc-800/60 mt-3 text-xs">
              {appointments.slice(0, 10).map((apt) => (
                <div key={apt.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-zinc-900/30 px-2 rounded-lg">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-salon-gold font-bold">{apt.appointmentNumber}</span>
                    <span className="text-white font-medium">
                      {apt.customerProfile?.user?.name || "Client"}
                    </span>
                    <span className="text-zinc-500 font-mono">({apt.customerProfile?.user?.phone || "—"})</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px]">
                    <span className="text-zinc-300 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3 text-salon-gold" />
                      <span>{apt.appointmentDate} at {apt.startTime}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        apt.status === "CONFIRMED"
                          ? "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                          : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATING HOURS & SCHEDULE */}
      {activeTab === "hours" && (
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-salon-gold" />
                  <span>Permanent 7-Day Salon Schedule</span>
                </h3>
                <p className="text-xs text-zinc-400">Open Monday to Sunday: 10:00 AM – 10:00 PM (All 7 Days)</p>
              </div>
              <Badge variant="gold">Open 7 Days</Badge>
            </div>

            <div className="space-y-3 text-xs">
              {weeklyHours.map((wh, idx) => (
                <div
                  key={wh.day}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-salon-black border border-zinc-800/80 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={wh.isOpen}
                      onChange={(e) => {
                        const copy = [...weeklyHours];
                        copy[idx].isOpen = e.target.checked;
                        setWeeklyHours(copy);
                      }}
                      className="rounded bg-zinc-900 border-zinc-700 text-salon-gold"
                    />
                    <span className="font-semibold text-white w-24">{wh.day}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        wh.isOpen ? "bg-emerald-950/60 text-emerald-400" : "bg-red-950/60 text-red-400"
                      }`}
                    >
                      {wh.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[11px]">Hours:</span>
                    <Input
                      type="time"
                      value={wh.openingTime}
                      disabled={!wh.isOpen}
                      onChange={(e) => {
                        const copy = [...weeklyHours];
                        copy[idx].openingTime = e.target.value;
                        setWeeklyHours(copy);
                      }}
                      className="bg-zinc-900 border-zinc-800 text-white w-28 h-8 text-xs font-mono"
                    />
                    <span className="text-zinc-500">to</span>
                    <Input
                      type="time"
                      value={wh.closingTime}
                      disabled={!wh.isOpen}
                      onChange={(e) => {
                        const copy = [...weeklyHours];
                        copy[idx].closingTime = e.target.value;
                        setWeeklyHours(copy);
                      }}
                      className="bg-zinc-900 border-zinc-800 text-white w-28 h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Time Slot Interval (Minutes):</label>
                <select
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(Number(e.target.value))}
                  className="w-full bg-salon-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Buffer Time Between Appointments:</label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(Number(e.target.value))}
                  className="w-full bg-salon-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value={0}>0 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes (Recommended)</option>
                  <option value={20}>20 Minutes</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" variant="gold" disabled={savingSettings} className="gap-1.5 shadow-md">
                {savingSettings ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Salon Hours & Intervals</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: CLOSED DATES & CAPACITY */}
      {activeTab === "holidays" && (
        <div className="space-y-5 text-xs">
          {/* Capacity Settings */}
          <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-5 shadow-lg space-y-4">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-salon-gold" />
              <span>Salon Capacity & Advance Notice</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Max Bookings Per Slot:</label>
                <Input
                  type="number"
                  min={1}
                  value={maxPerSlot}
                  onChange={(e) => setMaxPerSlot(Number(e.target.value))}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Max Bookings Per Day:</label>
                <Input
                  type="number"
                  min={1}
                  value={maxPerDay}
                  onChange={(e) => setMaxPerDay(Number(e.target.value))}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Advance Booking Horizon (Days):</label>
                <Input
                  type="number"
                  min={1}
                  value={advanceBookingDays}
                  onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                  className="bg-salon-black border-zinc-800 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Block Specific Date / Holiday */}
          <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 p-5 shadow-lg space-y-4">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-400" />
              <span>Block Specific Date or Holiday</span>
            </h3>

            <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row items-end gap-3">
              <div className="w-full sm:w-48">
                <label className="block text-zinc-300 font-medium mb-1">Date to Close:</label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-zinc-300 font-medium mb-1">Reason / Event Name:</label>
                <Input
                  required
                  placeholder="e.g. Festival Holiday / Studio Maintenance"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>
              <Button type="submit" variant="destructive" size="sm" className="h-9 gap-1.5 shrink-0">
                <Plus className="h-3.5 w-3.5" />
                <span>Block Date</span>
              </Button>
            </form>

            {/* Blocked Dates List */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-400 uppercase font-semibold">Active Blocked Dates</span>
              {blockedDates.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-salon-black border border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-red-400 font-semibold">{b.date}</span>
                    <span className="text-white">{b.reason}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                      Full Day
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDate(b.id)}
                    className="p-1 rounded text-zinc-500 hover:text-red-400"
                    title="Remove closure"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
