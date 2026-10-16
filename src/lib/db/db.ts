import Dexie, { type Table } from "dexie";
import { UserProfileInput, ComputedTargets } from "../nutrition/targets";

export interface DBProfile extends UserProfileInput {
  id: string; // "current"
  targets: ComputedTargets;
  createdAt: number;
  updatedAt: number;
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
}

export interface DBWaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  timestamp: number;
}

export interface DBWeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
  timestamp: number;
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
}

export interface DBSettings {
  id: string; // "global"
  theme: "auto" | "olympus" | "poseidon" | "nyx" | "athena";
  userApiKey?: string;
  reminderIntervalMinutes: number;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  remindersEnabled: boolean;
  soundEnabled: boolean;
  units: "metric" | "imperial";
}

export type XPEventType =
  | "meal"
  | "water"
  | "protein_goal"
  | "fiber_goal"
  | "full_day"
  | "swap"
  | "streak"
  | "breakfast";

export interface DBXPEvent {
  id: string;
  type: XPEventType;
  xp: number;
  description: string;
  timestamp: number;
}

class AmbrosiaDatabase extends Dexie {
  profile!: Table<DBProfile, string>;
  meals!: Table<DBMeal, string>;
  mealItems!: Table<DBMealItem, string>;
  waterLogs!: Table<DBWaterLog, string>;
  weightLogs!: Table<DBWeightLog, string>;
  favorites!: Table<DBFavorite, string>;
  settings!: Table<DBSettings, string>;
  xpEvents!: Table<DBXPEvent, string>;

  constructor() {
    super("ambrosia");
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
      });
    });
  }
}

// Global singleton instance
export const db = new AmbrosiaDatabase();

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
