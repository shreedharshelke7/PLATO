"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useProfile, useSettings } from "@/lib/db/hooks";
import { useAuth } from "@/lib/supabase/hooks";
import { useSyncStatus } from "@/lib/sync/syncEngine";
import { deleteDatabase } from "@/lib/db/db";
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
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  LogIn,
  Shield,
  Target,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const { settings, updateSettings } = useSettings();
  const { user, isConfigured, signOut } = useAuth();
  const { status: syncStatus, lastSyncAt, errorMessage, syncNow, deleteCloudData } = useSyncStatus();

  // Custom API key state
  const [apiKeyInput, setApiKeyInput] = useState<string>(settings.userApiKey || "");
  const [keySaved, setKeySaved] = useState<boolean>(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);
  const [keyVerificationResult, setKeyVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Cloud sync action states
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [isDeletingCloud, setIsDeletingCloud] = useState(false);
  const [cloudActionMessage, setCloudActionMessage] = useState<string | null>(null);

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
        throw new Error(data.error || "Failed to verify key with AI provider");
      }

      await updateSettings({ userApiKey: key });
      setKeySaved(true);
      setKeyVerificationResult({
        success: true,
        message: data.message || "✓ Key is valid and connected successfully!",
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

  const handleManualSync = async () => {
    setIsSyncingNow(true);
    setCloudActionMessage(null);
    try {
      await syncNow();
      setCloudActionMessage("Synchronized with Olympian Cloud!");
      setTimeout(() => setCloudActionMessage(null), 3000);
    } catch (err: unknown) {
      setCloudActionMessage(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setIsSyncingNow(false);
    }
  };

  const handleDeleteCloudData = async () => {
    const confirmed = window.confirm(
      "Are you sure you wish to delete your cloud backup from Supabase? Your device's local logs will remain intact."
    );
    if (!confirmed) return;

    setIsDeletingCloud(true);
    setCloudActionMessage(null);
    try {
      await deleteCloudData();
      setCloudActionMessage("Cloud records successfully removed from Supabase.");
      setTimeout(() => setCloudActionMessage(null), 3500);
    } catch (err: unknown) {
      setCloudActionMessage(err instanceof Error ? err.message : "Failed to delete cloud data.");
    } finally {
      setIsDeletingCloud(false);
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

    await deleteDatabase(user?.id ?? null);
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    alert("All records purged. Returning to Mortal Genesis.");
    router.replace("/dashboard");
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
          Configure local preferences, theme aesthetics, circadian reminders, cloud sync, and API keys.
        </p>
      </div>

      {/* 1. CLOUD SYNC & ACCOUNT */}
      <section className="p-6 rounded-3xl glass-panel-gold space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center text-accent-gold">
              <Cloud size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-text-primary">
                Olympian Cloud Sync
              </h3>
              <span className="text-xs text-accent-gold font-mono">
                Local-First • Realtime Supabase PostgreSQL Backup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Protected Account</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-surface-glass border border-border-base text-text-muted text-xs font-semibold flex items-center gap-1.5">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Guest Mode</span>
              </span>
            )}
          </div>
        </div>

        {/* Not Configured banner in Dev */}
        {!isConfigured && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Supabase environment variables not configured. Ambrosia is operating in 100% offline guest mode.
            </span>
          </div>
        )}

        {/* Signed In details */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-bg-surface border border-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold">
                  Active Account
                </p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{user.email}</p>
                <p className="text-[11px] text-text-secondary mt-1">
                  Last Synced:{" "}
                  {lastSyncAt ? format(new Date(lastSyncAt), "PPpp") : "Pending first sync"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncingNow || syncStatus === "syncing"}
                  className="px-4 py-2 rounded-xl gold-shimmer bg-gradient-to-r from-accent-gold-light via-accent-gold to-accent-gold-deep text-bg-base font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSyncingNow || syncStatus === "syncing" ? "animate-spin" : ""}`}
                  />
                  <span>Sync Now</span>
                </button>

                <button
                  onClick={() => signOut()}
                  className="px-3.5 py-2 rounded-xl border border-border-base text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Cloud Action Message */}
            {cloudActionMessage && (
              <div className="p-3 rounded-xl bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{cloudActionMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Sync Error: {errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-text-muted">
                Need to wipe your remote cloud backups without affecting this device?
              </span>
              <button
                onClick={handleDeleteCloudData}
                disabled={isDeletingCloud}
                className="text-xs text-terracotta hover:underline font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeletingCloud ? "Purging cloud..." : "Delete My Cloud Data"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-bg-surface border border-border-base space-y-3">
            <p className="text-xs text-text-secondary leading-relaxed">
              Your meals, water logs, and progress live on this browser in IndexedDB. Sign in or create
              an account to sync seamlessly between your phone, laptop, and tablet.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl gold-shimmer bg-gradient-to-r from-accent-gold-light via-accent-gold to-accent-gold-deep text-bg-base font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In or Create Account</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 2. AI API KEY CONFIGURATION (GROQ OR GEMINI) */}
      <section className="p-6 rounded-3xl glass-panel-gold space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center text-accent-gold">
            <Key size={20} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary">
              Personal AI API Key (Groq or Gemini)
            </h3>
            <span className="text-xs text-accent-gold font-mono">
              Stored 100% locally in IndexedDB • Never synced to cloud
            </span>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          The app functions out of the box with manual food logging and bundled offline databases.
          To use ultra-fast <strong>Groq LPU (openai/gpt-oss-120b &amp; Vision)</strong> or <strong>Gemini Flash Vision</strong> for unlimited meal photo scanning and bypass all limits,
          paste your free key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-accent-gold underline">Groq Cloud</a> or <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-accent-gold underline">Google AI Studio</a>.
        </p>

        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="gsk_... or AIzaSy..."
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

      {/* 3. THEME SELECTION */}
      <section className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="font-serif font-bold text-base text-text-primary">
          Dynamic Deity Themes (400ms Transitions)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: "auto", name: "Auto Circadian", icon: Sparkles, desc: "06-18 Marble, 18-06 Obsidian" },
            { id: "obsidian", name: "Obsidian", icon: Moon, desc: "Dark Basalt & Aurum Gold" },
            { id: "marble", name: "Marble", icon: Sun, desc: "Ivory Stone & Warm Bronze" },
            { id: "aegean", name: "Aegean", icon: Compass, desc: "Oceanic Teal & Gold Glow" },
            { id: "amethyst", name: "Amethyst", icon: Sparkles, desc: "Tyrian Purple & Silver" },
          ].map((th) => {
            const Icon = th.icon;
            const isSelected =
              settings.theme === th.id ||
              (th.id === "obsidian" && settings.theme === "nyx") ||
              (th.id === "marble" && settings.theme === "olympus");
            return (
              <button
                key={th.id}
                type="button"
                onClick={() =>
                  updateSettings({
                    theme: th.id as "auto" | "obsidian" | "marble" | "aegean" | "amethyst",
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

      {/* 4. PROFILE & BIOMETRICS */}
      <section className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary">
              Warrior Profile & Body Biometrics
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Physical attributes used to calculate resting metabolic rate and suggested targets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/goals"
              className="px-3 py-1.5 rounded-xl border border-accent-gold/40 text-accent-gold hover:bg-accent-gold/10 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>My Goals</span>
            </Link>
            <button
              onClick={handleSaveProfile}
              className="px-4 py-1.5 rounded-xl bg-accent-gold text-stone-950 font-bold text-xs shadow-sm cursor-pointer hover:bg-accent-gold-hover transition-colors"
            >
              {profileSaved ? "Saved!" : "Save Biometrics"}
            </button>
          </div>
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

      {/* 5. CIRCADIAN HYDRATION REMINDERS */}
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
            className="px-3.5 py-1.5 rounded-xl border border-cyan-400/40 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/10 cursor-pointer"
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

      {/* 6. PURGE & DANGER ZONE */}
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
          className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors cursor-pointer"
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
