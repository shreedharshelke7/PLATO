"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, addDays, subDays } from "date-fns";
import { useMeals, useProfile, useFavorites } from "@/lib/db/hooks";
import { DemeterIcon } from "@/components/gods";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  Trash2,
  Bookmark,
  Camera,
} from "lucide-react";

export default function MealLogPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const yesterdayDateStr = format(subDays(currentDate, 1), "yyyy-MM-dd");

  const { profile } = useProfile();
  const { meals, mealItems, totals, deleteMeal, copyYesterdayMeals, addMeal } =
    useMeals(dateStr);
  const { favorites, addFavorite, deleteFavorite } = useFavorites();

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const targets = profile?.targets ?? {
    calories: 2100,
    proteinG: 140,
    carbsG: 240,
    fatG: 63,
    fiberG: 29,
  };

  const handlePrevDay = () => setCurrentDate((d) => subDays(d, 1));
  const handleNextDay = () => setCurrentDate((d) => addDays(d, 1));

  const handleCopyYesterday = async () => {
    const copiedCount = await copyYesterdayMeals(dateStr, yesterdayDateStr);
    if (copiedCount === 0) {
      setCopyFeedback("No meals found in yesterday's log to copy.");
    } else {
      setCopyFeedback(`Successfully duplicated ${copiedCount} meals from yesterday!`);
    }
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleSaveToFavorites = async (mealId: string, mealName: string) => {
    const items = mealItems.filter((i) => i.mealId === mealId);
    if (items.length === 0) return;
    await addFavorite(
      mealName,
      items.map((item) => ({
        name: item.name,
        portionAmount: item.portionAmount,
        portionUnit: item.portionUnit,
        grams: item.grams,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        fiber_g: item.fiber_g,
        confidence: item.confidence,
        source: item.source,
      }))
    );
    alert(`Saved "${mealName}" to your Olympian Favorites!`);
  };

  const handleLogFavorite = async (fav: (typeof favorites)[0]) => {
    await addMeal({
      mealType: "lunch",
      name: fav.name,
      items: fav.items,
    });
    alert(`Logged "${fav.name}" to today!`);
  };

  const mealSections = [
    { type: "breakfast", label: "Breakfast", icon: "🌅" },
    { type: "lunch", label: "Lunch", icon: "☀️" },
    { type: "snack", label: "Snack & Beverages", icon: "🍎" },
    { type: "dinner", label: "Dinner", icon: "🌙" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-gold font-semibold flex items-center gap-1.5">
            <DemeterIcon size={16} /> Demeter Food Diary
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
            Daily Chronicle of Sustenance
          </h1>
        </div>

        {/* Date Selector with Next/Prev Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            aria-label="Previous Day"
            className="p-2 rounded-xl border border-border-base glass-panel text-text-secondary hover:text-text-primary hover:border-accent-gold"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="relative flex items-center">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setCurrentDate(new Date(e.target.value))}
              className="px-3.5 py-2 rounded-xl border border-border-base glass-panel text-xs font-semibold text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={handleNextDay}
            aria-label="Next Day"
            className="p-2 rounded-xl border border-border-base glass-panel text-text-secondary hover:text-text-primary hover:border-accent-gold"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Nutrition Summary Bar */}
      <div className="p-5 rounded-2xl glass-panel-gold">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-base">
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary">
              Day Totals vs Olympian Targets
            </h3>
            <span className="text-xs text-text-muted">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyYesterday}
              className="px-3 py-1.5 rounded-xl border border-accent-gold/40 text-xs font-semibold text-accent-gold hover:bg-accent-gold/15 transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Yesterday
            </button>
            <Link
              href="/scan"
              className="px-3.5 py-1.5 rounded-xl bg-accent-gold text-stone-950 text-xs font-bold hover:bg-accent-gold-hover transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" /> Scan Feast
            </Link>
          </div>
        </div>

        {copyFeedback && (
          <div className="p-2.5 my-2 rounded-xl bg-accent-gold/15 text-accent-gold text-xs font-medium">
            {copyFeedback}
          </div>
        )}

        {/* Macros Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 text-center">
          <div className="p-2.5 rounded-xl bg-bg-surface-elevated">
            <span className="text-[10px] uppercase text-text-muted block">Energy</span>
            <span className="font-bold text-sm text-text-primary">
              {totals.calories} / {targets.calories} kcal
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-surface-elevated">
            <span className="text-[10px] uppercase text-text-muted block">Protein</span>
            <span className="font-bold text-sm text-accent-gold">
              {totals.protein} / {targets.proteinG}g
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-surface-elevated">
            <span className="text-[10px] uppercase text-text-muted block">Carbs</span>
            <span className="font-bold text-sm text-sky-400">
              {totals.carbs} / {targets.carbsG}g
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-surface-elevated">
            <span className="text-[10px] uppercase text-text-muted block">Fats</span>
            <span className="font-bold text-sm text-purple-400">
              {totals.fat} / {targets.fatG}g
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-bg-surface-elevated col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase text-text-muted block">Fiber</span>
            <span className="font-bold text-sm text-emerald-400">
              {totals.fiber} / {targets.fiberG}g
            </span>
          </div>
        </div>
      </div>

      {/* Meal Breakdown Sections */}
      <div className="space-y-6">
        {mealSections.map((sec) => {
          const sectionMeals = meals.filter((m) => m.mealType === sec.type);
          const secCalories = sectionMeals.reduce((s, m) => s + m.totalCalories, 0);
          const secProtein = sectionMeals.reduce((s, m) => s + m.totalProtein, 0);

          return (
            <div key={sec.type} className="p-6 rounded-2xl glass-panel border border-border-base space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-base">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">{sec.icon}</span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-text-primary">
                      {sec.label}
                    </h3>
                    <span className="text-xs text-text-muted font-mono">
                      {secCalories > 0 ? `${secCalories} kcal • ${secProtein.toFixed(1)}g protein` : "No entries"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/scan?mealType=${sec.type}`}
                  className="px-3 py-1.5 rounded-xl border border-border-base hover:border-accent-gold text-xs font-semibold text-accent-gold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Food
                </Link>
              </div>

              {sectionMeals.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-muted">
                  No food logged for {sec.label.toLowerCase()} on this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {sectionMeals.map((meal) => {
                    const items = mealItems.filter((i) => i.mealId === meal.id);
                    return (
                      <div
                        key={meal.id}
                        className="p-4 rounded-xl bg-bg-surface-elevated border border-border-base space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-serif font-bold text-sm text-text-primary flex items-center gap-2">
                              {meal.name}
                              {meal.isJunkOrTreat && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/20">
                                  Treat Meal
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-text-muted font-mono mt-0.5">
                              {meal.totalCalories} kcal • {meal.totalProtein}g P • {meal.totalCarbs}g C • {meal.totalFat}g F • {meal.totalFiber}g Fiber
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSaveToFavorites(meal.id, meal.name)}
                              title="Save to Favorites"
                              className="p-1.5 text-text-muted hover:text-accent-gold transition-colors"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMeal(meal.id)}
                              title="Delete Meal"
                              className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Individual Meal Items */}
                        {items.length > 0 && (
                          <div className="pt-2 border-t border-border-base/60 space-y-1">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-xs text-text-secondary"
                              >
                                <span>
                                  • {item.name} ({item.portionAmount} {item.portionUnit})
                                </span>
                                <span className="font-mono text-[11px] text-text-muted">
                                  {item.calories} kcal | {item.protein_g}g P
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Olympian Favorites Section */}
      {favorites.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-accent-gold" />
            <h3 className="font-serif font-bold text-lg text-text-primary">
              Olympian Favorites
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-4 rounded-xl bg-bg-surface-elevated border border-border-base flex flex-col justify-between space-y-2"
              >
                <div>
                  <h4 className="font-serif font-bold text-sm text-text-primary">{fav.name}</h4>
                  <span className="text-xs text-text-muted font-mono block mt-0.5">
                    {fav.totalCalories} kcal • {fav.totalProtein}g protein
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border-base">
                  <button
                    onClick={() => handleLogFavorite(fav)}
                    className="text-xs font-bold text-accent-gold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log to Today
                  </button>
                  <button
                    onClick={() => deleteFavorite(fav.id)}
                    className="text-text-muted hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
