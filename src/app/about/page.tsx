import React from "react";
import Link from "next/link";
import { LandingNav } from "@/components/navigation/LandingNav";
import { LaurelWreath, GreekMeander, DionysusIcon } from "@/components/gods";
import { ArrowLeft, ArrowRight, ShieldCheck, Cpu, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <LandingNav />

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12">
        {/* Breadcrumb / Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-gold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Mount Olympus
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-gold text-xs font-semibold text-accent-gold uppercase tracking-wider">
            <LaurelWreath size={16} /> Research Origin & Architecture
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-text-primary tracking-tight">
            The Philosophy of Ambrosia
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Born from empirical community research on student nutrition in Pune. Designed to replace
            moralizing diet culture with godlike speed and realistic taste alchemy.
          </p>
          <GreekMeander className="h-3 text-accent-gold/30 w-full" />
        </div>

        {/* The Survey Section */}
        <section className="p-8 rounded-2xl glass-panel border border-border-base space-y-6">
          <h2 className="font-serif text-2xl font-bold text-text-primary flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent-gold" />
            The College CEP Research Study
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Project PLATO originated as an actionable initiative under a college{" "}
            <strong>Community Engagement Program (CEP)</strong>. We surveyed 50 young adults and students
            aged 18–25 in <strong>Pune, Maharashtra</strong> titled{" "}
            <em>&quot;Analysing Eating Habits &amp; Food Choices&quot;</em>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-bg-surface-elevated border border-border-base">
              <span className="font-serif text-3xl font-extrabold text-accent-gold">80%</span>
              <p className="text-xs text-text-secondary mt-1">
                Eat fast food solely for <strong>taste and comfort</strong>, regardless of knowing its
                caloric content.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-bg-surface-elevated border border-border-base">
              <span className="font-serif text-3xl font-extrabold text-accent-gold">50%</span>
              <p className="text-xs text-text-secondary mt-1">
                State that <strong>lack of time and hectic schedules</strong> are the primary barrier to
                cooking nutritious meals.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-bg-surface-elevated border border-border-base">
              <span className="font-serif text-3xl font-extrabold text-accent-gold">38%</span>
              <p className="text-xs text-text-secondary mt-1">
                Are the only respondents who reliably eat breakfast every morning; the rest start their
                day starved of fuel.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-bg-surface-elevated border border-border-base">
              <span className="font-serif text-3xl font-extrabold text-accent-gold">64%</span>
              <p className="text-xs text-text-secondary mt-1">
                Expressed an emphatic, definite desire to reform their diet—if solutions were fast and
                delicious.
              </p>
            </div>
          </div>
        </section>

        {/* Taste & Time Beat Knowledge */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-text-primary flex items-center gap-2">
            <DionysusIcon size={24} />
            Why &quot;Taste &amp; Time Beat Knowledge&quot;
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Virtually every individual understands that vegetables and lean proteins are healthier than
            deep-fried samosas or sugary sodas. Yet knowledge alone yields negligible compliance when
            exhausted at 9:00 PM after lectures or overtime shifts.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Ambrosia’s flagship innovation—<strong>The Divine Swap (governed by Dionysus)</strong>—does
            not shame or scold. Instead, when you crave a pizza or street vada pav, it provides 3
            calculated swaps that retain the savory mouthfeel and texture, prepare in under 10 minutes,
            and substantially slash saturated fats while boosting protein and gut fiber.
          </p>
        </section>

        {/* Local-First Architecture & Privacy */}
        <section className="p-8 rounded-2xl glass-panel-gold space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">
                Local-First & Absolute Privacy
              </h2>
              <span className="text-xs text-accent-gold font-mono">
                Zero Cloud Database • Zero Surveillance
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>
              Your health, weight, and food logs are intimate personal data. Ambrosia runs on an{" "}
              <strong>IndexedDB local-first database (Dexie)</strong> hosted directly on your browser
              storage.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-muted">
              <li>No account creation or password required.</li>
              <li>Your meals, weights, water logs, and custom keys never touch an Ambrosia server.</li>
              <li>
                When using Demeter’s Vision Scanner, image bytes are compressed client-side and transmitted
                ephemerally to Google Gemini API purely for optical recognition, and are never saved.
              </li>
              <li>Full JSON and CSV export/import allows complete ownership of your data at all times.</li>
            </ul>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <section className="p-6 rounded-xl bg-bg-surface-elevated border border-border-base text-xs text-text-muted leading-relaxed space-y-2">
          <div className="font-bold text-text-secondary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-accent-gold" /> Medical & Nutritional Disclaimer
          </div>
          <p>
            Ambrosia and Project PLATO provide algorithmic estimates and general health information
            derived from peer-reviewed Mifflin-St Jeor formulations, USDA nutritional tables, and the
            Indian Food Composition Tables (IFCT).
          </p>
          <p>
            This application is not intended to provide clinical medical diagnoses, treatment plans, or
            substitute for professional medical advice. Always consult a qualified physician or
            registered clinical dietitian regarding underlying health conditions, eating disorders, or
            metabolic therapies.
          </p>
        </section>

        {/* Next Step CTA */}
        <div className="pt-4 text-center">
          <Link
            href="/goals/new"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 transition-all shadow-md active:scale-95 text-sm"
          >
            Calculate Your Olympian Goals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
