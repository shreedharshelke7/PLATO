"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { LaurelWreath } from "@/components/gods/LaurelWreath";
import { GreekMeander } from "@/components/gods/GreekMeander";
import { ArrowRight, LogIn, Sparkles, Shield, Activity } from "lucide-react";

export function HeroGateScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Camera zooms into and through the classical gate as user scrolls
  const gateScale = useTransform(scrollYProgress, [0, 0.8], [1, 3.2]);
  const gateOpacity = useTransform(scrollYProgress, [0.65, 0.95], [1, 0]);
  const doorLeftX = useTransform(scrollYProgress, [0.1, 0.7], ["0%", "-65%"]);
  const doorRightX = useTransform(scrollYProgress, [0.1, 0.7], ["0%", "65%"]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.45], [0, -60]);

  return (
    <section ref={containerRef} className="relative h-[160vh] w-full" id="gate-scene">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-bg">
        {/* Deep Parallax Star & Nebulae Layers */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 30%, rgba(91, 42, 134, 0.25) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(31, 111, 120, 0.2) 0%, transparent 50%)",
          }}
        />

        {/* The Classical Arched Gate & Marble Columns */}
        <motion.div
          style={{ scale: gateScale, opacity: gateOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full max-w-6xl max-h-[85vh] object-contain"
          >
            <defs>
              <linearGradient id="gate-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F7E7A8" />
                <stop offset="45%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C37" />
              </linearGradient>
              <linearGradient id="gate-marble" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EDE5D4" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#EDE5D4" />
              </linearGradient>
            </defs>

            {/* Left Monumental Column */}
            <g transform="translate(140, 120)">
              {/* Capital */}
              <rect x="0" y="0" width="100" height="24" rx="4" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2" />
              <path d="M10 24 C10 38 25 38 25 24 M90 24 C90 38 75 38 75 24" stroke="url(#gate-gold)" strokeWidth="2" fill="none" />
              {/* Shaft with Fluting Lines */}
              <rect x="15" y="32" width="70" height="540" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2" />
              <line x1="28" y1="34" x2="28" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="40" y1="34" x2="40" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="50" y1="34" x2="50" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="60" y1="34" x2="60" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="72" y1="34" x2="72" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              {/* Base */}
              <rect x="0" y="572" width="100" height="30" rx="4" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2" />
            </g>

            {/* Right Monumental Column */}
            <g transform="translate(760, 120)">
              {/* Capital */}
              <rect x="0" y="0" width="100" height="24" rx="4" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2" />
              <path d="M10 24 C10 38 25 38 25 24 M90 24 C90 38 75 38 75 24" stroke="url(#gate-gold)" strokeWidth="2" fill="none" />
              {/* Shaft */}
              <rect x="15" y="32" width="70" height="540" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2" />
              <line x1="28" y1="34" x2="28" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="40" y1="34" x2="40" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="50" y1="34" x2="50" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="60" y1="34" x2="60" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              <line x1="72" y1="34" x2="72" y2="570" stroke="url(#gate-gold)" strokeWidth="1.2" opacity="0.6" />
              {/* Base */}
              <rect x="0" y="572" width="100" height="30" rx="4" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2" />
            </g>

            {/* Arched Pediment / Entablature Overhead */}
            <g transform="translate(100, 30)">
              {/* Architrave */}
              <rect x="0" y="60" width="800" height="30" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2" />
              {/* Triangular Pediment */}
              <polygon points="400,0 0,60 800,60" fill="url(#gate-marble)" stroke="url(#gate-gold)" strokeWidth="2.5" />
              {/* Central Pediment Medallion */}
              <circle cx="400" cy="38" r="18" fill="#12121A" stroke="url(#gate-gold)" strokeWidth="1.5" />
              <path d="M394 44 L404 30 M396 30 L406 44" stroke="url(#gate-gold)" strokeWidth="1.5" />
            </g>
          </svg>
        </motion.div>

        {/* Parting Gate Doors */}
        <div className="absolute inset-x-0 bottom-0 top-[20%] max-w-xl mx-auto flex pointer-events-none z-10 opacity-70">
          <motion.div
            style={{ x: doorLeftX }}
            className="w-1/2 h-full border-r border-gold/40 bg-gradient-to-r from-bg-elevated/80 to-surface/80 backdrop-blur-sm"
          />
          <motion.div
            style={{ x: doorRightX }}
            className="w-1/2 h-full border-l border-gold/40 bg-gradient-to-l from-bg-elevated/80 to-surface/80 backdrop-blur-sm"
          />
        </div>

        {/* Hero Forefront Text & CTAs */}
        <motion.div
          style={{ opacity: heroContentOpacity, y: heroContentY }}
          className="relative z-20 max-w-4xl mx-auto text-center px-4 space-y-6 pt-12 pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-gold border border-gold/40 text-xs font-semibold uppercase tracking-wider text-gold-light shadow-lg">
            <LaurelWreath size={18} />
            <span>The Academy of Ambrosia • Project PLATO</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black text-text tracking-tight leading-[1.05]">
            Fuel Like <span className="gold-gradient-text gold-glow">A God</span>.
          </h1>

          <p className="text-base sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Where classical philosophy meets modern metabolic precision. Examine your plate, calculate your true ratios, and discover the <span className="text-gold-light font-semibold">Divine Swap</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base gold-gradient-btn flex items-center justify-center gap-2.5 active:scale-95 shadow-xl"
            >
              Begin Your Ascent <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-base glass-panel border border-gold/30 hover:border-gold text-gold-light hover:text-text transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5 text-gold" /> Sign In
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gold" /> 100% Local-First Storage
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold" /> Gemini Vision AI
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-gold" /> No Shaming, Just Ratios
            </span>
          </div>

          <div className="pt-6">
            <GreekMeander className="h-3 text-gold/25 max-w-xs mx-auto" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
