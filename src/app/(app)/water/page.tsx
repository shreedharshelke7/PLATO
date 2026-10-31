"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useWater, useProfile, useSettings, useGoals } from "@/lib/db/hooks";
import { calculateWaterSchedule, WaterSlot } from "@/lib/nutrition/targets";
import { AmphoraWave } from "@/components/water/AmphoraWave";
import { playWaterChime } from "@/lib/audio/chime";
import { PoseidonIcon } from "@/components/gods";
import {
  Droplets,
  RotateCcw,
  Bell,
  BellRing,
  Volume2,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function HydrationPage() {
  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    setTodayStr(format(new Date(), "yyyy-MM-dd"));
  }, []);

  const { profile } = useProfile();
  const { targets: goalTargets } = useGoals();
  const { updateSettings } = useSettings();
  const { waterLogs, totalWaterMl, addWater, undoWater } = useWater(todayStr);

  const [customAmount, setCustomAmount] = useState<string>("");
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [inAppToast, setInAppToast] = useState<{ title: string; message: string } | null>(null);

  const targetMl = goalTargets.water_ml ?? profile?.targets?.waterMl ?? 2500;
  const wakeTime = profile?.wakeTime ?? "07:00";
  const sleepTime = profile?.sleepTime ?? "23:00";

  const handleAdd = async (amount: number) => {
    await addWater(amount);
    playWaterChime();
  };

  const handleCustomAdd = async () => {
    const val = parseInt(customAmount);
    if (val && val > 0) {
      await addWater(val);
      playWaterChime();
      setCustomAmount("");
    }
  };

  // Request browser notification permission on explicit click
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Notifications are not supported on this browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationStatus(perm);
    if (perm === "granted") {
      updateSettings({ remindersEnabled: true });
      showReminder("Poseidon's Blessing", "Hydration reminders are now actively attuned!");
    } else {
      showReminder(
        "In-App Reminders Active",
        "Browser alerts blocked. Ambrosia will play soft chimes while the app is active."
      );
    }
  };

  // Test Reminder function (runs notification or in-app toast + Web Audio chime)
  const showReminder = (title: string, message: string) => {
    playWaterChime();

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: message,
          icon: "/icon.png",
          badge: "/icon.png",
        });
        return;
      } catch {
        // Fallback to in-app toast below
      }
    }

    // In-app modal / toast fallback
    setInAppToast({ title, message });
    setTimeout(() => setInAppToast(null), 4000);
  };

  const handleTestReminder = () => {
    showReminder(
      "Poseidon Hydration Chime",
      "Time for a fluid replenishment! Quench your cells with 250 ml of water."
    );
  };

  // Calculate schedule slots
  const scheduleSlots: WaterSlot[] = calculateWaterSchedule(
    targetMl,
    wakeTime,
    sleepTime,
    totalWaterMl
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* In-app Toast / Fallback Banner */}
      {inAppToast && (
        <div className="fixed top-16 right-4 z-50 p-4 rounded-2xl glass-panel-gold border border-cyan-400 bg-bg-surface shadow-2xl flex items-start gap-3 max-w-sm animate-bounce">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <PoseidonIcon size={20} />
          </div>
          <div>
            <h5 className="font-serif font-bold text-sm text-text-primary">
              {inAppToast.title}
            </h5>
            <p className="text-xs text-text-secondary mt-0.5">{inAppToast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
            <PoseidonIcon size={16} /> Poseidon Ocean Sanctuary
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
            Tidal Hydration Waves
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Replenish your inner oceans with smart schedules attuned to your circadian rhythm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notificationStatus !== "granted" ? (
            <button
              onClick={requestNotificationPermission}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-stone-950 hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" /> Enable Reminders
            </button>
          ) : (
            <button
              onClick={handleTestReminder}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-panel border border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" /> Test Chime
            </button>
          )}
        </div>
      </div>

      {/* Main Hydration Centerpiece: Amphora Wave + Quick Add */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Animated Amphora Glass */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-8 rounded-3xl glass-panel relative overflow-hidden">
          <AmphoraWave currentMl={totalWaterMl} targetMl={targetMl} size={240} />

          {/* Quick Undo */}
          {waterLogs.length > 0 && (
            <button
              onClick={undoWater}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Undo last entry
            </button>
          )}
        </div>

        {/* Quick Add Buttons & Custom Amount */}
        <div className="md:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="font-serif font-bold text-base text-text-primary flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Quick Fluid Infusion
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleAdd(150)}
                className="p-4 rounded-2xl bg-bg-surface-elevated border border-border-base hover:border-cyan-400 text-center transition-all group active:scale-95 cursor-pointer"
              >
                <span className="font-serif font-black text-lg text-cyan-400 block group-hover:scale-105 transition-transform">
                  +150 ml
                </span>
                <span className="text-[10px] text-text-muted">Small Glass</span>
              </button>

              <button
                type="button"
                onClick={() => handleAdd(250)}
                className="p-4 rounded-2xl bg-bg-surface-elevated border border-border-base hover:border-cyan-400 text-center transition-all group active:scale-95 cursor-pointer"
              >
                <span className="font-serif font-black text-lg text-cyan-400 block group-hover:scale-105 transition-transform">
                  +250 ml
                </span>
                <span className="text-[10px] text-text-muted">Tumbler / Mug</span>
              </button>

              <button
                type="button"
                onClick={() => handleAdd(500)}
                className="p-4 rounded-2xl bg-bg-surface-elevated border border-border-base hover:border-cyan-400 text-center transition-all group active:scale-95 cursor-pointer"
              >
                <span className="font-serif font-black text-lg text-cyan-400 block group-hover:scale-105 transition-transform">
                  +500 ml
                </span>
                <span className="text-[10px] text-text-muted">Water Bottle</span>
              </button>
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Custom Volume
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={50}
                  max={2000}
                  step={50}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 350 ml"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-bg-surface border border-border-base text-text-primary text-sm focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCustomAdd}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-stone-950 font-bold text-xs hover:bg-cyan-400 transition-all active:scale-95 shadow-sm"
                >
                  Log Custom
                </button>
              </div>
            </div>
          </div>

          {/* Browser note alert */}
          <div className="p-4 rounded-2xl bg-bg-surface-elevated border border-border-base text-xs text-text-muted flex items-start gap-2.5">
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> Browsers may delay background alarms when locked. Install
              Ambrosia to your device home screen for maximum scheduling accuracy and audible
              celestial chimes.
            </p>
          </div>
        </div>
      </div>

      {/* Smart Schedule Slots */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-serif font-bold text-base text-text-primary">
              Poseidon&apos;s Circadian Interval Schedule
            </h3>
          </div>
          <span className="text-xs text-text-muted">
            Waking window: {wakeTime} to {sleepTime}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {scheduleSlots.map((slot, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                slot.isCompleted
                  ? "bg-cyan-500/10 border-cyan-400/40 text-text-primary"
                  : "bg-bg-surface-elevated border-border-base text-text-muted"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>{slot.timeStr}</span>
                {slot.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <span className="text-[10px] text-text-muted font-mono">
                    Target: {slot.targetCumulativeMl} ml
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-cyan-400 font-bold">
                {slot.isCompleted ? "Conquered" : `Drink ${slot.slotAmountMl} ml`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Logs Timeline */}
      {waterLogs.length > 0 && (
        <div className="p-6 rounded-3xl glass-panel space-y-3">
          <h3 className="font-serif font-bold text-base text-text-primary">
            Today&apos;s Log Entries
          </h3>
          <div className="divide-y divide-border-base/60 max-h-48 overflow-y-auto">
            {waterLogs
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((log) => (
                <div
                  key={log.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <span className="text-text-secondary font-mono">
                    {format(new Date(log.timestamp), "hh:mm a")}
                  </span>
                  <span className="font-bold text-cyan-400 font-mono">
                    +{log.amountMl} ml
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
