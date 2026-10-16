"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/db/hooks";
import { migrateLegacyDatabase } from "@/lib/db/db";
import { triggerSync } from "@/lib/sync/syncEngine";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { AppHeader } from "@/components/navigation/AppHeader";
import { MobileTabBar } from "@/components/navigation/MobileTabBar";
import { ImportGuestDataDialog } from "@/components/auth/ImportGuestDataDialog";
import { ZeusIcon } from "@/components/gods";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    // Check legacy database migration and initiate initial sync
    migrateLegacyDatabase().catch(() => {});
    triggerSync().catch(() => {});
  }, []);

  useEffect(() => {
    // If done loading and no profile exists, guide to onboarding
    if (!isLoading && !profile) {
      router.replace("/onboarding");
    }
  }, [isLoading, profile, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold animate-pulse mb-3">
          <ZeusIcon size={28} />
        </div>
        <p className="font-serif text-sm text-text-secondary tracking-widest uppercase">
          Summoning Mount Olympus...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-row text-text-primary">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
        {/* Mobile Tab Bar */}
        <MobileTabBar />
      </div>

      {/* Guest-to-Account Merge Dialog */}
      <ImportGuestDataDialog />
    </div>
  );
}
