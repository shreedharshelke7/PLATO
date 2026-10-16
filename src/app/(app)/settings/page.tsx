"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useSettings } from "@/lib/db/hooks";
import { db } from "@/lib/db/db";
import { playWaterChime } from "@/lib/audio/chime";
import {
  Settings as SettingsIcon,
  Key,
  Sun,
  Moon,
  Compass,
  Sparkles,
  Bell,
  Trash2,
  Check,
  Heart,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const { settings, updateSettings } = useSettings();


  // Custom API key state
  const [apiKeyInput, setApiKeyInput] = useState<string>(settings.userApiKey || "");
  const [keySaved, setKeySaved] = useState<boolean>(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyVerificationResult, setKeyVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Profile fields state
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age || 24);
  const [weightKg, setWeightKg] = useState(profile?.weightKg || 70);
  const [heightCm, setHeightCm] = useState(profile?.heightCm || 175);
  const [junkBudget, setJunkBudget] = useState(profile?.junkBudgetPerWeek ?? 3);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveAndTestApiKey = async () => {
    const key = apiKeyInput.trim();
    if (!key) {
      await updateSettings({ userApiKey: "" });
      setKeyVerificationResult({ success: true, message: "Custom API key cleared." });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2500);
      return;
    }

    setIsVerifyingKey(true);
    setKeyVerificationResult(null);

    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-key": key,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify key with Gemini API");
      }

      await updateSettings({ userApiKey: key });
      setKeySaved(true);
      setKeyVerificationResult({
        success: true,
        message: "✓ Key is valid and connected to Gemini 2.5 Flash!",
      });
      setTimeout(() => setKeySaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error verifying key";
      setKeyVerificationResult({
        success: false,
        message: msg,
      });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    await saveProfile({
      ...profile,
      name,
      age,
      weightKg,
      heightCm,
      junkBudgetPerWeek: junkBudget,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleTestReminder = () => {
    playWaterChime();
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Ambrosia Test Reminder", {
        body: "Celestial reminder active! Quench your body with 250 ml of water.",
        icon: "/icon.png",
      });
    } else {
      alert("Chime played! (Enable browser notifications for desktop popup alerts).");
    }
  };

  const handleDeleteAllData = async () => {
    const confirm1 = window.confirm(
      "Are you absolutely certain you wish to purge all Olympian data from this device? This action cannot be reversed."
    );
    if (!confirm1) return;

    await db.delete();
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    alert("All records purged. Returning to Mortal Genesis.");
    router.replace("/onboarding");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-gold font-semibold flex items-center gap-1.5">
          <SettingsIcon size={16} /> Sanctuary Configuration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
          Settings & Divine Key
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Configure local preferences, theme aesthetics, circadian reminders, and API keys.
        </p>
      </div>

      {/* 1. GEMINI VISION API KEY CONFIGURATION */}
      <section className="p-6 rounded-3xl glass-panel-gold space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center text-accent-gold">
            <Key size={20} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary">
              Personal Gemini API Key (Optional)
            </h3>
            <span className="text-xs text-accent-gold font-mono">
              Stored 100% locally in IndexedDB • Never logged
            </span>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          The app functions out of the box with manual food logging and bundled offline databases.
          To use Gemini 2.5 Flash Vision for meal photo scanning, paste your free key from Google AI Studio.
          When present, Ambrosia transmits it in the secure <code>x-user-key</code> header.
        </p>

        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-bg-surface border border-border-base text-text-primary text-sm focus:border-accent-gold focus:outline-none"
          />
          <button
            onClick={handleSaveAndTestApiKey}
            disabled={isVerifyingKey}
            className="px-6 py-2.5 rounded-xl bg-accent-gold hover:bg-accent-gold-hover text-stone-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isVerifyingKey ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : keySaved ? (
              <>
                <Check className="w-4 h-4" /> Saved &amp; Verified
              </>
            ) : (
              "Save & Test Key"
            )}
          </button>
        </div>

        {keyVerificationResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              keyVerificationResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {keyVerificationResult.success ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{keyVerificationResult.message}</span>
          </div>
        )}
      </section>

      {/* 2. THEME SELECTION */}
      <section className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="font-serif font-bold text-base text-text-primary">
          Dynamic Deity Themes (400ms Transitions)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: "auto", name: "Auto Circadian", icon: Sparkles, desc: "06-17 Olympus, 17-20 Athena, 20-06 Nyx" },
            { id: "olympus", name: "Olympus (Light)", icon: Sun, desc: "White marble & gold" },
            { id: "poseidon", name: "Poseidon (Dark)", icon: Compass, desc: "Deep oceanic navy & aqua" },
            { id: "nyx", name: "Nyx (Dark)", icon: Moon, desc: "Near-black celestial purple" },
            { id: "athena", name: "Athena (Muted)", icon: Sparkles, desc: "Ash slate & olive gold" },
          ].map((th) => {
            const Icon = th.icon;
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() =>
                  updateSettings({
                    theme: th.id as "auto" | "olympus" | "poseidon" | "nyx" | "athena",
                  })
                }
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-accent-gold bg-accent-gold/15 shadow-sm"
                    : "border-border-base bg-bg-surface hover:border-accent-gold/40 text-text-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="w-4 h-4 text-accent-gold" />
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                </div>
                <div className="font-bold text-xs text-text-primary">{th.name}</div>
                <div className="text-[10px] text-text-muted mt-0.5 leading-tight">{th.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PROFILE & TARGETS EDIT */}
      <section className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-text-primary">
            Warrior Profile & Metabolic Parameters
          </h3>
          <button
            onClick={handleSaveProfile}
            className="px-4 py-1.5 rounded-xl bg-accent-gold text-stone-950 font-bold text-xs shadow-sm"
          >
            {profileSaved ? "Saved!" : "Update Targets"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-text-secondary font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
            />
          </div>
          <div>
            <label className="block text-text-secondary font-semibold mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 20)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
            />
          </div>
          <div>
            <label className="block text-text-secondary font-semibold mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 60)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
            />
          </div>
          <div>
            <label className="block text-text-secondary font-semibold mb-1">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-text-secondary">Weekly Treat / Junk Budget:</span>
            <span className="font-bold text-accent-gold">{junkBudget} treats / week</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={junkBudget}
            onChange={(e) => setJunkBudget(parseInt(e.target.value))}
            className="w-full accent-accent-gold"
          />
        </div>
      </section>

      {/* 4. CIRCADIAN HYDRATION REMINDERS */}
      <section className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              Poseidon Hydration Reminders
            </h3>
            <span className="text-xs text-text-muted">
              Scheduled fluid intervals across waking hours
            </span>
          </div>

          <button
            onClick={handleTestReminder}
            className="px-3.5 py-1.5 rounded-xl border border-cyan-400/40 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/10"
          >
            Test Chime
          </button>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface-elevated text-xs text-text-muted space-y-2">
          <p>
            <strong>Note on browser alarms:</strong> Mobile operating systems and browsers may delay
            background notifications when locked. For optimal reminder cadence, install Ambrosia to
            your home screen as a standalone PWA.
          </p>
        </div>
      </section>

      {/* 5. PURGE & DANGER ZONE */}
      <section className="p-6 rounded-3xl border border-red-500/30 bg-red-500/5 space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-serif font-bold text-base">
          <Trash2 className="w-5 h-5" /> Danger Zone • Oblivion
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Permanently delete all profile targets, meal logs, weights, favorites, and Favor XP from
          this browser&apos;s IndexedDB.
        </p>
        <button
          onClick={handleDeleteAllData}
          className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors"
        >
          Purge All Data & Restart
        </button>
      </section>

      {/* Medical Disclaimer */}
      <div className="p-5 rounded-2xl bg-bg-surface-elevated border border-border-base text-xs text-text-muted leading-relaxed space-y-1">
        <div className="font-bold text-text-secondary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-accent-gold" /> Medical & Nutritional Advisory
        </div>
        <p>
          Ambrosia provides general information and AI estimates, not medical advice. Consult a
          qualified professional for medical conditions, metabolic disorders, or eating therapies.
        </p>
      </div>
    </div>
  );
}
