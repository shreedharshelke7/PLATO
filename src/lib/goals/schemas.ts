import { z } from "zod";

export const GoalTypeEnum = z.enum([
  "lose_fat",
  "maintain",
  "build_muscle",
  "eat_healthier",
  "hydration",
  "custom",
]);

export const goalTargetsSchema = z.object({
  calories: z
    .number()
    .min(800, "Calories must be at least 800 kcal")
    .max(6000, "Calories cannot exceed 6000 kcal"),
  protein_g: z
    .number()
    .min(20, "Protein must be at least 20 g")
    .max(400, "Protein cannot exceed 400 g"),
  carbs_g: z
    .number()
    .min(0, "Carbs cannot be negative")
    .max(800, "Carbs cannot exceed 800 g"),
  fat_g: z
    .number()
    .min(0, "Fat cannot be negative")
    .max(300, "Fat cannot exceed 300 g"),
  fiber_g: z
    .number()
    .min(10, "Fiber must be at least 10 g")
    .max(100, "Fiber cannot exceed 100 g"),
  water_ml: z
    .number()
    .min(500, "Water must be at least 500 ml")
    .max(8000, "Water cannot exceed 8000 ml"),
});

export const goalFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Goal name is required")
    .max(60, "Goal name must be 60 characters or fewer"),
  type: GoalTypeEnum,
  targets: goalTargetsSchema,
  startWeightKg: z
    .number()
    .min(30, "Weight must be at least 30 kg")
    .max(350, "Weight cannot exceed 350 kg")
    .optional(),
  targetWeightKg: z
    .number()
    .min(30, "Target weight must be at least 30 kg")
    .max(350, "Target weight cannot exceed 350 kg")
    .optional(),
  targetDate: z.string().optional(),
  pace: z.enum(["gentle", "standard"]).optional(),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;
