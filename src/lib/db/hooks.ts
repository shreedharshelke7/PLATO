"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useState, useEffect } from "react";
import {
  db,
  DBProfile,
  DBGoal,
  GoalType,
  DBMeal,
  DBMealItem,
  DBWaterLog,
  DBWeightLog,
  DBFavorite,
  DBSettings,
  XPEventType,
  MealType,
  isIndexedDBAvailable,
} from "./db";
import { UserProfileInput, calculateTargets } from "../nutrition/targets";
import { notifyDataChanged, pushImmediate } from "../sync/syncEngine";
import { normalizeTargets, GoalTargets } from "../nutrition/defaults";

// Hook to check IndexedDB health / private mode
export function useDBStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    isIndexedDBAvailable().then(setIsAvailable);
  }, []);

  return { isAvailable };
}

// Hook for User Profile
export function useProfile() {
  const rawProfile = useLiveQuery(
    async () => {
      const p = await db.profile.get("current");
      return p ?? null;
    },
    [],
    undefined
  );
  const profile = rawProfile && !rawProfile.deleted ? rawProfile : null;
  const isLoading = rawProfile === undefined;

  const saveProfile = async (input: UserProfileInput) => {
    const targets = calculateTargets(input);
    const now = Date.now();
    const fullProfile: DBProfile = {
      ...input,
      id: "current",
      targets,
      createdAt: profile?.createdAt ?? now,
      updatedAt: now,
      deleted: false,
    };
    await db.profile.put(fullProfile);
    notifyDataChanged();
    pushImmediate().catch(() => {});
    return fullProfile;
  };

  const updateProfileTargets = async (customTargets: Partial<DBProfile["targets"]>) => {
    if (!profile) return;
    const updated: DBProfile = {
      ...profile,
      targets: {
        ...profile.targets,
        ...customTargets,
      },
      updatedAt: Date.now(),
      deleted: false,
    };
    await db.profile.put(updated);
    notifyDataChanged();
    pushImmediate().catch(() => {});
  };

  return {
    profile,
    isLoading,
    saveProfile,
    updateProfileTargets,
    hasProfile: Boolean(profile),
  };
}

// Hook for Multiple Health Goals
export function useGoals() {
  const rawGoals = useLiveQuery(
    () => db.goals.filter((g) => !g.deleted).toArray(),
    [],
    undefined
  );

  const isLoading = rawGoals === undefined;
  const goals = (rawGoals ?? []).sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });

  const activeGoal = goals.find((g) => g.isActive && !g.archived) ?? null;
  const targets = normalizeTargets(activeGoal?.targets);
  const hasActiveGoal = Boolean(activeGoal);

  const createGoal = async (data: {
    name: string;
    type: GoalType;
    targets: GoalTargets;
    startWeightKg?: number;
    targetWeightKg?: number;
    targetDate?: string;
    pace?: "gentle" | "standard";
    notes?: string;
    setActive?: boolean;
  }) => {
    const now = Date.now();
    const id = `goal_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const isFirstGoal = goals.length === 0;
    const shouldBeActive = data.setActive ?? isFirstGoal;

    if (shouldBeActive) {
      await db.goals.toCollection().modify((g) => {
        if (g.isActive) {
          g.isActive = false;
          g.updatedAt = now;
        }
      });
    }

    const newGoal: DBGoal = {
      id,
      name: data.name.trim(),
      type: data.type,
      isActive: shouldBeActive,
      targets: data.targets,
      startWeightKg: data.startWeightKg,
      targetWeightKg: data.targetWeightKg,
      targetDate: data.targetDate,
      pace: data.pace,
      notes: data.notes,
      archived: false,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };

    await db.goals.put(newGoal);

    // Award XP event for Goal Created (+10 XP)
    await db.xpEvents.put({
      id: `xp_goal_${id}`,
      type: "goal_created",
      xp: 10,
      description: `Health goal forged: ${newGoal.name}`,
      timestamp: now,
      updatedAt: now,
      deleted: false,
    });

    notifyDataChanged();
    pushImmediate().catch(() => {});
    return newGoal;
  };

  const setActiveGoal = async (goalId: string) => {
    const now = Date.now();
    await db.transaction("rw", db.goals, async () => {
      const all = await db.goals.toArray();
      for (const g of all) {
        if (g.id === goalId) {
          await db.goals.update(g.id, {
            isActive: true,
            archived: false,
            updatedAt: now,
          });
        } else if (g.isActive) {
          await db.goals.update(g.id, {
            isActive: false,
            updatedAt: now,
          });
        }
      }
    });
    notifyDataChanged();
    pushImmediate().catch(() => {});
  };

  const updateGoal = async (
    goalId: string,
    updates: Partial<Omit<DBGoal, "id" | "createdAt">>
  ) => {
    const now = Date.now();
    await db.goals.update(goalId, {
      ...updates,
      updatedAt: now,
    });
    notifyDataChanged();
    pushImmediate().catch(() => {});
  };

  const archiveGoal = async (goalId: string) => {
    const now = Date.now();
    await db.transaction("rw", db.goals, async () => {
      const target = await db.goals.get(goalId);
      if (!target) return;

      await db.goals.update(goalId, {
        archived: true,
        isActive: false,
        updatedAt: now,
      });

      if (target.isActive) {
        const remaining = await db.goals
          .filter((g) => !g.deleted && !g.archived && g.id !== goalId)
          .reverse()
          .sortBy("createdAt");
        if (remaining.length > 0) {
          await db.goals.update(remaining[0].id, {
            isActive: true,
            updatedAt: now,
          });
        }
      }
    });
    notifyDataChanged();
    pushImmediate().catch(() => {});
  };

  const deleteGoal = async (goalId: string) => {
    const now = Date.now();
    let wasActive = false;
    await db.transaction("rw", db.goals, async () => {
      const target = await db.goals.get(goalId);
      if (!target) return;
      wasActive = target.isActive;

      await db.goals.update(goalId, {
        deleted: true,
        isActive: false,
        updatedAt: now,
      });

      if (wasActive) {
        const remaining = await db.goals
          .filter((g) => !g.deleted && !g.archived && g.id !== goalId)
          .reverse()
          .sortBy("createdAt");
        if (remaining.length > 0) {
          await db.goals.update(remaining[0].id, {
            isActive: true,
            updatedAt: now,
          });
        }
      }
    });

    notifyDataChanged();
    pushImmediate().catch(() => {});

    return async function undo() {
      await db.transaction("rw", db.goals, async () => {
        await db.goals.update(goalId, {
          deleted: false,
          isActive: wasActive,
          updatedAt: Date.now(),
        });
        if (wasActive) {
          const others = await db.goals
            .filter((g) => g.id !== goalId && g.isActive)
            .toArray();
          for (const o of others) {
            await db.goals.update(o.id, {
              isActive: false,
              updatedAt: Date.now(),
            });
          }
        }
      });
      notifyDataChanged();
      pushImmediate().catch(() => {});
    };
  };

  return {
    goals,
    activeGoal,
    targets,
    hasActiveGoal,
    isLoading,
    createGoal,
    setActiveGoal,
    updateGoal,
    archiveGoal,
    deleteGoal,
  };
}

// Hook for Settings
export const DEFAULT_SETTINGS: DBSettings = {
  id: "global",
  theme: "auto",
  reminderIntervalMinutes: 120,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  remindersEnabled: false,
  soundEnabled: true,
  units: "metric",
  updatedAt: 0,
};

export function useSettings() {
  const settings = useLiveQuery(async () => {
    const s = await db.settings.get("global");
    return s ?? DEFAULT_SETTINGS;
  });

  const updateSettings = async (updates: Partial<DBSettings>) => {
    const current = settings ?? DEFAULT_SETTINGS;
    const updated = {
      ...current,
      ...updates,
      id: "global" as const,
      updatedAt: Date.now(),
    };
    await db.settings.put(updated);
    notifyDataChanged();

    if (updates.theme) {
      try {
        localStorage.setItem("ambrosia_theme", updates.theme);
        if (updates.theme === "auto") {
          const hour = new Date().getHours();
          const autoTheme = hour >= 6 && hour < 18 ? "marble" : "obsidian";
          document.documentElement.setAttribute("data-theme", autoTheme);
        } else if (updates.theme === "olympus") {
          document.documentElement.setAttribute("data-theme", "marble");
        } else if (updates.theme === "poseidon") {
          document.documentElement.setAttribute("data-theme", "aegean");
        } else if (updates.theme === "nyx") {
          document.documentElement.setAttribute("data-theme", "obsidian");
        } else if (updates.theme === "athena") {
          document.documentElement.setAttribute("data-theme", "amethyst");
        } else {
          document.documentElement.setAttribute("data-theme", updates.theme);
        }
      } catch {
        // ignore localStorage error
      }
    }
    return updated;
  };

  return {
    settings: settings ?? DEFAULT_SETTINGS,
    updateSettings,
    isLoading: settings === undefined,
  };
}

// Hook for Meals for a given date
export function useMeals(dateStr: string) {
  const meals = useLiveQuery(
    () => db.meals.where("date").equals(dateStr).filter((m) => !m.deleted).toArray(),
    [dateStr]
  );

  const mealItems = useLiveQuery(async () => {
    if (!meals || meals.length === 0) return [];
    const mealIds = meals.map((m) => m.id);
    return db.mealItems
      .where("mealId")
      .anyOf(mealIds)
      .filter((item) => !item.deleted)
      .toArray();
  }, [meals]);

  const addMeal = async (params: {
    mealType: MealType;
    name: string;
    items: Omit<DBMealItem, "id" | "mealId">[];
    isJunkOrTreat?: boolean;
  }) => {
    const now = Date.now();
    const mealId = `meal_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const totalCalories = params.items.reduce((s, i) => s + i.calories, 0);
    const totalProtein = Number(params.items.reduce((s, i) => s + i.protein_g, 0).toFixed(1));
    const totalCarbs = Number(params.items.reduce((s, i) => s + i.carbs_g, 0).toFixed(1));
    const totalFat = Number(params.items.reduce((s, i) => s + i.fat_g, 0).toFixed(1));
    const totalFiber = Number(params.items.reduce((s, i) => s + i.fiber_g, 0).toFixed(1));

    const newMeal: DBMeal = {
      id: mealId,
      date: dateStr,
      mealType: params.mealType,
      name: params.name || `${params.mealType.charAt(0).toUpperCase() + params.mealType.slice(1)} Feast`,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      isJunkOrTreat: params.isJunkOrTreat,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };

    const newItems: DBMealItem[] = params.items.map((item, idx) => ({
      ...item,
      id: `item_${now}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
      mealId,
      updatedAt: now,
      deleted: false,
    }));

    await db.transaction("rw", db.meals, db.mealItems, db.xpEvents, async () => {
      await db.meals.put(newMeal);
      await db.mealItems.bulkPut(newItems);
      // Award XP for logging a meal
      await db.xpEvents.put({
        id: `xp_${now}`,
        type: params.isJunkOrTreat ? "swap" : "meal",
        xp: 10,
        description: `Logged ${newMeal.name}`,
        timestamp: now,
        updatedAt: now,
        deleted: false,
      });
    });

    notifyDataChanged();
    return newMeal;
  };

  const deleteMeal = async (mealId: string) => {
    const now = Date.now();
    await db.transaction("rw", db.meals, db.mealItems, async () => {
      await db.meals.update(mealId, { deleted: true, updatedAt: now });
      const itemsToSoftDelete = await db.mealItems.where("mealId").equals(mealId).toArray();
      if (itemsToSoftDelete.length > 0) {
        await db.mealItems.bulkPut(
          itemsToSoftDelete.map((i) => ({ ...i, deleted: true, updatedAt: now }))
        );
      }
    });
    notifyDataChanged();
  };

  const copyYesterdayMeals = async (targetDateStr: string, yesterdayDateStr: string) => {
    const yesterdayMeals = await db.meals
      .where("date")
      .equals(yesterdayDateStr)
      .filter((m) => !m.deleted)
      .toArray();

    if (!yesterdayMeals || yesterdayMeals.length === 0) return 0;

    for (const ym of yesterdayMeals) {
      const items = await db.mealItems
        .where("mealId")
        .equals(ym.id)
        .filter((i) => !i.deleted)
        .toArray();

      await addMeal({
        mealType: ym.mealType,
        name: ym.name,
        isJunkOrTreat: ym.isJunkOrTreat,
        items: items.map((item) => ({
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
        })),
      });
    }
    return yesterdayMeals.length;
  };

  const totals = {
    calories: meals?.reduce((s, m) => s + m.totalCalories, 0) ?? 0,
    protein: Number((meals?.reduce((s, m) => s + m.totalProtein, 0) ?? 0).toFixed(1)),
    carbs: Number((meals?.reduce((s, m) => s + m.totalCarbs, 0) ?? 0).toFixed(1)),
    fat: Number((meals?.reduce((s, m) => s + m.totalFat, 0) ?? 0).toFixed(1)),
    fiber: Number((meals?.reduce((s, m) => s + m.totalFiber, 0) ?? 0).toFixed(1)),
  };

  return {
    meals: meals ?? [],
    mealItems: mealItems ?? [],
    totals,
    isLoading: meals === undefined,
    addMeal,
    deleteMeal,
    copyYesterdayMeals,
  };
}

// Hook for Water Logs
export function useWater(dateStr: string) {
  const waterLogs = useLiveQuery(
    () => db.waterLogs.where("date").equals(dateStr).filter((w) => !w.deleted).toArray(),
    [dateStr]
  );

  const totalWaterMl = waterLogs?.reduce((sum, item) => sum + item.amountMl, 0) ?? 0;

  const addWater = async (amountMl: number) => {
    const now = Date.now();
    const log: DBWaterLog = {
      id: `water_${now}_${Math.random().toString(36).slice(2, 6)}`,
      date: dateStr,
      amountMl,
      timestamp: now,
      updatedAt: now,
      deleted: false,
    };
    await db.waterLogs.put(log);

    // Award XP (+5 per 250-500ml)
    if (amountMl >= 250) {
      await db.xpEvents.put({
        id: `xp_water_${now}`,
        type: "water",
        xp: 5,
        description: `Hydrated with ${amountMl} ml of water`,
        timestamp: now,
        updatedAt: now,
        deleted: false,
      });
    }
    notifyDataChanged();
    return log;
  };

  const undoWater = async () => {
    if (!waterLogs || waterLogs.length === 0) return;
    const last = waterLogs.sort((a, b) => b.timestamp - a.timestamp)[0];
    if (last) {
      await db.waterLogs.update(last.id, { deleted: true, updatedAt: Date.now() });
      notifyDataChanged();
    }
  };

  return {
    waterLogs: waterLogs ?? [],
    totalWaterMl,
    addWater,
    undoWater,
    isLoading: waterLogs === undefined,
  };
}

// Hook for XP and Gamification
export function useXP() {
  const events = useLiveQuery(() =>
    db.xpEvents.orderBy("timestamp").filter((e) => !e.deleted).reverse().toArray()
  );
  const allMeals = useLiveQuery(() => db.meals.filter((m) => !m.deleted).toArray());
  const allWater = useLiveQuery(() => db.waterLogs.filter((w) => !w.deleted).toArray());

  const totalXP = events?.reduce((sum, e) => sum + e.xp, 0) ?? 0;
  const totalWaterLoggedMl = allWater?.reduce((sum, w) => sum + w.amountMl, 0) ?? 0;

  // Compute streaks
  const uniqueDates = Array.from(new Set(allMeals?.map((m) => m.date) ?? [])).sort().reverse();

  const [dateInfo, setDateInfo] = useState({ todayStr: "", yesterday: "" });

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yStr = yesterdayDate.toISOString().split("T")[0];
    setDateInfo({ todayStr: today, yesterday: yStr });
  }, []);

  let streakDays = 0;
  if (dateInfo.todayStr && (uniqueDates.includes(dateInfo.todayStr) || uniqueDates.includes(dateInfo.yesterday))) {
    let checkDate = new Date(uniqueDates[0]);
    streakDays = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const diffDays = Math.round(
        (checkDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        streakDays++;
        checkDate = prevDate;
      } else {
        break;
      }
    }
  }

  // Breakfast streak
  const breakfastMeals = allMeals?.filter((m) => m.mealType === "breakfast") ?? [];
  const breakfastDates = Array.from(new Set(breakfastMeals.map((m) => m.date))).sort().reverse();
  let breakfastStreak = 0;
  if (dateInfo.todayStr && (breakfastDates.includes(dateInfo.todayStr) || breakfastDates.includes(dateInfo.yesterday))) {
    let checkDate = new Date(breakfastDates[0]);
    breakfastStreak = 1;
    for (let i = 1; i < breakfastDates.length; i++) {
      const prevDate = new Date(breakfastDates[i]);
      const diffDays = Math.round(
        (checkDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        breakfastStreak++;
        checkDate = prevDate;
      } else {
        break;
      }
    }
  }

  const totalSwapsLogged = allMeals?.filter((m) => m.isJunkOrTreat).length ?? 0;

  const awardXP = async (type: XPEventType, xp: number, description: string) => {
    const now = Date.now();
    await db.xpEvents.put({
      id: `xp_${now}_${Math.random().toString(36).slice(2, 5)}`,
      type,
      xp,
      description,
      timestamp: now,
      updatedAt: now,
      deleted: false,
    });
    notifyDataChanged();
  };

  return {
    totalXP,
    streakDays,
    breakfastStreak,
    totalWaterLoggedMl,
    totalSwapsLogged,
    events: events ?? [],
    awardXP,
  };
}

// Hook for Weight Logs
export function useWeight() {
  const weightLogs = useLiveQuery(() =>
    db.weightLogs.orderBy("date").filter((w) => !w.deleted).toArray()
  );

  const addWeight = async (weightKg: number, dateStr: string, note?: string) => {
    const now = Date.now();
    const log: DBWeightLog = {
      id: `weight_${dateStr}_${now}`,
      date: dateStr,
      weightKg,
      note,
      timestamp: now,
      updatedAt: now,
      deleted: false,
    };
    await db.weightLogs.put(log);
    notifyDataChanged();
    return log;
  };

  const deleteWeight = async (id: string) => {
    await db.weightLogs.update(id, { deleted: true, updatedAt: Date.now() });
    notifyDataChanged();
  };

  return {
    weightLogs: weightLogs ?? [],
    addWeight,
    deleteWeight,
    isLoading: weightLogs === undefined,
  };
}

// Hook for Favorites
export function useFavorites() {
  const favorites = useLiveQuery(() =>
    db.favorites.orderBy("createdAt").filter((f) => !f.deleted).reverse().toArray()
  );

  const addFavorite = async (name: string, items: Omit<DBMealItem, "id" | "mealId">[]) => {
    const now = Date.now();
    const totalCalories = items.reduce((s, i) => s + i.calories, 0);
    const totalProtein = Number(items.reduce((s, i) => s + i.protein_g, 0).toFixed(1));
    const totalCarbs = Number(items.reduce((s, i) => s + i.carbs_g, 0).toFixed(1));
    const totalFat = Number(items.reduce((s, i) => s + i.fat_g, 0).toFixed(1));
    const totalFiber = Number(items.reduce((s, i) => s + i.fiber_g, 0).toFixed(1));

    const fav: DBFavorite = {
      id: `fav_${now}`,
      name,
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };
    await db.favorites.put(fav);
    notifyDataChanged();
    return fav;
  };

  const deleteFavorite = async (id: string) => {
    await db.favorites.update(id, { deleted: true, updatedAt: Date.now() });
    notifyDataChanged();
  };

  return {
    favorites: favorites ?? [],
    addFavorite,
    deleteFavorite,
    isLoading: favorites === undefined,
  };
}
