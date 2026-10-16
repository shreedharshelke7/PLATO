"use client";

import React from "react";
import {
  ZeusIcon,
  DemeterIcon,
  PoseidonIcon,
  HermesIcon,
  AthenaIcon,
  ApolloIcon,
  DionysusIcon,
} from "../gods";

const GODS = [
  { name: "Zeus", role: "Daily Calorie Power Ring", icon: ZeusIcon, tag: "Command" },
  { name: "Demeter", role: "Vision Scanner & Harvest Log", icon: DemeterIcon, tag: "Nourish" },
  { name: "Poseidon", role: "Tidal Hydration Waves", icon: PoseidonIcon, tag: "Hydrate" },
  { name: "Hermes", role: "Swift Reminders & Quick-Log", icon: HermesIcon, tag: "Speed" },
  { name: "Athena", role: "AI Coach & 5-Min Strategy", icon: AthenaIcon, tag: "Wisdom" },
  { name: "Apollo", role: "Olympian Progress & Streaks", icon: ApolloIcon, tag: "Ascent" },
  { name: "Dionysus", role: "Divine Swap & Junk Budget", icon: DionysusIcon, tag: "Alchemy" },
];

export function GodsMarquee() {
  return (
    <div className="w-full overflow-hidden border-y border-border-base bg-bg-surface/50 py-3 relative">
      <div className="flex w-max animate-marquee space-x-8 items-center">
        {/* Double array for infinite marquee */}
        {[...GODS, ...GODS].map((god, idx) => {
          const Icon = god.icon;
          return (
            <div
              key={idx}
              className="flex items-center space-x-2.5 px-4 py-1.5 rounded-full glass-panel border border-border-base text-xs font-medium whitespace-nowrap"
            >
              <span className="text-accent-gold">
                <Icon size={16} />
              </span>
              <span className="font-serif font-bold text-text-primary tracking-wide">
                {god.name}
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-text-secondary">{god.role}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-gold/15 text-accent-gold uppercase font-bold">
                {god.tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
