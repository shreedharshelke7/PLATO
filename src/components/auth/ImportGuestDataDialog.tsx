"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasGuestData, mergeGuestDataToUser } from "@/lib/sync/syncEngine";
import { Sparkles, Database, ArrowRight, Loader2, Check } from "lucide-react";

export function ImportGuestDataDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedCount, setMergedCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkMigrationEligibility() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      const flagKey = `ambrosia_guest_migration_${user.id}`;
      const alreadyPrompted = localStorage.getItem(flagKey);
      if (alreadyPrompted) return;

      const guestLogsExist = await hasGuestData();
      if (guestLogsExist && mounted) {
        setUserId(user.id);
        setIsOpen(true);
      }
    }

    checkMigrationEligibility();

    return () => {
      mounted = false;
    };
  }, []);

  const handleMerge = async () => {
    if (!userId) return;
    setIsMerging(true);
    try {
      const count = await mergeGuestDataToUser(userId);
      setMergedCount(count);
      localStorage.setItem(`ambrosia_guest_migration_${userId}`, "merged");
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error("Failed to merge guest logs:", err);
      setIsMerging(false);
      setIsOpen(false);
    }
  };

  const handleStartFresh = () => {
    if (userId) {
      localStorage.setItem(`ambrosia_guest_migration_${userId}`, "skipped");
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md p-6 rounded-2xl glass-panel-gold border border-accent-gold/40 shadow-2xl relative overflow-hidden bg-bg-elevated"
        >
          {/* Header icon */}
          <div className="w-12 h-12 rounded-full bg-accent-gold/15 flex items-center justify-center text-accent-gold mb-4 mx-auto border border-accent-gold/30">
            {mergedCount !== null ? (
              <Check className="w-6 h-6 text-emerald-400" />
            ) : (
              <Database className="w-6 h-6" />
            )}
          </div>

          <h3 className="font-serif text-xl font-bold text-center text-text-primary mb-2">
            {mergedCount !== null
              ? "Feasts Unified!"
              : "Merge Local Device Logs?"}
          </h3>

          <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
            {mergedCount !== null ? (
              `Successfully transferred ${mergedCount} logs into your Olympian cloud account.`
            ) : (
              <>
                We found nutrition and hydration history recorded on this device while in guest mode.
                Would you like to merge them into your permanent cloud account?
              </>
            )}
          </p>

          {mergedCount === null && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleMerge}
                disabled={isMerging}
                className="w-full py-3 px-4 rounded-xl gold-shimmer bg-gradient-to-r from-accent-gold-light via-accent-gold to-accent-gold-deep text-bg-base font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-accent-gold/20 transition-all disabled:opacity-50"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Unifying logs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-bg-base" />
                    <span>Merge Into My Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleStartFresh}
                disabled={isMerging}
                className="w-full py-2.5 px-4 rounded-xl border border-border-base text-text-muted hover:text-text-primary hover:border-accent-gold/40 text-xs font-semibold tracking-wider transition-all cursor-pointer"
              >
                Start Fresh (Ignore Device Logs)
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
