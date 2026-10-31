"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGoals } from "@/lib/db/hooks";
import { GoalEditorForm } from "@/components/goals/GoalEditorForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ApolloIcon } from "@/components/gods";

export default function EditGoalPage() {
  const params = useParams();
  const goalId = params.id as string;
  const { goals, isLoading } = useGoals();

  const goal = goals.find((g) => g.id === goalId);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
        <p className="text-xs text-text-muted font-serif">Loading goal...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-8 rounded-3xl glass-panel text-center space-y-4 max-w-md mx-auto my-12 border border-border-base">
        <h2 className="font-serif text-lg font-bold text-text-primary">Goal Not Found</h2>
        <p className="text-xs text-text-muted">
          This health goal does not exist or may have been deleted.
        </p>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Goals</span>
        </Link>
      </div>
    );
  }

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
          <ApolloIcon size={16} /> Precision Adjustment
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
          Edit Goal: {goal.name}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Update targets, fine-tune macronutrients, or adjust timelines.
        </p>
      </div>

      <GoalEditorForm existingGoal={goal} isEditMode={true} />
    </div>
  );
}
