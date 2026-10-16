import React from "react";

interface GodIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function DionysusIcon({
  className = "w-6 h-6 text-accent-gold",
  size = 24,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel = "Dionysus - God of Festivity and Wine",
}: GodIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : ariaLabel}
    >
      {/* Wine Chalice bowl */}
      <path d="M7 3h10v5c0 4-3 7-5 7s-5-3-5-7V3Z" fill="currentColor" fillOpacity="0.15" />
      {/* Stem and foot */}
      <line x1="12" y1="15" x2="12" y2="21" strokeWidth="2" />
      <path d="M8 21h8" strokeWidth="2" />
      {/* Grape cluster detail */}
      <circle cx="16" cy="4" r="1" fill="currentColor" />
      <circle cx="18" cy="5" r="1" fill="currentColor" />
      <circle cx="17" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
