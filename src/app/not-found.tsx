import React from "react";
import Link from "next/link";
import { ZeusIcon } from "@/components/gods";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col items-center justify-center p-6 text-center">
      <div className="p-10 rounded-3xl glass-panel-gold max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center mx-auto">
          <ZeusIcon size={36} />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-accent-gold font-mono font-bold">
            404 • Lost in the Labyrinth
          </span>
          <h1 className="font-serif text-3xl font-black text-text-primary">
            Realm Not Found
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            The mythological page you seek has descended into the Underworld or never existed on Mount Olympus.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-accent-gold hover:bg-accent-gold-hover text-stone-950 text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <Home className="w-4 h-4" /> Return to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold glass-panel border border-border-base text-text-primary text-xs flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
