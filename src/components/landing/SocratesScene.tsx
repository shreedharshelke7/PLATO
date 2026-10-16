"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { SocratesFigure } from "@/components/philosophers/SocratesFigure";
import { SpeechBubble } from "@/components/landing/SpeechBubble";
import { Camera, HelpCircle, CheckCircle2 } from "lucide-react";

interface SceneProps {
  onSelectPhilosopher?: () => void;
}

export function SocratesScene({ onSelectPhilosopher }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sceneOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.75, 0.9], [0, 1, 1, 0]);

  const speechText =
    "I claim to know nothing, so I ask: what did you eat today, and why? A meal that is examined is a meal that can be improved. Show me your plate.";

  const socraticDialogues = [
    {
      q: "What did I eat today?",
      reply:
        "Do you truly know the fuel inside your dish, or only its name? A bowl of dal and two rotis hold secrets of fiber and amino acids you cannot guess by sight alone. Let Demeter's vision camera examine it.",
    },
    {
      q: "Why did I choose it?",
      reply:
        "Was it chosen by hunger, by haste, or by the seduction of salt and fat? When time is short, appetite yields to convenience. Knowing the reason is the first step toward mastery.",
    },
    {
      q: "Would I change it?",
      reply:
        "Change requires not self-reproach, but curiosity. If a swap gives you identical joy with double the protein, is it not the wiser choice? Let us test it.",
    },
  ];

  return (
    <section ref={containerRef} className="relative min-h-[130vh] w-full" id="scene-socrates">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-8 overflow-hidden">
        <motion.div
          style={{ opacity: sceneOpacity }}
          className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Socrates Figure */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            <div
              onMouseEnter={() => setIsSpeaking(true)}
              onMouseLeave={() => setIsSpeaking(false)}
            >
              <SocratesFigure
                speaking={isSpeaking}
                size={270}
                onClick={onSelectPhilosopher}
              />
            </div>
            <span className="text-xs font-mono text-gold uppercase tracking-widest mt-2 block font-semibold">
              The Examined Plate
            </span>
          </div>

          {/* Right Column: Speech & Interactive Socratic Dialogues */}
          <div className="lg:col-span-7 space-y-6">
            <SpeechBubble
              philosopherName="Socrates"
              caption="Inspired by the Socratic method of examination (Apology)"
              speech={speechText}
              isActive={true}
              onSpeakingChange={setIsSpeaking}
            />

            {/* Interactive Socratic Questions */}
            <div className="p-6 rounded-3xl glass-panel bg-surface/80 border border-gold/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-light flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-gold" />
                  Socratic Inquiry (Tap to examine)
                </span>
                <span className="text-[10px] text-text-muted font-mono">
                  Know Your Plate
                </span>
              </div>

              {/* 3 Question Chips */}
              <div className="flex flex-wrap gap-2">
                {socraticDialogues.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQuestion(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeQuestion === idx
                        ? "bg-gold text-bg font-bold shadow-md shadow-gold/20"
                        : "glass-panel border border-border text-text hover:border-gold/40"
                    }`}
                  >
                    {item.q}
                  </button>
                ))}
              </div>

              {/* Socratic Reply Box */}
              <AnimatePresence mode="wait">
                {activeQuestion !== null && (
                  <motion.div
                    key={activeQuestion}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 rounded-2xl bg-surface-glass border border-gold/25 space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <p className="font-serif text-xs sm:text-sm text-text leading-relaxed italic">
                        &ldquo;{socraticDialogues[activeQuestion].reply}&rdquo;
                      </p>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Link
                        href="/scan"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold gold-gradient-btn"
                      >
                        <Camera className="w-3.5 h-3.5" /> Scan a Plate
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
