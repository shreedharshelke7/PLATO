"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { updatePasswordSchema, calculatePasswordStrength } from "@/lib/auth/schemas";
import { mapSupabaseAuthError } from "@/lib/auth/errors";
import { ZeusIcon } from "@/components/gods/ZeusIcon";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  const { score: strengthScore, label: strengthLabel, colorClass: strengthColor } =
    calculatePasswordStrength(password);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    const result = updatePasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message || "Invalid password inputs");
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
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(mapSupabaseAuthError(error).message);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    } catch (err) {
      setErrorMessage(mapSupabaseAuthError(err instanceof Error ? err.message : String(err)).message);
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
            Forge New Credentials
          </h2>
          <p className="text-xs text-text-muted">
            Enter your new secure password to restore full access to your sanctuary.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-surface-glass border border-gold/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <h3 className="font-serif font-bold text-base text-text">
              Password Restored
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Your new password has been verified. Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-muted">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-glass border border-border focus:border-gold text-text text-sm transition-colors"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-muted">Strength:</span>
                    <span className="font-semibold text-gold-light">{strengthLabel}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-full transition-all duration-300 ${
                          strengthScore >= step ? strengthColor : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-muted">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-glass border border-border focus:border-gold text-text text-sm transition-colors"
                  autoComplete="new-password"
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
