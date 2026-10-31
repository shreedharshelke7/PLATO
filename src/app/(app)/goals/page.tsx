"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGoals } from "@/lib/db/hooks";
import { type DBGoal } from "@/lib/db/db";
import {
  getGoalTypeLabel,
  renderGoalTypeIcon,
} from "@/components/goals/ActiveGoalChip";
import {
  Target,
  Plus,
  CheckCircle2,
  Trash2,
  Archive,
  Edit2,
  RotateCcw,
  Scale,
  Calendar,
} from "lucide-react";
import { ApolloIcon } from "@/components/gods";

export default function GoalsPage() {
  const { goals, activeGoal, setActiveGoal, archiveGoal, deleteGoal } = useGoals();

  const [undoAction, setUndoAction] = useState<{
    goalName: string;
    undo: () => Promise<void>;
  } | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleDelete = async (goal: DBGoal) => {
    const undoFn = await deleteGoal(goal.id);
    if (undoTimeout) clearTimeout(undoTimeout);

    setUndoAction({
      goalName: goal.name,
      undo: undoFn,
    });

    const timeout = setTimeout(() => {
      setUndoAction(null);
    }, 6000);
    setUndoTimeout(timeout);
  };

  const handleExecuteUndo = async () => {
    if (!undoAction) return;
    await undoAction.undo();
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoAction(null);
  };

  const nonArchivedGoals = goals.filter((g) => !g.archived);
  const archivedGoals = goals.filter((g) => g.archived);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-gold font-semibold flex items-center gap-1.5">
            <ApolloIcon size={16} /> Mount Olympus Ascent
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
            My Health Goals
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Forge multiple dietary ambitions and switch active targets whenever your journey shifts.
          </p>
        </div>

        <Link
          href="/goals/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs gold-gradient-btn shrink-0 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </Link>
      </div>

      {/* Undo Toast Notification */}
      <AnimatePresence>
        {undoAction && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-panel-gold border border-accent-gold/40 bg-bg-elevated shadow-2xl text-xs"
          >
            <span>Goal <strong>&quot;{undoAction.goalName}&quot;</strong> deleted.</span>
            <button
              onClick={handleExecuteUndo}
              className="px-2.5 py-1 rounded-lg bg-accent-gold text-stone-950 font-bold hover:bg-accent-gold-hover transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goal Highlight Banner */}
      {activeGoal ? (
        <div className="p-6 rounded-3xl glass-panel-gold border border-accent-gold/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-gold/25 border border-accent-gold/50 text-accent-gold text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Currently Driving Dashboard
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  {getGoalTypeLabel(activeGoal.type)}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-black text-text-primary">
                {activeGoal.name}
              </h2>
              {activeGoal.notes && (
                <p className="text-xs text-text-muted italic max-w-xl">
                  &ldquo;{activeGoal.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-glass p-3 rounded-2xl border border-border-base text-center">
              <div>
                <div className="text-[10px] text-text-muted uppercase">Calories</div>
                <div className="font-bold text-sm text-accent-gold">{activeGoal.targets.calories}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase">Protein</div>
                <div className="font-bold text-sm text-text-primary">{activeGoal.targets.protein_g}g</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase">Fiber</div>
                <div className="font-bold text-sm text-text-primary">{activeGoal.targets.fiber_g}g</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase">Water</div>
                <div className="font-bold text-sm text-cyan-400">{activeGoal.targets.water_ml}ml</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl glass-panel border border-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-glass border border-border-base text-text-muted text-[11px] font-semibold">
              Operating on General Defaults
            </span>
            <h2 className="font-serif text-lg font-bold text-text-primary">
              Standard Adult Targets Active (2000 kcal)
            </h2>
            <p className="text-xs text-text-muted">
              Create a personalized health goal to calculate specific calorie floors, macro ratios, and water targets.
            </p>
          </div>
          <Link
            href="/goals/new"
            className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Goal</span>
          </Link>
        </div>
      )}

      {/* Goal Cards Grid */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-base text-text-primary">
          All Goals ({nonArchivedGoals.length})
        </h3>

        {nonArchivedGoals.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel text-center space-y-4 border border-border-base">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent-gold/15 flex items-center justify-center text-accent-gold">
              <Target className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-serif text-lg font-bold text-text-primary">
                No Goals Created Yet
              </h4>
              <p className="text-xs text-text-muted">
                Forge your first goal: choose whether to lose fat, build muscle, maintain equilibrium, or stay hydrated.
              </p>
            </div>
            <Link
              href="/goals/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs gold-gradient-btn shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Goal</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nonArchivedGoals.map((goal) => {
              const isActive = goal.id === activeGoal?.id;

              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-3xl glass-panel border transition-all flex flex-col justify-between space-y-4 ${
                    isActive
                      ? "border-accent-gold/60 shadow-lg shadow-accent-gold/5 bg-accent-gold/5"
                      : "border-border-base hover:border-accent-gold/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isActive
                              ? "bg-accent-gold/20 text-accent-gold"
                              : "bg-surface-glass text-text-muted"
                          }`}
                        >
                          {renderGoalTypeIcon(goal.type, "w-5 h-5")}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-base text-text-primary truncate max-w-[220px]">
                            {goal.name}
                          </h4>
                          <span className="text-[11px] text-text-muted font-medium">
                            {getGoalTypeLabel(goal.type)}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-accent-gold/25 text-accent-gold text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-accent-gold/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveGoal(goal.id)}
                          className="px-3 py-1 rounded-full border border-border-base hover:border-accent-gold/50 text-[11px] font-semibold text-text-secondary hover:text-accent-gold transition-colors cursor-pointer"
                        >
                          Set Active
                        </button>
                      )}
                    </div>

                    {/* Targets Summary Grid */}
                    <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-bg-surface border border-border-base text-center">
                      <div>
                        <div className="text-[9px] text-text-muted uppercase">Calories</div>
                        <div className="font-bold text-xs text-accent-gold">{goal.targets.calories}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-text-muted uppercase">Protein</div>
                        <div className="font-bold text-xs text-text-primary">{goal.targets.protein_g}g</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-text-muted uppercase">Carbs</div>
                        <div className="font-bold text-xs text-text-primary">{goal.targets.carbs_g}g</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-text-muted uppercase">Fat</div>
                        <div className="font-bold text-xs text-text-primary">{goal.targets.fat_g}g</div>
                      </div>
                    </div>

                    {/* Weight & Timeline Progress if present */}
                    {(goal.startWeightKg || goal.targetWeightKg || goal.targetDate) && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted pt-1">
                        {goal.targetWeightKg && (
                          <span className="flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-accent-gold" />
                            Target: <strong className="text-text-primary">{goal.targetWeightKg} kg</strong>
                          </span>
                        )}
                        {goal.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            By {goal.targetDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-border-base flex items-center justify-between text-xs">
                    <Link
                      href={`/goals/${goal.id}/edit`}
                      className="text-text-secondary hover:text-accent-gold flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => archiveGoal(goal.id)}
                        className="text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                        title="Archive goal"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>

                      <button
                        onClick={() => handleDelete(goal)}
                        className="text-terracotta/70 hover:text-terracotta flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Goals section */}
      {archivedGoals.length > 0 && (
        <div className="pt-6 border-t border-border-base space-y-3">
          <h4 className="font-serif font-bold text-sm text-text-muted uppercase tracking-wider">
            Archived Goals ({archivedGoals.length})
          </h4>
          <div className="space-y-2">
            {archivedGoals.map((ag) => (
              <div
                key={ag.id}
                className="p-3.5 rounded-2xl glass-panel border border-border-base opacity-70 hover:opacity-100 transition-opacity flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-text-primary">{ag.name}</span>
                  <span className="text-text-muted ml-2">
                    ({ag.targets.calories} kcal • {getGoalTypeLabel(ag.type)})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveGoal(ag.id)}
                    className="text-accent-gold hover:underline font-semibold cursor-pointer"
                  >
                    Restore & Activate
                  </button>
                  <button
                    onClick={() => handleDelete(ag)}
                    className="text-terracotta hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
