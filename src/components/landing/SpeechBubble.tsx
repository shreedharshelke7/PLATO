"use client";

import React, { useState, useEffect } from "react";
import { Volume2, Square } from "lucide-react";

interface SpeechBubbleProps {
  speech: string;
  caption: string;
  philosopherName: string;
  isActive?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
  className?: string;
}

export function SpeechBubble({
  speech,
  caption,
  philosopherName,
  isActive = true,
  onSpeakingChange,
  className = "",
}: SpeechBubbleProps) {
  const [revealedWordCount, setRevealedWordCount] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isSupported] = useState<boolean>(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );

  const words = speech.split(" ");

  // Word-by-word reveal when active
  useEffect(() => {
    if (!isActive) return;

    let current = 0;
    const timer = setInterval(() => {
      current++;
      setRevealedWordCount(current);
      if (current >= words.length) {
        clearInterval(timer);
      }
    }, 70);

    return () => {
      clearInterval(timer);
    };
  }, [isActive, words.length]);

  // Audio speech synthesis
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      onSpeakingChange?.(false);
      return;
    }

    window.speechSynthesis.cancel(); // clear queue
    const utterance = new SpeechSynthesisUtterance(speech);
    utterance.rate = 0.9;
    utterance.lang = "en-US";

    // Try finding a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Daniel") || v.name.includes("Google"))) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      onSpeakingChange?.(true);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      onSpeakingChange?.(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      onSpeakingChange?.(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className={`relative max-w-xl p-6 sm:p-7 rounded-3xl glass-panel-gold bg-surface-glass border border-gold/30 shadow-2xl backdrop-blur-xl ${className}`}
      aria-live="polite"
    >
      {/* Small Quote Tail SVG */}
      <div className="absolute -left-3 top-8 w-4 h-4 overflow-hidden hidden md:block">
        <div className="w-4 h-4 bg-surface-glass border-l border-t border-gold/30 transform -rotate-45" />
      </div>

      {/* Header bar with Philosopher name & audio control */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div>
          <span className="font-serif font-black text-sm uppercase tracking-wider text-gold-light block">
            {philosopherName}
          </span>
          <span className="text-[11px] text-text-muted italic block">
            {caption}
          </span>
        </div>

        {/* Listen Button (Off by default, user-initiated only) */}
        {isSupported && (
          <button
            type="button"
            onClick={toggleSpeech}
            aria-label={isPlayingAudio ? "Stop reading speech aloud" : `Listen to ${philosopherName}'s speech`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingAudio
                ? "bg-gold text-bg font-bold animate-pulse"
                : "border border-gold/40 text-gold-light hover:bg-gold/15"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Screen reader full text is always in DOM */}
      <p className="sr-only">{speech}</p>

      {/* Word-by-word visual reveal */}
      <p className="font-serif text-base sm:text-lg leading-relaxed text-text font-medium select-text" aria-hidden="true">
        {words.map((word, idx) => {
          const isRevealed = idx < revealedWordCount;
          return (
            <span
              key={idx}
              className={`inline-block transition-all duration-300 mr-1.5 ${
                isRevealed
                  ? "opacity-100 translate-y-0 text-text"
                  : "opacity-15 blur-[0.5px] translate-y-1 text-text-muted"
              }`}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
}
