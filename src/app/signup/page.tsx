"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { validateRedirectPath } from "@/lib/utils/redirect";
import { ZeusIcon } from "@/components/gods/ZeusIcon";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Compass,
  Loader2,
  Inbox,
} from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const targetPath = validateRedirectPath(nextParam, "/dashboard");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckEmailState, setIsCheckEmailState] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const supabaseConfigured = isSupabaseConfigured();

  // Password Strength Calculation (0 - 4)
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-gold"];

  const handleGuestEntry = () => {
    try {
      document.cookie = "ambrosia_guest=true; path=/; max-age=31536000; SameSite=Lax";
    } catch {
      // ignore
    }
    router.replace(targetPath);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const result = signupSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    if (!supabaseConfigured) {
      setErrorMessage("Authentication is not configured on this deployment. Please continue as guest.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setIsLoading(true);
    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(targetPath)}`,
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setErrorMessage("An account with this email already exists. Please sign in instead.");
        } else if (error.message.toLowerCase().includes("rate limit")) {
          setErrorMessage("Too many registration requests. Please wait a minute and try again.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        setIsCheckEmailState(true);
      } else if (data?.session) {
        // Immediate session without confirmation
        document.cookie = "ambrosia_guest=false; path=/; max-age=0";
        router.replace(targetPath);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!supabaseConfigured) {
      setErrorMessage("Authentication is not configured on this deployment.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setIsGoogleLoading(true);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(targetPath)}`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Google OAuth initiation failed.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      data-theme="obsidian"
      className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-7 sm:p-9 rounded-3xl glass-panel-gold bg-surface border border-gold/40 shadow-2xl space-y-6"
      >
        {/* Brand Header */}
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
            Initiate Your Ascent
          </h2>
          <p className="text-xs text-text-muted">
            Create your account to secure cloud synchronisation across devices.
          </p>
        </div>

        {/* Check Email State */}
        {isCheckEmailState ? (
          <div className="p-6 rounded-2xl bg-surface-glass border border-gold/30 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-gold/15 flex items-center justify-center text-gold">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text">
              Check Your Email
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              We have dispatched a celestial verification link to <strong className="text-gold-light">{email}</strong>. Please tap the link in the message to activate your account.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-xl font-bold text-xs gold-gradient-btn inline-block"
              >
                Proceed to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Not Configured Banner (Graceful Degradation) */}
            {!supabaseConfigured && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Accounts are not configured on this deployment</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  You can still use all nutrition, scanner, and Divine Swap features in guest mode with local IndexedDB storage.
                </p>
                <button
                  type="button"
                  onClick={handleGuestEntry}
                  className="w-full py-2 rounded-xl bg-gold text-bg font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Compass className="w-3.5 h-3.5" /> Continue as guest
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-muted">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Charioteer of Athens"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-glass border border-border focus:border-gold text-text text-sm transition-colors"
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <span className="text-[11px] text-red-400">{fieldErrors.name}</span>
                )}
              </div>

              {/* Email Address */}
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
                    autoComplete="email"
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <span className="text-[11px] text-red-400">{fieldErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-muted">
                  Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-text-muted">Strength:</span>
                      <span className="font-bold text-gold-light">{strengthLabels[strength]}</span>
                    </div>
                    <div className="w-full bg-border h-1.5 rounded-full overflow-hidden flex gap-1">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            strength > step ? strengthColors[strength] : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {fieldErrors.password && (
                  <span className="text-[11px] text-red-400">{fieldErrors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-muted">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-glass border border-border focus:border-gold text-text text-sm transition-colors"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="text-[11px] text-red-400">{fieldErrors.confirmPassword}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !supabaseConfigured}
                className="w-full py-3.5 rounded-xl font-bold text-sm gold-gradient-btn flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Forging Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute px-3 bg-surface text-[11px] text-text-muted font-mono uppercase">
                or
              </span>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading || !supabaseConfigured}
              className="w-full py-3 rounded-xl border border-border hover:border-gold/50 bg-surface-glass text-xs font-semibold text-text flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign Up with Google</span>
            </button>

            {/* Footer Navigation */}
            <div className="pt-2 flex flex-col items-center gap-2 text-xs text-center border-t border-border">
              <p className="text-text-muted">
                Already registered?{" "}
                <Link
                  href={`/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`}
                  className="text-gold font-bold hover:underline"
                >
                  Sign In
                </Link>
              </p>
              <button
                type="button"
                onClick={handleGuestEntry}
                className="text-text-muted hover:text-gold transition-colors font-mono text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3 h-3 text-gold" /> Continue as guest without account
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      }
    >
      <SignupForm />
    </React.Suspense>
  );
}
