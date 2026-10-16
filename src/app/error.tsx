"use client";

import React, { useEffect } from "react";
import { ZeusIcon } from "@/components/gods";
import { RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally if needed (without secrets)
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center p-6 text-center">
      <div className="p-10 rounded-3xl glass-panel-gold max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <ZeusIcon size={36} />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-red-400 font-mono font-bold">
            The Lightning Trembled
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-text-primary">
            An Olympian Rift Occurred
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            {error.message || "An unexpected error occurred while rendering the sanctuary view."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold glass-panel border border-border-base text-text-primary text-xs flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
