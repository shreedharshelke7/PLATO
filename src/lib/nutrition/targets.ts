export type Sex = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";

export type HealthGoal =
  | "lose_fat"
  | "maintain"
  | "build_muscle"
  | "eat_healthier";

export type GoalPace = "gentle" | "standard";

export type DietType = "veg" | "egg" | "non_veg" | "vegan";

export interface UserProfileInput {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  goalWeightKg?: number;
  activityLevel: ActivityLevel;
  goal: HealthGoal;
  pace: GoalPace;
  diet: DietType;
  wakeTime: string; // "HH:MM" e.g. "07:00"
  sleepTime: string; // "HH:MM" e.g. "23:00"
  allergies: string[];
  junkBudgetPerWeek?: number;
}

export interface ComputedTargets {
  bmr: number;
  tdee: number;
  bmi: number;
  bmiCategory: "underweight" | "normal" | "overweight" | "obese";
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
  explanation: string[];
  warnings: string[];
  safetyFloorApplied: boolean;
}

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 */
export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
}): number {
  const { weightKg, heightCm, age, sex } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (sex === "male") {
    return Math.round(base + 5);
  } else if (sex === "female") {
    return Math.round(base - 161);
  } else {
    // For "other", take the biological midpoint
    return Math.round(base - 78);
  }
}

/**
 * Calculates Total Daily Energy Expenditure.
 */
export function calculateTDEE(params: {
  bmr: number;
  activityLevel: ActivityLevel;
}): number {
  const factor = ACTIVITY_FACTORS[params.activityLevel] ?? 1.2;
  return Math.round(params.bmr * factor);
}

/**
 * Calculates BMI and category.
 */
export function calculateBMI(params: {
  weightKg: number;
  heightCm: number;
}): { bmi: number; category: "underweight" | "normal" | "overweight" | "obese" } {
  const heightM = params.heightCm / 100;
  if (heightM <= 0) return { bmi: 0, category: "underweight" };
  const bmi = Number((params.weightKg / (heightM * heightM)).toFixed(1));
  let category: "underweight" | "normal" | "overweight" | "obese" = "normal";

  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";

  return { bmi, category };
}

/**
 * Validates goals against safety restrictions.
 */
export function validateSafetyRestrictions(params: {
  age: number;
  bmi: number;
  goal: HealthGoal;
}): { allowed: boolean; message?: string } {
  const { age, bmi, goal } = params;

  if (age < 18 && goal === "lose_fat") {
    return {
      allowed: false,
      message:
        "For growing warriors under 18, fat loss targets are restricted. Focus on nourishment, muscle building, or athletic vitality alongside a doctor or parent.",
    };
  }

  if (bmi < 18.5 && goal === "lose_fat") {
    return {
      allowed: false,
      message:
        "Your current BMI indicates you are already below standard weight (underweight). Calorie restriction is not recommended. Let's aim to nourish or build muscle.",
    };
  }

  return { allowed: true };
}

/**
 * Calculates full daily targets with safety floors and macro distributions.
 */
export function calculateTargets(profile: UserProfileInput): ComputedTargets {
  const bmr = calculateBMR({
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    age: profile.age,
    sex: profile.sex,
  });

  const tdee = calculateTDEE({
    bmr,
    activityLevel: profile.activityLevel,
  });

  const { bmi, category: bmiCategory } = calculateBMI({
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
  });

  const warnings: string[] = [];
  const explanation: string[] = [];

  // Goal adjustments
  let targetCalories = tdee;

  if (profile.goal === "lose_fat") {
    // Check safety
    if (bmi < 18.5) {
      warnings.push("Calorie deficit disallowed: your BMI is below 18.5. Maintaining TDEE.");
      targetCalories = tdee;
    } else if (profile.age < 18) {
      warnings.push("Deficit disallowed for age under 18. Maintaining vitality TDEE.");
      targetCalories = tdee;
    } else {
      const deficit = profile.pace === "gentle" ? 300 : 500;
      targetCalories = tdee - deficit;
      explanation.push(
        `Caloric deficit of ${deficit} kcal (${profile.pace} pace) applied from your TDEE of ${tdee} kcal.`
      );
    }
  } else if (profile.goal === "build_muscle") {
    targetCalories = tdee + 250;
    explanation.push(`Caloric surplus of 250 kcal applied to fuel muscular hypertrophy.`);
  } else {
    explanation.push(`Maintaining daily energy balance at your TDEE of ${tdee} kcal.`);
  }

  // Safety floor check: Male min 1500 kcal, Female/Other min 1200 kcal
  const minFloor = profile.sex === "male" ? 1500 : 1200;
  let safetyFloorApplied = false;

  if (targetCalories < minFloor) {
    targetCalories = minFloor;
    safetyFloorApplied = true;
    warnings.push(
      `Safety floor activated: calories clamped to ${minFloor} kcal to preserve hormonal and metabolic health.`
    );
  }

  // Protein targets
  // lose: 1.8 g/kg, build: 2.0 g/kg, otherwise: 1.4 g/kg
  let proteinFactor = 1.4;
  if (profile.goal === "lose_fat") proteinFactor = 1.8;
  else if (profile.goal === "build_muscle") proteinFactor = 2.0;

  const proteinG = Math.round(profile.weightKg * proteinFactor);
  const proteinCalories = proteinG * 4;

  // Fat targets: 27% of total calories (9 kcal/g)
  const fatCalories = targetCalories * 0.27;
  const fatG = Math.round(fatCalories / 9);

  // Carbs: remaining calories (4 kcal/g)
  const remainingCarbCalories = Math.max(0, targetCalories - proteinCalories - fatG * 9);
  const carbsG = Math.round(remainingCarbCalories / 4);

  // Fiber: max(25, 14 g per 1000 kcal)
  const fiberG = Math.max(25, Math.round((14 * targetCalories) / 1000));

  // Water: 35 ml/kg + 400 ml if active or athlete
  const isActive = profile.activityLevel === "active" || profile.activityLevel === "athlete";
  const waterMl = Math.round(profile.weightKg * 35 + (isActive ? 400 : 0));

  explanation.push(
    `Protein set at ${proteinFactor} g/kg (${proteinG}g) to protect and synthesize lean mass.`,
    `Fats set at 27% of calories (${fatG}g) for hormonal balance; remaining calories allocated to energizing carbohydrates (${carbsG}g).`,
    `Fiber target of ${fiberG}g set for optimal gut microbiome digestion.`,
    `Hydration calculated at ${waterMl} ml based on ${profile.weightKg}kg mass${isActive ? " plus active athlete boost" : ""}.`
  );

  return {
    bmr,
    tdee,
    bmi,
    bmiCategory,
    calories: targetCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    waterMl,
    explanation,
    warnings,
    safetyFloorApplied,
  };
}

/**
 * Proportionally scales nutrition when portion changes.
 */
export function scaleNutrients<T extends { calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number }>(
  item: T,
  ratio: number
): T {
  return {
    ...item,
    calories: Math.max(0, Math.round(item.calories * ratio)),
    protein_g: Math.max(0, Number((item.protein_g * ratio).toFixed(1))),
    carbs_g: Math.max(0, Number((item.carbs_g * ratio).toFixed(1))),
    fat_g: Math.max(0, Number((item.fat_g * ratio).toFixed(1))),
    fiber_g: Math.max(0, Number((item.fiber_g * ratio).toFixed(1))),
  };
}

export interface WaterSlot {
  timeStr: string; // e.g. "09:00"
  targetCumulativeMl: number;
  slotAmountMl: number;
  isCompleted: boolean;
}

/**
 * Splits daily water requirement across waking hours into hourly or bi-hourly slots.
 */
export function calculateWaterSchedule(
  dailyTargetMl: number,
  wakeTime: string, // "07:00"
  sleepTime: string, // "23:00"
  loggedWaterMl: number
): WaterSlot[] {
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);
  const [sleepH, sleepM] = sleepTime.split(":").map(Number);

  const wakeMinutes = (wakeH || 7) * 60 + (wakeM || 0);
  let sleepMinutes = (sleepH || 23) * 60 + (sleepM || 0);

  if (sleepMinutes <= wakeMinutes) {
    sleepMinutes += 24 * 60; // Crosses midnight
  }

  const activeHours = Math.max(4, Math.floor((sleepMinutes - wakeMinutes) / 60));
  // 6 to 8 intervals through the day
  const numSlots = Math.min(8, Math.max(4, Math.floor(activeHours / 2)));
  const intervalMinutes = Math.floor((sleepMinutes - wakeMinutes) / numSlots);
  const perSlot = Math.round(dailyTargetMl / numSlots);

  const slots: WaterSlot[] = [];
  let cumulative = 0;

  for (let i = 1; i <= numSlots; i++) {
    cumulative = Math.min(dailyTargetMl, i * perSlot);
    const slotMinutes = (wakeMinutes + i * intervalMinutes) % (24 * 60);
    const h = Math.floor(slotMinutes / 60);
    const m = slotMinutes % 60;
    const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

    slots.push({
      timeStr,
      targetCumulativeMl: cumulative,
      slotAmountMl: perSlot,
      isCompleted: loggedWaterMl >= cumulative,
    });
  }

  return slots;
}
