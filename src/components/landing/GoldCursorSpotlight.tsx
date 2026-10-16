"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function GoldCursorSpotlight() {
  const [enabled, setEnabled] = useState(false);
  const cursorX = useSpring(-200, { stiffness: 400, damping: 28 });
  const cursorY = useSpring(-200, { stiffness: 400, damping: 28 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const rafId = requestAnimationFrame(() => setEnabled(true));

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 160);
      cursorY.set(e.clientY - 160);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 w-80 h-80 rounded-full z-10 mix-blend-screen"
      style={{
        x: cursorX,
        y: cursorY,
        background:
          "radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.03) 45%, transparent 70%)",
      }}
      aria-hidden="true"
    />
  );
}
