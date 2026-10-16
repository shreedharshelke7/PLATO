"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../supabase/client";
import {
  getDatabase,
  setActiveUserId,
  SYNCED_TABLES,
  type SyncedTableName,
} from "../db/db";

export type SyncState = "synced" | "syncing" | "offline" | "error";

export interface SyncEngineStatus {
  status: SyncState;
  lastSyncAt: number | null;
  errorMessage: string | null;
}

// Global sync state store
let currentStatus: SyncEngineStatus = {
  status: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "synced",
  lastSyncAt: null,
  errorMessage: null,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function getSyncStatusSnapshot(): SyncEngineStatus {
  return currentStatus;
}

function updateSyncStatus(updates: Partial<SyncEngineStatus>) {
  currentStatus = { ...currentStatus, ...updates };
  notifyListeners();
}

export interface RemoteDataRow {
  table_name?: string;
  record_id?: string;
  payload: Record<string, unknown>;
  client_updated_at?: string;
  updated_at?: string;
  deleted?: boolean;
}

/**
 * Pure LWW (Last-Write-Wins) conflict resolver for testability & determinism.
 * Returns { winner: "local" | "remote", record: Record<string, unknown> }
 */
export function resolveLWW(
  localRecord: { updatedAt?: number; deleted?: boolean; [key: string]: unknown } | undefined,
  remoteRecord: RemoteDataRow
): { winner: "local" | "remote"; record: Record<string, unknown> } {
  if (!localRecord) {
    const remoteTime = remoteRecord.client_updated_at
      ? new Date(remoteRecord.client_updated_at).getTime()
      : remoteRecord.updated_at
      ? new Date(remoteRecord.updated_at).getTime()
      : Date.now();
    return {
      winner: "remote",
      record: {
        ...remoteRecord.payload,
        updatedAt: remoteTime,
        deleted: Boolean(remoteRecord.deleted),
      },
    };
  }

  const localTime = localRecord.updatedAt ?? 0;
  const remoteTime = remoteRecord.client_updated_at
    ? new Date(remoteRecord.client_updated_at).getTime()
    : remoteRecord.updated_at
    ? new Date(remoteRecord.updated_at).getTime()
    : 0;

  if (remoteTime > localTime) {
    return {
      winner: "remote",
      record: {
        ...remoteRecord.payload,
        updatedAt: remoteTime,
        deleted: Boolean(remoteRecord.deleted),
      },
    };
  }

  return {
    winner: "local",
    record: localRecord as Record<string, unknown>,
  };
}

/**
 * Sanitizes records before pushing to cloud.
 * Strips userApiKey from settings table so secrets never leave the device.
 */
export function sanitizeForCloud(
  tableName: SyncedTableName,
  payload: Record<string, unknown>
): Record<string, unknown> {
  if (tableName === "settings") {
    const sanitized = { ...payload };
    delete sanitized.userApiKey;
    return sanitized;
  }
  return payload;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced trigger for auto-sync on local writes (1.5 seconds)
 */
export function notifyDataChanged() {
  if (typeof window === "undefined") return;
  if (!isSupabaseConfigured()) return;
  if (navigator && !navigator.onLine) {
    updateSyncStatus({ status: "offline" });
    return;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    triggerSync().catch((err) => {
      console.warn("Auto-sync background error:", err);
    });
  }, 1500);
}

/**
 * Core bidirectional sync implementation
 */
export async function triggerSync(options?: { force?: boolean }): Promise<void> {
  if (typeof window === "undefined") return;

  if (!isSupabaseConfigured()) {
    updateSyncStatus({ status: "offline", errorMessage: null });
    return;
  }

  if (navigator && !navigator.onLine) {
    updateSyncStatus({ status: "offline", errorMessage: null });
    return;
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    updateSyncStatus({ status: "offline" });
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Unauthenticated guest: no cloud sync
    updateSyncStatus({ status: "synced", errorMessage: null });
    return;
  }

  // Ensure active user database matches logged-in user
  setActiveUserId(user.id);
  const userDb = getDatabase(user.id);

  updateSyncStatus({ status: "syncing", errorMessage: null });

  try {
    const lastSyncKey = `ambrosia_last_sync_${user.id}`;
    const lastSyncAt = options?.force
      ? 0
      : Number(localStorage.getItem(lastSyncKey) || 0);

    const syncStartTime = Date.now();

    // ==========================================
    // 1. PUSH PHASE: Local changes -> Supabase
    // ==========================================
    const rowsToUpsert: Array<{
      user_id: string;
      table_name: string;
      record_id: string;
      payload: Record<string, unknown>;
      client_updated_at: string;
      deleted: boolean;
    }> = [];

    for (const tableName of SYNCED_TABLES) {
      const table = userDb.table(tableName);
      let records: Array<Record<string, unknown>> = [];
      if (lastSyncAt > 0) {
        records = (await table.where("updatedAt").above(lastSyncAt).toArray()) as Array<Record<string, unknown>>;
      } else {
        records = (await table.toArray()) as Array<Record<string, unknown>>;
      }

      for (const record of records) {
        const recordId = String(record.id);
        const sanitized = sanitizeForCloud(tableName, record);
        rowsToUpsert.push({
          user_id: user.id,
          table_name: tableName,
          record_id: recordId,
          payload: sanitized,
          client_updated_at: new Date((record.updatedAt as number) || syncStartTime).toISOString(),
          deleted: Boolean(record.deleted),
        });
      }
    }

    if (rowsToUpsert.length > 0) {
      // Upsert in batches of 100
      const BATCH_SIZE = 100;
      for (let i = 0; i < rowsToUpsert.length; i += BATCH_SIZE) {
        const chunk = rowsToUpsert.slice(i, i + BATCH_SIZE);
        const { error: pushError } = await supabase
          .from("user_data")
          .upsert(chunk, { onConflict: "user_id,table_name,record_id" });

        if (pushError) {
          throw new Error(`Push error: ${pushError.message}`);
        }
      }
    }

    // ==========================================
    // 2. PULL PHASE: Supabase changes -> Local
    // ==========================================
    let query = supabase
      .from("user_data")
      .select("table_name, record_id, payload, client_updated_at, updated_at, deleted")
      .eq("user_id", user.id);

    if (lastSyncAt > 0) {
      query = query.gt("updated_at", new Date(lastSyncAt).toISOString());
    }

    const { data: remoteRows, error: pullError } = await query;
    if (pullError) {
      throw new Error(`Pull error: ${pullError.message}`);
    }

    if (remoteRows && remoteRows.length > 0) {
      // Group remote changes by table
      const rowsByTable = new Map<SyncedTableName, RemoteDataRow[]>();
      for (const row of remoteRows) {
        const tbl = row.table_name as SyncedTableName;
        if (!SYNCED_TABLES.includes(tbl)) continue;
        const list = rowsByTable.get(tbl) || [];
        list.push(row as unknown as RemoteDataRow);
        rowsByTable.set(tbl, list);
      }

      for (const [tblName, rows] of rowsByTable.entries()) {
        const table = userDb.table(tblName);
        for (const row of rows) {
          if (!row.record_id) continue;
          const localRecord = (await table.get(row.record_id)) as Record<string, unknown> | undefined;
          const { winner, record } = resolveLWW(localRecord, row);

          if (winner === "remote") {
            // If settings table, preserve existing local userApiKey if present
            if (tblName === "settings" && localRecord?.userApiKey) {
              record.userApiKey = localRecord.userApiKey;
            }
            await table.put(record);
          }
        }
      }
    }

    // Record success
    localStorage.setItem(lastSyncKey, String(syncStartTime));
    updateSyncStatus({
      status: "synced",
      lastSyncAt: syncStartTime,
      errorMessage: null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Sync failed";
    console.error("Sync failed:", err);
    updateSyncStatus({
      status: "error",
      errorMessage: errorMsg,
    });
  }
}

/**
 * Checks if guest database has data
 */
export async function hasGuestData(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const guestDb = getDatabase(null);
    const [mealsCount, waterCount, hasProfile] = await Promise.all([
      guestDb.meals.count(),
      guestDb.waterLogs.count(),
      guestDb.profile.get("current"),
    ]);
    return mealsCount > 0 || waterCount > 0 || Boolean(hasProfile);
  } catch {
    return false;
  }
}

/**
 * Migrates data from ambrosia-guest into the authenticated user's database
 */
export async function mergeGuestDataToUser(userId: string): Promise<number> {
  const guestDb = getDatabase(null);
  const userDb = getDatabase(userId);
  const now = Date.now();
  let migratedCount = 0;

  for (const tableName of SYNCED_TABLES) {
    const guestTable = guestDb.table(tableName);
    const userTable = userDb.table(tableName);
    const records = await guestTable.toArray();

    if (records.length > 0) {
      const prepared = records.map((r) => ({
        ...r,
        updatedAt: now,
        deleted: false,
      }));
      await userTable.bulkPut(prepared);
      migratedCount += records.length;
    }
  }

  // Clear guest data once migrated so prompt is not shown again
  await guestDb.delete().catch(() => {});

  // Trigger sync to cloud immediately
  triggerSync({ force: true }).catch(() => {});

  return migratedCount;
}

/**
 * Deletes all cloud data for the current user from Supabase user_data table
 */
export async function deleteUserCloudData(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("user_data").delete().eq("user_id", user.id);
  if (error) {
    throw new Error(`Failed to delete cloud data: ${error.message}`);
  }

  // Reset last sync timestamp
  if (typeof window !== "undefined") {
    localStorage.removeItem(`ambrosia_last_sync_${user.id}`);
  }

  updateSyncStatus({
    status: "synced",
    lastSyncAt: Date.now(),
    errorMessage: null,
  });
}

/**
 * Hook for consuming sync status in UI components
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncEngineStatus>(getSyncStatusSnapshot());

  useEffect(() => {
    const onStatusChange = () => {
      setStatus(getSyncStatusSnapshot());
    };
    listeners.add(onStatusChange);
    return () => {
      listeners.delete(onStatusChange);
    };
  }, []);

  const syncNow = useCallback(async () => {
    await triggerSync({ force: true });
  }, []);

  const deleteCloudData = useCallback(async () => {
    await deleteUserCloudData();
  }, []);

  return {
    status: status.status,
    lastSyncAt: status.lastSyncAt,
    errorMessage: status.errorMessage,
    syncNow,
    deleteCloudData,
  };
}

// Browser lifecycle listeners: online, visibilitychange
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    updateSyncStatus({ status: "syncing" });
    triggerSync().catch(() => {});
  });

  window.addEventListener("offline", () => {
    updateSyncStatus({ status: "offline" });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      triggerSync().catch(() => {});
    }
  });
}
