"use client";

import React from "react";
import { motion } from "framer-motion";

interface PhilosopherProps {
  speaking?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function PlatoFigure({
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
      aria-label="Plato, Master of the Academy"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative inline-block cursor-pointer select-none transition-transform duration-300 hover:scale-[1.02] focus:outline-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Golden Aura Glow Pulse when speaking */}
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
          <linearGradient id="plato-marble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EDE5D4" />
            <stop offset="100%" stopColor="#C4B89F" />
          </linearGradient>
          <linearGradient id="plato-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E7A8" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A67C37" />
          </linearGradient>
          <linearGradient id="plato-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A1A24" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0A0A0F" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Halo Pedestal Arch */}
        <circle
          cx="120"
          cy="110"
          r="95"
          stroke="url(#plato-gold)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.4"
        />

        {/* Flowing Classical Robe / Himation */}
        <path
          d="M40 270 C45 220, 60 180, 85 160 C100 150, 140 150, 155 160 C180 180, 195 220, 200 270 Z"
          fill="url(#plato-marble)"
          stroke="url(#plato-gold)"
          strokeWidth="1.5"
        />

        {/* Robe Drapery Folds with Fine Gold Lines */}
        <path
          d="M85 160 Q110 200 100 270"
          stroke="url(#plato-gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M155 160 Q130 205 140 270"
          stroke="url(#plato-gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M120 165 V270"
          stroke="#A67C37"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* Neck */}
        <path
          d="M102 135 H138 V165 H102 Z"
          fill="url(#plato-marble)"
          stroke="url(#plato-gold)"
          strokeWidth="1"
        />

        {/* Head / Classical Bust Silhouette */}
        <path
          d="M85 110 C85 65, 155 65, 155 110 C155 135, 145 148, 120 148 C95 148, 85 135, 85 110 Z"
          fill="url(#plato-marble)"
          stroke="url(#plato-gold)"
          strokeWidth="2"
        />

        {/* Noble Curly Beard & Hair Waves */}
        <path
          d="M82 95 C75 115 88 140 105 145 C115 148 125 148 135 145 C152 140 165 115 158 95"
          stroke="url(#plato-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Animated speaking beard/jaw resonance */}
        <motion.path
          d="M105 140 Q120 152 135 140"
          stroke="url(#plato-gold)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: speaking
              ? ["M105 140 Q120 154 135 140", "M105 140 Q120 148 135 140", "M105 140 Q120 154 135 140"]
              : "M105 140 Q120 150 135 140",
          }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        />

        {/* Philosopher Hair Touches */}
        <path
          d="M84 92 C82 60, 110 50, 120 50 C130 50, 158 60, 156 92"
          stroke="url(#plato-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes & Contemplative Brow */}
        <path d="M100 98 Q108 95 114 98" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M126 98 Q132 95 140 98" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        {/* Greek Straight Nose Line */}
        <path d="M120 95 V116 H115" stroke="url(#plato-gold)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Laurel Crown on Brow */}
        <g transform="translate(86, 68)">
          <path
            d="M5 15 Q20 5 35 10 T65 12"
            stroke="url(#plato-gold)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Leaves */}
          <ellipse cx="14" cy="9" rx="5" ry="2.5" transform="rotate(-25 14 9)" fill="url(#plato-gold)" />
          <ellipse cx="28" cy="7" rx="5" ry="2.5" transform="rotate(15 28 7)" fill="url(#plato-gold)" />
          <ellipse cx="44" cy="8" rx="5" ry="2.5" transform="rotate(-15 44 8)" fill="url(#plato-gold)" />
          <ellipse cx="58" cy="11" rx="4.5" ry="2" transform="rotate(30 58 11)" fill="url(#plato-gold)" />
        </g>

        {/* Right Hand Holding the Charioteer's Reins / Papyrus Scroll */}
        <motion.g
          animate={{
            y: speaking ? [-1, 2, -1] : 0,
            rotate: speaking ? [0, 1.5, 0] : 0,
          }}
          transition={{ duration: 1.6, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
        >
          {/* Papyrus Scroll */}
          <rect
            x="160"
            y="175"
            width="22"
            height="55"
            rx="4"
            transform="rotate(15 160 175)"
            fill="#F6F1E7"
            stroke="url(#plato-gold)"
            strokeWidth="1.5"
          />
          <line x1="168" y1="185" x2="182" y2="189" stroke="#A67C37" strokeWidth="1" />
          <line x1="166" y1="195" x2="180" y2="199" stroke="#A67C37" strokeWidth="1" />
          <line x1="164" y1="205" x2="178" y2="209" stroke="#A67C37" strokeWidth="1" />
          {/* Hand clasp */}
          <ellipse cx="166" cy="195" rx="8" ry="6" fill="url(#plato-marble)" stroke="url(#plato-gold)" strokeWidth="1.2" />
        </motion.g>
      </svg>
    </div>
  );
}
