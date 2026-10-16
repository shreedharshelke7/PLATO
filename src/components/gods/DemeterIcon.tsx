import React from "react";

interface GodIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function DemeterIcon({
  className = "w-6 h-6 text-accent-gold",
  size = 24,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel = "Demeter - Goddess of Harvest and Agriculture",
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
      {/* Central stalk */}
      <path d="M12 22V2" strokeWidth="2" />
      {/* Wheat grains */}
      <path d="M12 7c-2-1.5-4-1-5 1 1.5 2 3.5 1.5 5-1Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 7c2-1.5 4-1 5 1-1.5 2-3.5 1.5-5-1Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 12c-2.5-1.8-4.5-1-5.5 1 1.8 2.2 4 1.5 5.5-1Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 12c2.5-1.8 4.5-1 5.5 1-1.8 2.2-4 1.5-5.5-1Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 17c-2.5-1.8-4.5-1-5.5 1 1.8 2.2 4 1.5 5.5-1Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 17c2.5-1.8 4.5-1 5.5 1-1.8 2.2-4 1.5-5.5-1Z" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}
