"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AristotleFigure } from "@/components/philosophers/AristotleFigure";
import { SpeechBubble } from "@/components/landing/SpeechBubble";
import { MacroRing } from "@/components/dashboard/MacroRing";

interface SceneProps {
  onSelectPhilosopher?: () => void;
}

export function AristotleScene({ onSelectPhilosopher }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sceneOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.75, 0.9], [0, 1, 1, 0]);
  const scaleTilt = useTransform(scrollYProgress, [0.15, 0.45], [-12, 0]); // scale tilting to balance

  const speechText =
    "Virtue lives in the mean: not too little, not too much. Your plate is no different. Measure it kindly, and find your balance.";

  return (
    <section ref={containerRef} className="relative min-h-[130vh] w-full" id="scene-aristotle">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-8 overflow-hidden">
        <motion.div
          style={{ opacity: sceneOpacity }}
          className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Aristotle Figure */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div
              onMouseEnter={() => setIsSpeaking(true)}
              onMouseLeave={() => setIsSpeaking(false)}
            >
              <AristotleFigure
                speaking={isSpeaking}
                size={270}
                onClick={onSelectPhilosopher}
              />
            </div>
            <span className="text-xs font-mono text-gold uppercase tracking-widest mt-2 block font-semibold">
              The Golden Mean
            </span>
          </div>

          {/* Right Column: Speech & Balance Demonstration */}
          <div className="lg:col-span-7 space-y-6">
            <SpeechBubble
              philosopherName="Aristotle"
              caption="Inspired by Aristotle's doctrine of the mean (Nicomachean Ethics)"
              speech={speechText}
              isActive={true}
              onSpeakingChange={setIsSpeaking}
            />

            {/* The Golden Mean Balance Scale & 3 Balanced Macro Rings */}
            <div className="p-6 rounded-3xl glass-panel bg-surface/80 border border-gold/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-light">
                  Metabolic Equilibrium
                </span>
                <span className="text-[10px] text-text-muted font-mono">
                  Deficiency • The Mean • Excess
                </span>
              </div>

              {/* Animated Balance Scale */}
              <div className="py-2 flex items-center justify-center">
                <svg width="280" height="90" viewBox="0 0 280 90" fill="none" className="overflow-visible">
                  {/* Fulcrum base */}
                  <polygon points="140,55 125,85 155,85" fill="#1A1A24" stroke="#D4AF37" strokeWidth="1.5" />
                  <circle cx="140" cy="55" r="4" fill="#D4AF37" />

                  {/* Tilting balance beam moving to equilibrium */}
                  <motion.g style={{ rotate: scaleTilt, originX: "140px", originY: "55px" }}>
                    <line x1="30" y1="55" x2="250" y2="55" stroke="#D4AF37" strokeWidth="2.5" />

                    {/* Left Pan (Starvation/Deficit) */}
                    <line x1="45" y1="55" x2="35" y2="78" stroke="#D4AF37" strokeWidth="1" />
                    <line x1="45" y1="55" x2="55" y2="78" stroke="#D4AF37" strokeWidth="1" />
                    <path d="M28 78 Q45 88 62 78 Z" fill="#EDE5D4" stroke="#D4AF37" strokeWidth="1.2" />

                    {/* Right Pan (Gluttony/Excess) */}
                    <line x1="235" y1="55" x2="225" y2="78" stroke="#D4AF37" strokeWidth="1" />
                    <line x1="235" y1="55" x2="245" y2="78" stroke="#D4AF37" strokeWidth="1" />
                    <path d="M218 78 Q235 88 252 78 Z" fill="#EDE5D4" stroke="#D4AF37" strokeWidth="1.2" />
                  </motion.g>
                </svg>
              </div>

              {/* 3 Macro Rings balanced in harmony */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                <MacroRing
                  label="Protein"
                  consumed={135}
                  target={140}
                  unit="g"
                  color="var(--gold)"
                  size={75}
                />
                <MacroRing
                  label="Carbs"
                  consumed={210}
                  target={220}
                  unit="g"
                  color="var(--aegean)"
                  size={75}
                />
                <MacroRing
                  label="Healthy Fats"
                  consumed={58}
                  target={62}
                  unit="g"
                  color="var(--royal)"
                  size={75}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
