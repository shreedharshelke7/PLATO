import React from "react";

interface GodIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function ApolloIcon({
  className = "w-6 h-6 text-accent-gold",
  size = 24,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel = "Apollo - God of Light, Music and Truth",
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
      {/* Radiant sun aura */}
      <circle cx="12" cy="12" r="9" strokeDasharray="2 3" opacity="0.35" />
      {/* Classical Lyre Frame */}
      <path d="M7 6v7c0 3 2.5 5 5 5s5-2 5-5V6" />
      <path d="M5 6h14" />
      {/* Lyre strings */}
      <line x1="10" y1="6" x2="10" y2="17" strokeWidth="1.5" />
      <line x1="12" y1="6" x2="12" y2="18" strokeWidth="1.5" />
      <line x1="14" y1="6" x2="14" y2="17" strokeWidth="1.5" />
      {/* Sun ray top */}
      <line x1="12" y1="1" x2="12" y2="3" />
    </svg>
  );
}
