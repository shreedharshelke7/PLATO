"use client";

import React from "react";
import { motion } from "framer-motion";

interface PhilosopherProps {
  speaking?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function AristotleFigure({
  speaking = false,
  size = 280,
  className = "",
  onClick,
}: PhilosopherProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Aristotle, Philosopher of the Golden Mean"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative inline-block cursor-pointer select-none transition-transform duration-300 hover:scale-[1.02] focus:outline-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Golden Aura Glow Pulse */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        animate={{
          backgroundColor: speaking
            ? "rgba(212, 175, 55, 0.35)"
            : "rgba(212, 175, 55, 0.08)",
          scale: speaking ? [1, 1.08, 1] : 1,
        }}
        transition={{
          duration: 2.2,
          repeat: speaking ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 240 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="ari-marble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EDE5D4" />
            <stop offset="100%" stopColor="#C4B89F" />
          </linearGradient>
          <linearGradient id="ari-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E7A8" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A67C37" />
          </linearGradient>
        </defs>

        {/* Circular Geometry Aura */}
        <circle
          cx="120"
          cy="110"
          r="95"
          stroke="url(#ari-gold)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          opacity="0.35"
        />

        {/* Draped Robe */}
        <path
          d="M45 270 C50 215, 65 175, 90 155 C105 145, 135 145, 150 155 C175 175, 190 215, 195 270 Z"
          fill="url(#ari-marble)"
          stroke="url(#ari-gold)"
          strokeWidth="1.5"
        />

        {/* Robe Folds */}
        <path d="M90 155 Q125 190 115 270" stroke="url(#ari-gold)" strokeWidth="1.5" opacity="0.7" />
        <path d="M150 155 Q120 205 130 270" stroke="url(#ari-gold)" strokeWidth="1.5" opacity="0.7" />

        {/* Neck */}
        <path d="M104 135 H136 V162 H104 Z" fill="url(#ari-marble)" stroke="url(#ari-gold)" strokeWidth="1" />

        {/* Head / Classical Aristotle Bust with receding hair and trimmed scholar beard */}
        <path
          d="M88 112 C88 68, 152 68, 152 112 C152 135, 142 147, 120 147 C98 147, 88 135, 88 112 Z"
          fill="url(#ari-marble)"
          stroke="url(#ari-gold)"
          strokeWidth="2"
        />

        {/* Neatly Cropped Beard */}
        <path
          d="M87 105 C85 125 96 144 110 146 C120 148 130 146 140 144 C150 125 153 105 151 105"
          stroke="url(#ari-gold)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Speaking animation for mouth/beard */}
        <motion.path
          d="M108 138 Q120 148 132 138"
          stroke="url(#ari-gold)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: speaking
              ? ["M108 138 Q120 151 132 138", "M108 138 Q120 144 132 138", "M108 138 Q120 151 132 138"]
              : "M108 138 Q120 147 132 138",
          }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        />

        {/* Hair with philosopher temple receding lines */}
        <path
          d="M89 95 C86 70, 110 52, 120 52 C130 52, 154 70, 151 95"
          stroke="url(#ari-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Piercing Analytical Eyes */}
        <path d="M102 96 Q108 93 114 96" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M126 96 Q132 93 138 96" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M120 94 V115 H116" stroke="url(#ari-gold)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Aristotle Holding the Golden Mean Balance Scales */}
        <motion.g
          animate={{
            rotate: speaking ? [-1.5, 1.5, -1.5] : 0,
            y: speaking ? [-1, 1, -1] : 0,
          }}
          transition={{ duration: 2, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
          style={{ originX: "65px", originY: "185px" }}
        >
          {/* Fulcrum and Beam */}
          <line x1="40" y1="185" x2="90" y2="185" stroke="url(#ari-gold)" strokeWidth="2" />
          <polygon points="65,178 62,185 68,185" fill="url(#ari-gold)" />
          <circle cx="65" cy="185" r="2.5" fill="#D4AF37" />

          {/* Left Pan (moderation) */}
          <line x1="45" y1="185" x2="40" y2="205" stroke="url(#ari-gold)" strokeWidth="1" />
          <line x1="45" y1="185" x2="50" y2="205" stroke="url(#ari-gold)" strokeWidth="1" />
          <path d="M36 205 Q45 212 54 205 Z" fill="url(#ari-marble)" stroke="url(#ari-gold)" strokeWidth="1.2" />

          {/* Right Pan */}
          <line x1="85" y1="185" x2="80" y2="205" stroke="url(#ari-gold)" strokeWidth="1" />
          <line x1="85" y1="185" x2="90" y2="205" stroke="url(#ari-gold)" strokeWidth="1" />
          <path d="M76 205 Q85 212 94 205 Z" fill="url(#ari-marble)" stroke="url(#ari-gold)" strokeWidth="1.2" />

          {/* Hand holding the scale cord */}
          <ellipse cx="65" cy="176" rx="6" ry="4" fill="url(#ari-marble)" stroke="url(#ari-gold)" strokeWidth="1" />
        </motion.g>
      </svg>
    </div>
  );
}
