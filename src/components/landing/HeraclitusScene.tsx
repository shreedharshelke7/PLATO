"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeraclitusFigure } from "@/components/philosophers/HeraclitusFigure";
import { SpeechBubble } from "@/components/landing/SpeechBubble";
import { Droplets, Bell, ArrowRight } from "lucide-react";

interface SceneProps {
  onSelectPhilosopher?: () => void;
}

export function HeraclitusScene({ onSelectPhilosopher }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sceneOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.75, 0.9], [0, 1, 1, 0]);
  const waterLevel = useTransform(scrollYProgress, [0.15, 0.55], ["15%", "85%"]);

  const speechText =
    "Everything flows, and so must you. A river that stops becomes a pond. Drink steadily, and let the day move through you.";

  return (
    <section ref={containerRef} className="relative min-h-[130vh] w-full" id="scene-heraclitus">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-8 overflow-hidden">
        <motion.div
          style={{ opacity: sceneOpacity }}
          className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Heraclitus Figure */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div
              onMouseEnter={() => setIsSpeaking(true)}
              onMouseLeave={() => setIsSpeaking(false)}
            >
              <HeraclitusFigure
                speaking={isSpeaking}
                size={270}
                onClick={onSelectPhilosopher}
              />
            </div>
            <span className="text-xs font-mono text-gold uppercase tracking-widest mt-2 block font-semibold">
              Everything Flows
            </span>
          </div>

          {/* Right Column: Speech & Hydration Wave Demonstration */}
          <div className="lg:col-span-7 space-y-6">
            <SpeechBubble
              philosopherName="Heraclitus"
              caption="Inspired by Heraclitus's doctrine of universal flux (Panta Rhei)"
              speech={speechText}
              isActive={true}
              onSpeakingChange={setIsSpeaking}
            />

            {/* Rising Water Wave & Hydration Glass Display */}
            <div className="p-6 rounded-3xl glass-panel bg-surface/80 border border-gold/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-light flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-aegean" />
                  Hydration Architecture
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gold">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Bell className="w-3.5 h-3.5 text-gold" />
                  </motion.div>
                  <span className="font-mono text-[11px]">Celestial Chime</span>
                </div>
              </div>

              {/* Water Vessel with Wave Animation */}
              <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-bg border border-aegean/30 flex items-end">
                {/* Background Aegean Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-aegean/20 to-transparent pointer-events-none" />

                {/* Animated Rising Water Wave Layer */}
                <motion.div
                  className="w-full relative overflow-hidden bg-gradient-to-t from-[#0B1E28] to-[#1F6F78]"
                  style={{ height: waterLevel }}
                >
                  <svg
                    viewBox="0 0 500 60"
                    preserveAspectRatio="none"
                    className="w-[200%] h-8 absolute top-0 left-0 animate-wave opacity-75"
                  >
                    <path
                      d="M0,20 C150,50 350,-10 500,20 L500,0 L0,0 Z"
                      fill="#1F6F78"
                    />
                  </svg>
                </motion.div>

                {/* Glass Markings Overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                  <div>
                    <span className="font-serif font-black text-2xl text-text drop-shadow">
                      2,400 <span className="text-xs font-sans font-normal text-text-muted">ml</span>
                    </span>
                    <span className="block text-[10px] uppercase font-mono text-cyan-200">
                      Steady Intake • 86% Reached
                    </span>
                  </div>

                  <div className="space-y-1 text-right text-[10px] font-mono text-text-muted">
                    <span className="block">08:00 • 300 ml ✓</span>
                    <span className="block">12:00 • 500 ml ✓</span>
                    <span className="block text-gold">15:00 • 350 ml Next</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                <span className="text-text-muted text-[11px]">Interval reminders mapped to circadian rhythm</span>
                <Link
                  href="/water"
                  className="font-bold text-gold hover:underline flex items-center gap-1 text-xs"
                >
                  Open Poseidon Hydration <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
