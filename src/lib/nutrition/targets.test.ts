import { describe, it, expect } from "vitest";
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  calculateTargets,
  scaleNutrients,
  calculateWaterSchedule,
  validateSafetyRestrictions,
  UserProfileInput,
} from "./targets";

describe("Nutrition Targets Engine", () => {
  it("calculates Mifflin-St Jeor BMR correctly for male and female", () => {
    // 70kg, 175cm, 25yo male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    const maleBmr = calculateBMR({ weightKg: 70, heightCm: 175, age: 25, sex: "male" });
    expect(maleBmr).toBe(1674);

    // 60kg, 165cm, 25yo female: 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345
    const femaleBmr = calculateBMR({ weightKg: 60, heightCm: 165, age: 25, sex: "female" });
    expect(femaleBmr).toBe(1345);
  });

  it("calculates TDEE correctly based on activity factor", () => {
    const tdeeModerate = calculateTDEE({ bmr: 1600, activityLevel: "moderate" });
    expect(tdeeModerate).toBe(Math.round(1600 * 1.55)); // 2480
  });

  it("calculates BMI and classification accurately", () => {
    const normal = calculateBMI({ weightKg: 70, heightCm: 175 });
    expect(normal.bmi).toBe(22.9);
    expect(normal.category).toBe("normal");

    const under = calculateBMI({ weightKg: 45, heightCm: 170 });
    expect(under.bmi).toBe(15.6);
    expect(under.category).toBe("underweight");
  });

  it("enforces safety restrictions for under-18 and underweight individuals", () => {
    const under18 = validateSafetyRestrictions({ age: 16, bmi: 22, goal: "lose_fat" });
    expect(under18.allowed).toBe(false);
    expect(under18.message).toContain("under 18");

    const underweight = validateSafetyRestrictions({ age: 22, bmi: 17.5, goal: "lose_fat" });
    expect(underweight.allowed).toBe(false);
    expect(underweight.message).toContain("underweight");

    const normalAdult = validateSafetyRestrictions({ age: 24, bmi: 24, goal: "lose_fat" });
    expect(normalAdult.allowed).toBe(true);
  });

  it("enforces male minimum calorie safety floor (1500 kcal)", () => {
    const smallMaleProfile: UserProfileInput = {
      name: "Alex",
      age: 40,
      sex: "male",
      heightCm: 155,
      weightKg: 50,
      activityLevel: "sedentary",
      goal: "lose_fat",
      pace: "standard", // -500 kcal
      diet: "veg",
      wakeTime: "07:00",
      sleepTime: "23:00",
      allergies: [],
    };

    const targets = calculateTargets(smallMaleProfile);
    expect(targets.calories).toBeGreaterThanOrEqual(1500);
    expect(targets.safetyFloorApplied).toBe(true);
  });

  it("enforces female minimum calorie safety floor (1200 kcal)", () => {
    const smallFemaleProfile: UserProfileInput = {
      name: "Sophia",
      age: 45,
      sex: "female",
      heightCm: 150,
      weightKg: 45,
      activityLevel: "sedentary",
      goal: "lose_fat",
      pace: "standard",
      diet: "veg",
      wakeTime: "07:00",
      sleepTime: "23:00",
      allergies: [],
    };

    const targets = calculateTargets(smallFemaleProfile);
    expect(targets.calories).toBeGreaterThanOrEqual(1200);
    expect(targets.safetyFloorApplied).toBe(true);
  });

  it("scales nutrients proportionally", () => {
    const original = {
      name: "Roti",
      calories: 120,
      protein_g: 3.5,
      carbs_g: 22.0,
      fat_g: 1.0,
      fiber_g: 2.0,
    };

    // 2 rotis (2x)
    const double = scaleNutrients(original, 2);
    expect(double.calories).toBe(240);
    expect(double.protein_g).toBe(7.0);
    expect(double.carbs_g).toBe(44.0);
    expect(double.fat_g).toBe(2.0);
  });

  it("generates structured water schedules", () => {
    const schedule = calculateWaterSchedule(2400, "08:00", "22:00", 1200);
    expect(schedule.length).toBeGreaterThan(3);
    // At 1200 logged, earlier slots should be marked completed
    expect(schedule[0].isCompleted).toBe(true);
  });

  it("contains rich bundled food database with over 120 items and fuzzy search", async () => {
    const { LOCAL_FOODS, searchLocalFoods } = await import("../../data/foods");
    expect(LOCAL_FOODS.length).toBeGreaterThanOrEqual(120);
    const samosaResults = searchLocalFoods("samosa");
    expect(samosaResults.length).toBeGreaterThan(0);
    expect(samosaResults[0].name).toContain("Samosa");
  });
});
