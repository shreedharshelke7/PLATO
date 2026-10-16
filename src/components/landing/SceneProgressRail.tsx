"use client";

import React from "react";

interface SceneDot {
  id: string;
  label: string;
}

interface SceneProgressRailProps {
  scenes: SceneDot[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
}

export function SceneProgressRail({
  scenes,
  activeSceneId,
  onSelectScene,
}: SceneProgressRailProps) {
  return (
    <nav
      aria-label="Philosophers Academy scroll navigation"
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-3 py-4 px-2 rounded-full glass-panel-gold border border-gold/25"
    >
      {scenes.map((scene) => {
        const isActive = activeSceneId === scene.id;
        return (
          <button
            key={scene.id}
            type="button"
            onClick={() => onSelectScene(scene.id)}
            aria-label={`Scroll to ${scene.label}`}
            className="group relative flex items-center justify-center p-1 cursor-pointer focus:outline-none"
          >
            {/* Label tooltip on hover */}
            <span className="absolute right-7 px-2.5 py-1 rounded-lg bg-surface border border-gold/30 text-[10px] font-mono text-gold-light whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              {scene.label}
            </span>

            {/* Dot */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "w-3 h-3 bg-gold shadow-[0_0_12px_#D4AF37]"
                  : "w-2 h-2 bg-text-muted/40 hover:bg-gold/60"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
