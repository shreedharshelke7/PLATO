import React from "react";

interface GodIconProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function HermesIcon({
  className = "w-6 h-6 text-accent-gold",
  size = 24,
  "aria-hidden": ariaHidden = true,
  "aria-label": ariaLabel = "Hermes - Herald of the Gods",
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
      {/* Caduceus central staff */}
      <path d="M12 3v18" strokeWidth="2" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      {/* Caduceus double entwined serpent curves */}
      <path d="M7 8c1.5-2 3.5-2 5 0s3.5 2 5 0" />
      <path d="M7 14c1.5-2 3.5-2 5 0s3.5 2 5 0" />
      {/* Hermes messenger wings */}
      <path d="M12 5c-3-2-7-1-8 2 2.5.5 5-.5 8-2Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 5c3-2 7-1 8 2-2.5.5-5-.5-8-2Z" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}
