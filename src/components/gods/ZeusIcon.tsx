import React from "react";

interface GodIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function ZeusIcon({
  className = "w-6 h-6 text-accent-gold",
  size = 24,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel = "Zeus - God of Sky and Thunder",
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
      {/* Stylized Olympian Lightning Bolt */}
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" />
      {/* Cloud & aura accents */}
      <path d="M4 8a3 3 0 0 1 5-2 3.5 3.5 0 0 1 6.5 1" opacity="0.6" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
    </svg>
  );
}
