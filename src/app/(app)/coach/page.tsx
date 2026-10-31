"use client";

import React, { useState, useRef } from "react";
import { useProfile, useXP, useSettings, useGoals } from "@/lib/db/hooks";
import { AthenaIcon } from "@/components/gods";
import {
  Send,
  ShieldAlert,
  Loader2,
  Target,
} from "lucide-react";

interface CoachMessage {
  id: string;
  sender: "user" | "athena";
  text: string;
  insights?: string[];
  focus?: string;
  timestamp: string;
}

export default function AICoachPage() {
  const { profile } = useProfile();
  const { activeGoal, targets } = useGoals();
  const { settings } = useSettings();
  const { streakDays, totalXP } = useXP();
  const counterRef = useRef(1);

  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "intro",
      sender: "athena",
      text: `Greetings, ${profile?.name || "Warrior"}. I am Athena. I observe your metabolic patterns and craft strategy so you never rely on fickle willpower. Ask me anything regarding macro timing, student meal hacks, or conquering cravings.`,
      insights: [
        "Knowledge without strategy fails under stress.",
        "Front-loading protein reduces afternoon brain fog.",
        "Consistency over 30 days builds godlike discipline.",
      ],
      focus: "Anchor your hydration and morning protein today.",
      timestamp: "Just now",
    },
  ]);

  const presetQuestions = [
    "How can I hit 30g protein at breakfast in under 5 minutes?",
    "What should I snack on during late-night study sessions?",
    "How to manage high-carb Indian thalis when eating at a hostel or mess?",
    "I'm feeling fatigued in the afternoon—what is my diet missing?",
  ];

  const handleSendMessage = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuestion).trim();
    if (!q || isLoading) return;

    const userCount = counterRef.current++;
    const userMsg: CoachMessage = {
      id: `u_${userCount}`,
      sender: "user",
      text: q,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.userApiKey) headers["x-user-key"] = settings.userApiKey;

      const res = await fetch("/api/coach", {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: q,
          profile,
          activeGoal,
          past7DaysSummary: {
            streakDays,
            totalXP,
            avgCalories: targets.calories,
            avgProtein: targets.protein_g,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Counsel failed");

      const athenaCount = counterRef.current++;
      const athenaMsg: CoachMessage = {
        id: `a_${athenaCount}`,
        sender: "athena",
        text: data.answer,
        insights: data.insights,
        focus: data.focusForTomorrow,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, athenaMsg]);
    } catch {
      const errCount = counterRef.current++;
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${errCount}`,
          sender: "athena",
          text: "Forgive me, warrior—my strategic connection wavered. Focus today on hitting your protein target and drinking pure water.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-base shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-lime-400 font-semibold flex items-center gap-1.5">
            <AthenaIcon size={16} /> Athena War Room
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-text-primary mt-0.5">
            Strategic AI Nutrition Coach
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">
            Circadian Strategy Mode
          </span>
        </div>
      </div>

      {/* Preset Questions Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {presetQuestions.map((pq, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(pq)}
            className="px-3 py-1.5 rounded-full text-xs bg-bg-surface-elevated border border-border-base hover:border-lime-400/50 text-text-secondary hover:text-text-primary whitespace-nowrap transition-all shrink-0 cursor-pointer"
          >
            {pq}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl glass-panel pr-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            {m.sender === "athena" && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 mb-1 flex items-center gap-1">
                <AthenaIcon size={12} /> Athena&apos;s Strategic Decree
              </span>
            )}

            <div
              className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed space-y-3 ${
                m.sender === "user"
                  ? "bg-accent-gold text-stone-950 font-medium rounded-tr-none ml-8"
                  : "bg-bg-surface-elevated border border-border-base text-text-primary rounded-tl-none mr-8"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Tactical Bullet Insights */}
              {m.insights && m.insights.length > 0 && (
                <div className="p-3 rounded-xl bg-bg-base/60 border border-border-base/50 space-y-1.5 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 block">
                    Strategic Axioms
                  </span>
                  {m.insights.map((ins, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-text-secondary">
                      <span className="text-lime-400 font-bold">•</span>
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Focus Priority */}
              {m.focus && (
                <div className="text-[11px] font-semibold text-lime-300 flex items-center gap-1.5 pt-1">
                  <Target className="w-3.5 h-3.5" /> Single Focus: {m.focus}
                </div>
              )}
            </div>

            <span className="text-[10px] text-text-muted mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-lime-400 p-3">
            <Loader2 className="w-4 h-4 animate-spin" /> Athena synthesizing strategic guidance...
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="shrink-0 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Athena about breakfast shortcuts, thali macros, or craving strategy..."
            className="flex-1 px-4 py-3 rounded-2xl bg-bg-surface border border-border-base text-text-primary text-sm focus:border-lime-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputQuestion.trim()}
            className="px-6 py-3 rounded-2xl bg-lime-500 hover:bg-lime-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" /> Consult
          </button>
        </div>

        {/* Safety Disclaimer */}
        <p className="text-[10px] text-text-muted text-center flex items-center justify-center gap-1">
          <ShieldAlert className="w-3 h-3 text-accent-gold" />
          Athena provides general tactical nutrition coaching and estimates, not medical advice.
          Consult a doctor for health diagnoses.
        </p>
      </div>
    </div>
  );
}
