"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import { setActiveUserId } from "../db/db";
import { pushImmediate } from "../sync/syncEngine";

export interface UserProfile {
  id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  isConfigured: boolean;
  fullName: string;
  avatarUrl: string | null;
  signOut: (options?: { keepLocalData?: boolean }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isGuest: true,
  isConfigured: false,
  fullName: "Hero",
  avatarUrl: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isConfigured);

  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
        return;
      }
    } catch {
      // ignore
    }

    // Fallback to user metadata if profiles table is still syncing or empty
    if (currentUser?.user_metadata) {
      setProfile({
        id: userId,
        full_name: currentUser.user_metadata.full_name || null,
        avatar_url: currentUser.user_metadata.avatar_url || null,
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let isMounted = true;

    // Fetch initial user verified with Supabase
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (isMounted) {
        setUser(currentUser);
        setActiveUserId(currentUser?.id ?? null);
        if (currentUser?.id) {
          fetchProfile(currentUser.id, currentUser);
        }
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const newUser = session?.user ?? null;
      setUser(newUser);
      setActiveUserId(newUser?.id ?? null);

      if (newUser?.id) {
        await fetchProfile(newUser.id, newUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  const signOut = useCallback(
    async (options?: { keepLocalData?: boolean }) => {
      const supabase = getSupabaseBrowserClient();

      // 1. Run final sync if online and signed in
      let finalPushFailed = false;
      if (typeof navigator !== "undefined" && navigator.onLine && user) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Final sync timeout")), 4000)
          );
          await Promise.race([pushImmediate(), timeoutPromise]);
        } catch (err) {
          console.warn("Final cloud push failed before sign-out:", err);
          finalPushFailed = true;
          if (typeof window !== "undefined") {
            window.alert(
              "Cloud sync could not be verified before signing out. To prevent any data loss, your local records have been preserved on this device."
            );
          }
        }
      }

      // 2. Clear guest and session cookies
      try {
        document.cookie = "ambrosia_guest=; path=/; max-age=0";
      } catch {
        // ignore
      }

      const previousUserId = user?.id;

      // 3. Supabase signOut
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      }

      // 4. In-memory state cleanup
      setUser(null);
      setProfile(null);
      setActiveUserId(null);

      // 5. Delete local database ONLY IF "Keep data on this device" was false AND final sync did NOT fail
      if (!options?.keepLocalData && !finalPushFailed && previousUserId) {
        try {
          const { deleteDatabase } = await import("../db/db");
          await deleteDatabase(previousUserId);
        } catch {
          // ignore
        }
      }

      // 6. Redirect to home landing page
      router.push("/");
    },
    [user, router]
  );

  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Olympian";

  const avatarUrl =
    profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isGuest: !user,
        isConfigured,
        fullName,
        avatarUrl,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
