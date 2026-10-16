"use client";

import React from "react";
import { motion } from "framer-motion";

interface PhilosopherProps {
  speaking?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function PythagorasFigure({
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
      aria-label="Pythagoras, Master of Number and Harmonic Ratio"
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
          <linearGradient id="pyth-marble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EDE5D4" />
            <stop offset="100%" stopColor="#C4B89F" />
          </linearGradient>
          <linearGradient id="pyth-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E7A8" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A67C37" />
          </linearGradient>
        </defs>

        {/* Sacred Geometry / Golden Ratio Spiral Aura */}
        <path
          d="M120 110 C140 110 155 95 155 75 C155 45 130 25 95 25 C50 25 20 60 20 110 C20 170 65 215 125 215"
          stroke="url(#pyth-gold)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.4"
        />

        {/* Geometric Robe with Clean Structural Folds */}
        <path
          d="M40 270 C45 215, 60 175, 88 155 C105 145, 135 145, 152 155 C180 175, 195 215, 200 270 Z"
          fill="url(#pyth-marble)"
          stroke="url(#pyth-gold)"
          strokeWidth="1.5"
        />

        {/* Diagonal Geometric Folds */}
        <path d="M88 155 L115 270" stroke="url(#pyth-gold)" strokeWidth="1.5" opacity="0.6" />
        <path d="M152 155 L135 270" stroke="url(#pyth-gold)" strokeWidth="1.5" opacity="0.6" />

        {/* Neck */}
        <path d="M102 135 H138 V162 H102 Z" fill="url(#pyth-marble)" stroke="url(#pyth-gold)" strokeWidth="1" />

        {/* Head / Classical Mystic Bust */}
        <path
          d="M86 112 C86 65, 154 65, 154 112 C154 136, 144 148, 120 148 C96 148, 86 136, 86 112 Z"
          fill="url(#pyth-marble)"
          stroke="url(#pyth-gold)"
          strokeWidth="2"
        />

        {/* Eastern / Croton Mystic Headband / Turban Cloth */}
        <path
          d="M84 76 C84 62, 100 52, 120 52 C140 52, 156 62, 156 76 C156 84, 140 88, 120 88 C100 88, 84 84, 84 76 Z"
          fill="url(#pyth-marble)"
          stroke="url(#pyth-gold)"
          strokeWidth="2"
        />
        <line x1="88" y1="72" x2="152" y2="72" stroke="url(#pyth-gold)" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* Pointed Philosopher Beard */}
        <path
          d="M86 96 C82 120 95 146 112 152 C118 154 122 154 128 152 C145 146 158 120 154 96"
          stroke="url(#pyth-gold)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Speaking mouth motion */}
        <motion.path
          d="M108 140 Q120 152 132 140"
          stroke="url(#pyth-gold)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: speaking
              ? ["M108 140 Q120 154 132 140", "M108 140 Q120 146 132 140", "M108 140 Q120 154 132 140"]
              : "M108 140 Q120 148 132 140",
          }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        />

        {/* Focused Geometer Eyes */}
        <path d="M100 97 Q107 94 114 97" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M126 97 Q133 94 140 97" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M120 95 V116 H116" stroke="url(#pyth-gold)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Hand Holding Triangle / Geometer Compass & Tablet */}
        <motion.g
          animate={{
            y: speaking ? [-1, 2, -1] : 0,
            rotate: speaking ? [0, -2, 0] : 0,
          }}
          transition={{ duration: 1.8, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
        >
          {/* Right hand */}
          <ellipse cx="60" cy="180" rx="8" ry="6" fill="url(#pyth-marble)" stroke="url(#pyth-gold)" strokeWidth="1.2" />
          {/* Golden Triangle / Tetractys Symbol */}
          <polygon
            points="60,158 48,178 72,178"
            stroke="url(#pyth-gold)"
            strokeWidth="1.8"
            fill="none"
          />
          {/* Inscribed golden ratio circle */}
          <circle cx="60" cy="170" r="5" stroke="url(#pyth-gold)" strokeWidth="1" fill="none" opacity="0.8" />
        </motion.g>
      </svg>
    </div>
  );
}
