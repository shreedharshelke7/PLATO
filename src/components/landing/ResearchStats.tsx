"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GreekMeander } from "../gods";

interface StatItem {
  percentage: number;
  label: string;
  emphasis: string;
  context: string;
}

const STATS: StatItem[] = [
  {
    percentage: 80,
    label: "eat fast food primarily for",
    emphasis: "Taste",
    context: "Flavor and craving beat willpower every time.",
  },
  {
    percentage: 50,
    label: "cite this as the single biggest barrier:",
    emphasis: "Lack of Time",
    context: "Cooking shouldn't demand an hour after a grueling day.",
  },
  {
    percentage: 38,
    label: "manage to consume",
    emphasis: "Breakfast Daily",
    context: "The majority start their morning fasting on empty reserves.",
  },
  {
    percentage: 34,
    label: "eat essential",
    emphasis: "Fruits & Greens",
    context: "Critical micronutrients and prebiotic fiber are routinely missed.",
  },
  {
    percentage: 64,
    label: "stated they are",
    emphasis: "Ready to Change",
    context: "All they need are realistic, mouthwatering alternatives.",
  },
];

function StatCounter({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = stat.percentage;
    const duration = 1200;
    const increment = Math.max(1, Math.floor(end / 40));
    const stepTime = Math.abs(Math.floor(duration / (end / increment)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, stat.percentage]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-6 rounded-2xl glass-panel bg-surface/80 relative flex flex-col justify-between hover:border-gold/50 transition-colors"
    >
      <div>
        <div className="flex items-baseline space-x-1">
          <span className="font-serif text-5xl font-black text-gold tracking-tight gold-glow">
            {count}%
          </span>
        </div>
        <p className="text-sm text-text-muted mt-2">
          {stat.label}{" "}
          <strong className="text-text font-bold text-base block mt-0.5">
            {stat.emphasis}
          </strong>
        </p>
      </div>
      <p className="text-xs text-text-muted mt-4 border-t border-border pt-3">
        {stat.context}
      </p>
    </motion.div>
  );
}

export function ResearchStats() {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto relative z-20" id="scene-research">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">
          Ground Truth • Community Engagement Study
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-text mt-2">
          Why Traditional Diets Fail
        </h2>
        <p className="text-sm md:text-base text-text-muted mt-3">
          Insights from our 50-respondent survey in Pune across students and young professionals (aged 18–25).
          Most people don&apos;t lack knowledge—taste and time dominate food choices.
        </p>
        <p className="text-[11px] text-text-muted font-mono mt-1 opacity-80">
          Source: College CEP Survey &quot;Analysing Eating Habits &amp; Food Choices&quot;, Pune (n = 50).
        </p>
        <GreekMeander className="mt-6 text-gold/30 h-3 max-w-md mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATS.slice(0, 3).map((stat, i) => (
          <StatCounter key={i} stat={stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
        {STATS.slice(3).map((stat, i) => (
          <StatCounter key={i + 3} stat={stat} index={i + 3} />
        ))}
      </div>
    </section>
  );
}
