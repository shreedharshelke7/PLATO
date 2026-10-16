"use client";

import React from "react";
import { PoseidonIcon } from "../gods";

interface AmphoraWaveProps {
  currentMl: number;
  targetMl: number;
  size?: number;
}

export function AmphoraWave({ currentMl, targetMl, size = 260 }: AmphoraWaveProps) {
  const safeTarget = Math.max(1, targetMl);
  const percent = Math.min(100, Math.round((currentMl / safeTarget) * 100));

  // Invert percent for SVG Y coordinate (100% full = y near top, 0% = y near bottom)
  const fillY = 280 - (percent / 100) * 220;

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      <svg
        width={size}
        height={size * 1.25}
        viewBox="0 0 200 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Amphora mask: classical vase profile with handles */}
          <clipPath id="amphora-mask">
            {/* Neck & mouth */}
            <path d="M70 20 h60 v30 c0 15 25 35 35 60 c10 25 5 80 -25 110 c-15 15 -35 20 -40 20 c-5 0 -25 -5 -40 -20 c-30 -30 -35 -85 -25 -110 c10 -25 35 -45 35 -60 v-30 Z" />
          </clipPath>

          <linearGradient id="water-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="amphora-glass-glare" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Outer Amphora Vessel Outline with Greek Handles */}
        {/* Left Handle */}
        <path
          d="M60 60 C30 70 20 110 50 140 C55 145 62 145 62 140 C45 115 45 80 70 70 Z"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="var(--accent-gold)"
          strokeWidth="2.5"
          className="text-accent-gold"
        />
        {/* Right Handle */}
        <path
          d="M140 60 C170 70 180 110 150 140 C145 145 138 145 138 140 C155 115 155 80 130 70 Z"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="var(--accent-gold)"
          strokeWidth="2.5"
          className="text-accent-gold"
        />

        {/* Amphora Body Glass Background */}
        <path
          d="M70 20 h60 v30 c0 15 25 35 35 60 c10 25 5 80 -25 110 c-15 15 -35 20 -40 20 c-5 0 -25 -5 -40 -20 c-30 -30 -35 -85 -25 -110 c10 -25 35 -45 35 -60 v-30 Z"
          fill="url(#amphora-glass-glare)"
          stroke="var(--border-gold)"
          strokeWidth="3"
        />

        {/* Water Liquid Layer with Wave Animation */}
        <g clipPath="url(#amphora-mask)">
          {/* Animated Wave Path */}
          <g
            style={{
              transform: `translateY(${fillY - 60}px)`,
              transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <path
              d="M 0 50 Q 50 30 100 50 T 200 50 T 300 50 T 400 50 V 300 H 0 Z"
              fill="url(#water-gradient)"
              className="animate-wave"
            />
          </g>
        </g>

        {/* Decorative Rim & Neck Lines */}
        <ellipse cx="100" cy="20" rx="30" ry="6" stroke="var(--border-gold)" strokeWidth="3" fill="none" />
        <line x1="70" y1="45" x2="130" y2="45" stroke="var(--border-gold)" strokeWidth="1.5" strokeDasharray="3 2" />
        <ellipse cx="100" cy="235" rx="28" ry="5" stroke="var(--border-gold)" strokeWidth="2" fill="none" />
      </svg>

      {/* Floating Center Stats Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
        <div className="w-8 h-8 rounded-full bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-1 shadow-md">
          <PoseidonIcon size={18} />
        </div>
        <span className="font-serif text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {currentMl}
        </span>
        <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-200 drop-shadow">
          ml logged
        </span>
        <span className="text-xs font-mono font-bold text-cyan-300 drop-shadow mt-0.5">
          {percent}% of {safeTarget} ml
        </span>
      </div>
    </div>
  );
}
