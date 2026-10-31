"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ZeusIcon } from "@/components/gods/ZeusIcon";
import { Inbox, Send, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email] = useState(emailParam);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email.trim() || resendCooldown > 0 || isResending) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setIsResending(true);
    setFeedback(null);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setFeedback(`Failed to resend: ${error.message}`);
      } else {
        setFeedback("Confirmation email resent successfully! Check your inbox.");
        setResendCooldown(60);
      }
    } catch {
      setFeedback("Failed to resend. Please try again later.");
    } finally {
      setIsResending(false);
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
        className="relative z-10 w-full max-w-md p-7 sm:p-9 rounded-3xl glass-panel-gold bg-surface border border-gold/40 shadow-2xl text-center space-y-6"
      >
        <Link href="/" className="inline-flex items-center gap-2 group mx-auto">
          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
            <ZeusIcon size={22} />
          </div>
          <span className="font-serif text-2xl font-black tracking-widest text-text">
            PLATO
          </span>
        </Link>

        <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 flex items-center justify-center text-gold">
          <Inbox className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-extrabold text-text tracking-tight">
            Confirm Your Email
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We have sent an activation link to{" "}
            {email ? (
              <strong className="text-gold-light">{email}</strong>
            ) : (
              "your registered email"
            )}
            . Please click the link to confirm your account and begin logging like a god.
          </p>
        </div>

        {feedback && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-gold-light bg-gold/10 p-2.5 rounded-xl border border-gold/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending || !email}
            className="w-full py-3 rounded-xl border border-gold/40 text-gold text-xs font-semibold hover:bg-gold/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {resendCooldown > 0
                ? `Resend Email in ${resendCooldown}s`
                : "Resend Confirmation Email"}
            </span>
          </button>

          <Link
            href="/login"
            className="w-full py-3.5 rounded-xl font-bold text-xs gold-gradient-btn flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </React.Suspense>
  );
}
