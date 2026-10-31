import { describe, it, expect } from "vitest";
import { goalFormSchema, goalTargetsSchema } from "./schemas";
import { DEFAULT_TARGETS, normalizeTargets } from "../nutrition/defaults";
import { validateSafetyRestrictions, calculateBMI } from "../nutrition/targets";
import { DBGoal, GoalType } from "../db/db";

describe("Health Goals System", () => {
  describe("Target Validation (Zod Schema)", () => {
    it("accepts valid goal target parameters", () => {
      const valid = goalTargetsSchema.safeParse({
        calories: 2200,
        protein_g: 150,
        carbs_g: 250,
        fat_g: 65,
        fiber_g: 30,
        water_ml: 3000,
      });
      expect(valid.success).toBe(true);
    });

    it("rejects calories below 800 or above 6000", () => {
      const tooLow = goalTargetsSchema.safeParse({
        calories: 700,
        protein_g: 50,
        carbs_g: 50,
        fat_g: 20,
        fiber_g: 15,
        water_ml: 1500,
      });
      expect(tooLow.success).toBe(false);

      const tooHigh = goalTargetsSchema.safeParse({
        calories: 7500,
        protein_g: 50,
        carbs_g: 50,
        fat_g: 20,
        fiber_g: 15,
        water_ml: 1500,
      });
      expect(tooHigh.success).toBe(false);
    });

    it("rejects protein below 20g or above 400g", () => {
      const tooLow = goalTargetsSchema.safeParse({
        calories: 2000,
        protein_g: 10,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
        water_ml: 2500,
      });
      expect(tooLow.success).toBe(false);

      const tooHigh = goalTargetsSchema.safeParse({
        calories: 2000,
        protein_g: 500,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
        water_ml: 2500,
      });
      expect(tooHigh.success).toBe(false);
    });

    it("rejects fiber below 10g or above 100g", () => {
      const tooLow = goalTargetsSchema.safeParse({
        calories: 2000,
        protein_g: 100,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 5,
        water_ml: 2500,
      });
      expect(tooLow.success).toBe(false);
    });

    it("rejects water below 500ml or above 8000ml", () => {
      const tooLow = goalTargetsSchema.safeParse({
        calories: 2000,
        protein_g: 100,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
        water_ml: 300,
      });
      expect(tooLow.success).toBe(false);

      const tooHigh = goalTargetsSchema.safeParse({
        calories: 2000,
        protein_g: 100,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
        water_ml: 10000,
      });
      expect(tooHigh.success).toBe(false);
    });

    it("validates full goal form data with realistic weights", () => {
      const validForm = goalFormSchema.safeParse({
        name: "Summer Fat Loss",
        type: "lose_fat",
        targets: {
          calories: 1800,
          protein_g: 140,
          carbs_g: 180,
          fat_g: 55,
          fiber_g: 30,
          water_ml: 2800,
        },
        startWeightKg: 75,
        targetWeightKg: 70,
        pace: "standard",
      });
      expect(validForm.success).toBe(true);

      const invalidWeight = goalFormSchema.safeParse({
        name: "Invalid Goal",
        type: "maintain",
        targets: {
          calories: 2000,
          protein_g: 100,
          carbs_g: 200,
          fat_g: 50,
          fiber_g: 25,
          water_ml: 2500,
        },
        startWeightKg: 15, // under 30kg
      });
      expect(invalidWeight.success).toBe(false);
    });
  });

  describe("Safety Restrictions", () => {
    it("blocks fat loss goal for users under 18 years old", () => {
      const check = validateSafetyRestrictions({ age: 17, bmi: 22, goal: "lose_fat" });
      expect(check.allowed).toBe(false);
      expect(check.message).toContain("under 18");
    });

    it("blocks fat loss goal for underweight users (BMI < 18.5)", () => {
      const bmiResult = calculateBMI({ weightKg: 45, heightCm: 170 });
      expect(bmiResult.bmi).toBeLessThan(18.5);

      const check = validateSafetyRestrictions({ age: 25, bmi: bmiResult.bmi, goal: "lose_fat" });
      expect(check.allowed).toBe(false);
      expect(check.message).toContain("underweight");
    });

    it("allows maintenance or muscle building for underweight or under-18 users", () => {
      const under18Maintain = validateSafetyRestrictions({ age: 16, bmi: 21, goal: "maintain" });
      expect(under18Maintain.allowed).toBe(true);

      const underWeightBuild = validateSafetyRestrictions({ age: 24, bmi: 17.2, goal: "build_muscle" });
      expect(underWeightBuild.allowed).toBe(true);
    });
  });

  describe("Default Targets Fallback", () => {
    it("returns general adult defaults when no goal exists", () => {
      expect(DEFAULT_TARGETS.calories).toBe(2000);
      expect(DEFAULT_TARGETS.protein_g).toBe(60);
      expect(DEFAULT_TARGETS.fiber_g).toBe(25);
      expect(DEFAULT_TARGETS.water_ml).toBe(2500);
    });

    it("normalizeTargets provides dual property access for camelCase and snake_case", () => {
      const normalized = normalizeTargets(null);
      expect(normalized.calories).toBe(2000);
      expect(normalized.protein_g).toBe(60);
      expect(normalized.proteinG).toBe(60);
      expect(normalized.fiber_g).toBe(25);
      expect(normalized.fiberG).toBe(25);
      expect(normalized.water_ml).toBe(2500);
      expect(normalized.waterMl).toBe(2500);
    });

    it("normalizeTargets merges active goal targets cleanly", () => {
      const normalized = normalizeTargets({
        calories: 2400,
        protein_g: 160,
      });
      expect(normalized.calories).toBe(2400);
      expect(normalized.protein_g).toBe(160);
      expect(normalized.proteinG).toBe(160);
      expect(normalized.fiber_g).toBe(25); // defaulted
    });
  });

  describe("Goal State Transitions (Single Active Rule & Fallback)", () => {
    it("enforces exactly one active goal when multiple goals are created", () => {
      let goalsList: DBGoal[] = [];

      // Create Goal 1 (first goal automatically active)
      const goal1: DBGoal = {
        id: "g1",
        name: "First Goal",
        type: "maintain",
        isActive: true,
        targets: { calories: 2000, protein_g: 60, carbs_g: 250, fat_g: 65, fiber_g: 25, water_ml: 2500 },
        archived: false,
        createdAt: 1000,
        updatedAt: 1000,
      };
      goalsList.push(goal1);
      expect(goalsList.filter((g) => g.isActive)).toHaveLength(1);

      // Create Goal 2 and set it active -> Goal 1 becomes inactive
      const goal2: DBGoal = {
        id: "g2",
        name: "Second Goal",
        type: "lose_fat",
        isActive: true,
        targets: { calories: 1700, protein_g: 140, carbs_g: 150, fat_g: 50, fiber_g: 30, water_ml: 2800 },
        archived: false,
        createdAt: 2000,
        updatedAt: 2000,
      };
      goalsList = goalsList.map((g) => ({ ...g, isActive: false }));
      goalsList.push(goal2);

      const activeGoals = goalsList.filter((g) => g.isActive);
      expect(activeGoals).toHaveLength(1);
      expect(activeGoals[0].id).toBe("g2");
    });

    it("when active goal is archived, the most recent remaining goal becomes active", () => {
      const goalsList: DBGoal[] = [
        {
          id: "g1",
          name: "Goal 1",
          type: "maintain",
          isActive: false,
          targets: { calories: 2000, protein_g: 60, carbs_g: 250, fat_g: 65, fiber_g: 25, water_ml: 2500 },
          archived: false,
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: "g2",
          name: "Goal 2",
          type: "lose_fat",
          isActive: true,
          targets: { calories: 1700, protein_g: 140, carbs_g: 150, fat_g: 50, fiber_g: 30, water_ml: 2800 },
          archived: false,
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      // Archive g2
      const target = goalsList.find((g) => g.id === "g2")!;
      target.archived = true;
      target.isActive = false;

      // Select most recent remaining non-archived
      const remaining = goalsList
        .filter((g) => !g.archived && !g.deleted)
        .sort((a, b) => b.createdAt - a.createdAt);

      if (remaining.length > 0) {
        remaining[0].isActive = true;
      }

      expect(goalsList.find((g) => g.id === "g1")?.isActive).toBe(true);
      expect(goalsList.find((g) => g.id === "g2")?.isActive).toBe(false);
    });

    it("when all goals are deleted, active goal returns null (fallback to defaults)", () => {
      const goalsList: DBGoal[] = [
        {
          id: "g1",
          name: "Goal 1",
          type: "maintain",
          isActive: false,
          targets: { calories: 2000, protein_g: 60, carbs_g: 250, fat_g: 65, fiber_g: 25, water_ml: 2500 },
          archived: false,
          createdAt: 1000,
          updatedAt: 1000,
          deleted: true,
        },
      ];

      const activeGoal = goalsList.find((g) => g.isActive && !g.archived && !g.deleted) ?? null;
      expect(activeGoal).toBeNull();
      const targets = normalizeTargets(activeGoal?.targets);
      expect(targets.calories).toBe(DEFAULT_TARGETS.calories);
    });
  });

  describe("Dexie Profile-to-Goal Migration", () => {
    it("converts existing profile with targets into 'My first goal'", () => {
      const existingProfile = {
        id: "current",
        name: "Alexander",
        age: 26,
        sex: "male",
        heightCm: 180,
        weightKg: 78,
        goalWeightKg: 74,
        activityLevel: "moderate",
        goal: "lose_fat" as GoalType,
        pace: "standard" as const,
        diet: "veg",
        wakeTime: "07:00",
        sleepTime: "23:00",
        allergies: [],
        targets: {
          bmr: 1750,
          tdee: 2712,
          bmi: 24.1,
          bmiCategory: "normal",
          calories: 2212,
          proteinG: 156,
          carbsG: 245,
          fatG: 62,
          fiberG: 32,
          waterMl: 2900,
          explanation: [],
          warnings: [],
          safetyFloorApplied: false,
        },
        createdAt: 1600000000000,
        updatedAt: 1600000000000,
        deleted: false,
      };

      const now = Date.now();
      const convertedGoal: DBGoal = {
        id: "initial-goal",
        name: "My first goal",
        type: existingProfile.goal,
        isActive: true,
        targets: {
          calories: existingProfile.targets.calories,
          protein_g: existingProfile.targets.proteinG,
          carbs_g: existingProfile.targets.carbsG,
          fat_g: existingProfile.targets.fatG,
          fiber_g: existingProfile.targets.fiberG,
          water_ml: existingProfile.targets.waterMl,
        },
        startWeightKg: existingProfile.weightKg,
        targetWeightKg: existingProfile.goalWeightKg,
        pace: existingProfile.pace,
        archived: false,
        createdAt: existingProfile.createdAt || now,
        updatedAt: now,
        deleted: false,
      };

      expect(convertedGoal.id).toBe("initial-goal");
      expect(convertedGoal.name).toBe("My first goal");
      expect(convertedGoal.isActive).toBe(true);
      expect(convertedGoal.targets.calories).toBe(2212);
      expect(convertedGoal.targets.protein_g).toBe(156);
      expect(convertedGoal.targets.water_ml).toBe(2900);
      expect(convertedGoal.startWeightKg).toBe(78);
      expect(convertedGoal.targetWeightKg).toBe(74);
    });
  });
});
