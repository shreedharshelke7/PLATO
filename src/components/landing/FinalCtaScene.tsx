"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserPlus, LogIn, Compass, Shield } from "lucide-react";
import { ZeusIcon, GreekMeander } from "@/components/gods";

export function FinalCtaScene() {
  const handleContinueGuest = () => {
    try {
      document.cookie = "ambrosia_guest=true; path=/; max-age=31536000; SameSite=Lax";
    } catch {
      // ignore
    }
  };

  return (
    <section className="py-24 px-4 max-w-5xl mx-auto w-full relative z-20" id="scene-final-cta">
      {/* Academy Crest & Title */}
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
          <ZeusIcon size={36} />
        </div>
        <span className="text-xs uppercase font-mono tracking-widest text-gold font-bold">
          The Academy Awaits
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-black text-text tracking-tight">
          Join the Academy of Ambrosia
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
          Step beyond mortal guesswork. Calibrate your true metabolic floors, examine every plate with Gemini Vision, and conquer cravings with Divine Swaps.
        </p>
        <GreekMeander className="h-3 text-gold/30 max-w-xs mx-auto pt-2" />
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
        {/* Card 1: Create Account */}
        <div className="p-7 rounded-3xl glass-panel-gold bg-surface border border-gold/40 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-text">
              Begin Your Genesis
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Create your profile with cloud synchronization across all devices. Unlock unlimited scans and personalized nutrition insights.
            </p>
          </div>

          <Link
            href="/signup"
            className="w-full py-3.5 rounded-xl font-bold text-sm gold-gradient-btn flex items-center justify-center gap-2 active:scale-95 shadow-lg"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Sign In */}
        <div className="p-7 rounded-3xl glass-panel bg-surface/80 border border-border flex flex-col justify-between space-y-6 hover:border-gold/40 transition-colors">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-surface-glass border border-gold/20 flex items-center justify-center text-gold-light">
              <LogIn className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-text">
              Return to Sanctuary
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Already initiated? Sign in to restore your Olympian streaks, water logs, and custom nutrition targets instantly.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full py-3.5 rounded-xl font-semibold text-sm glass-panel border border-gold/40 text-gold-light hover:text-text hover:bg-gold/10 transition-all flex items-center justify-center gap-2"
          >
            Sign In with Account
          </Link>
        </div>
      </div>

      {/* Guest Mode Link */}
      <div className="text-center space-y-2">
        <Link
          href="/dashboard"
          onClick={handleContinueGuest}
          className="inline-flex items-center gap-2 text-xs font-mono text-gold hover:underline py-1.5 px-3 rounded-lg hover:bg-gold/10 transition-all cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" /> Continue as guest (local IndexedDB only)
        </Link>
        <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted">
          <Shield className="w-3 h-3 text-gold" />
          <span>Guest mode requires zero sign-in. Your data remains strictly on this device.</span>
        </div>
      </div>

      {/* Medical & Privacy Disclaimer Footer */}
      <footer className="mt-16 pt-8 border-t border-border text-xs text-text-muted text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 font-serif font-bold text-text text-sm">
          <span>PLATO</span>
          <span>•</span>
          <span>The Academy of Ambrosia</span>
        </div>
        <p className="leading-relaxed">
          Ambrosia provides educational insights, philosophical models, and AI estimations. It is not intended as medical advice or clinical diagnosis. Always consult a certified healthcare professional before making drastic dietary modifications.
        </p>
        <p className="text-[10px] text-text-muted opacity-75">
          Engineered with local-first IndexedDB architecture and Supabase RLS cloud synchronization.
        </p>
      </footer>
    </section>
  );
}
