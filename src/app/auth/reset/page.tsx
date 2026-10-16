"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { z } from "zod";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ZeusIcon } from "@/components/gods/ZeusIcon";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = resetSchema.safeParse({ email });
    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message || "Invalid email");
      return;
    }

    if (!supabaseConfigured) {
      setErrorMessage("Authentication is not configured on this deployment.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setIsLoading(true);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/update-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Password reset request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-theme="obsidian"
      className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md p-7 sm:p-9 rounded-3xl glass-panel-gold bg-surface border border-gold/40 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
              <ZeusIcon size={22} />
            </div>
            <span className="font-serif text-2xl font-black tracking-widest text-text">
              PLATO
            </span>
          </Link>
          <h2 className="font-serif text-2xl font-extrabold text-text tracking-tight">
            Recover Sanctuary Access
          </h2>
          <p className="text-xs text-text-muted">
            Enter your email to receive a secure password recovery transmission.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-surface-glass border border-gold/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <h3 className="font-serif font-bold text-base text-text">
              Transmission Sent
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              If an account exists for <strong className="text-gold-light">{email}</strong>, a recovery link has been sent. Check your inbox.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs font-bold text-gold hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-muted">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@olympus.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-glass border border-border focus:border-gold text-text text-sm transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !supabaseConfigured}
              className="w-full py-3.5 rounded-xl font-bold text-sm gold-gradient-btn flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <span>Send Recovery Email</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs text-text-muted hover:text-gold inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
