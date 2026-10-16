"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { EpicurusFigure } from "@/components/philosophers/EpicurusFigure";
import { SpeechBubble } from "@/components/landing/SpeechBubble";
import { Sparkles, ArrowRight, RotateCw, Clock, Flame } from "lucide-react";

interface SceneProps {
  onSelectPhilosopher?: () => void;
}

export function EpicurusScene({ onSelectPhilosopher }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sceneOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.75, 0.9], [0, 1, 1, 0]);

  const speechText =
    "Pleasure is not the enemy of health. The deepest joys are simple: warm bread, fresh fruit, good company. Taste can be your ally, so let me show you what to swap, not what to give up.";

  return (
    <section ref={containerRef} className="relative min-h-[130vh] w-full" id="scene-epicurus">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-8 overflow-hidden">
        <motion.div
          style={{ opacity: sceneOpacity }}
          className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Epicurus Figure */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div
              onMouseEnter={() => setIsSpeaking(true)}
              onMouseLeave={() => setIsSpeaking(false)}
            >
              <EpicurusFigure
                speaking={isSpeaking}
                size={270}
                onClick={onSelectPhilosopher}
              />
            </div>
            <span className="text-xs font-mono text-gold uppercase tracking-widest mt-2 block font-semibold">
              The Divine Swap
            </span>
          </div>

          {/* Right Column: Speech & 3D Interactive Card Flip */}
          <div className="lg:col-span-7 space-y-6">
            <SpeechBubble
              philosopherName="Epicurus"
              caption="Inspired by Epicurean tranquility and simple pleasures"
              speech={speechText}
              isActive={true}
              onSpeakingChange={setIsSpeaking}
            />

            {/* 3D Divine Swap Card Flip Demonstration */}
            <div className="p-6 rounded-3xl glass-panel bg-surface/80 border border-gold/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-light flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  Divine Swap in Action (Example)
                </span>
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="text-[11px] font-mono text-gold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" /> Flip comparison
                </button>
              </div>

              {/* 3D Flip Container */}
              <div
                className="relative h-48 w-full cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {/* Front: Craved Fast Food (Pepperoni Pizza Slice) */}
                  <div
                    className="absolute inset-0 rounded-2xl p-5 bg-gradient-to-br from-surface to-bg-elevated border border-border flex flex-col justify-between"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
                          🍕
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-red-400 font-bold tracking-wider">
                            Original Craving (Example)
                          </span>
                          <h4 className="font-serif font-bold text-base text-text">
                            2 Slices Cheesy Pepperoni Pizza
                          </h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-mono font-bold">
                        590 kcal
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-border/60 pt-3">
                      <div>
                        <span className="text-[10px] text-text-muted block">Protein</span>
                        <span className="font-bold text-text">16g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">Fiber</span>
                        <span className="font-bold text-text">2g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">Satiety</span>
                        <span className="font-bold text-amber-400">Low (crash)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gold pt-1">
                      <span>Click to flip toward the Divine Swap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Back: The Divine Swap (Thin Crust Paneer / Chicken Roti Pizza) */}
                  <div
                    className="absolute inset-0 rounded-2xl p-5 bg-gradient-to-br from-surface-glass to-surface border border-gold/40 flex flex-col justify-between"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-2xl">
                          ✨
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-gold font-bold tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-gold" /> Divine Swap
                          </span>
                          <h4 className="font-serif font-bold text-base text-text">
                            Crispy Whole-Wheat Paneer Roti Pizza
                          </h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-success text-xs font-mono font-bold">
                        410 kcal
                      </span>
                    </div>

                    {/* Animated Delta Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-success text-xs font-mono font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3" /> −180 kcal
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-gold/15 border border-gold/30 text-gold-light text-xs font-mono font-bold">
                        +9 g Protein
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-bold">
                        +4 g Fiber
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 8 min prep
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                      <span className="text-text-muted text-[11px]">Taste Match: 9.4 / 10</span>
                      <Link
                        href="/swap"
                        className="font-bold text-gold hover:underline text-xs flex items-center gap-1"
                      >
                        Try Divine Swap <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
