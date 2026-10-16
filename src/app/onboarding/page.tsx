"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserProfileInput,
  Sex,
  ActivityLevel,
  HealthGoal,
  DietType,
  calculateTargets,
  validateSafetyRestrictions,
  calculateBMI,
} from "@/lib/nutrition/targets";
import { useProfile } from "@/lib/db/hooks";
import {
  AthenaIcon,
  LaurelWreath,
} from "@/components/gods";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Scale,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { saveProfile } = useProfile();

  const [step, setStep] = useState<number>(1);
  const [unitMode, setUnitMode] = useState<"metric" | "imperial">("metric");

  // Form State
  const [formData, setFormData] = useState<UserProfileInput>({
    name: "",
    age: 24,
    sex: "male",
    heightCm: 175,
    weightKg: 70,
    goalWeightKg: undefined,
    activityLevel: "moderate",
    goal: "eat_healthier",
    pace: "standard",
    diet: "veg",
    wakeTime: "07:00",
    sleepTime: "23:00",
    allergies: [],
    junkBudgetPerWeek: 3,
  });

  // Custom Target Overrides (Step 4)
  const [customCalories, setCustomCalories] = useState<number | null>(null);
  const [customProtein, setCustomProtein] = useState<number | null>(null);
  const [customCarbs, setCustomCarbs] = useState<number | null>(null);
  const [customFat, setCustomFat] = useState<number | null>(null);
  const [customFiber, setCustomFiber] = useState<number | null>(null);
  const [customWater, setCustomWater] = useState<number | null>(null);

  // Free-text allergy tag input
  const [allergyInput, setAllergyInput] = useState("");

  // Height / Weight unit converters for UI
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(9);
  const [weightLbs, setWeightLbs] = useState(154);

  const handleMetricToggle = (mode: "metric" | "imperial") => {
    setUnitMode(mode);
    if (mode === "imperial") {
      const totalInches = Math.round(formData.heightCm / 2.54);
      setFeet(Math.floor(totalInches / 12));
      setInches(totalInches % 12);
      setWeightLbs(Math.round(formData.weightKg * 2.20462));
    } else {
      const cm = Math.round((feet * 12 + inches) * 2.54);
      const kg = Math.round(weightLbs / 2.20462);
      setFormData((prev) => ({ ...prev, heightCm: cm, weightKg: kg }));
    }
  };

  const handleImperialHeightChange = (f: number, i: number) => {
    setFeet(f);
    setInches(i);
    const cm = Math.round((f * 12 + i) * 2.54);
    setFormData((prev) => ({ ...prev, heightCm: cm }));
  };

  const handleImperialWeightChange = (lbs: number) => {
    setWeightLbs(lbs);
    const kg = Math.round(lbs / 2.20462);
    setFormData((prev) => ({ ...prev, weightKg: kg }));
  };

  const addAllergy = () => {
    const clean = allergyInput.trim();
    if (clean && !formData.allergies.includes(clean)) {
      setFormData((prev) => ({ ...prev, allergies: [...prev.allergies, clean] }));
      setAllergyInput("");
    }
  };

  const removeAllergy = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((t) => t !== tag),
    }));
  };

  // Computations
  const computed = calculateTargets(formData);
  const { bmi, category: bmiCategory } = calculateBMI({
    weightKg: formData.weightKg,
    heightCm: formData.heightCm,
  });

  const safetyCheck = validateSafetyRestrictions({
    age: formData.age,
    bmi,
    goal: formData.goal,
  });

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      alert("Please enter your name or warrior moniker.");
      return;
    }
    if (step === 3 && !safetyCheck.allowed) {
      alert(safetyCheck.message);
      return;
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleFinish = async () => {
    // If user edited overrides in Step 4, apply them
    await saveProfile(formData);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-center py-10 px-4 relative overflow-hidden">
      {/* Background aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Top Progress Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel-gold text-xs font-semibold text-accent-gold uppercase tracking-wider">
            <LaurelWreath size={16} /> Trial {step} of 4 • Ascension Protocol
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {step === 1 && "The Mortal Genesis"}
            {step === 2 && "The Daily Rhythm"}
            {step === 3 && "The Olympian Goal"}
            {step === 4 && "Athena's Target Revelation"}
          </h1>
          <div className="w-full bg-border-base/50 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="bg-accent-gold h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-10 rounded-3xl glass-panel-gold relative shadow-xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: BASIC WARRIOR PROFILE */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Unit Switcher */}
                <div className="flex justify-end">
                  <div className="inline-flex p-1 rounded-xl bg-bg-surface-elevated border border-border-base text-xs">
                    <button
                      type="button"
                      onClick={() => handleMetricToggle("metric")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        unitMode === "metric"
                          ? "bg-accent-gold text-stone-950"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Metric (kg/cm)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMetricToggle("imperial")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        unitMode === "imperial"
                          ? "bg-accent-gold text-stone-950"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Imperial (lbs/ft)
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Your Name or Moniker
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Achilles, Priya, Alex"
                    className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold focus:outline-none text-text-primary text-base"
                  />
                </div>

                {/* Age & Sex */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min={12}
                      max={99}
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: parseInt(e.target.value) || 18 })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold focus:outline-none text-text-primary text-base"
                    />
                    {formData.age < 18 && (
                      <span className="text-[11px] text-amber-400 mt-1 block">
                        Youth protocols apply (parent/doctor supervision required for deficit goals).
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Biological Sex
                    </label>
                    <select
                      value={formData.sex}
                      onChange={(e) =>
                        setFormData({ ...formData, sex: e.target.value as Sex })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold focus:outline-none text-text-primary text-base"
                    >
                      <option value="male">Male (Mifflin +5)</option>
                      <option value="female">Female (Mifflin -161)</option>
                      <option value="other">Other / Non-Binary</option>
                    </select>
                  </div>
                </div>

                {/* Height & Weight */}
                {unitMode === "metric" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={250}
                        value={formData.heightCm}
                        onChange={(e) =>
                          setFormData({ ...formData, heightCm: parseInt(e.target.value) || 170 })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold focus:outline-none text-text-primary text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        min={30}
                        max={300}
                        value={formData.weightKg}
                        onChange={(e) =>
                          setFormData({ ...formData, weightKg: parseInt(e.target.value) || 60 })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold focus:outline-none text-text-primary text-base"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Height (Feet & Inches)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={3}
                          max={8}
                          value={feet}
                          onChange={(e) =>
                            handleImperialHeightChange(parseInt(e.target.value) || 5, inches)
                          }
                          className="w-1/2 px-3 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold text-center text-text-primary"
                          placeholder="ft"
                        />
                        <input
                          type="number"
                          min={0}
                          max={11}
                          value={inches}
                          onChange={(e) =>
                            handleImperialHeightChange(feet, parseInt(e.target.value) || 0)
                          }
                          className="w-1/2 px-3 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold text-center text-text-primary"
                          placeholder="in"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        min={70}
                        max={600}
                        value={weightLbs}
                        onChange={(e) =>
                          handleImperialWeightChange(parseInt(e.target.value) || 150)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold focus:outline-none text-text-primary text-base"
                      />
                    </div>
                  </div>
                )}

                {/* BMI Insight */}
                <div className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base flex items-center justify-between text-xs">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-accent-gold" /> Calculated BMI
                  </span>
                  <span className="font-semibold text-text-primary">
                    {bmi} kg/m² ({bmiCategory})
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 2: LIFESTYLE & SCHEDULE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Daily Activity Multiplier
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "sedentary",
                        title: "Sedentary (1.2×)",
                        desc: "Desk job, study sessions, minimal deliberate movement",
                      },
                      {
                        id: "light",
                        title: "Light Activity (1.375×)",
                        desc: "1–3 light walks or workouts per week",
                      },
                      {
                        id: "moderate",
                        title: "Moderate Activity (1.55×)",
                        desc: "Gym or sports 3–5 days weekly; frequent active transit",
                      },
                      {
                        id: "active",
                        title: "Active (1.725×)",
                        desc: "Heavy training 6–7 days; physical or manual work",
                      },
                      {
                        id: "athlete",
                        title: "Olympian Athlete (1.9×)",
                        desc: "Twice daily training or competitive sports endurance",
                      },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setFormData({ ...formData, activityLevel: opt.id as ActivityLevel })
                        }
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          formData.activityLevel === opt.id
                            ? "border-accent-gold bg-accent-gold/10"
                            : "border-border-base hover:border-border-gold/40 bg-bg-surface"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-text-primary">
                            {opt.title}
                          </span>
                          {formData.activityLevel === opt.id && (
                            <Check className="w-4 h-4 text-accent-gold" />
                          )}
                        </div>
                        <span className="text-xs text-text-muted mt-0.5 block">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Dietary Foundation
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "veg", label: "Vegetarian" },
                      { id: "egg", label: "Eggetarian" },
                      { id: "non_veg", label: "Non-Veg" },
                      { id: "vegan", label: "Vegan" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, diet: d.id as DietType })}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          formData.diet === d.id
                            ? "border-accent-gold bg-accent-gold text-stone-950"
                            : "border-border-base hover:border-accent-gold/40 bg-bg-surface text-text-primary"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wake & Sleep Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Wake Time
                    </label>
                    <input
                      type="time"
                      value={formData.wakeTime}
                      onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold text-text-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Sleep Time
                    </label>
                    <input
                      type="time"
                      value={formData.sleepTime}
                      onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold text-text-primary text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: GOALS, PACE & JUNK BUDGET */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Health Goal */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Primary Ascent Goal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "lose_fat",
                        title: "Lose Fat",
                        desc: "Targeted calorie deficit preserving lean muscle",
                        disabled: formData.age < 18 || bmi < 18.5,
                      },
                      {
                        id: "build_muscle",
                        title: "Build Muscle",
                        desc: "Hypertrophy surplus (+250 kcal) + 2.0g/kg protein",
                        disabled: false,
                      },
                      {
                        id: "maintain",
                        title: "Maintain Weight",
                        desc: "Energy balance at full metabolic expenditure",
                        disabled: false,
                      },
                      {
                        id: "eat_healthier",
                        title: "Eat Healthier & Energize",
                        desc: "Optimize micronutrients, fiber, and clean vitality",
                        disabled: false,
                      },
                    ].map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          if (!g.disabled) {
                            setFormData({ ...formData, goal: g.id as HealthGoal });
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all ${
                          g.disabled
                            ? "opacity-40 cursor-not-allowed border-border-base bg-bg-surface/30"
                            : formData.goal === g.id
                            ? "border-accent-gold bg-accent-gold/10 cursor-pointer"
                            : "border-border-base hover:border-accent-gold/40 bg-bg-surface cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-text-primary">
                            {g.title}
                          </span>
                          {formData.goal === g.id && (
                            <Check className="w-4 h-4 text-accent-gold" />
                          )}
                        </div>
                        <span className="text-xs text-text-muted mt-0.5 block">{g.desc}</span>
                      </div>
                    ))}
                  </div>

                  {!safetyCheck.allowed && (
                    <div className="p-3 mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{safetyCheck.message}</span>
                    </div>
                  )}
                </div>

                {/* Pace (if fat loss selected) */}
                {formData.goal === "lose_fat" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                      Deficit Pace
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setFormData({ ...formData, pace: "gentle" })}
                        className={`p-3 rounded-xl border cursor-pointer text-center ${
                          formData.pace === "gentle"
                            ? "border-accent-gold bg-accent-gold/10 font-bold"
                            : "border-border-base bg-bg-surface text-text-secondary"
                        }`}
                      >
                        <span className="text-sm block">Gentle (-300 kcal)</span>
                        <span className="text-[11px] text-text-muted">Maximum sustainability</span>
                      </div>
                      <div
                        onClick={() => setFormData({ ...formData, pace: "standard" })}
                        className={`p-3 rounded-xl border cursor-pointer text-center ${
                          formData.pace === "standard"
                            ? "border-accent-gold bg-accent-gold/10 font-bold"
                            : "border-border-base bg-bg-surface text-text-secondary"
                        }`}
                      >
                        <span className="text-sm block">Standard (-500 kcal)</span>
                        <span className="text-[11px] text-text-muted">Steady fat mobilization</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly Junk Budget */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Weekly Treat / Junk Budget
                    </label>
                    <span className="text-xs font-bold text-accent-gold font-mono">
                      {formData.junkBudgetPerWeek ?? 3} treats / week
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={formData.junkBudgetPerWeek ?? 3}
                    onChange={(e) =>
                      setFormData({ ...formData, junkBudgetPerWeek: parseInt(e.target.value) })
                    }
                    className="w-full accent-accent-gold cursor-pointer"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Guilt-free indulgence allowance tracked by Dionysus without shaming.
                  </p>
                </div>

                {/* Allergies / Dislikes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Allergies or Dislikes
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAllergy();
                        }
                      }}
                      placeholder="e.g. peanuts, dairy, gluten, shellfish"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-bg-surface border border-border-base focus:border-accent-gold text-text-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="px-4 py-2.5 rounded-xl bg-accent-gold text-stone-950 font-bold text-xs"
                    >
                      Add Tag
                    </button>
                  </div>
                  {formData.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.allergies.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-accent-gold/15 text-accent-gold text-xs flex items-center gap-1 border border-accent-gold/30"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeAllergy(tag)}
                            className="hover:text-red-400 font-bold text-sm leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: TARGET REVELATION & OVERRIDE */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Header Badge */}
                <div className="p-4 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center text-accent-gold shrink-0">
                    <AthenaIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-text-primary">
                      Athena&apos;s Prescribed Macro Blueprint
                    </h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      BMR: <strong>{computed.bmr} kcal</strong> • TDEE:{" "}
                      <strong>{computed.tdee} kcal</strong> • Safety Floor:{" "}
                      <strong>
                        {formData.sex === "male" ? "1500 kcal (Male)" : "1200 kcal (Female)"}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Macro Tiles with Editable Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted block">
                      Daily Energy
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={customCalories ?? computed.calories}
                        onChange={(e) => setCustomCalories(parseInt(e.target.value) || 0)}
                        className="w-24 font-serif font-black text-2xl text-accent-gold bg-transparent border-b border-accent-gold/40 focus:outline-none"
                      />
                      <span className="text-xs text-text-muted">kcal</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted block">
                      Protein Target
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={customProtein ?? computed.proteinG}
                        onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                        className="w-20 font-serif font-black text-2xl text-text-primary bg-transparent border-b border-border-base focus:border-accent-gold focus:outline-none"
                      />
                      <span className="text-xs text-text-muted">grams</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted block">
                      Carbohydrates
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={customCarbs ?? computed.carbsG}
                        onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                        className="w-20 font-serif font-black text-2xl text-text-primary bg-transparent border-b border-border-base focus:border-accent-gold focus:outline-none"
                      />
                      <span className="text-xs text-text-muted">grams</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted block">
                      Healthy Fats (27%)
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={customFat ?? computed.fatG}
                        onChange={(e) => setCustomFat(parseInt(e.target.value) || 0)}
                        className="w-20 font-serif font-black text-2xl text-text-primary bg-transparent border-b border-border-base focus:border-accent-gold focus:outline-none"
                      />
                      <span className="text-xs text-text-muted">grams</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted block">
                      Prebiotic Fiber
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={customFiber ?? computed.fiberG}
                        onChange={(e) => setCustomFiber(parseInt(e.target.value) || 0)}
                        className="w-20 font-serif font-black text-2xl text-text-primary bg-transparent border-b border-border-base focus:border-accent-gold focus:outline-none"
                      />
                      <span className="text-xs text-text-muted">grams</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bg-surface-elevated border border-border-base">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted block">
                      Target Hydration
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <input
                        type="number"
                        value={customWater ?? computed.waterMl}
                        onChange={(e) => setCustomWater(parseInt(e.target.value) || 0)}
                        className="w-24 font-serif font-black text-2xl text-cyan-400 bg-transparent border-b border-cyan-400/40 focus:outline-none"
                      />
                      <span className="text-xs text-text-muted">ml</span>
                    </div>
                  </div>
                </div>

                {/* Plain-Language Explanations */}
                <div className="space-y-2 text-xs text-text-secondary border-t border-border-base pt-4">
                  <span className="font-bold text-text-primary uppercase tracking-wider block">
                    Strategic Breakdown
                  </span>
                  {computed.explanation.map((exp, i) => (
                    <p key={i} className="flex items-start gap-1.5">
                      <span className="text-accent-gold mt-0.5">•</span>
                      <span>{exp}</span>
                    </p>
                  ))}
                  {computed.warnings.map((warn, i) => (
                    <p key={i} className="text-amber-300 font-medium flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Navigation Footer */}
          <div className="flex items-center justify-between pt-8 border-t border-border-base mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel border border-border-base hover:border-accent-gold text-text-secondary flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                Continue Trial <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-7 py-3 rounded-xl text-sm font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 flex items-center gap-2 transition-all shadow-lg shadow-accent-gold/25 active:scale-95"
              >
                <Check className="w-4 h-4" /> Seal Olympian Targets
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
