"use client";

import React from "react";
import { ZeusIcon } from "../gods";

interface PowerRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export function PowerRing({
  consumed,
  target,
  size = 220,
  strokeWidth = 14,
}: PowerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.round((consumed / safeTarget) * 100));
  const offset = circumference - (percent / 100) * circumference;
  const remaining = Math.max(0, safeTarget - consumed);

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--ring-track)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--accent-gold)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Central Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <div className="w-8 h-8 rounded-full bg-accent-gold/15 flex items-center justify-center text-accent-gold mb-1">
          <ZeusIcon size={18} />
        </div>
        <span className="font-serif text-3xl font-black text-text-primary tracking-tight">
          {remaining}
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary">
          Calories Left
        </span>
        <span className="text-[10px] text-text-muted mt-0.5 font-mono">
          {consumed} / {safeTarget} kcal
        </span>
      </div>
    </div>
  );
}
