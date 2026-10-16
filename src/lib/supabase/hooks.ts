"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import { setActiveUserId } from "../db/db";

export function useAuth() {
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    // Fetch initial user
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (mounted) {
        setUser(currentUser);
        setActiveUserId(currentUser?.id ?? null);
        setIsLoading(false);
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        const newUser = session?.user ?? null;
        setUser(newUser);
        setActiveUserId(newUser?.id ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signOut = useCallback(
    async (options?: { clearLocalData?: boolean }) => {
      if (!isConfigured) return;
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      // Delete cookie
      document.cookie = "ambrosia_guest=; path=/; max-age=0";

      await supabase.auth.signOut();
      setActiveUserId(null);

      if (options?.clearLocalData && user?.id) {
        try {
          const { deleteDatabase } = await import("../db/db");
          await deleteDatabase(user.id);
        } catch {
          // ignore
        }
      }

      router.push("/login");
    },
    [isConfigured, user, router]
  );

  return {
    user,
    isLoading,
    isGuest: !user,
    isConfigured,
    signOut,
  };
}
