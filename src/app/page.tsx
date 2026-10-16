"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "@/components/navigation/LandingNav";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { IntroLoader } from "@/components/landing/IntroLoader";
import { HeroGateScene } from "@/components/landing/HeroGateScene";
import { PlatoScene } from "@/components/landing/PlatoScene";
import { AristotleScene } from "@/components/landing/AristotleScene";
import { SocratesScene } from "@/components/landing/SocratesScene";
import { EpicurusScene } from "@/components/landing/EpicurusScene";
import { PythagorasScene } from "@/components/landing/PythagorasScene";
import { HeraclitusScene } from "@/components/landing/HeraclitusScene";
import { ResearchStats } from "@/components/landing/ResearchStats";
import { FinalCtaScene } from "@/components/landing/FinalCtaScene";
import { SceneProgressRail } from "@/components/landing/SceneProgressRail";
import {
  PhilosopherModal,
  PhilosopherDetail,
} from "@/components/landing/PhilosopherModal";

import {
  PlatoFigure,
  AristotleFigure,
  SocratesFigure,
  EpicurusFigure,
  PythagorasFigure,
  HeraclitusFigure,
} from "@/components/philosophers";

// Dynamic import for canvas and cursor spotlight for optimal performance
const GoldDustCanvas = dynamic(
  () => import("@/components/landing/GoldDustCanvas").then((mod) => mod.GoldDustCanvas),
  { ssr: false }
);

const GoldCursorSpotlight = dynamic(
  () => import("@/components/landing/GoldCursorSpotlight").then((mod) => mod.GoldCursorSpotlight),
  { ssr: false }
);

const PHILOSOPHERS_DIRECTORY: Record<string, PhilosopherDetail> = {
  plato: {
    id: "plato",
    name: "Plato",
    title: "Master of the Academy",
    theme: "The Soul as a Chariot",
    speech:
      "Imagine the soul as a chariot. Reason holds the reins while appetite and spirit pull in their own directions. A well-fed life is neither starvation nor excess; it is the reins held steady. Come, learn what your plate is truly asking.",
    caption: "Inspired by Plato's chariot allegory (Phaedrus)",
    featureName: "Mifflin-St Jeor Goal Engine",
    featureHref: "/onboarding",
    featureDescription:
      "Our pure-function goal engine acts as the Charioteer, calculating certified BMR, TDEE, protein preservation floors, and fiber requirements based on your unique biometric baseline.",
    figureComponent: PlatoFigure,
  },
  aristotle: {
    id: "aristotle",
    name: "Aristotle",
    title: "Philosopher of the Golden Mean",
    theme: "Equilibrium and Moderation",
    speech:
      "Virtue lives in the mean: not too little, not too much. Your plate is no different. Measure it kindly, and find your balance.",
    caption: "Inspired by Aristotle's doctrine of the mean (Nicomachean Ethics)",
    featureName: "Macronutrient Balance Pillars",
    featureHref: "/dashboard",
    featureDescription:
      "Avoid restrictive famine and careless surplus. Live in the Golden Mean with calibrated daily macro rings tracking protein, low-glycemic carbohydrates, and healthy fats.",
    figureComponent: AristotleFigure,
  },
  socrates: {
    id: "socrates",
    name: "Socrates",
    title: "The Questioner of Plates",
    theme: "The Examined Meal",
    speech:
      "I claim to know nothing, so I ask: what did you eat today, and why? A meal that is examined is a meal that can be improved. Show me your plate.",
    caption: "Inspired by the Socratic method of examination (Apology)",
    featureName: "Demeter Vision Meal Scanner",
    featureHref: "/scan",
    featureDescription:
      "Gemini Multimodal AI examines Indian and global foods down to katori, roti, and piece counts, returning verified calories and macronutrient densities with human-in-the-loop editing.",
    figureComponent: SocratesFigure,
  },
  epicurus: {
    id: "epicurus",
    name: "Epicurus",
    title: "Master of the Garden",
    theme: "Simple Joy & Divine Swaps",
    speech:
      "Pleasure is not the enemy of health. The deepest joys are simple: warm bread, fresh fruit, good company. Taste can be your ally, so let me show you what to swap, not what to give up.",
    caption: "Inspired by Epicurean tranquility and simple pleasures (Letter to Menoeceus)",
    featureName: "Divine Swap & Junk Budget",
    featureHref: "/swap",
    featureDescription:
      "Craving pizza, samosas, or Maggi? Dionysus instantly computes 3 realistic under-10-minute swaps preserving taste while elevating protein and fiber, tracked without guilt in your weekly treat budget.",
    figureComponent: EpicurusFigure,
  },
  pythagoras: {
    id: "pythagoras",
    name: "Pythagoras",
    title: "Master of Number and Ratio",
    theme: "Harmony is Proportion",
    speech:
      "All things are harmony and number. Protein, fat, carbohydrate, fiber: the body is a ratio. Let me show you yours.",
    caption: "Inspired by Pythagorean numerical harmony and sacred proportion",
    featureName: "Apollo Trends & Progress Analytics",
    featureHref: "/progress",
    featureDescription:
      "Track your lifelong bodily proportions, weekly weight trajectories, fiber density, and breakfast streaks with interactive charts powered by Recharts.",
    figureComponent: PythagorasFigure,
  },
  heraclitus: {
    id: "heraclitus",
    name: "Heraclitus",
    title: "Philosopher of Eternal Flux",
    theme: "Everything Flows",
    speech:
      "Everything flows, and so must you. A river that stops becomes a pond. Drink steadily, and let the day move through you.",
    caption: "Inspired by Heraclitus's doctrine of universal flux (Panta Rhei)",
    featureName: "Poseidon Circadian Hydration",
    featureHref: "/water",
    featureDescription:
      "Animated tidal amphora waves, automatic wake/sleep water distribution schedules, and friendly chimes to keep fluid steadily moving through your body.",
    figureComponent: HeraclitusFigure,
  },
};

const SCENE_DOTS = [
  { id: "gate-scene", label: "The Gate" },
  { id: "scene-plato", label: "Plato" },
  { id: "scene-aristotle", label: "Aristotle" },
  { id: "scene-socrates", label: "Socrates" },
  { id: "scene-epicurus", label: "Epicurus" },
  { id: "scene-pythagoras", label: "Pythagoras" },
  { id: "scene-heraclitus", label: "Heraclitus" },
  { id: "scene-research", label: "Research" },
  { id: "scene-final-cta", label: "The Academy" },
];

export default function LandingPage() {
  const [activePhilosopherModal, setActivePhilosopherModal] =
    useState<PhilosopherDetail | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string>("gate-scene");

  const scrollToScene = (id: string) => {
    setActiveSceneId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <SmoothScrollProvider>
      {/* Landing page is permanently in dark luxury Obsidian mode */}
      <div
        data-theme="obsidian"
        className="min-h-screen bg-bg text-text flex flex-col relative overflow-x-hidden selection:bg-gold/25 selection:text-gold-light"
      >
        {/* Intro Loader (≤1.8s, skippable, once per session) */}
        <IntroLoader />

        {/* Ambient Gold Dust Canvas */}
        <GoldDustCanvas />

        {/* Custom Soft-Gold Spotlight Cursor (Desktop) */}
        <GoldCursorSpotlight />

        {/* Navbar */}
        <LandingNav />

        {/* Scene Navigation Progress Rail */}
        <SceneProgressRail
          scenes={SCENE_DOTS}
          activeSceneId={activeSceneId}
          onSelectScene={scrollToScene}
        />

        {/* 1. SCENE: THE GATE (HERO) */}
        <HeroGateScene />

        {/* 2. SCENE: PLATO (KEYNOTE - CHARIOT ALLEGORY) */}
        <PlatoScene
          onSelectPhilosopher={() =>
            setActivePhilosopherModal(PHILOSOPHERS_DIRECTORY.plato)
          }
        />

        {/* 3. SCENE: ARISTOTLE (THE GOLDEN MEAN) */}
        <AristotleScene
          onSelectPhilosopher={() =>
            setActivePhilosopherModal(PHILOSOPHERS_DIRECTORY.aristotle)
          }
        />

        {/* 4. SCENE: SOCRATES (THE EXAMINED PLATE) */}
        <SocratesScene
          onSelectPhilosopher={() =>
            setActivePhilosopherModal(PHILOSOPHERS_DIRECTORY.socrates)
          }
        />

        {/* 5. SCENE: EPICURUS (SIMPLE PLEASURE & DIVINE SWAP) */}
        <EpicurusScene
          onSelectPhilosopher={() =>
            setActivePhilosopherModal(PHILOSOPHERS_DIRECTORY.epicurus)
          }
        />

        {/* 6. SCENE: PYTHAGORAS (HARMONY IS NUMBER) */}
        <PythagorasScene
          onSelectPhilosopher={() =>
            setActivePhilosopherModal(PHILOSOPHERS_DIRECTORY.pythagoras)
          }
        />

        {/* 7. SCENE: HERACLITUS (EVERYTHING FLOWS) */}
        <HeraclitusScene
          onSelectPhilosopher={() =>
            setActivePhilosopherModal(PHILOSOPHERS_DIRECTORY.heraclitus)
          }
        />

        {/* 8. SCENE: THE RESEARCH (CEP SURVEY STATS) */}
        <ResearchStats />

        {/* 9. SCENE: FINAL CTA (JOIN THE ACADEMY) */}
        <FinalCtaScene />

        {/* Philosopher Full Speech Detail Modal */}
        <PhilosopherModal
          philosopher={activePhilosopherModal}
          onClose={() => setActivePhilosopherModal(null)}
        />
      </div>
    </SmoothScrollProvider>
  );
}
