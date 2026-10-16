import React from "react";

interface GodIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function PoseidonIcon({
  className = "w-6 h-6 text-accent-gold",
  size = 24,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel = "Poseidon - God of the Seas",
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
      {/* Trident staff */}
      <path d="M12 2v20" strokeWidth="2" />
      {/* Center prong */}
      <polygon points="12 2 10.5 5 13.5 5" fill="currentColor" />
      {/* Left prong & curve */}
      <path d="M6 3v4c0 3 3 5 6 5" />
      <polygon points="6 2 4.5 5 7.5 5" fill="currentColor" />
      {/* Right prong & curve */}
      <path d="M18 3v4c0 3-3 5-6 5" />
      <polygon points="18 2 16.5 5 19.5 5" fill="currentColor" />
      {/* Water ripple base */}
      <path d="M4 19c2-1 4-1 6 0s4 1 6 0 3-.7 4 0" opacity="0.6" />
    </svg>
  );
}
