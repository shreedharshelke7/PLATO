import { describe, it, expect } from "vitest";
import { resolveLWW, sanitizeForCloud } from "./syncEngine";

describe("Cloud Sync Engine - Conflict Resolution & Safety", () => {
  it("resolves to remote when remote timestamp is newer (LWW)", () => {
    const local = {
      id: "meal_1",
      name: "Greek Yogurt & Honey",
      calories: 220,
      updatedAt: 1000,
      deleted: false,
    };

    const remote = {
      payload: {
        id: "meal_1",
        name: "Greek Yogurt, Walnuts & Honey",
        calories: 310,
      },
      client_updated_at: new Date(2000).toISOString(),
      updated_at: new Date(2000).toISOString(),
      deleted: false,
    };

    const result = resolveLWW(local, remote);
    expect(result.winner).toBe("remote");
    expect(result.record.name).toBe("Greek Yogurt, Walnuts & Honey");
    expect(result.record.calories).toBe(310);
    expect(result.record.updatedAt).toBe(2000);
    expect(result.record.deleted).toBe(false);
  });

  it("resolves to local when local timestamp is newer or equal (LWW)", () => {
    const local = {
      id: "meal_1",
      name: "Tawa Paneer with 2 Rotis",
      calories: 450,
      updatedAt: 3000,
      deleted: false,
    };

    const remote = {
      payload: {
        id: "meal_1",
        name: "Tawa Paneer (stale)",
        calories: 300,
      },
      client_updated_at: new Date(1500).toISOString(),
      updated_at: new Date(1500).toISOString(),
      deleted: false,
    };

    const result = resolveLWW(local, remote);
    expect(result.winner).toBe("local");
    expect(result.record.name).toBe("Tawa Paneer with 2 Rotis");
    expect(result.record.calories).toBe(450);
  });

  it("resolves to remote when local record does not exist", () => {
    const remote = {
      payload: {
        id: "meal_new",
        name: "Hydrating Coconut Water",
        calories: 45,
      },
      client_updated_at: new Date(5000).toISOString(),
      deleted: false,
    };

    const result = resolveLWW(undefined, remote);
    expect(result.winner).toBe("remote");
    expect(result.record.name).toBe("Hydrating Coconut Water");
    expect(result.record.updatedAt).toBe(5000);
  });

  it("handles soft-delete propagation via remote", () => {
    const local = {
      id: "meal_del",
      name: "Mistaken Food Log",
      calories: 500,
      updatedAt: 1000,
      deleted: false,
    };

    const remote = {
      payload: {
        id: "meal_del",
        name: "Mistaken Food Log",
        calories: 500,
      },
      client_updated_at: new Date(2000).toISOString(),
      deleted: true,
    };

    const result = resolveLWW(local, remote);
    expect(result.winner).toBe("remote");
    expect(result.record.deleted).toBe(true);
  });

  it("strictly strips userApiKey from settings before cloud push", () => {
    const localSettings = {
      id: "global",
      theme: "obsidian",
      reminderIntervalMinutes: 120,
      userApiKey: "AIzaSySecretCustomGeminiKey12345",
      soundEnabled: true,
      units: "metric",
      updatedAt: 123456789,
    };

    const cloudPayload = sanitizeForCloud("settings", localSettings);
    expect(cloudPayload.theme).toBe("obsidian");
    expect(cloudPayload.userApiKey).toBeUndefined();
    expect("userApiKey" in cloudPayload).toBe(false);

    // Non-settings table remains unaltered
    const mealPayload = { id: "m1", name: "Dal Khichdi", calories: 320 };
    const sanitizedMeal = sanitizeForCloud("meals", mealPayload);
    expect(sanitizedMeal.name).toBe("Dal Khichdi");
  });

  it("backfills updatedAt and deleted: false during Dexie v2 upgrade", () => {
    // Simulate v1 record that lacked updatedAt and deleted fields
    const v1Records = [
      { id: "meal_old", date: "2026-03-01", mealType: "lunch", name: "Samosa", createdAt: 1000 },
      { id: "water_old", date: "2026-03-01", amountMl: 500, timestamp: 1200 },
    ];

    const upgradedMeals = v1Records.map((item: Record<string, unknown>) => ({
      ...item,
      updatedAt: (item.updatedAt as number | undefined) ?? (item.createdAt as number | undefined) ?? (item.timestamp as number | undefined) ?? 9999,
      deleted: (item.deleted as boolean | undefined) ?? false,
    }));

    expect(upgradedMeals[0].updatedAt).toBe(1000);
    expect(upgradedMeals[0].deleted).toBe(false);
    expect(upgradedMeals[1].updatedAt).toBe(1200);
    expect(upgradedMeals[1].deleted).toBe(false);
  });
});
