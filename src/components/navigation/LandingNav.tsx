"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ZeusIcon } from "../gods";
import { Sun, Moon, Sparkles, Compass } from "lucide-react";

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
    const themes = ["auto", "olympus", "poseidon", "nyx", "athena"];
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    setCurrentTheme(nextTheme);

    try {
      localStorage.setItem("ambrosia_theme", nextTheme);
      if (nextTheme === "auto") {
        const hour = new Date().getHours();
        const autoTheme =
          hour >= 6 && hour < 17 ? "olympus" : hour >= 17 && hour < 20 ? "athena" : "nyx";
        document.documentElement.setAttribute("data-theme", autoTheme);
      } else {
        document.documentElement.setAttribute("data-theme", nextTheme);
      }
    } catch {
      // ignore
    }
  };

  return (
    <nav className="w-full sticky top-0 z-50 glass-panel border-b border-border-base/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-full bg-accent-gold/15 flex items-center justify-center text-accent-gold group-hover:scale-105 transition-transform">
            <ZeusIcon size={20} />
          </div>
          <div>
            <span className="font-serif text-xl font-black tracking-widest text-text-primary block leading-none">
              PLATO
            </span>
            <span className="text-[10px] tracking-wider text-accent-gold uppercase font-semibold">
              Ambrosia
            </span>
          </div>
        </Link>

        {/* Links & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <Link
            href="/about"
            className="text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Research & About
          </Link>
          <Link
            href="/dashboard"
            className="hidden sm:inline-block text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            App
          </Link>

          {/* Theme switcher pill */}
          <button
            onClick={cycleTheme}
            aria-label="Toggle theme"
            className="px-2.5 py-1.5 rounded-lg border border-border-base glass-panel text-xs flex items-center gap-1.5 hover:border-accent-gold/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            {currentTheme === "olympus" ? (
              <Sun className="w-3.5 h-3.5 text-accent-gold" />
            ) : currentTheme === "poseidon" ? (
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
            ) : currentTheme === "nyx" ? (
              <Moon className="w-3.5 h-3.5 text-purple-400" />
            ) : currentTheme === "athena" ? (
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            )}
            <span className="capitalize font-mono text-[11px]">{currentTheme}</span>
          </button>

          {/* Main Ascent CTA */}
          <Link
            href="/onboarding"
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 transition-all shadow-sm active:scale-95"
          >
            Begin Ascent
          </Link>
        </div>
      </div>
    </nav>
  );
}
