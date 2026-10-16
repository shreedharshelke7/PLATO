import { describe, it, expect } from "vitest";
import {
  getContrastRatio,
  passesWCAG_AA,
  THEME_PALETTES,
} from "./contrast";

describe("WCAG AA Contrast Verification for All Theme Tokens", () => {
  for (const [themeId, theme] of Object.entries(THEME_PALETTES)) {
    describe(`Theme: ${theme.name} (${themeId})`, () => {
      const backgrounds = [
        { name: "bg", hex: theme.bg },
        { name: "bgElevated", hex: theme.bgElevated },
        { name: "surface", hex: theme.surface },
      ];

      for (const bg of backgrounds) {
        it(`primary text (${theme.text}) passes WCAG AA normal text (>= 4.5:1) on ${bg.name} (${bg.hex})`, () => {
          const ratio = getContrastRatio(theme.text, bg.hex);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
          expect(passesWCAG_AA(theme.text, bg.hex, false)).toBe(true);
        });

        it(`muted text (${theme.textMuted}) passes WCAG AA normal text (>= 4.5:1) on ${bg.name} (${bg.hex})`, () => {
          const ratio = getContrastRatio(theme.textMuted, bg.hex);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
          expect(passesWCAG_AA(theme.textMuted, bg.hex, false)).toBe(true);
        });

        it(`gold text color (${theme.goldText}) passes WCAG AA (>= 4.5:1) on ${bg.name} (${bg.hex})`, () => {
          const ratio = getContrastRatio(theme.goldText, bg.hex);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
          expect(passesWCAG_AA(theme.goldText, bg.hex, false)).toBe(true);
        });
      }
    });
  }
});
