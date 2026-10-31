"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGoals, useProfile } from "@/lib/db/hooks";
import { type GoalType, type DBGoal } from "@/lib/db/db";
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  validateSafetyRestrictions,
  Sex,
  ActivityLevel,
  GoalPace,
} from "@/lib/nutrition/targets";
import { GoalTargets } from "@/lib/nutrition/defaults";
import { goalFormSchema } from "@/lib/goals/schemas";
import {
  Flame,
  Scale,
  Dumbbell,
  Sparkles,
  Droplets,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

interface GoalEditorFormProps {
  existingGoal?: DBGoal;
  isEditMode?: boolean;
}

const TEMPLATES: Array<{
  type: GoalType;
  title: string;
  defaultName: string;
  description: string;
  icon: typeof Flame;
}> = [
  {
    type: "lose_fat",
    title: "Lose Fat",
    defaultName: "Lean Definition",
    description: "Moderate calorie deficit with high protein to preserve muscle.",
    icon: Flame,
  },
  {
    type: "maintain",
    title: "Maintain",
    defaultName: "Daily Equilibrium",
    description: "Balanced energy expenditure for long-term health and vitality.",
    icon: Scale,
  },
  {
    type: "build_muscle",
    title: "Build Muscle",
    defaultName: "Hypertrophy Ascent",
    description: "Slight calorie surplus with optimal protein for strength gains.",
    icon: Dumbbell,
  },
  {
    type: "eat_healthier",
    title: "Eat Healthier",
    defaultName: "Nutrient Rich Vitality",
    description: "Focus on micronutrient density, high fiber, and gut wellness.",
    icon: Sparkles,
  },
  {
    type: "hydration",
    title: "Stay Hydrated",
    defaultName: "Poseidon's Torrent",
    description: "Elevate daily water intake to 3.5L+ while keeping nutrition steady.",
    icon: Droplets,
  },
  {
    type: "custom",
    title: "Custom Target",
    defaultName: "Warrior Custom Plan",
    description: "Full manual control over your calories, macros, and fluid intake.",
    icon: Target,
  },
];

export function GoalEditorForm({ existingGoal, isEditMode = false }: GoalEditorFormProps) {
  const router = useRouter();
  const { createGoal, updateGoal, setActiveGoal, targets: currentActiveTargets } = useGoals();
  const { profile, saveProfile } = useProfile();

  // Template & Name
  const [selectedType, setSelectedType] = useState<GoalType>(existingGoal?.type ?? "lose_fat");
  const [name, setName] = useState<string>(
    existingGoal?.name ?? "Lean Definition"
  );

  // Biometrics (from profile if available, else inline inputs)
  const [age, setAge] = useState<number>(profile?.age ?? 24);
  const [sex, setSex] = useState<Sex>(profile?.sex ?? "male");
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState<number>(profile?.weightKg ?? 70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel ?? "moderate"
  );
  const [pace, setPace] = useState<GoalPace>(existingGoal?.pace ?? "standard");
  const [showBiometrics, setShowBiometrics] = useState<boolean>(
    !profile?.age || !profile?.heightCm || !profile?.weightKg
  );

  // Targets (editable)
  const [calories, setCalories] = useState<number>(
    existingGoal?.targets.calories ?? 2000
  );
  const [proteinG, setProteinG] = useState<number>(
    existingGoal?.targets.protein_g ?? 140
  );
  const [carbsG, setCarbsG] = useState<number>(
    existingGoal?.targets.carbs_g ?? 220
  );
  const [fatG, setFatG] = useState<number>(
    existingGoal?.targets.fat_g ?? 60
  );
  const [fiberG, setFiberG] = useState<number>(
    existingGoal?.targets.fiber_g ?? 30
  );
  const [waterMl, setWaterMl] = useState<number>(
    existingGoal?.targets.water_ml ?? 2800
  );

  // Optional Timeline & Progress
  const [targetWeightKg, setTargetWeightKg] = useState<string>(
    existingGoal?.targetWeightKg ? String(existingGoal.targetWeightKg) : ""
  );
  const [targetDate, setTargetDate] = useState<string>(
    existingGoal?.targetDate ?? ""
  );
  const [notes, setNotes] = useState<string>(existingGoal?.notes ?? "");

  // Form feedback / validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Safety checks calculation
  const { bmi } = useMemo(() => {
    return calculateBMI({ weightKg, heightCm });
  }, [weightKg, heightCm]);

  const safetyCheck = useMemo(() => {
    if (selectedType === "lose_fat") {
      return validateSafetyRestrictions({ age, bmi, goal: "lose_fat" });
    }
    return { allowed: true };
  }, [selectedType, age, bmi]);

  // Dynamic Suggestion Calculation based on biometric parameters
  useEffect(() => {
    if (isEditMode) return; // Don't overwrite if editing existing goal unless user changed type

    const bmr = calculateBMR({ weightKg, heightCm, age, sex });
    const tdee = calculateTDEE({ bmr, activityLevel });

    let suggestedCal = tdee;
    let suggestedProt = Math.round(weightKg * 1.8);
    let suggestedFiber = 28;
    let suggestedWater = Math.round(weightKg * 35);

    if (selectedType === "lose_fat") {
      const deficit = pace === "gentle" ? 300 : 500;
      suggestedCal = Math.max(sex === "female" ? 1200 : 1500, tdee - deficit);
      suggestedProt = Math.round(weightKg * 2.0); // elevated protein to preserve muscle
      suggestedFiber = 30;
      suggestedWater = 2800;
    } else if (selectedType === "build_muscle") {
      suggestedCal = tdee + (pace === "gentle" ? 200 : 350);
      suggestedProt = Math.round(weightKg * 2.2);
      suggestedFiber = 30;
      suggestedWater = 3000;
    } else if (selectedType === "eat_healthier") {
      suggestedCal = tdee;
      suggestedProt = Math.round(weightKg * 1.6);
      suggestedFiber = 38; // high fiber focus
      suggestedWater = 2700;
    } else if (selectedType === "hydration") {
      suggestedCal = currentActiveTargets.calories || 2000;
      suggestedProt = currentActiveTargets.protein_g || 60;
      suggestedFiber = currentActiveTargets.fiber_g || 25;
      suggestedWater = 3500;
    } else if (selectedType === "maintain") {
      suggestedCal = tdee;
      suggestedProt = Math.round(weightKg * 1.6);
      suggestedFiber = 28;
      suggestedWater = 2500;
    }

    // Split remaining calories into carbs and fat
    const remainingCalories = Math.max(0, suggestedCal - (suggestedProt * 4));
    const suggestedFat = Math.round((suggestedCal * 0.25) / 9);
    const suggestedCarbs = Math.max(50, Math.round((remainingCalories - (suggestedFat * 9)) / 4));

    setCalories(suggestedCal);
    setProteinG(suggestedProt);
    setCarbsG(suggestedCarbs);
    setFatG(suggestedFat);
    setFiberG(suggestedFiber);
    setWaterMl(suggestedWater);
  }, [
    selectedType,
    age,
    sex,
    heightCm,
    weightKg,
    activityLevel,
    pace,
    isEditMode,
    currentActiveTargets,
  ]);

  // Handle template selection
  const handleSelectTemplate = (type: GoalType) => {
    setSelectedType(type);
    const tmpl = TEMPLATES.find((t) => t.type === type);
    if (tmpl && (!name || TEMPLATES.some((t) => t.defaultName === name))) {
      setName(tmpl.defaultName);
    }
  };

  // Submit Handler
  const handleSubmit = async (setActiveAfterSave: boolean) => {
    setErrors({});

    // Safety restriction block
    if (!safetyCheck.allowed) {
      setErrors({ safety: safetyCheck.message || "This goal violates safety restrictions." });
      return;
    }

    const parsedTargetWeight = targetWeightKg ? parseFloat(targetWeightKg) : undefined;

    // Validate with Zod
    const validationResult = goalFormSchema.safeParse({
      name,
      type: selectedType,
      targets: {
        calories: Number(calories),
        protein_g: Number(proteinG),
        carbs_g: Number(carbsG),
        fat_g: Number(fatG),
        fiber_g: Number(fiberG),
        water_ml: Number(waterMl),
      },
      startWeightKg: Number(weightKg),
      targetWeightKg: parsedTargetWeight,
      targetDate: targetDate || undefined,
      pace,
      notes: notes.trim() || undefined,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Save or update body biometrics in profile if provided
      if (profile) {
        await saveProfile({
          ...profile,
          age,
          sex,
          heightCm,
          weightKg,
          activityLevel,
          pace,
        });
      } else {
        await saveProfile({
          name: "Warrior",
          age,
          sex,
          heightCm,
          weightKg,
          activityLevel,
          goal: selectedType === "hydration" || selectedType === "custom" ? "maintain" : selectedType,
          pace,
          diet: "veg",
          wakeTime: "07:00",
          sleepTime: "23:00",
          allergies: [],
          junkBudgetPerWeek: 3,
        });
      }

      const targetsPayload: GoalTargets = {
        calories: Number(calories),
        protein_g: Number(proteinG),
        carbs_g: Number(carbsG),
        fat_g: Number(fatG),
        fiber_g: Number(fiberG),
        water_ml: Number(waterMl),
      };

      if (isEditMode && existingGoal) {
        await updateGoal(existingGoal.id, {
          name: name.trim(),
          type: selectedType,
          targets: targetsPayload,
          startWeightKg: Number(weightKg),
          targetWeightKg: parsedTargetWeight,
          targetDate: targetDate || undefined,
          pace,
          notes: notes.trim() || undefined,
        });
        if (setActiveAfterSave) {
          await setActiveGoal(existingGoal.id);
        }
      } else {
        await createGoal({
          name: name.trim(),
          type: selectedType,
          targets: targetsPayload,
          startWeightKg: Number(weightKg),
          targetWeightKg: parsedTargetWeight,
          targetDate: targetDate || undefined,
          pace,
          notes: notes.trim() || undefined,
          setActive: setActiveAfterSave,
        });
      }

      router.push("/goals");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save goal.";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. SELECT TEMPLATE */}
      <section className="space-y-3">
        <label className="block font-serif font-bold text-sm text-text-primary">
          1. Choose Goal Archetype
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedType === tmpl.type;
            return (
              <button
                key={tmpl.type}
                type="button"
                onClick={() => handleSelectTemplate(tmpl.type)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-accent-gold bg-accent-gold/15 shadow-md shadow-accent-gold/10 ring-1 ring-accent-gold"
                    : "border-border-base bg-surface-glass hover:border-accent-gold/40 text-text-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-accent-gold/30 text-accent-gold"
                        : "bg-surface-glass text-text-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-accent-gold" />}
                </div>
                <h4 className="font-bold text-xs text-text-primary">{tmpl.title}</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-2">
                  {tmpl.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Safety Alert (if safetyCheck fails) */}
      {!safetyCheck.allowed && (
        <div className="p-4 rounded-2xl bg-terracotta/15 border border-terracotta/40 text-xs text-terracotta flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Safety Restriction:</strong>
            <span>{safetyCheck.message}</span>
          </div>
        </div>
      )}

      {/* 2. GOAL NAME */}
      <section className="space-y-2">
        <label className="block font-serif font-bold text-sm text-text-primary">
          2. Goal Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Summer Fat Loss, Marathon Fuel"
          className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-border-base text-text-primary focus:border-accent-gold focus:outline-none text-sm"
        />
        {errors.name && <p className="text-xs text-terracotta">{errors.name}</p>}
      </section>

      {/* 3. BIOMETRICS COLLAPSIBLE / INLINE */}
      <section className="p-5 rounded-3xl glass-panel border border-border-base space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-sm text-text-primary">
              Body Stats for Personalized Mathematics
            </h4>
            <p className="text-xs text-text-muted">
              Used to calculate BMR via Mifflin-St Jeor and suggested macro targets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBiometrics(!showBiometrics)}
            className="text-xs text-accent-gold hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>{showBiometrics ? "Hide Stats" : "Adjust Stats"}</span>
            {showBiometrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showBiometrics && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
            <div>
              <label className="block text-text-secondary font-semibold mb-1">Age</label>
              <input
                type="number"
                min={14}
                max={100}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary font-semibold mb-1">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary font-semibold mb-1">Height (cm)</label>
              <input
                type="number"
                min={100}
                max={250}
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary font-semibold mb-1">Weight (kg)</label>
              <input
                type="number"
                min={30}
                max={300}
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 65)}
                className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary font-semibold mb-1">Activity</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
              >
                <option value="sedentary">Sedentary (1.2)</option>
                <option value="light">Light (1.375)</option>
                <option value="moderate">Moderate (1.55)</option>
                <option value="active">Active (1.725)</option>
                <option value="athlete">Athlete (1.9)</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* 4. TARGETS REVIEW & MANUAL OVERRIDE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block font-serif font-bold text-sm text-text-primary">
            3. Review & Customize Daily Targets
          </label>
          <span className="text-[11px] text-text-muted">
            All values can be fine-tuned manually
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-bg-surface border border-border-base">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Calories (kcal)
            </span>
            <input
              type="number"
              min={800}
              max={6000}
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-base font-bold text-accent-gold text-base"
            />
            {errors["targets.calories"] && (
              <p className="text-[10px] text-terracotta mt-1">{errors["targets.calories"]}</p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-bg-surface border border-border-base">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Protein (g)
            </span>
            <input
              type="number"
              min={20}
              max={400}
              value={proteinG}
              onChange={(e) => setProteinG(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-base font-bold text-text-primary text-base"
            />
            {errors["targets.protein_g"] && (
              <p className="text-[10px] text-terracotta mt-1">{errors["targets.protein_g"]}</p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-bg-surface border border-border-base">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Carbs (g)
            </span>
            <input
              type="number"
              min={0}
              max={800}
              value={carbsG}
              onChange={(e) => setCarbsG(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-base font-bold text-text-primary text-base"
            />
          </div>

          <div className="p-3 rounded-2xl bg-bg-surface border border-border-base">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Fat (g)
            </span>
            <input
              type="number"
              min={0}
              max={300}
              value={fatG}
              onChange={(e) => setFatG(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-base font-bold text-text-primary text-base"
            />
          </div>

          <div className="p-3 rounded-2xl bg-bg-surface border border-border-base">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Fiber (g)
            </span>
            <input
              type="number"
              min={10}
              max={100}
              value={fiberG}
              onChange={(e) => setFiberG(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-base font-bold text-text-primary text-base"
            />
            {errors["targets.fiber_g"] && (
              <p className="text-[10px] text-terracotta mt-1">{errors["targets.fiber_g"]}</p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-bg-surface border border-border-base">
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Water (ml)
            </span>
            <input
              type="number"
              min={500}
              max={8000}
              step={100}
              value={waterMl}
              onChange={(e) => setWaterMl(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-base font-bold text-cyan-400 text-base"
            />
            {errors["targets.water_ml"] && (
              <p className="text-[10px] text-terracotta mt-1">{errors["targets.water_ml"]}</p>
            )}
          </div>
        </div>
      </section>

      {/* 5. OPTIONAL TIMELINE & TARGET WEIGHT */}
      <section className="p-5 rounded-3xl glass-panel border border-border-base space-y-4 text-xs">
        <h4 className="font-serif font-bold text-sm text-text-primary">
          4. Optional Target Weight & Notes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-text-secondary font-semibold mb-1">
              Target Weight (kg)
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="e.g. 68"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
            />
          </div>
          <div>
            <label className="block text-text-secondary font-semibold mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
            />
          </div>
          <div>
            <label className="block text-text-secondary font-semibold mb-1">
              Pace
            </label>
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value as GoalPace)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
            >
              <option value="standard">Standard (recommended)</option>
              <option value="gentle">Gentle / Gradual</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-text-secondary font-semibold mb-1">
            Personal Notes & Motivation
          </label>
          <input
            type="text"
            placeholder="e.g. Preparing for summer summit, prioritising high-protein vegetarian lunches"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-base text-text-primary"
          />
        </div>
      </section>

      {/* Submission errors if any */}
      {errors.submit && (
        <div className="p-3 rounded-xl bg-terracotta/20 border border-terracotta/40 text-xs text-terracotta">
          {errors.submit}
        </div>
      )}

      {/* 6. ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border-base">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border-base text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={isSubmitting || !safetyCheck.allowed}
          onClick={() => handleSubmit(false)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-accent-gold/40 text-accent-gold hover:bg-accent-gold/10 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          Save Goal
        </button>

        <button
          type="button"
          disabled={isSubmitting || !safetyCheck.allowed}
          onClick={() => handleSubmit(true)}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>Save & Set Active</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
