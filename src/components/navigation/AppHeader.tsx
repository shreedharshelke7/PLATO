"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useXP, useSettings } from "@/lib/db/hooks";
import { useAuth } from "@/lib/supabase/hooks";
import { useSyncStatus } from "@/lib/sync/syncEngine";
import { getRankFromXP } from "@/lib/db/gamification";
import { LaurelWreath, ZeusIcon } from "../gods";
import {
  Flame,
  Sun,
  Moon,
  Compass,
  Sparkles,
  Settings as SettingsIcon,
  CheckCircle2,
  Loader2,
  CloudOff,
  AlertCircle,
  LogOut,
  LogIn,
} from "lucide-react";

export function AppHeader() {
  const { totalXP, streakDays } = useXP();
  const { settings, updateSettings } = useSettings();
  const { user, fullName, signOut } = useAuth();
  const { status: syncStatus, syncNow } = useSyncStatus();
  const { rank } = getRankFromXP(totalXP);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [keepLocalData, setKeepLocalData] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cycleTheme = () => {
    const themes: Array<"auto" | "obsidian" | "marble" | "aegean" | "amethyst"> = [
      "auto",
      "obsidian",
      "marble",
      "aegean",
      "amethyst",
    ];
    const currentNorm =
      settings.theme === "olympus"
        ? "marble"
        : settings.theme === "poseidon"
        ? "aegean"
        : settings.theme === "nyx"
        ? "obsidian"
        : settings.theme === "athena"
        ? "amethyst"
        : (settings.theme as "auto" | "obsidian" | "marble" | "aegean" | "amethyst");
    const nextIdx = (themes.indexOf(currentNorm) + 1) % themes.length;
    updateSettings({ theme: themes[nextIdx] });
  };

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ keepLocalData });
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  const userInitial = fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A";

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-14 border-b border-border-base glass-panel flex items-center justify-between px-4 sm:px-6">
        {/* Brand logo (visible on mobile where sidebar is hidden) */}
        <div className="flex items-center space-x-3 md:hidden">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
              <ZeusIcon size={18} />
            </div>
            <span className="font-serif font-black text-lg text-text-primary tracking-wider">
              PLATO
            </span>
          </Link>
        </div>

        {/* Center / Left status (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="font-serif font-bold text-sm text-text-primary">
            Olympian Sanctuary
          </span>
          <span className="text-xs text-text-muted">•</span>
          <span className="text-xs text-text-secondary">
            Mifflin-St Jeor Engine Active
          </span>
        </div>

        {/* Right widgets: Streak + Favor Rank + Sync Status + Theme + Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {/* Streak */}
          <div
            title={`${streakDays} Day Logging Streak`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streakDays}d</span>
          </div>

          {/* Favor XP / God Rank */}
          <div
            title={`${totalXP} Total Favor XP`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel-gold text-accent-gold text-xs font-semibold"
          >
            <LaurelWreath size={16} />
            <span className="font-serif tracking-wide">{rank.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({totalXP} XP)</span>
          </div>

          {/* Cloud Sync Status Indicator */}
          <div className="flex items-center">
            {syncStatus === "syncing" && (
              <div
                title="Syncing with Olympian Cloud..."
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden lg:inline text-[11px] font-medium">Syncing</span>
              </div>
            )}
            {syncStatus === "synced" && (
              <div
                title="All records synchronized to cloud"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/25 text-accent-gold text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold" />
                <span className="hidden lg:inline text-[11px] font-medium">Synced</span>
              </div>
            )}
            {syncStatus === "offline" && (
              <div
                title="Working offline (data saved locally)"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-glass border border-border-base text-text-muted text-xs"
              >
                <CloudOff className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Offline</span>
              </div>
            )}
            {syncStatus === "error" && (
              <button
                onClick={() => syncNow()}
                title="Sync error - click to retry"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-terracotta/10 border border-terracotta/40 text-terracotta text-xs cursor-pointer hover:bg-terracotta/20 transition-all"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">Retry</span>
              </button>
            )}
          </div>

          {/* Theme button */}
          <button
            onClick={cycleTheme}
            aria-label="Cycle theme"
            className="p-1.5 rounded-lg border border-border-base glass-panel text-text-secondary hover:text-text-primary hover:border-accent-gold/40 transition-all cursor-pointer"
          >
            {settings.theme === "marble" || settings.theme === "olympus" ? (
              <Sun className="w-4 h-4 text-accent-gold" />
            ) : settings.theme === "aegean" || settings.theme === "poseidon" ? (
              <Compass className="w-4 h-4 text-cyan-400" />
            ) : settings.theme === "amethyst" || settings.theme === "athena" ? (
              <Sparkles className="w-4 h-4 text-purple-400" />
            ) : settings.theme === "obsidian" || settings.theme === "nyx" ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-accent-gold" />
            )}
          </button>

          {/* Auth profile avatar / menu */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User Account Menu"
                className="w-8 h-8 rounded-full border border-accent-gold/40 bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold text-xs hover:border-accent-gold hover:scale-105 transition-all cursor-pointer"
              >
                {userInitial}
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border-base bg-surface-glass hover:border-accent-gold/50 text-text-secondary hover:text-accent-gold text-xs font-semibold transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* User dropdown menu */}
            {isUserMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl glass-panel-gold border border-accent-gold/30 bg-bg-elevated p-2 shadow-2xl z-50">
                <div className="px-3 py-2 border-b border-border-base mb-1">
                  <p className="text-xs font-bold text-text-primary truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">
                    {user.email}
                  </p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-glass transition-all"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Account & Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setShowSignOutModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-terracotta hover:bg-terracotta/10 transition-all cursor-pointer text-left mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl glass-panel-gold bg-bg-surface p-6 border border-gold/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-gold">
              <LogOut className="w-5 h-5" />
              <h3 className="font-serif font-bold text-base text-text">
                Depart the Sanctuary?
              </h3>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Your synced records are preserved in the Olympian Cloud. Are you ready to sign out?
            </p>

            <label className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={keepLocalData}
                onChange={(e) => setKeepLocalData(e.target.checked)}
                className="rounded border-border bg-surface-glass text-gold focus:ring-gold"
              />
              <span>Keep data on this device (offline cache)</span>
            </label>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSigningOut}
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold text-text-muted hover:text-text transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSigningOut}
                onClick={handleConfirmSignOut}
                className="flex-1 py-2 rounded-xl bg-terracotta hover:bg-terracotta/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <span>Sign Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
