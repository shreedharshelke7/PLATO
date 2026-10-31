export interface GoalTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
}

/**
 * Standard adult default targets when no personal goal is active.
 * General adult averages: 2000 kcal, 60g protein, 25g fiber, 2500ml water.
 */
export const DEFAULT_TARGETS: GoalTargets = {
  calories: 2000,
  protein_g: 60,
  carbs_g: 250,
  fat_g: 65,
  fiber_g: 25,
  water_ml: 2500,
};

/**
 * Normalizes goal targets into both camelCase and snake_case properties
 * so components consuming either can work seamlessly without disruption.
 */
export function normalizeTargets(t?: Partial<GoalTargets> | null): {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
} {
  const calories = t?.calories ?? DEFAULT_TARGETS.calories;
  const protein_g = t?.protein_g ?? DEFAULT_TARGETS.protein_g;
  const carbs_g = t?.carbs_g ?? DEFAULT_TARGETS.carbs_g;
  const fat_g = t?.fat_g ?? DEFAULT_TARGETS.fat_g;
  const fiber_g = t?.fiber_g ?? DEFAULT_TARGETS.fiber_g;
  const water_ml = t?.water_ml ?? DEFAULT_TARGETS.water_ml;

  return {
    calories,
    protein_g,
    carbs_g,
    fat_g,
    fiber_g,
    water_ml,
    proteinG: protein_g,
    carbsG: carbs_g,
    fatG: fat_g,
    fiberG: fiber_g,
    waterMl: water_ml,
  };
}
