/**
 * Shared design tokens for the Usus mobile app.
 * Mirrors the Tailwind/CSS custom properties from the web version.
 *
 * Use `useColors()` from `../hooks/useColors` inside components to get the
 * theme-reactive version. The static `C` export is kept for backward
 * compatibility and as the canonical dark-theme reference.
 */

interface CategoryColor { bg: string; border: string; text: string; }

export interface Colors {
  background: string; card: string;
  zinc900: string; zinc800: string; zinc700: string;
  border: string;
  text: string; textMuted: string; textFaint: string;
  accent: string; accentBg: string;
  fitness: CategoryColor; health: CategoryColor; learning: CategoryColor;
  mindfulness: CategoryColor; productivity: CategoryColor;
  social: CategoryColor; other: CategoryColor;
  orange: string; red: string; redBg: string; green: string; yellow: string;
}

// ── Dark theme (default) ──────────────────────────────────────────
export const C: Colors = {
  background: '#09090b',
  card:       '#18181b',
  zinc900:    '#18181b',
  zinc800:    '#27272a',
  zinc700:    '#3f3f46',
  border:     '#27272a',
  text:       '#ffffff',
  textMuted:  '#a1a1aa',
  textFaint:  '#71717a',
  accent:     '#06b6d4',
  accentBg:   'rgba(6,182,212,0.12)',
  fitness:      { bg: 'rgba(249,115,22,0.2)',  border: 'rgba(249,115,22,0.3)',  text: '#fb923c' },
  health:       { bg: 'rgba(74,222,128,0.2)',  border: 'rgba(74,222,128,0.3)',  text: '#4ade80' },
  learning:     { bg: 'rgba(96,165,250,0.2)',  border: 'rgba(96,165,250,0.3)',  text: '#60a5fa' },
  mindfulness:  { bg: 'rgba(192,132,252,0.2)', border: 'rgba(192,132,252,0.3)', text: '#c084fc' },
  productivity: { bg: 'rgba(251,191,36,0.2)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  social:       { bg: 'rgba(244,114,182,0.2)', border: 'rgba(244,114,182,0.3)', text: '#f472b6' },
  other:        { bg: 'rgba(63,63,70,0.4)',    border: 'rgba(63,63,70,0.5)',    text: '#71717a' },
  orange:  '#fb923c',
  red:     '#f87171',
  redBg:   'rgba(248,113,113,0.1)',
  green:   '#4ade80',
  yellow:  '#fbbf24',
};

// ── Light theme ───────────────────────────────────────────────────
export const lightColors: Colors = {
  background: '#f4f4f5',
  card:       '#ffffff',
  zinc900:    '#f4f4f5',
  zinc800:    '#e4e4e7',
  zinc700:    '#d4d4d8',
  border:     '#e4e4e7',
  text:       '#09090b',
  textMuted:  '#52525b',
  textFaint:  '#71717a',
  accent:     '#0891b2',
  accentBg:   'rgba(8,145,178,0.12)',
  fitness:      { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  text: '#c2410c' },
  health:       { bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)',  text: '#15803d' },
  learning:     { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  text: '#1d4ed8' },
  mindfulness:  { bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)', text: '#7e22ce' },
  productivity: { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  text: '#b45309' },
  social:       { bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)', text: '#be185d' },
  other:        { bg: 'rgba(113,113,122,0.12)', border: 'rgba(113,113,122,0.3)', text: '#52525b' },
  orange:  '#c2410c',
  red:     '#dc2626',
  redBg:   'rgba(220,38,38,0.1)',
  green:   '#15803d',
  yellow:  '#b45309',
};
