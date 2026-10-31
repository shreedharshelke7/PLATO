import Dexie, { type Table } from "dexie";
import { UserProfileInput, ComputedTargets } from "../nutrition/targets";

export interface DBProfile extends UserProfileInput {
  id: string; // "current"
  targets: ComputedTargets;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface DBMealItem {
  id: string;
  mealId: string;
  name: string;
  portionAmount: number;
  portionUnit: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence?: number;
  source: "scanner" | "barcode" | "database" | "manual" | "swap";
  updatedAt?: number;
  deleted?: boolean;
}

export interface DBMeal {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  name: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  isJunkOrTreat?: boolean;
  createdAt: number;
  updatedAt?: number;
  deleted?: boolean;
}

export interface DBWaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  timestamp: number;
  updatedAt?: number;
  deleted?: boolean;
}

export interface DBWeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
  timestamp: number;
  updatedAt?: number;
  deleted?: boolean;
}

export interface DBFavorite {
  id: string;
  name: string;
  items: Omit<DBMealItem, "id" | "mealId">[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  createdAt: number;
  updatedAt?: number;
  deleted?: boolean;
}

export interface DBSettings {
  id: string; // "global"
  theme: "auto" | "obsidian" | "marble" | "aegean" | "amethyst" | "olympus" | "poseidon" | "nyx" | "athena";
  userApiKey?: string;
  reminderIntervalMinutes: number;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  remindersEnabled: boolean;
  soundEnabled: boolean;
  units: "metric" | "imperial";
  updatedAt?: number;
}

export type GoalType =
  | "lose_fat"
  | "maintain"
  | "build_muscle"
  | "eat_healthier"
  | "hydration"
  | "custom";

export interface DBGoal {
  id: string;
  name: string;
  type: GoalType;
  isActive: boolean;
  targets: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    water_ml: number;
  };
  startWeightKg?: number;
  targetWeightKg?: number;
  targetDate?: string;
  pace?: "gentle" | "standard";
  notes?: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export type XPEventType =
  | "meal"
  | "water"
  | "protein_goal"
  | "fiber_goal"
  | "full_day"
  | "swap"
  | "streak"
  | "breakfast"
  | "goal_created";

export interface DBXPEvent {
  id: string;
  type: XPEventType;
  xp: number;
  description: string;
  timestamp: number;
  updatedAt?: number;
  deleted?: boolean;
}

export const SYNCED_TABLES = [
  "profile",
  "goals",
  "meals",
  "mealItems",
  "waterLogs",
  "weightLogs",
  "favorites",
  "xpEvents",
  "settings",
] as const;

export type SyncedTableName = (typeof SYNCED_TABLES)[number];

export class AmbrosiaDatabase extends Dexie {
  profile!: Table<DBProfile, string>;
  goals!: Table<DBGoal, string>;
  meals!: Table<DBMeal, string>;
  mealItems!: Table<DBMealItem, string>;
  waterLogs!: Table<DBWaterLog, string>;
  weightLogs!: Table<DBWeightLog, string>;
  favorites!: Table<DBFavorite, string>;
  settings!: Table<DBSettings, string>;
  xpEvents!: Table<DBXPEvent, string>;

  constructor(dbName = "ambrosia-guest") {
    super(dbName);

    // Version 1 (Baseline)
    this.version(1).stores({
      profile: "id",
      meals: "id, date, mealType, createdAt",
      mealItems: "id, mealId",
      waterLogs: "id, date, timestamp",
      weightLogs: "id, date, timestamp",
      favorites: "id, createdAt",
      settings: "id",
      xpEvents: "id, type, timestamp",
    });

    // Version 2 (Cloud Sync & Soft Deletes)
    this.version(2)
      .stores({
        profile: "id, updatedAt, deleted",
        meals: "id, date, mealType, createdAt, updatedAt, deleted",
        mealItems: "id, mealId, updatedAt, deleted",
        waterLogs: "id, date, timestamp, updatedAt, deleted",
        weightLogs: "id, date, timestamp, updatedAt, deleted",
        favorites: "id, createdAt, updatedAt, deleted",
        settings: "id, updatedAt",
        xpEvents: "id, type, timestamp, updatedAt, deleted",
      })
      .upgrade(async (tx) => {
        const now = Date.now();
        await tx.table("profile").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = item.createdAt || now;
          if (item.deleted === undefined) item.deleted = false;
        });
        await tx.table("meals").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = item.createdAt || now;
          if (item.deleted === undefined) item.deleted = false;
        });
        await tx.table("mealItems").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = now;
          if (item.deleted === undefined) item.deleted = false;
        });
        await tx.table("waterLogs").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = item.timestamp || now;
          if (item.deleted === undefined) item.deleted = false;
        });
        await tx.table("weightLogs").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = item.timestamp || now;
          if (item.deleted === undefined) item.deleted = false;
        });
        await tx.table("favorites").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = item.createdAt || now;
          if (item.deleted === undefined) item.deleted = false;
        });
        await tx.table("xpEvents").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = item.timestamp || now;
          if (item.deleted === undefined) item.deleted = false;
        });
        await tx.table("settings").toCollection().modify((item: Record<string, unknown>) => {
          if (item.updatedAt === undefined) item.updatedAt = now;
        });
      });

    // Version 3 (Multiple Health Goals & Profile-to-Goal Migration)
    this.version(3)
      .stores({
        goals: "id, isActive, type, archived, createdAt, updatedAt, deleted",
      })
      .upgrade(async (tx) => {
        const now = Date.now();
        try {
          const profileTable = tx.table("profile");
          const existingProfile = await profileTable.get("current");
          if (existingProfile && existingProfile.targets && !existingProfile.deleted) {
            const goalsTable = tx.table("goals");
            const existingGoalCount = await goalsTable.count();
            if (existingGoalCount === 0) {
              await goalsTable.add({
                id: "initial-goal",
                name: "My first goal",
                type: (existingProfile.goal as GoalType) || "maintain",
                isActive: true,
                targets: {
                  calories: existingProfile.targets.calories ?? 2000,
                  protein_g: existingProfile.targets.proteinG ?? 60,
                  carbs_g: existingProfile.targets.carbsG ?? 250,
                  fat_g: existingProfile.targets.fatG ?? 65,
                  fiber_g: existingProfile.targets.fiberG ?? 25,
                  water_ml: existingProfile.targets.waterMl ?? 2500,
                },
                startWeightKg: existingProfile.weightKg,
                targetWeightKg: existingProfile.goalWeightKg,
                pace: existingProfile.pace || "standard",
                archived: false,
                createdAt: existingProfile.createdAt || now,
                updatedAt: now,
                deleted: false,
              });
            }
          }
        } catch {
          // ignore migration error if fresh
        }
      });

    this.on("populate", () => {
      this.settings.add({
        id: "global",
        theme: "auto",
        reminderIntervalMinutes: 120,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
        remindersEnabled: false,
        soundEnabled: true,
        units: "metric",
        updatedAt: Date.now(),
      });
    });
  }
}

// Map of instantiated Dexie instances per user/guest
const dbInstances = new Map<string, AmbrosiaDatabase>();

let activeUserId: string | null = null;

// Initialize active user from localStorage if available in browser
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("ambrosia_active_user");
    if (saved) {
      activeUserId = saved;
    }
  } catch {
    // ignore localStorage restriction
  }
}

export function getActiveUserId(): string | null {
  return activeUserId;
}

export function setActiveUserId(userId: string | null): void {
  activeUserId = userId;
  if (typeof window !== "undefined") {
    try {
      if (userId) {
        localStorage.setItem("ambrosia_active_user", userId);
      } else {
        localStorage.removeItem("ambrosia_active_user");
      }
    } catch {
      // ignore
    }
  }
}

export function getDatabase(userId?: string | null): AmbrosiaDatabase {
  const dbName = userId ? `ambrosia-${userId}` : "ambrosia-guest";
  let instance = dbInstances.get(dbName);
  if (!instance) {
    instance = new AmbrosiaDatabase(dbName);
    dbInstances.set(dbName, instance);
  }
  return instance;
}

export async function deleteDatabase(userId?: string | null): Promise<void> {
  const dbName = userId ? `ambrosia-${userId}` : "ambrosia-guest";
  const instance = dbInstances.get(dbName);
  if (instance) {
    await instance.delete();
    dbInstances.delete(dbName);
  } else {
    const temp = new AmbrosiaDatabase(dbName);
    await temp.delete();
  }
}

/**
 * Transparent singleton proxy.
 * Calls to `db.meals`, `db.profile`, `db.transaction`, etc. resolve dynamically
 * to whichever database is currently active (user or guest).
 */
export const db: AmbrosiaDatabase = new Proxy({} as AmbrosiaDatabase, {
  get(_target, prop: string | symbol) {
    const active = getDatabase(activeUserId);
    const val = (active as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === "function") {
      return (val as (...args: unknown[]) => unknown).bind(active);
    }
    return val;
  },
});

// Helper to test if IndexedDB is available
export async function isIndexedDBAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return false;
  }
  try {
    const testDB = "ambrosia_test_probe";
    const req = window.indexedDB.open(testDB);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        try {
          req.result.close();
          window.indexedDB.deleteDatabase(testDB);
        } catch {
          // ignore cleanup error
        }
        resolve(true);
      };
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Migration helper: If user had an existing database under legacy "ambrosia"
 * and "ambrosia-guest" is empty, copy over the records.
 */
export async function migrateLegacyDatabase(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const guestDb = getDatabase(null);
    const [guestProfile, guestMeals] = await Promise.all([
      guestDb.profile.get("current").catch(() => null),
      guestDb.meals.count().catch(() => 0),
    ]);
    if (guestProfile || guestMeals > 0) return; // Already has guest data

    const legacyDb = new AmbrosiaDatabase("ambrosia");
    const [legacyProfile, legacyCount] = await Promise.all([
      legacyDb.profile.get("current").catch(() => null),
      legacyDb.meals.count().catch(() => 0),
    ]);

    if (legacyProfile || legacyCount > 0) {
      const [profile, meals, mealItems, waterLogs, weightLogs, favorites, xpEvents] =
        await Promise.all([
          legacyDb.profile.toArray().catch(() => []),
          legacyDb.meals.toArray().catch(() => []),
          legacyDb.mealItems.toArray().catch(() => []),
          legacyDb.waterLogs.toArray().catch(() => []),
          legacyDb.weightLogs.toArray().catch(() => []),
          legacyDb.favorites.toArray().catch(() => []),
          legacyDb.xpEvents.toArray().catch(() => []),
        ]);

      if (profile.length) await guestDb.profile.bulkPut(profile);
      if (meals.length) await guestDb.meals.bulkPut(meals);
      if (mealItems.length) await guestDb.mealItems.bulkPut(mealItems);
      if (waterLogs.length) await guestDb.waterLogs.bulkPut(waterLogs);
      if (weightLogs.length) await guestDb.weightLogs.bulkPut(weightLogs);
      if (favorites.length) await guestDb.favorites.bulkPut(favorites);
      if (xpEvents.length) await guestDb.xpEvents.bulkPut(xpEvents);
    }
  } catch (err) {
    console.warn("Legacy migration notice:", err);
  }
}
