/**
 * WCAG 2.1 Contrast Calculation Utilities
 * Calculates relative luminance and contrast ratio between colors.
 */

export function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  const channels = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = getRelativeLuminance(foregroundHex);
  const l2 = getRelativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function passesWCAG_AA(
  foregroundHex: string,
  backgroundHex: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

export interface ThemeColorTokens {
  name: string;
  bg: string;
  bgElevated: string;
  surface: string;
  text: string;
  textMuted: string;
  goldText: string;
  goldAccent: string;
}

export const THEME_PALETTES: Record<string, ThemeColorTokens> = {
  obsidian: {
    name: "Obsidian",
    bg: "#0A0A0F",
    bgElevated: "#12121A",
    surface: "#1A1A24",
    text: "#F6F1E7",
    textMuted: "#A8A294",
    goldText: "#D4AF37",
    goldAccent: "#D4AF37",
  },
  marble: {
    name: "Marble",
    bg: "#F6F1E7",
    bgElevated: "#EFE8DA",
    surface: "#FFFFFF",
    text: "#1A1612",
    textMuted: "#5F5648",
    goldText: "#7A5C14",
    goldAccent: "#D4AF37",
  },
  aegean: {
    name: "Aegean",
    bg: "#06141A",
    bgElevated: "#0B1E28",
    surface: "#0D2A33",
    text: "#F6F1E7",
    textMuted: "#8FA8B0",
    goldText: "#D4AF37",
    goldAccent: "#D4AF37",
  },
  amethyst: {
    name: "Amethyst",
    bg: "#0E0916",
    bgElevated: "#150E22",
    surface: "#1B1229",
    text: "#F6F1E7",
    textMuted: "#A69CB5",
    goldText: "#D4AF37",
    goldAccent: "#D4AF37",
  },
};
