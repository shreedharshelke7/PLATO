"use client";

import React, { useEffect, useRef } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = !document.hidden;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Particle pool: mobile gets 35, desktop gets 65
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 65;

    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      targetAlpha: number;
      color: string;
    }

    const goldColors = ["rgba(200, 155, 60,", "rgba(229, 184, 66,", "rgba(240, 207, 101,"];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.1,
        alpha: Math.random() * 0.6 + 0.2,
        targetAlpha: Math.random() * 0.7 + 0.2,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
      });
    }

    // Occasional Zeus lightning flash
    let lightningIntensity = 0;
    let lightningCooldown = 180 + Math.random() * 200;

    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Flash background if lightning triggers
      if (lightningCooldown <= 0) {
        lightningIntensity = 0.15;
        lightningCooldown = 280 + Math.random() * 320;
      } else {
        lightningCooldown--;
      }

      if (lightningIntensity > 0) {
        ctx.fillStyle = `rgba(229, 184, 66, ${lightningIntensity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        lightningIntensity *= 0.88;
      }

      // Draw and update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.y < 0) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        // Subtle twinkling
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        if (Math.abs(p.alpha - p.targetAlpha) < 0.05) {
          p.targetAlpha = Math.random() * 0.7 + 0.2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(200, 155, 60, 0.4)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
      aria-hidden="true"
    />
  );
}
