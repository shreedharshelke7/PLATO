import React from "react";

interface MarbleColumnProps {
  className?: string;
  side?: "left" | "right";
}

export function MarbleColumn({ className = "w-16 h-full text-accent-gold/20" }: MarbleColumnProps) {
  return (
    <div className={`pointer-events-none select-none flex flex-col items-center justify-between ${className}`} aria-hidden="true">
      <svg viewBox="0 0 80 400" className="w-full h-full" fill="none" stroke="currentColor">
        {/* Capital */}
        <rect x="5" y="10" width="70" height="12" rx="2" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
        <path d="M10 22 C20 30, 60 30, 70 22" strokeWidth="2" />
        {/* Volutes */}
        <circle cx="16" cy="22" r="6" strokeWidth="2" />
        <circle cx="64" cy="22" r="6" strokeWidth="2" />

        {/* Fluted shaft lines */}
        <line x1="18" y1="34" x2="18" y2="360" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="28" y1="34" x2="28" y2="360" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="40" y1="34" x2="40" y2="360" strokeWidth="2" strokeOpacity="0.8" />
        <line x1="52" y1="34" x2="52" y2="360" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="62" y1="34" x2="62" y2="360" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Outer column edges */}
        <line x1="12" y1="34" x2="12" y2="360" strokeWidth="2" />
        <line x1="68" y1="34" x2="68" y2="360" strokeWidth="2" />

        {/* Base */}
        <path d="M10 360 C20 354, 60 354, 70 360" strokeWidth="2" />
        <rect x="5" y="360" width="70" height="15" rx="2" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
        <rect x="2" y="375" width="76" height="15" rx="2" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
      </svg>
    </div>
  );
}
