"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/hooks";
import { migrateLegacyDatabase } from "@/lib/db/db";
import { triggerSync, waitForInitialSync, isInitialSyncCompleted } from "@/lib/sync/syncEngine";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { AppHeader } from "@/components/navigation/AppHeader";
import { MobileTabBar } from "@/components/navigation/MobileTabBar";
import { ImportGuestDataDialog } from "@/components/auth/ImportGuestDataDialog";
import { ZeusIcon } from "@/components/gods";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isInitialSyncing, setIsInitialSyncing] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    // Check legacy database migration
    migrateLegacyDatabase().catch(() => {});

    // If logged in and initial sync not yet finished, wait for first cloud pull (max 6s timeout)
    if (user && !isInitialSyncCompleted()) {
      setIsInitialSyncing(true);
      waitForInitialSync(6000)
        .catch(() => {})
        .finally(() => {
          if (!isCancelled) {
            setIsInitialSyncing(false);
          }
        });
    } else {
      triggerSync().catch(() => {});
    }

    return () => {
      isCancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-bg-base flex flex-row text-text-primary relative">
      {/* Race-free initial cloud sync loading overlay */}
      {isInitialSyncing && (
        <div className="fixed inset-0 z-50 bg-bg-base/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-14 h-14 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold animate-pulse mb-3">
            <ZeusIcon size={32} />
          </div>
          <p className="font-serif text-sm text-text-primary tracking-widest uppercase font-semibold">
            Synchronizing with Mount Olympus...
          </p>
          <p className="text-xs text-text-muted mt-1">
            Restoring your divine records and goals
          </p>
        </div>
      )}

      {/* Desktop Sidebar */}
      <React.Suspense fallback={<aside className="hidden md:flex flex-col w-64 border-r border-border-base bg-surface-elevated/40" />}>
        <AppSidebar />
      </React.Suspense>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          <React.Suspense fallback={null}>
            {children}
          </React.Suspense>
        </main>
        {/* Mobile Tab Bar */}
        <React.Suspense fallback={null}>
          <MobileTabBar />
        </React.Suspense>
      </div>

      {/* Guest-to-Account Merge Dialog */}
      <ImportGuestDataDialog />
    </div>
  );
}
