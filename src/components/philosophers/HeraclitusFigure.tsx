"use client";

import React from "react";
import { motion } from "framer-motion";

interface PhilosopherProps {
  speaking?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function HeraclitusFigure({
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
      aria-label="Heraclitus, Philosopher of Universal Flux and Flow"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative inline-block cursor-pointer select-none transition-transform duration-300 hover:scale-[1.02] focus:outline-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Golden/Aegean Aura Glow Pulse */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        animate={{
          backgroundColor: speaking
            ? "rgba(31, 111, 120, 0.45)"
            : "rgba(31, 111, 120, 0.12)",
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
          <linearGradient id="hera-marble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EDE5D4" />
            <stop offset="100%" stopColor="#C4B89F" />
          </linearGradient>
          <linearGradient id="hera-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E7A8" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A67C37" />
          </linearGradient>
          <linearGradient id="hera-aegean" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1F6F78" />
            <stop offset="100%" stopColor="#0B1E28" />
          </linearGradient>
        </defs>

        {/* River Wave Halo Arch */}
        <circle cx="120" cy="110" r="95" stroke="url(#hera-gold)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.35" />

        {/* Flowing Water-like Robes */}
        <path
          d="M40 270 C45 215, 60 175, 86 155 C102 145, 138 145, 154 155 C180 175, 195 215, 200 270 Z"
          fill="url(#hera-marble)"
          stroke="url(#hera-gold)"
          strokeWidth="1.5"
        />

        {/* Wave-like Robe Folds */}
        <path d="M86 155 Q110 190 95 270" stroke="url(#hera-gold)" strokeWidth="1.5" opacity="0.7" />
        <path d="M154 155 Q130 190 145 270" stroke="url(#hera-gold)" strokeWidth="1.5" opacity="0.7" />
        <path d="M120 162 Q112 210 120 270" stroke="#1F6F78" strokeWidth="1.4" opacity="0.6" />

        {/* Neck */}
        <path d="M102 135 H138 V162 H102 Z" fill="url(#hera-marble)" stroke="url(#hera-gold)" strokeWidth="1" />

        {/* Head / Classical Contemplative Bust */}
        <path
          d="M86 112 C86 65, 154 65, 154 112 C154 136, 144 148, 120 148 C96 148, 86 136, 86 112 Z"
          fill="url(#hera-marble)"
          stroke="url(#hera-gold)"
          strokeWidth="2"
        />

        {/* River-Wave Flowing Beard */}
        <path
          d="M84 96 C80 120 90 142 105 148 C115 152 125 152 135 148 C150 142 160 120 156 96"
          stroke="url(#hera-gold)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Secondary wave tendrils in beard */}
        <path d="M108 148 Q115 162 120 170 Q125 162 132 148" stroke="#1F6F78" strokeWidth="1.8" fill="none" opacity="0.8" />

        {/* Speaking mouth motion */}
        <motion.path
          d="M106 140 Q120 150 134 140"
          stroke="url(#hera-gold)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: speaking
              ? ["M106 140 Q120 153 134 140", "M106 140 Q120 146 134 140", "M106 140 Q120 153 134 140"]
              : "M106 140 Q120 148 134 140",
          }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        />

        {/* Long hair flowing like river currents */}
        <path
          d="M85 94 C84 62, 105 50, 120 50 C135 50, 156 62, 155 94"
          stroke="url(#hera-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Reflective, Profound Eyes */}
        <path d="M100 97 Q107 94 114 97" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M126 97 Q133 94 140 97" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M120 95 V116 H116" stroke="url(#hera-gold)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Hand Pouring Water from an Amphora (Hydration Vessel) */}
        <motion.g
          animate={{
            y: speaking ? [-1, 2, -1] : 0,
            rotate: speaking ? [0, 2, 0] : 0,
          }}
          transition={{ duration: 1.8, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
        >
          {/* Hand clasp */}
          <ellipse cx="165" cy="188" rx="8" ry="6" fill="url(#hera-marble)" stroke="url(#hera-gold)" strokeWidth="1.2" />

          {/* Small tilted Amphora */}
          <path
            d="M165 175 L180 185 L175 205 L160 195 Z"
            fill="url(#hera-marble)"
            stroke="url(#hera-gold)"
            strokeWidth="1.5"
          />
          {/* Flowing Water stream droplets from vessel mouth */}
          <motion.path
            d="M176 206 Q178 220 174 235"
            stroke="#1F6F78"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={{
              opacity: speaking ? [0.6, 1, 0.6] : 0.8,
              pathLength: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <circle cx="174" cy="242" r="2.5" fill="#1F6F78" />
        </motion.g>
      </svg>
    </div>
  );
}
