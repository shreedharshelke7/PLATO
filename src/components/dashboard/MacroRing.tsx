"use client";

import React from "react";

interface MacroRingProps {
  label: string;
  consumed: number;
  target: number;
  unit?: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export function MacroRing({
  label,
  consumed,
  target,
  unit = "g",
  color,
  size = 80,
  strokeWidth = 7,
}: MacroRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.round((consumed / safeTarget) * 100));
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative inline-flex items-center justify-center">
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
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-800 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-xs text-text-primary">
            {Math.round(consumed)}
            <span className="text-[10px] text-text-muted">{unit}</span>
          </span>
        </div>
      </div>

      <span className="text-[11px] font-semibold text-text-primary mt-1.5 block">
        {label}
      </span>
      <span className="text-[10px] text-text-muted font-mono block">
        of {Math.round(target)}{unit}
      </span>
    </div>
  );
}

export function FiberBar({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.round((consumed / safeTarget) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-text-primary">Prebiotic Fiber</span>
        <span className="text-text-muted font-mono">
          {Math.round(consumed)} / {safeTarget}g ({percent}%)
        </span>
      </div>
      <div className="w-full bg-border-base/50 h-2 rounded-full overflow-hidden">
        <div
          className="bg-success h-full rounded-full transition-all duration-800"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
