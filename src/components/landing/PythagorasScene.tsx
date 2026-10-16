"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { PythagorasFigure } from "@/components/philosophers/PythagorasFigure";
import { SpeechBubble } from "@/components/landing/SpeechBubble";
import { TrendingUp, ArrowRight } from "lucide-react";

interface SceneProps {
  onSelectPhilosopher?: () => void;
}

export function PythagorasScene({ onSelectPhilosopher }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sceneOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.75, 0.9], [0, 1, 1, 0]);
  const spiralLength = useTransform(scrollYProgress, [0.15, 0.55], [0, 1]);

  const speechText =
    "All things are harmony and number. Protein, fat, carbohydrate, fiber: the body is a ratio. Let me show you yours.";

  return (
    <section ref={containerRef} className="relative min-h-[130vh] w-full" id="scene-pythagoras">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-8 overflow-hidden">
        <motion.div
          style={{ opacity: sceneOpacity }}
          className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Pythagoras Figure */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div
              onMouseEnter={() => setIsSpeaking(true)}
              onMouseLeave={() => setIsSpeaking(false)}
            >
              <PythagorasFigure
                speaking={isSpeaking}
                size={270}
                onClick={onSelectPhilosopher}
              />
            </div>
            <span className="text-xs font-mono text-gold uppercase tracking-widest mt-2 block font-semibold">
              Harmony is Number
            </span>
          </div>

          {/* Right Column: Speech & Sacred Geometry / Numerical Targets */}
          <div className="lg:col-span-7 space-y-6">
            <SpeechBubble
              philosopherName="Pythagoras"
              caption="Inspired by Pythagorean numerical harmony and proportion"
              speech={speechText}
              isActive={true}
              onSpeakingChange={setIsSpeaking}
            />

            {/* Sacred Geometry Golden Spiral & Metabolic Targets */}
            <div className="p-6 rounded-3xl glass-panel bg-surface/80 border border-gold/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-light flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-gold" />
                  Sacred Harmonic Targets (Mifflin-St Jeor Engine)
                </span>
                <span className="text-[10px] text-text-muted font-mono">Φ = 1.618</span>
              </div>

              {/* Golden Ratio Spiral SVG */}
              <div className="relative h-28 w-full flex items-center justify-center py-2">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 320 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="max-w-md w-full"
                >
                  {/* Geometric Rectangles */}
                  <rect x="20" y="10" width="80" height="80" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />
                  <rect x="100" y="10" width="50" height="50" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />
                  <rect x="100" y="60" width="30" height="30" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />
                  <rect x="130" y="60" width="20" height="20" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />

                  {/* Golden Spiral drawing with scroll */}
                  <motion.path
                    d="M20 90 A 80 80 0 0 1 100 10 A 50 50 0 0 1 150 60 A 30 30 0 0 1 120 90 A 20 20 0 0 1 100 70 A 12 12 0 0 1 112 58"
                    stroke="#D4AF37"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    style={{ pathLength: spiralLength }}
                  />
                </svg>
              </div>

              {/* Animated Counting Ratios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-border pt-3">
                <div className="p-2.5 rounded-xl bg-surface-glass border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Daily Energy</span>
                  <span className="font-serif font-black text-lg text-gold-light">2,150</span>
                  <span className="text-[9px] text-text-muted block">kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-glass border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Pure Protein</span>
                  <span className="font-serif font-black text-lg text-gold">145</span>
                  <span className="text-[9px] text-text-muted block">grams</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-glass border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Prebiotic Fiber</span>
                  <span className="font-serif font-black text-lg text-success">32</span>
                  <span className="text-[9px] text-text-muted block">grams</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-glass border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Hydration Flow</span>
                  <span className="font-serif font-black text-lg text-aegean">2,800</span>
                  <span className="text-[9px] text-text-muted block">ml</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-text-muted text-[11px]">Calibrated to BMR, activity & goals</span>
                <Link
                  href="/progress"
                  className="font-bold text-gold hover:underline flex items-center gap-1 text-xs"
                >
                  View Olympian Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
