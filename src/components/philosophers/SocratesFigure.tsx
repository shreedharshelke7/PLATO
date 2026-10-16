"use client";

import React from "react";
import { motion } from "framer-motion";

interface PhilosopherProps {
  speaking?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function SocratesFigure({
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
      aria-label="Socrates, The Questioner of Plates"
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
          <linearGradient id="soc-marble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EDE5D4" />
            <stop offset="100%" stopColor="#C4B89F" />
          </linearGradient>
          <linearGradient id="soc-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7E7A8" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A67C37" />
          </linearGradient>
        </defs>

        {/* Aura Ring */}
        <circle cx="120" cy="110" r="95" stroke="url(#soc-gold)" strokeWidth="1.5" strokeDasharray="3 7" opacity="0.4" />

        {/* Humble Coarse Wool Robe */}
        <path
          d="M40 270 C45 210, 60 170, 88 152 C105 142, 135 142, 152 152 C180 170, 195 210, 200 270 Z"
          fill="url(#soc-marble)"
          stroke="url(#soc-gold)"
          strokeWidth="1.5"
        />

        {/* Folds */}
        <path d="M88 152 Q105 200 95 270" stroke="url(#soc-gold)" strokeWidth="1.5" opacity="0.6" />
        <path d="M152 152 Q135 200 145 270" stroke="url(#soc-gold)" strokeWidth="1.5" opacity="0.6" />

        {/* Neck */}
        <path d="M102 135 H138 V160 H102 Z" fill="url(#soc-marble)" stroke="url(#soc-gold)" strokeWidth="1" />

        {/* Characteristic Rounded Head (Satyr-like robust face) */}
        <path
          d="M84 112 C84 65, 156 65, 156 112 C156 138, 145 150, 120 150 C95 150, 84 138, 84 112 Z"
          fill="url(#soc-marble)"
          stroke="url(#soc-gold)"
          strokeWidth="2"
        />

        {/* Wild, unruly beard */}
        <path
          d="M82 100 C74 125 90 148 106 150 C116 152 124 152 134 150 C150 148 166 125 158 100"
          stroke="url(#soc-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Animated Speaking mouth/beard */}
        <motion.path
          d="M106 142 Q120 153 134 142"
          stroke="url(#soc-gold)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: speaking
              ? ["M106 142 Q120 155 134 142", "M106 142 Q120 148 134 142", "M106 142 Q120 155 134 142"]
              : "M106 142 Q120 150 134 142",
          }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        />

        {/* Bald crown with fringe hair */}
        <path d="M85 90 C84 62 100 56 120 56 C140 56 156 62 155 90" stroke="url(#soc-gold)" strokeWidth="1.8" fill="none" opacity="0.8" />
        <path d="M84 94 C78 102 78 112 82 120" stroke="url(#soc-gold)" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M156 94 C162 102 162 112 158 120" stroke="url(#soc-gold)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Inquisitive Eyes & Arched Brow */}
        <circle cx="107" cy="98" r="2.5" fill="#1A1612" />
        <circle cx="133" cy="98" r="2.5" fill="#1A1612" />
        <path d="M101 92 Q107 88 113 92" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        <path d="M127 92 Q133 88 139 92" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
        {/* Broad Snub Nose */}
        <path d="M117 96 Q115 110 114 113 Q120 117 126 113" stroke="url(#soc-gold)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Hand Gesture: Index finger raised in philosophical inquiry */}
        <motion.g
          animate={{
            y: speaking ? [-2, 3, -2] : 0,
            rotate: speaking ? [0, 3, 0] : 0,
          }}
          transition={{ duration: 1.8, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
        >
          {/* Hand holding an examined plate or raised index finger */}
          <path
            d="M165 210 Q168 185 170 175 C170 170 174 170 174 175 Q173 192 173 210"
            stroke="url(#soc-gold)"
            strokeWidth="2"
            fill="url(#soc-marble)"
            strokeLinecap="round"
          />
          {/* Fist clasp */}
          <ellipse cx="168" cy="210" rx="9" ry="8" fill="url(#soc-marble)" stroke="url(#soc-gold)" strokeWidth="1.2" />

          {/* Examined Greek Clay Plate (Pinax) in other hand */}
          <ellipse cx="70" cy="200" rx="20" ry="10" fill="url(#soc-marble)" stroke="url(#soc-gold)" strokeWidth="2" />
          <ellipse cx="70" cy="200" rx="14" ry="6" stroke="url(#soc-gold)" strokeWidth="1" strokeDasharray="2 3" fill="none" />
          {/* AI scan focal rings over plate */}
          <circle cx="70" cy="200" r="6" stroke="#D4AF37" strokeWidth="1.5" fill="none" opacity="0.8" />
        </motion.g>
      </svg>
    </div>
  );
}
