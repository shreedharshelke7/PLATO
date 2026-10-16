"use client";

import React from "react";
import Link from "next/link";
import { X, ArrowRight, Sparkles } from "lucide-react";

export interface PhilosopherDetail {
  id: string;
  name: string;
  title: string;
  theme: string;
  speech: string;
  caption: string;
  featureName: string;
  featureHref: string;
  featureDescription: string;
  figureComponent: React.ComponentType<{ size?: number; speaking?: boolean }>;
}

interface PhilosopherModalProps {
  philosopher: PhilosopherDetail | null;
  onClose: () => void;
}

export function PhilosopherModal({ philosopher, onClose }: PhilosopherModalProps) {
  if (!philosopher) return null;

  const Figure = philosopher.figureComponent;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="philosopher-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 max-w-xl w-full p-6 sm:p-8 rounded-3xl glass-panel-gold bg-surface border border-gold/40 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 p-2 rounded-full text-text-muted hover:text-gold hover:bg-gold/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0 flex items-center justify-center">
            <Figure size={140} speaking={false} />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-mono tracking-widest text-gold font-bold">
              {philosopher.title}
            </span>
            <h3 id="philosopher-modal-title" className="font-serif text-2xl font-black text-text">
              {philosopher.name}
            </h3>
            <p className="text-xs text-text-muted italic">
              {philosopher.caption}
            </p>
          </div>
        </div>

        {/* Full speech */}
        <div className="p-4 rounded-2xl bg-surface-glass border border-gold/20">
          <p className="font-serif text-sm sm:text-base leading-relaxed text-text italic">
            &ldquo;{philosopher.speech}&rdquo;
          </p>
        </div>

        {/* Feature Connection */}
        <div className="space-y-3 pt-1 border-t border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-light">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Embodies: {philosopher.featureName}</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {philosopher.featureDescription}
          </p>
          <div className="pt-2">
            <Link
              href={philosopher.featureHref}
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm gold-gradient-btn"
            >
              Explore {philosopher.featureName} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
