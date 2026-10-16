"use client";

import React from "react";
import { motion } from "framer-motion";

interface PhilosopherProps {
  speaking?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function EpicurusFigure({
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
      aria-label="Epicurus, Philosopher of Simple Joy and Divine Swaps"
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
          <linearGradient id="epi-marble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EDE5D4" />
            <stop offset="100%" stopColor="#C4B89F" />
          </linearGradient>
          <linearGradient id="epi-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E7A8" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A67C37" />
          </linearGradient>
        </defs>

        {/* Garden Wreath Arch Halo */}
        <circle cx="120" cy="110" r="95" stroke="url(#epi-gold)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />

        {/* Serene Garden Robe */}
        <path
          d="M45 270 C50 215, 65 175, 90 155 C105 145, 135 145, 150 155 C175 175, 190 215, 195 270 Z"
          fill="url(#epi-marble)"
          stroke="url(#epi-gold)"
          strokeWidth="1.5"
        />

        {/* Robe Folds */}
        <path d="M90 155 Q115 195 105 270" stroke="url(#epi-gold)" strokeWidth="1.5" opacity="0.7" />
        <path d="M150 155 Q125 195 135 270" stroke="url(#epi-gold)" strokeWidth="1.5" opacity="0.7" />

        {/* Neck */}
        <path d="M104 135 H136 V162 H104 Z" fill="url(#epi-marble)" stroke="url(#epi-gold)" strokeWidth="1" />

        {/* Head / Classical Portrait with serene brow and neat full beard */}
        <path
          d="M86 112 C86 65, 154 65, 154 112 C154 136, 144 148, 120 148 C96 148, 86 136, 86 112 Z"
          fill="url(#epi-marble)"
          stroke="url(#epi-gold)"
          strokeWidth="2"
        />

        {/* Serene, Full Beard */}
        <path
          d="M84 96 C80 120 92 145 108 148 C116 150 124 150 132 148 C148 145 160 120 156 96"
          stroke="url(#epi-gold)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Speaking mouth motion */}
        <motion.path
          d="M106 140 Q120 150 134 140"
          stroke="url(#epi-gold)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: speaking
              ? ["M106 140 Q120 152 134 140", "M106 140 Q120 146 134 140", "M106 140 Q120 152 134 140"]
              : "M106 140 Q120 148 134 140",
          }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        />

        {/* Hair in soft gentle curls */}
        <path
          d="M85 94 C84 65, 105 52, 120 52 C135 52, 156 65, 155 94"
          stroke="url(#epi-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Calm Gentle Eyes (Ataraxia) */}
        <path d="M100 97 Q107 94 114 97" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M126 97 Q133 94 140 97" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M120 95 V116 H116" stroke="url(#epi-gold)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Gentle Smiling Brow */}
        <path d="M99 91 Q107 88 115 91" stroke="url(#epi-gold)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M125 91 Q133 88 141 91" stroke="url(#epi-gold)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Hand Holding Fresh Fruit / Bread (Simple Pleasures) */}
        <motion.g
          animate={{
            y: speaking ? [-1, 2, -1] : 0,
            rotate: speaking ? [0, 2, 0] : 0,
          }}
          transition={{ duration: 1.8, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
        >
          {/* Hand cupping fruit */}
          <path
            d="M155 195 Q170 190 180 198 Q175 208 160 205 Z"
            fill="url(#epi-marble)"
            stroke="url(#epi-gold)"
            strokeWidth="1.5"
          />
          {/* Cluster of Grapes / Fig (symbol of simple, healthy garden bounty) */}
          <circle cx="172" cy="188" r="5" fill="#5B2A86" stroke="url(#epi-gold)" strokeWidth="1" />
          <circle cx="180" cy="186" r="4.5" fill="#5B2A86" stroke="url(#epi-gold)" strokeWidth="1" />
          <circle cx="176" cy="180" r="4" fill="#5B2A86" stroke="url(#epi-gold)" strokeWidth="1" />
          <circle cx="168" cy="182" r="3.5" fill="#5B2A86" stroke="url(#epi-gold)" strokeWidth="1" />
          {/* Vine twig */}
          <path d="M176 176 Q178 170 184 172" stroke="url(#epi-gold)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </motion.g>
      </svg>
    </div>
  );
}
