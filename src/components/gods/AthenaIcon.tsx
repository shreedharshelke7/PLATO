import React from "react";

interface GodIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function AthenaIcon({
  className = "w-6 h-6 text-accent-gold",
  size = 24,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel = "Athena - Goddess of Wisdom and Strategy",
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
      {/* Owl body outline */}
      <path d="M12 2C8 2 5 5 5 9c0 5 3 9 7 12 4-3 7-7 7-12 0-4-3-7-7-7Z" fill="currentColor" fillOpacity="0.1" />
      {/* Wisdom eyes */}
      <circle cx="9" cy="9" r="2.5" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="2.5" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      {/* Beak */}
      <polygon points="12 11 11 13 13 13" fill="currentColor" />
      {/* Feathers / brow crest */}
      <path d="M7 6c1.5-1 3-1 5 0 2-1 3.5-1 5 0" opacity="0.6" />
    </svg>
  );
}
