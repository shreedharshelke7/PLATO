"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PlatoFigure } from "@/components/philosophers/PlatoFigure";
import { SpeechBubble } from "@/components/landing/SpeechBubble";

interface SceneProps {
  onSelectPhilosopher?: () => void;
}

export function PlatoScene({ onSelectPhilosopher }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sceneOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.75, 0.9], [0, 1, 1, 0]);
  const platoX = useTransform(scrollYProgress, [0.1, 0.3], [-100, 0]);

  const speechText =
    "Imagine the soul as a chariot. Reason holds the reins while appetite and spirit pull in their own directions. A well-fed life is neither starvation nor excess; it is the reins held steady. Come, learn what your plate is truly asking.";

  return (
    <section ref={containerRef} className="relative min-h-[130vh] w-full" id="scene-plato">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-8 overflow-hidden">
        <motion.div
          style={{ opacity: sceneOpacity }}
          className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Plato Figure */}
          <motion.div
            style={{ x: platoX }}
            className="lg:col-span-5 flex flex-col items-center justify-center text-center"
          >
            <div
              onMouseEnter={() => setIsSpeaking(true)}
              onMouseLeave={() => setIsSpeaking(false)}
            >
              <PlatoFigure
                speaking={isSpeaking}
                size={270}
                onClick={onSelectPhilosopher}
              />
            </div>
            <span className="text-xs font-mono text-gold uppercase tracking-widest mt-2 block font-semibold">
              Tap figure for full discourse
            </span>
          </motion.div>

          {/* Right Column: Speech & Animated Chariot Allegory */}
          <div className="lg:col-span-7 space-y-6">
            <SpeechBubble
              philosopherName="Plato"
              caption="Inspired by Plato's chariot allegory (Phaedrus)"
              speech={speechText}
              isActive={true}
              onSpeakingChange={setIsSpeaking}
            />

            {/* Chariot Allegory Animated SVG */}
            <div className="p-5 rounded-2xl glass-panel bg-surface/80 border border-gold/20 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-light">
                  The Soul as a Chariot
                </span>
                <span className="text-[10px] text-text-muted font-mono">
                  Appetite • Spirit • Reason
                </span>
              </div>

              <div className="relative w-full h-24 sm:h-28 flex items-center justify-center">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 400 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="max-w-md w-full"
                >
                  {/* Road / Ground Horizon */}
                  <line x1="10" y1="85" x2="390" y2="85" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                  {/* Chariot Body */}
                  <g transform="translate(60, 45)">
                    {/* Chariot Wheel */}
                    <circle cx="20" cy="30" r="14" stroke="#D4AF37" strokeWidth="2" fill="#12121A" />
                    <line x1="20" y1="16" x2="20" y2="44" stroke="#D4AF37" strokeWidth="1" />
                    <line x1="6" y1="30" x2="34" y2="30" stroke="#D4AF37" strokeWidth="1" />
                    {/* Car */}
                    <path d="M5 25 Q10 5 35 10 L30 30 Z" fill="#EDE5D4" stroke="#D4AF37" strokeWidth="1.5" />
                    {/* Charioteer (Reason) */}
                    <circle cx="22" cy="0" r="5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.2" />
                    <line x1="22" y1="5" x2="20" y2="20" stroke="#D4AF37" strokeWidth="2" />
                  </g>

                  {/* Dynamic Reins Extending Forward */}
                  <motion.path
                    d="M82 52 Q150 40 230 45"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    fill="none"
                    animate={{
                      d: isSpeaking
                        ? ["M82 52 Q150 36 230 45", "M82 52 Q150 44 230 45", "M82 52 Q150 36 230 45"]
                        : "M82 52 Q150 40 230 45",
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />

                  {/* Steed 1: Dark Horse (Appetite - Craving) */}
                  <g transform="translate(230, 25)">
                    <path
                      d="M0 45 C15 25 25 15 45 15 C55 15 65 22 75 35 C65 50 45 55 25 55 Z"
                      fill="#1A1A24"
                      stroke="#B5523B"
                      strokeWidth="1.5"
                    />
                    <text x="32" y="40" fill="#B5523B" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                      Appetite
                    </text>
                  </g>

                  {/* Steed 2: White / Noble Horse (Spirit - Energy) */}
                  <g transform="translate(260, 15)">
                    <path
                      d="M0 45 C15 25 25 15 45 15 C55 15 65 22 75 35 C65 50 45 55 25 55 Z"
                      fill="#EDE5D4"
                      stroke="#D4AF37"
                      strokeWidth="1.5"
                    />
                    <text x="32" y="38" fill="#7A5C14" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                      Spirit
                    </text>
                  </g>
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/60 pt-2 mt-2">
                <span>Reason: Mifflin-St Jeor Engine</span>
                <span className="text-gold font-semibold">Holds the Reins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
