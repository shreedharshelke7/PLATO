"use client";

import React from "react";
import Link from "next/link";
import { useXP, useSettings } from "@/lib/db/hooks";
import { getRankFromXP } from "@/lib/db/gamification";
import { LaurelWreath, ZeusIcon } from "../gods";
import { Flame, Sun, Moon, Compass, Sparkles, Settings as SettingsIcon } from "lucide-react";

export function AppHeader() {
  const { totalXP, streakDays } = useXP();
  const { settings, updateSettings } = useSettings();
  const { rank } = getRankFromXP(totalXP);

  const cycleTheme = () => {
    const themes: Array<"auto" | "olympus" | "poseidon" | "nyx" | "athena"> = [
      "auto",
      "olympus",
      "poseidon",
      "nyx",
      "athena",
    ];
    const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
    updateSettings({ theme: themes[nextIdx] });
  };

  return (
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

      {/* Right widgets: Streak + Favor Rank + Theme + Settings */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5 ml-auto">
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
          className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel-gold text-accent-gold text-xs font-semibold"
        >
          <LaurelWreath size={16} />
          <span className="font-serif tracking-wide">{rank.name}</span>
          <span className="text-[10px] opacity-75 font-mono">({totalXP} XP)</span>
        </div>

        {/* Theme button */}
        <button
          onClick={cycleTheme}
          aria-label="Cycle theme"
          className="p-1.5 rounded-lg border border-border-base glass-panel text-text-secondary hover:text-text-primary hover:border-accent-gold/40 transition-all cursor-pointer"
        >
          {settings.theme === "olympus" ? (
            <Sun className="w-4 h-4 text-accent-gold" />
          ) : settings.theme === "poseidon" ? (
            <Compass className="w-4 h-4 text-cyan-400" />
          ) : settings.theme === "nyx" ? (
            <Moon className="w-4 h-4 text-purple-400" />
          ) : settings.theme === "athena" ? (
            <Sparkles className="w-4 h-4 text-lime-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-accent-gold" />
          )}
        </button>

        {/* Settings link */}
        <Link
          href="/settings"
          aria-label="Settings"
          className="p-1.5 rounded-lg border border-border-base glass-panel text-text-secondary hover:text-text-primary hover:border-accent-gold/40 transition-all"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
