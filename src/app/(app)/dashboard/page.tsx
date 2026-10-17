"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useProfile, useMeals, useWater, useXP } from "@/lib/db/hooks";
import { PowerRing } from "@/components/dashboard/PowerRing";
import { MacroRing, FiberBar } from "@/components/dashboard/MacroRing";
import {
  ZeusIcon,
  DemeterIcon,
  DionysusIcon,
  PoseidonIcon,
  HermesIcon,
  AthenaIcon,
} from "@/components/gods";
import {
  Plus,
  ArrowRight,
  Flame,
  Camera,
  Trash2,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setTodayStr(today);
    setSelectedDate(today);
  }, []);

  const { profile } = useProfile();
  const { meals, totals, addMeal, deleteMeal } = useMeals(selectedDate);
  const { totalWaterMl } = useWater(selectedDate);
  const { breakfastStreak, totalSwapsLogged } = useXP();

  const targets = profile?.targets ?? {
    calories: 2100,
    proteinG: 140,
    carbsG: 240,
    fatG: 63,
    fiberG: 29,
    waterMl: 2800,
  };

  const remainingProtein = Math.max(0, targets.proteinG - totals.protein);
  const junkBudget = profile?.junkBudgetPerWeek ?? 3;
  const junkUsedThisWeek = Math.min(junkBudget, totalSwapsLogged % 7);

  // Hermes Quick Log items (popular staples)
  const quickLogItems = [
    {
      name: "2 Phulkas + Dal Tadka",
      type: "lunch" as const,
      items: [
        {
          name: "Roti / Phulka (2 pcs)",
          portionAmount: 2,
          portionUnit: "roti",
          grams: 70,
          calories: 170,
          protein_g: 6.2,
          carbs_g: 35.0,
          fat_g: 1.0,
          fiber_g: 4.6,
          source: "database" as const,
        },
        {
          name: "Yellow Dal Tadka",
          portionAmount: 1,
          portionUnit: "katori",
          grams: 150,
          calories: 155,
          protein_g: 7.5,
          carbs_g: 20.0,
          fat_g: 5.1,
          fiber_g: 4.8,
          source: "database" as const,
        },
      ],
    },
    {
      name: "2 Whole Boiled Eggs",
      type: "breakfast" as const,
      items: [
        {
          name: "Whole Boiled Eggs (2)",
          portionAmount: 2,
          portionUnit: "egg",
          grams: 100,
          calories: 144,
          protein_g: 12.6,
          carbs_g: 0.8,
          fat_g: 10.0,
          fiber_g: 0,
          source: "database" as const,
        },
      ],
    },
    {
      name: "1 Scoop Whey Isolate",
      type: "snack" as const,
      items: [
        {
          name: "Whey Protein Isolate",
          portionAmount: 1,
          portionUnit: "scoop",
          grams: 30,
          calories: 115,
          protein_g: 25.0,
          carbs_g: 1.5,
          fat_g: 0.8,
          fiber_g: 0,
          source: "database" as const,
        },
      ],
    },
    {
      name: "Bowl of Fresh Fruits",
      type: "snack" as const,
      items: [
        {
          name: "Banana & Apple Slices",
          portionAmount: 1,
          portionUnit: "bowl",
          grams: 150,
          calories: 120,
          protein_g: 1.2,
          carbs_g: 28.0,
          fat_g: 0.4,
          fiber_g: 3.8,
          source: "database" as const,
        },
      ],
    },
  ];

  const handleQuickLog = async (item: (typeof quickLogItems)[0]) => {
    await addMeal({
      mealType: item.type,
      name: item.name,
      items: item.items,
    });
  };

  const mealTypes = [
    { id: "breakfast", label: "Breakfast", icon: "🌅" },
    { id: "lunch", label: "Lunch", icon: "☀️" },
    { id: "snack", label: "Snack", icon: "🍎" },
    { id: "dinner", label: "Dinner", icon: "🌙" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Top Banner: Greeting, Date Picker & Streak */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-gold font-semibold flex items-center gap-1.5">
            <ZeusIcon size={16} /> Zeus Throne Room
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
            Greetings, {profile?.name || "Warrior"}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Your body is your temple. Master your daily energy threshold today.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border-base glass-panel text-xs text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
          />
          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-accent-gold/15 text-accent-gold hover:bg-accent-gold hover:text-stone-950 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Primary Metabolic Hero Grid: Power Ring + Macro Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zeus Power Ring (Calorie Command) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel-gold flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-accent-gold">
            <ZeusIcon size={14} /> Power Threshold
          </div>
          <div className="py-4">
            <PowerRing consumed={totals.calories} target={targets.calories} size={230} />
          </div>

          <div className="w-full pt-4 border-t border-border-base flex items-center justify-around text-xs">
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Goal</span>
              <span className="font-bold text-text-primary">{targets.calories} kcal</span>
            </div>
            <div className="h-6 w-px bg-border-base" />
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Consumed</span>
              <span className="font-bold text-accent-gold">{totals.calories} kcal</span>
            </div>
            <div className="h-6 w-px bg-border-base" />
            <div>
              <span className="text-text-muted block text-[10px] uppercase">Remaining</span>
              <span className="font-bold text-text-primary">
                {Math.max(0, targets.calories - totals.calories)} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Macros Breakdown & Satiety */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-text-primary">
                Macronutrient Pillars
              </h3>
              <p className="text-xs text-text-secondary">
                {remainingProtein > 0
                  ? `⚡ ${remainingProtein}g protein remaining to secure muscle preservation`
                  : "✨ Protein target conquered for today!"}
              </p>
            </div>
            <Link
              href="/scan"
              className="px-3.5 py-1.5 rounded-xl bg-accent-gold text-stone-950 font-bold text-xs flex items-center gap-1.5 hover:bg-accent-gold-hover transition-all active:scale-95 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" /> Scan Meal
            </Link>
          </div>

          {/* 3 Macro Rings */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <MacroRing
              label="Protein"
              consumed={totals.protein}
              target={targets.proteinG}
              color="var(--gold)"
            />
            <MacroRing
              label="Carbohydrates"
              consumed={totals.carbs}
              target={targets.carbsG}
              color="var(--aegean)"
            />
            <MacroRing
              label="Healthy Fats"
              consumed={totals.fat}
              target={targets.fatG}
              color="var(--royal)"
            />
          </div>

          {/* Prebiotic Fiber Bar */}
          <div className="pt-2 border-t border-border-base">
            <FiberBar consumed={totals.fiber} target={targets.fiberG} />
          </div>
        </div>
      </div>

      {/* Row 2: Water Glance + Dionysus Treat Budget + Breakfast Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Poseidon Hydration Tile */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                <PoseidonIcon size={20} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-text-primary">
                  Poseidon Hydration
                </h4>
                <span className="text-[11px] text-text-muted">Target: {targets.waterMl} ml</span>
              </div>
            </div>
            <Link
              href="/water"
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-cyan-400 text-lg">{totalWaterMl} ml</span>
              <span className="text-text-muted">
                {Math.round((totalWaterMl / Math.max(1, targets.waterMl)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-border-base/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-800"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((totalWaterMl / Math.max(1, targets.waterMl)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Dionysus Junk Budget Meter */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <DionysusIcon size={20} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-text-primary">
                  Weekly Junk Budget
                </h4>
                <span className="text-[11px] text-text-muted">Zero Guilt Allowed</span>
              </div>
            </div>
            <Link
              href="/swap"
              className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
            >
              Swap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-text-primary text-base">
                {junkUsedThisWeek} / {junkBudget} Treats Used
              </span>
              <span className="text-[11px] text-purple-400 font-medium">
                {junkBudget - junkUsedThisWeek} treats left
              </span>
            </div>
            {/* Laurel-wreath styled treat indicators */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: junkBudget }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 flex-1 rounded-full transition-colors ${
                    i < junkUsedThisWeek
                      ? "bg-purple-500"
                      : "bg-border-base border border-purple-500/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Breakfast Streak Card (Survey Highlight) */}
        <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-text-primary">
                  Breakfast Champion
                </h4>
                <span className="text-[11px] text-text-muted">Research Insight (38% benchmark)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 font-mono">
              {breakfastStreak} Days
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Only 38% of surveyed Pune students eat breakfast daily. You&apos;re beating the morning rush
            with steady morning fuel.
          </p>
        </div>
      </div>

      {/* Hermes Quick-Log Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HermesIcon size={18} className="text-accent-gold" />
            <h3 className="font-serif font-bold text-base text-text-primary">
              Hermes Quick-Log Shortcuts
            </h3>
          </div>
          <span className="text-xs text-text-muted">One-tap instant feast logging</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLogItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickLog(item)}
              className="p-3.5 rounded-2xl glass-panel border border-border-base hover:border-accent-gold text-left transition-all group active:scale-95 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs text-accent-gold font-medium mb-1">
                <span className="capitalize font-mono text-[10px]">{item.type}</span>
                <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
              </div>
              <div className="font-semibold text-xs text-text-primary truncate">{item.name}</div>
              <div className="text-[10px] text-text-muted mt-1 font-mono">
                {item.items.reduce((s, i) => s + i.calories, 0)} kcal •{" "}
                {item.items.reduce((s, i) => s + i.protein_g, 0)}g protein
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Meals Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DemeterIcon size={20} className="text-accent-gold" />
            <h3 className="font-serif font-bold text-lg text-text-primary">
              Today&apos;s Feasts &amp; Sustenance
            </h3>
          </div>
          <Link
            href="/log"
            className="text-xs font-semibold text-accent-gold hover:underline flex items-center gap-1"
          >
            View Full Diary <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealTypes.map((type) => {
            const typeMeals = meals.filter((m) => m.mealType === type.id);
            const typeCalories = typeMeals.reduce((sum, m) => sum + m.totalCalories, 0);
            const typeProtein = typeMeals.reduce((sum, m) => sum + m.totalProtein, 0);

            return (
              <div
                key={type.id}
                className="p-5 rounded-2xl glass-panel border border-border-base space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border-base">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{type.icon}</span>
                    <h4 className="font-serif font-bold text-sm text-text-primary">
                      {type.label}
                    </h4>
                  </div>
                  <div className="text-xs font-mono text-text-muted">
                    {typeCalories > 0 ? (
                      <span className="font-semibold text-text-primary">
                        {typeCalories} kcal • {typeProtein.toFixed(1)}g P
                      </span>
                    ) : (
                      <span>Empty</span>
                    )}
                  </div>
                </div>

                {typeMeals.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-xs text-text-muted mb-2">No {type.label.toLowerCase()} logged yet</p>
                    <Link
                      href={`/scan?mealType=${type.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent-gold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add {type.label}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {typeMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-bg-surface-elevated text-xs"
                      >
                        <div>
                          <div className="font-semibold text-text-primary">{meal.name}</div>
                          <div className="text-[10px] text-text-muted font-mono mt-0.5">
                            {meal.totalCalories} kcal • {meal.totalProtein}g P • {meal.totalCarbs}g C • {meal.totalFat}g F
                          </div>
                        </div>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                          title="Delete feast"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Athena Tip Card */}
      <div className="p-6 rounded-2xl glass-panel-gold border border-accent-gold/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center text-accent-gold shrink-0">
          <AthenaIcon size={24} />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-accent-gold uppercase font-bold tracking-wider">
            Athena&apos;s Daily Counsel
          </span>
          <h4 className="font-serif font-bold text-sm text-text-primary">
            Prioritize Pre-Lecture Protein Distribution
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Consuming 25–30g of protein within 90 minutes of waking stabilizes ghrelin (hunger hormone)
            and mitigates mid-afternoon energy crashes. If rushed, 2 boiled eggs or a quick sattu drink
            takes under 2 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
