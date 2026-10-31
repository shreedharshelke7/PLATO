"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useGoals } from "@/lib/db/hooks";
import { type GoalType } from "@/lib/db/db";
import {
  Target,
  ChevronDown,
  Check,
  Plus,
  Sparkles,
  Flame,
  Droplets,
  Dumbbell,
  Scale,
} from "lucide-react";

export function getGoalTypeLabel(type: GoalType): string {
  switch (type) {
    case "lose_fat":
      return "Fat Loss";
    case "maintain":
      return "Maintenance";
    case "build_muscle":
      return "Muscle Gain";
    case "eat_healthier":
      return "Nourishment";
    case "hydration":
      return "Hydration";
    case "custom":
      return "Custom Target";
  }
}

export function renderGoalTypeIcon(type?: GoalType, className = "w-3.5 h-3.5") {
  switch (type) {
    case "lose_fat":
      return <Flame className={className} />;
    case "maintain":
      return <Scale className={className} />;
    case "build_muscle":
      return <Dumbbell className={className} />;
    case "eat_healthier":
      return <Sparkles className={className} />;
    case "hydration":
      return <Droplets className={className} />;
    default:
      return <Target className={className} />;
  }
}

export function ActiveGoalChip() {
  const { goals, activeGoal, setActiveGoal, hasActiveGoal } = useGoals();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const otherGoals = goals.filter((g) => !g.archived && g.id !== activeGoal?.id);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
          hasActiveGoal
            ? "bg-accent-gold/15 border-accent-gold/40 text-accent-gold hover:bg-accent-gold/25"
            : "bg-surface-glass border-border-base text-text-muted hover:border-accent-gold/40"
        }`}
      >
        {renderGoalTypeIcon(activeGoal?.type, "w-3.5 h-3.5 shrink-0")}
        <span className="font-serif max-w-[140px] sm:max-w-[200px] truncate">
          {activeGoal ? activeGoal.name : "Default Targets"}
        </span>
        {activeGoal && (
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-accent-gold/20 font-sans uppercase tracking-wider">
            {getGoalTypeLabel(activeGoal.type)}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl glass-panel-gold border border-accent-gold/30 bg-bg-elevated p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border-base flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Active Health Goal
            </span>
            <Link
              href="/goals"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-accent-gold hover:underline flex items-center gap-1 font-semibold"
            >
              Manage
            </Link>
          </div>

          <div className="py-1 max-h-56 overflow-y-auto space-y-1">
            {activeGoal && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-accent-gold/15 border border-accent-gold/30 text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-text-primary truncate">{activeGoal.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {activeGoal.targets.calories} kcal • {activeGoal.targets.protein_g}g P
                  </p>
                </div>
                <div className="flex items-center gap-1 text-accent-gold font-bold text-[11px] shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
              </div>
            )}

            {otherGoals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setActiveGoal(g.id);
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-glass transition-colors text-xs text-text-secondary hover:text-text-primary group"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  {renderGoalTypeIcon(g.type, "w-3.5 h-3.5 text-text-muted group-hover:text-accent-gold shrink-0")}
                  <div className="min-w-0">
                      <p className="font-medium truncate">{g.name}</p>
                      <p className="text-[10px] text-text-muted">
                        {g.targets.calories} kcal • {getGoalTypeLabel(g.type)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0">
                    Switch
                  </span>
                </button>
            ))}

            {otherGoals.length === 0 && !hasActiveGoal && (
              <div className="p-3 text-center text-xs text-text-muted">
                No custom goals created yet.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border-base mt-1 flex flex-col gap-1">
            <Link
              href="/goals/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-accent-gold hover:bg-accent-gold/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Goal</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
