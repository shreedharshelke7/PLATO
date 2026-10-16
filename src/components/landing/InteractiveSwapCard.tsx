"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DionysusIcon } from "../gods";
import { ArrowRight, Sparkles, Clock, ThumbsUp } from "lucide-react";

export function InteractiveSwapCard() {
  const [swapped, setSwapped] = useState(false);

  return (
    <div className="relative max-w-xl mx-auto w-full p-6 rounded-2xl glass-panel-gold overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent-gold/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-base">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-accent-gold/15 flex items-center justify-center text-accent-gold">
            <DionysusIcon size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-accent-gold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Divine Swap Preview
            </div>
            <h3 className="font-serif text-lg font-bold text-text-primary">
              Taste Preserved, Fuel Elevated
            </h3>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent-gold/10 text-accent-gold border border-accent-gold/30">
          Live Interactive
        </div>
      </div>

      {/* Content Side-by-Side or Transition */}
      <div className="py-6">
        <AnimatePresence mode="wait">
          {!swapped ? (
            <motion.div
              key="original"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
                    Craved Fast Food
                  </span>
                  <h4 className="text-xl font-bold text-text-primary mt-0.5">
                    2 Slices Pizza Margherita + Cold Drink
                  </h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Classic craving: quick, high GI carbs, saturated fat, low satiety.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-md bg-red-500/10 text-red-400 font-semibold border border-red-500/20">
                  Original
                </span>
              </div>

              {/* Nutrition Grid */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2">
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-border-base">
                  <span className="text-xs text-text-muted block">Calories</span>
                  <span className="font-bold text-base text-text-primary">640</span>
                  <span className="text-[10px] text-text-muted block">kcal</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-border-base">
                  <span className="text-xs text-text-muted block">Protein</span>
                  <span className="font-bold text-base text-text-primary">21g</span>
                  <span className="text-[10px] text-text-muted block">lean mass</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-border-base">
                  <span className="text-xs text-text-muted block">Carbs</span>
                  <span className="font-bold text-base text-text-primary">97g</span>
                  <span className="text-[10px] text-text-muted block">35g sugar</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-border-base">
                  <span className="text-xs text-text-muted block">Fiber</span>
                  <span className="font-bold text-base text-text-primary">3.6g</span>
                  <span className="text-[10px] text-text-muted block">low satiety</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="swap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-accent-gold font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Dionysus Alchemy Recommendation
                  </span>
                  <h4 className="text-xl font-bold text-text-primary mt-0.5">
                    Crispy Paneer Multigrain Wrap + Spiced Mint Chaas
                  </h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Same savory spices, gooey cheese crunch, with whole grains and refreshing probiotics.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Divine Swap
                </span>
              </div>

              {/* Nutrition Grid with Deltas */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2">
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-emerald-500/30">
                  <span className="text-xs text-text-muted block">Calories</span>
                  <span className="font-bold text-base text-emerald-400">425</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">-215 kcal</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-emerald-500/30">
                  <span className="text-xs text-text-muted block">Protein</span>
                  <span className="font-bold text-base text-emerald-400">27g</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">+6g protein</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-emerald-500/30">
                  <span className="text-xs text-text-muted block">Carbs</span>
                  <span className="font-bold text-base text-emerald-400">48g</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">-49g carbs</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-surface-elevated border border-emerald-500/30">
                  <span className="text-xs text-text-muted block">Fiber</span>
                  <span className="font-bold text-base text-emerald-400">7.8g</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">+4.2g fiber</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center justify-between text-xs text-text-secondary pt-1 px-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent-gold" /> Prep: <strong>8 minutes</strong>
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-accent-gold" /> Taste Match: <strong>9.3 / 10</strong>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        <button
          onClick={() => setSwapped(!swapped)}
          className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-accent-gold hover:bg-accent-gold-hover text-stone-950 font-semibold shadow-md active:scale-[0.99]"
        >
          {swapped ? (
            <>
              View Original Fast Food <ArrowRight className="w-4 h-4 rotate-180" />
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Tap to Perform Divine Swap <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
