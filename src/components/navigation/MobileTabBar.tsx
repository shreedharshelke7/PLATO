"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Droplets,
  Camera,
  TrendingUp,
  Menu,
  Sparkles,
  CalendarDays,
  Brain,
  ChefHat,
  Settings,
  X,
} from "lucide-react";

export function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreLinks = [
    { href: "/swap", label: "Divine Swap", icon: Sparkles, desc: "Dionysus Treat Upgrades" },
    { href: "/log", label: "Meal Diary", icon: CalendarDays, desc: "History & Edit Log" },
    { href: "/coach", label: "AI Coach", icon: Brain, desc: "Athena Insights & Q&A" },
    { href: "/plan", label: "Meal Plan", icon: ChefHat, desc: "5-Min Quick Recipes" },
    { href: "/settings", label: "Settings", icon: Settings, desc: "Profile & Keys" },
  ];

  return (
    <>
      {/* Slide-up "More" Drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative z-10 glass-panel-gold rounded-t-3xl p-6 border-t border-border-gold space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border-base">
              <span className="font-serif font-bold text-base text-text-primary">
                Olympian Sanctuary
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-full text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-2">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-accent-gold text-stone-950 font-bold"
                        : "hover:bg-bg-surface-elevated text-text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-semibold">{link.label}</div>
                      <div className="text-xs text-text-muted">{link.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 glass-panel border-t border-border-base flex items-center justify-around px-2 pb-safe">
        {/* Home */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-14 py-1 ${
            pathname === "/dashboard" ? "text-accent-gold" : "text-text-muted"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </Link>

        {/* Water */}
        <Link
          href="/water"
          className={`flex flex-col items-center justify-center w-14 py-1 ${
            pathname === "/water" ? "text-cyan-400" : "text-text-muted"
          }`}
        >
          <Droplets className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Water</span>
        </Link>

        {/* Big Center Scan Button */}
        <Link
          href="/scan"
          aria-label="Scan Meal"
          className="relative -top-5 w-14 h-14 rounded-full bg-accent-gold hover:bg-accent-gold-hover text-stone-950 flex items-center justify-center shadow-lg shadow-accent-gold/30 border-4 border-bg-base transition-transform active:scale-95 cursor-pointer"
        >
          <Camera className="w-6 h-6 text-stone-950" />
        </Link>

        {/* Progress */}
        <Link
          href="/progress"
          className={`flex flex-col items-center justify-center w-14 py-1 ${
            pathname === "/progress" ? "text-accent-gold" : "text-text-muted"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Progress</span>
        </Link>

        {/* More */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center w-14 py-1 text-text-muted hover:text-text-primary"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
}
