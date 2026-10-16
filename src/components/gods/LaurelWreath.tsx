import React from "react";

interface LaurelWreathProps {
  className?: string;
  size?: number;
  children?: React.ReactNode;
}

export function LaurelWreath({
  className = "text-accent-gold",
  size = 48,
  children,
}: LaurelWreathProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Left branch */}
        <path d="M26 56C16 50 10 38 10 24c0-6 2-12 5-16" />
        <path d="M12 48c-3-2-5-6-4-10 3 0 6 3 4 10Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M9 36c-3-3-4-7-2-10 3 1 5 4 2 10Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M11 24c-2-3-2-7 1-10 2 2 3 5-1 10Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M15 14c-1-3 0-6 3-8 2 3 1 6-3 8Z" fill="currentColor" fillOpacity="0.2" />

        {/* Right branch */}
        <path d="M38 56c10-6 16-18 16-32 0-6-2-12-5-16" />
        <path d="M52 48c3-2 5-6 4-10-3 0-6 3-4 10Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M55 36c3-3 4-7 2-10-3 1-5 4-2 10Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M53 24c2-3 2-7-1-10-2 2-3 5 1 10Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M49 14c1-3 0-6-3-8-2 3-1 6 3 8Z" fill="currentColor" fillOpacity="0.2" />

        {/* Ribbon tie at bottom */}
        <path d="M30 56c-2 2-5 3-7 4M34 56c2 2 5 3 7 4" />
        <circle cx="32" cy="56" r="2.5" fill="currentColor" />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
