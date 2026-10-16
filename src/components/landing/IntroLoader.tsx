"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroLoader({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem("ambrosia_intro_shown");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!visible) {
      onComplete?.();
      return;
    }

    try {
      sessionStorage.setItem("ambrosia_intro_shown", "true");
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1750);

    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  const handleSkip = () => {
    setVisible(false);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg text-text select-none cursor-pointer"
          onClick={handleSkip}
        >
          {/* Skip pill */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-6 right-6 px-3 py-1.5 rounded-full border border-gold/30 text-[11px] font-mono uppercase text-gold hover:bg-gold/15 transition-all"
          >
            Skip (Esc)
          </button>

          {/* Drawing Gold Laurel Wreath */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg
              width="128"
              height="128"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              {/* Left Wreath Branch */}
              <motion.path
                d="M 50 85 C 32 82 18 68 18 50 C 18 32 30 20 45 15"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              {/* Right Wreath Branch */}
              <motion.path
                d="M 50 85 C 68 82 82 68 82 50 C 82 32 70 20 55 15"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />

              {/* Leaves */}
              {[
                { cx: 30, cy: 75, r: 3 },
                { cx: 20, cy: 55, r: 3.5 },
                { cx: 24, cy: 35, r: 3 },
                { cx: 36, cy: 22, r: 2.8 },
                { cx: 70, cy: 75, r: 3 },
                { cx: 80, cy: 55, r: 3.5 },
                { cx: 76, cy: 35, r: 3 },
                { cx: 64, cy: 22, r: 2.8 },
              ].map((leaf, idx) => (
                <motion.circle
                  key={idx}
                  cx={leaf.cx}
                  cy={leaf.cy}
                  r={leaf.r}
                  fill="#D4AF37"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.85 }}
                  transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
                />
              ))}

              {/* Central Lightning glyph */}
              <motion.path
                d="M52 28 L44 50 H52 L48 72 L60 48 H52 Z"
                fill="#F1E3B0"
                stroke="#D4AF37"
                strokeWidth="1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4, type: "spring" }}
              />
            </svg>
          </div>

          {/* Delphic Maxim: Know Thyself */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-center mt-6 space-y-1.5"
          >
            <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-widest text-gold-light uppercase gold-glow">
              Know Thyself.
            </h2>
            <p className="text-xs tracking-widest font-serif text-text-muted uppercase">
              Γνῶθι σεαυτόν • The Academy of Ambrosia
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
