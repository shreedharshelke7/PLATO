import React from "react";
import Link from "next/link";
import {
  ZeusIcon,
  DemeterIcon,
  PoseidonIcon,
  HermesIcon,
  AthenaIcon,
  ApolloIcon,
  DionysusIcon,
  MarbleColumn,
  GreekMeander,
  LaurelWreath,
} from "@/components/gods";
import { LandingNav } from "@/components/navigation/LandingNav";
import { HeroCanvas } from "@/components/landing/HeroCanvas";
import { GodsMarquee } from "@/components/landing/GodsMarquee";
import { ResearchStats } from "@/components/landing/ResearchStats";
import { InteractiveSwapCard } from "@/components/landing/InteractiveSwapCard";
import { ArrowRight, Camera, Sparkles, Shield, Activity } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      god: "Zeus",
      title: "Daily Power Ring",
      desc: "Instant calorie & macro mastery without tedious spreadsheets. Balance energy balance with thunderous precision.",
      icon: ZeusIcon,
      color: "text-amber-400",
    },
    {
      god: "Demeter",
      title: "Vision Food Scanner",
      desc: "Multimodal AI recognizes Indian & global plates—thalis, rotis, katoris of dal, biryani, or packaged barcodes.",
      icon: DemeterIcon,
      color: "text-yellow-500",
    },
    {
      god: "Dionysus",
      title: "Divine Swap & Junk Budget",
      desc: "Craving pizza, samosas, or Maggi? Get 3 realistic <10-minute swaps preserving taste while elevating protein and fiber.",
      icon: DionysusIcon,
      color: "text-purple-400",
    },
    {
      god: "Poseidon",
      title: "Tidal Hydration Waves",
      desc: "Fluid schedules intelligently mapped to your waking hours. Animated amphora wave levels and friendly chimes.",
      icon: PoseidonIcon,
      color: "text-cyan-400",
    },
    {
      god: "Athena",
      title: "AI Nutrition Coach",
      desc: "Generates science-backed 1-day meal plans and solves the 50% 'lack of time' barrier with 5-minute kitchen hacks.",
      icon: AthenaIcon,
      color: "text-lime-400",
    },
    {
      god: "Apollo",
      title: "Olympian Streaks & Trends",
      desc: "Track weight progressions, protein compliance, fiber density, and breakfast habit streaks without punitive shaming.",
      icon: ApolloIcon,
      color: "text-orange-400",
    },
    {
      god: "Hermes",
      title: "Swift Quick-Logging",
      desc: "Log yesterday's lunch or one-tap favorite meals in 2 seconds flat when college or work schedule gets frantic.",
      icon: HermesIcon,
      color: "text-sky-400",
    },
  ];

  const steps = [
    {
      num: "I",
      title: "Forge Your Olympian Target",
      desc: "Mifflin-St Jeor engine computes personalized BMR, TDEE, protein floors, and fiber targets tailored to your lifestyle.",
    },
    {
      num: "II",
      title: "Scan or Swap in Seconds",
      desc: "Snap a photo with Demeter's vision camera, scan a barcode, or invoke Dionysus for an instant healthy swap.",
    },
    {
      num: "III",
      title: "Rise in Favor & Vitality",
      desc: "Earn Favor XP, unlock achievements from Mortal to Immortal Olympian, and track lifelong sustainable vitality.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col relative overflow-x-hidden">
      <LandingNav />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 overflow-hidden py-12 md:py-24">
        {/* Animated Lightning/Stars Background */}
        <HeroCanvas />

        {/* Parallax Classical Marble Columns */}
        <div className="absolute left-0 top-0 bottom-0 hidden lg:block opacity-30 select-none">
          <MarbleColumn side="left" className="w-20 h-full text-accent-gold" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 hidden lg:block opacity-30 select-none">
          <MarbleColumn side="right" className="w-20 h-full text-accent-gold" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel-gold text-xs font-semibold uppercase tracking-wider text-accent-gold">
            <LaurelWreath size={18} />
            <span>Project PLATO • Ambrosia Nutrition</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black text-text-primary tracking-tight leading-[1.08]">
            Fuel Like <span className="text-accent-gold gold-glow">A God</span>.
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            AI meal vision, Indian portion precision, intelligent hydration, and the revolutionary{" "}
            <span className="text-text-primary font-semibold">Divine Swap</span>. Built for taste,
            engineered for speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base bg-accent-gold hover:bg-accent-gold-hover text-stone-950 transition-all shadow-lg shadow-accent-gold/20 flex items-center justify-center gap-2 active:scale-95"
            >
              Begin Your Ascent <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/scan"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-base glass-panel border border-border-base hover:border-accent-gold text-text-primary transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 text-accent-gold" /> Scan a Meal
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent-gold" /> 100% Local-First Storage
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-gold" /> Gemini Vision AI
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-accent-gold" /> No Login Required
            </span>
          </div>
        </div>
      </section>

      {/* 2. MARQUEE STRIP */}
      <GodsMarquee />

      {/* 3. THE RESEARCH / SURVEY STATS */}
      <ResearchStats />

      {/* 4. USP: DIVINE SWAP SHOWCASE */}
      <section className="py-20 px-4 bg-bg-surface/30 border-y border-border-base relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-gold">
              The Primary Innovation
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
              The Divine Swap
            </h2>
            <p className="text-sm md:text-base text-text-secondary mt-3">
              Knowledge doesn&apos;t stop fast-food cravings—taste and convenience do. Dionysus instantly
              suggests 3 identical flavor profiles ready in under 10 minutes.
            </p>
          </div>

          <InteractiveSwapCard />
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 STEPS) */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-gold">
            Simplicity & Mastery
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
            Ascend in Three Trials
          </h2>
          <GreekMeander className="mt-4 text-accent-gold/30 h-3 max-w-xs mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl glass-panel relative border border-border-base hover:border-accent-gold/40 transition-all group"
            >
              <div className="font-serif text-5xl font-black text-accent-gold/20 group-hover:text-accent-gold/40 transition-colors mb-4">
                {step.num}
              </div>
              <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FEATURE GRID (7 GODS) */}
      <section className="py-20 px-4 bg-bg-surface/20 border-t border-border-base">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-gold">
              Olympian Architecture
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
              Seven Gods. Complete Mastery.
            </h2>
            <p className="text-sm md:text-base text-text-secondary mt-3">
              Every deity governs a pillar of your metabolic, hydration, and nutritional ascent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl glass-panel relative group hover:border-accent-gold/60 transition-all hover:-translate-y-1 duration-300"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/15 flex items-center justify-center text-accent-gold group-hover:scale-110 transition-transform">
                      <Icon size={26} />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-accent-gold uppercase font-bold tracking-wider">
                        {feat.god}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-text-primary">
                        {feat.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL ASCENT CTA */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto relative">
        <div className="p-10 md:p-16 rounded-3xl glass-panel-gold relative overflow-hidden space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
            <ZeusIcon size={36} />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-black text-text-primary tracking-tight">
            Mount Olympus Awaits.
          </h2>

          <p className="text-base text-text-secondary max-w-xl mx-auto">
            Take the 2-minute setup, compute your certified metabolic floors, and master your nutrition
            with zero guilt.
          </p>

          <div className="pt-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-accent-gold hover:bg-accent-gold-hover text-stone-950 transition-all shadow-xl active:scale-95"
            >
              Begin Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-border-base bg-bg-surface/60 py-10 px-4 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-black text-sm tracking-wider text-text-primary">
              PLATO
            </span>
            <span>•</span>
            <span>Ambrosia Nutrition System</span>
          </div>

          <div className="text-center md:text-right max-w-lg leading-relaxed">
            <p>
              Ambrosia provides general information and AI estimates, not medical advice. Consult a
              qualified healthcare professional before undertaking significant dietary changes.
            </p>
            <p className="mt-1">
              Data stored locally in your browser via IndexedDB. Photo scans are analyzed via Google
              Gemini Vision and never permanently retained.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
