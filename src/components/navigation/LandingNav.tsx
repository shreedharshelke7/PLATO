"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ZeusIcon } from "../gods";
import { Sun, Moon, Sparkles, Compass, LogIn } from "lucide-react";

export function LandingNav() {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("ambrosia_theme") || "auto";
      } catch {
        return "auto";
      }
    }
    return "auto";
  });

  const cycleTheme = () => {
    const themes = ["auto", "obsidian", "marble", "aegean", "amethyst"];
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    setCurrentTheme(nextTheme);

    try {
      localStorage.setItem("ambrosia_theme", nextTheme);
      // Note: Landing page stays in dark obsidian mode by specification, but updates stored preference for when user enters the app
    } catch {
      // ignore
    }
  };

  return (
    <nav className="w-full sticky top-0 z-50 glass-panel border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform shadow-md">
            <ZeusIcon size={20} />
          </div>
          <div>
            <span className="font-serif text-xl font-black tracking-widest text-text block leading-none">
              PLATO
            </span>
            <span className="text-[10px] tracking-wider text-gold-light uppercase font-semibold">
              The Academy
            </span>
          </div>
        </Link>

        {/* Links & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <Link
            href="/about"
            className="text-xs sm:text-sm font-medium text-text-muted hover:text-text transition-colors"
          >
            Research
          </Link>

          {/* Quick link for returning users */}
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-medium text-text-muted hover:text-gold transition-colors flex items-center gap-1"
          >
            <span>Skip to app</span>
          </Link>

          {/* Sign In link */}
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-gold-light hover:text-gold transition-colors flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>

          {/* Theme switcher pill */}
          <button
            type="button"
            onClick={cycleTheme}
            aria-label="Toggle app theme"
            className="px-2.5 py-1.5 rounded-lg border border-border glass-panel text-xs flex items-center gap-1.5 hover:border-gold/50 text-text-muted hover:text-text transition-all cursor-pointer"
          >
            {currentTheme === "marble" ? (
              <Sun className="w-3.5 h-3.5 text-gold" />
            ) : currentTheme === "aegean" ? (
              <Compass className="w-3.5 h-3.5 text-aegean" />
            ) : currentTheme === "amethyst" ? (
              <Sparkles className="w-3.5 h-3.5 text-royal" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gold" />
            )}
            <span className="capitalize font-mono text-[11px]">{currentTheme}</span>
          </button>

          {/* Main Ascent CTA */}
          <Link
            href="/signup"
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold gold-gradient-btn transition-all shadow-sm active:scale-95"
          >
            Begin Ascent
          </Link>
        </div>
      </div>
    </nav>
  );
}
