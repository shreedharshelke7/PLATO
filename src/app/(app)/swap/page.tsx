"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useMeals, useSettings, useXP } from "@/lib/db/hooks";
import { DionysusIcon, LaurelWreath } from "@/components/gods";
import { SwapResponse } from "@/app/api/swap/route";
import {
  Sparkles,
  Clock,
  ThumbsUp,
  ChefHat,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

export default function DivineSwapPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const { settings } = useSettings();
  const [todayStr, setTodayStr] = useState<string>("");
  const { addMeal } = useMeals(todayStr);
  const { totalSwapsLogged, awardXP } = useXP();

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const [cravingInput, setCravingInput] = useState<string>("Samosa");
  const [isAlchemizing, setIsAlchemizing] = useState<boolean>(false);
  const [swapData, setSwapData] = useState<SwapResponse | null>(null);
  const [selectedSwapIndex, setSelectedSwapIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const junkBudget = profile?.junkBudgetPerWeek ?? 3;
  const junkUsedThisWeek = Math.min(junkBudget, totalSwapsLogged % 7);

  const popularCravings = [
    "Samosa",
    "Pizza Margherita",
    "Maggi 2-Minute Noodles",
    "Mumbai Vada Pav",
    "Crispy French Fries",
    "Sweet Cold Drink / Cola",
    "Pav Bhaji with Butter",
    "Gulab Jamun",
  ];

  const handleFetchSwap = async (queryToSearch?: string) => {
    const q = (queryToSearch || cravingInput).trim();
    if (!q) return;

    setIsAlchemizing(true);
    setErrorMessage(null);
    setSwapData(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.userApiKey) headers["x-user-key"] = settings.userApiKey;

      const res = await fetch("/api/swap", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: q,
          diet: profile?.diet ?? "veg",
          allergies: profile?.allergies ?? [],
          goal: profile?.goal ?? "lose_fat",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Alchemy failed");

      setSwapData(data);
      setSelectedSwapIndex(0);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Swap generation failed");
    } finally {
      setIsAlchemizing(false);
    }
  };

  // 1. "Swap and Log It"
  const handleSwapAndLog = async () => {
    if (!swapData) return;
    const swap = swapData.swaps[selectedSwapIndex];

    await addMeal({
      mealType: "snack",
      name: `Divine Swap: ${swap.name}`,
      items: [
        {
          name: swap.name,
          portionAmount: 1,
          portionUnit: "serving",
          grams: 180,
          calories: swap.calories,
          protein_g: swap.protein_g,
          carbs_g: swap.carbs_g,
          fat_g: swap.fat_g,
          fiber_g: swap.fiber_g,
          confidence: 1.0,
          source: "swap",
        },
      ],
      isJunkOrTreat: false,
    });

    await awardXP("swap", 25, `Performed Divine Swap: ${swap.name}`);
    alert(`Success! Logged "${swap.name}" with +25 Favor XP.`);
    router.push("/dashboard");
  };

  // 2. "I'll Eat the Original" (Logged against Junk Budget with NO shaming)
  const handleEatOriginal = async () => {
    if (!swapData) return;
    const orig = swapData.original;

    await addMeal({
      mealType: "snack",
      name: orig.name,
      items: [
        {
          name: orig.name,
          portionAmount: 1,
          portionUnit: "serving",
          grams: 180,
          calories: orig.calories,
          protein_g: orig.protein_g,
          carbs_g: orig.carbs_g,
          fat_g: orig.fat_g,
          fiber_g: orig.fiber_g,
          confidence: 1.0,
          source: "manual",
        },
      ],
      isJunkOrTreat: true, // Counts against weekly junk budget
    });

    alert(
      `Enjoy your treat! Logged "${orig.name}" against your weekly treat allowance (${junkUsedThisWeek + 1}/${junkBudget} used). Zero guilt.`
    );
    router.push("/dashboard");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold flex items-center gap-1.5">
            <DionysusIcon size={16} /> Dionysus Feast Altar
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary mt-0.5">
            The Divine Swap
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Taste & time beat willpower every time. Transmute any craving into an elevated feast.
          </p>
        </div>

        {/* Junk Budget Status */}
        <div className="p-3 rounded-2xl glass-panel-gold border border-purple-500/30 flex items-center gap-3">
          <LaurelWreath size={28} className="text-purple-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-muted block">
              Junk Budget
            </span>
            <span className="font-serif font-black text-xs text-text-primary">
              {junkUsedThisWeek} of {junkBudget} Treats Logged
            </span>
          </div>
        </div>
      </div>

      {/* Input Form & Quick Pills */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
          What fast food or snack are you craving right now?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cravingInput}
            onChange={(e) => setCravingInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFetchSwap();
              }
            }}
            placeholder="e.g. Samosa, Pizza, Maggi, Burger, Fries..."
            className="flex-1 px-4 py-3 rounded-xl bg-bg-surface border border-border-base text-text-primary text-sm focus:border-accent-gold"
          />
          <button
            type="button"
            onClick={() => handleFetchSwap()}
            disabled={isAlchemizing}
            className="px-6 py-3 rounded-xl bg-accent-gold hover:bg-accent-gold-hover text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isAlchemizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Invoke Alchemy
          </button>
        </div>

        {/* Popular Cravings Quick Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] text-text-muted self-center mr-1">Popular:</span>
          {popularCravings.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setCravingInput(item);
                handleFetchSwap(item);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-bg-surface-elevated border border-border-base hover:border-accent-gold text-text-secondary hover:text-text-primary transition-all"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* RESULTS DISPLAY: SIDE BY SIDE COMPARISON */}
      {swapData && (
        <div className="space-y-6">
          {/* Swap Options Selector Tabs (1, 2, 3) */}
          <div className="flex gap-2">
            {swapData.swaps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSwapIndex(idx)}
                className={`flex-1 p-3 rounded-2xl border text-left transition-all ${
                  selectedSwapIndex === idx
                    ? "border-accent-gold bg-accent-gold/15 shadow-sm"
                    : "border-border-base glass-panel hover:border-accent-gold/40 text-text-muted"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-0.5">
                  <span className="text-accent-gold">Option {idx + 1}</span>
                  <span className="text-[10px] font-mono font-bold flex items-center gap-0.5 text-text-primary">
                    <Clock className="w-3 h-3 text-accent-gold" /> {s.prepMinutes}m
                  </span>
                </div>
                <div className="font-serif font-bold text-xs text-text-primary truncate">
                  {s.name}
                </div>
              </button>
            ))}
          </div>

          {/* Active Comparison Card */}
          {(() => {
            const currentSwap = swapData.swaps[selectedSwapIndex];
            const deltaKcal = currentSwap.calories - swapData.original.calories;
            const deltaProtein = Number(
              (currentSwap.protein_g - swapData.original.protein_g).toFixed(1)
            );
            const deltaFiber = Number(
              (currentSwap.fiber_g - swapData.original.fiber_g).toFixed(1)
            );

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Original Craving */}
                <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-border-base flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                      The Craving
                    </span>
                    <h3 className="font-serif font-bold text-xl text-text-primary mt-2">
                      {swapData.original.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-bg-surface-elevated">
                      <span className="text-text-muted block text-[10px]">Calories</span>
                      <span className="font-bold text-base text-text-primary">
                        {swapData.original.calories} kcal
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-bg-surface-elevated">
                      <span className="text-text-muted block text-[10px]">Protein</span>
                      <span className="font-bold text-base text-text-primary">
                        {swapData.original.protein_g}g
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-bg-surface-elevated">
                      <span className="text-text-muted block text-[10px]">Carbs</span>
                      <span className="font-bold text-base text-text-primary">
                        {swapData.original.carbs_g}g
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-bg-surface-elevated">
                      <span className="text-text-muted block text-[10px]">Prebiotic Fiber</span>
                      <span className="font-bold text-base text-text-primary">
                        {swapData.original.fiber_g}g
                      </span>
                    </div>
                  </div>

                  {/* Eat Original Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleEatOriginal}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold glass-panel border border-border-base hover:border-purple-400 text-text-secondary hover:text-text-primary transition-all text-center"
                    >
                      I&apos;ll eat the original (Treat Budget)
                    </button>
                    <span className="text-[10px] text-text-muted text-center block mt-1">
                      No penalty, no shaming. Just mindful honesty.
                    </span>
                  </div>
                </div>

                {/* Right: The Divine Swap */}
                <div className="lg:col-span-7 p-6 rounded-3xl glass-panel-gold flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold px-2.5 py-0.5 rounded-full bg-accent-gold/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Divine Swap Option {selectedSwapIndex + 1}
                      </span>

                      {/* Taste Match & Prep */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 font-bold text-accent-gold">
                          <ThumbsUp className="w-3.5 h-3.5" /> {currentSwap.tasteMatch}/10 Taste Match
                        </span>
                        <span className="flex items-center gap-1 font-bold text-text-primary">
                          <Clock className="w-3.5 h-3.5 text-accent-gold" /> {currentSwap.prepMinutes}m Prep
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif font-black text-2xl text-text-primary">
                      {currentSwap.name}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {currentSwap.whyItWorks}
                    </p>
                  </div>

                  {/* Nutrition with Animated Delta Chips */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-bg-surface-elevated border border-emerald-500/30">
                      <span className="text-[10px] text-text-muted block">Calories</span>
                      <span className="font-bold text-sm text-text-primary">
                        {currentSwap.calories} kcal
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                        {deltaKcal < 0 ? `${deltaKcal} kcal` : `+${deltaKcal} kcal`}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-bg-surface-elevated border border-emerald-500/30">
                      <span className="text-[10px] text-text-muted block">Protein</span>
                      <span className="font-bold text-sm text-text-primary">
                        {currentSwap.protein_g}g
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                        {deltaProtein > 0 ? `+${deltaProtein}g` : `${deltaProtein}g`}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-bg-surface-elevated border border-border-base">
                      <span className="text-[10px] text-text-muted block">Carbs</span>
                      <span className="font-bold text-sm text-text-primary">
                        {currentSwap.carbs_g}g
                      </span>
                      <span className="text-[10px] font-mono text-text-muted block mt-0.5">
                        energy
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-bg-surface-elevated border border-emerald-500/30">
                      <span className="text-[10px] text-text-muted block">Prebiotic Fiber</span>
                      <span className="font-bold text-sm text-text-primary">
                        {currentSwap.fiber_g}g
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                        {deltaFiber > 0 ? `+${deltaFiber}g` : `${deltaFiber}g`}
                      </span>
                    </div>
                  </div>

                  {/* Recipe / How to make */}
                  <div className="p-3.5 rounded-xl bg-bg-surface border border-border-base text-xs space-y-1">
                    <span className="font-bold text-accent-gold uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" /> Quick Assembly ({currentSwap.prepMinutes} mins)
                    </span>
                    <p className="text-text-secondary leading-relaxed">{currentSwap.howTo}</p>
                  </div>

                  {/* Swap & Log Button */}
                  <button
                    type="button"
                    onClick={handleSwapAndLog}
                    className="w-full py-3.5 px-6 rounded-xl font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent-gold/25 active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Swap and Log It (+25 XP)
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
