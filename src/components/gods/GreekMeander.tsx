import React from "react";

interface GreekMeanderProps {
  className?: string;
  repeat?: number;
}

export function GreekMeander({ className = "text-accent-gold/40 h-3 w-full", repeat = 8 }: GreekMeanderProps) {
  return (
    <div className={`overflow-hidden flex items-center justify-center ${className}`} aria-hidden="true">
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${repeat * 40} 16`}
        preserveAspectRatio="repeat-x"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <pattern id="greek-meander-pat" width="40" height="16" patternUnits="userSpaceOnUse">
          <path d="M 0 14 L 36 14 L 36 2 L 8 2 L 8 10 L 28 10 L 28 6 L 16 6" />
        </pattern>
        <rect width="100%" height="16" fill="url(#greek-meander-pat)" />
      </svg>
    </div>
  );
}
