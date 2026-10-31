"use client";

import React from "react";
import Link from "next/link";
import { GoalEditorForm } from "@/components/goals/GoalEditorForm";
import { ArrowLeft } from "lucide-react";
import { ApolloIcon } from "@/components/gods";

export default function NewGoalPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-gold transition-colors mb-3 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Goals</span>
        </Link>

        <span className="text-xs uppercase tracking-widest text-accent-gold font-semibold flex items-center gap-1.5">
          <ApolloIcon size={16} /> Celestial Calibration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
          Forge a Health Goal
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Choose a goal archetype, review your metabolic baseline, and establish custom macronutrient targets.
        </p>
      </div>

      <GoalEditorForm />
    </div>
  );
}
