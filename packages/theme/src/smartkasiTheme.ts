'use client';

/**
 * SmartKasi — Modern Light theme (first choice)
 * Single source of truth for web (Astryx + HeroUI) + Flutter.
 * Teal accent #0F766E on modern slate/white — clean, light, no brownish, no red/black. Light is default.
 */
import { defineTheme, defineSyntaxTheme } from '@astryxdesign/core/theme';
import tokens from './tokens.json';

const syntax = defineSyntaxTheme({
  name: 'smartkasi-syntax',
  tokens: {
    keyword: ['#0F766E', '#5EEAD4'],
    string: ['#065F46', '#A7F3D0'],
    comment: ['#57534E', '#A8A29E'],
    number: ['#92400E', '#FDE68A'],
    function: ['#0F766E', '#99F6E4'],
    type: ['#115E59', '#5EEAD4'],
    variable: ['#57534E', '#A8A29E'],
    operator: ['#57534E', '#A8A29E'],
    constant: ['#92400E', '#FDE68A'],
    tag: ['#115E59', '#5EEAD4'],
    attribute: ['#57534E', '#A8A29E'],
    property: ['#0F766E', '#5EEAD4'],
    punctuation: ['#57534E', '#A8A29E'],
    background: [tokens.background.bodyLight, tokens.background.bodyDark],
  },
});

export const smartkasiTheme = defineTheme({
  name: 'smartkasi',
  typography: {
    scale: { base: 14, ratio: 1.25 },
    body: {
      family: 'Outfit',
      fallbacks: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Outfit',
      fallbacks: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      weights: { 3: '600', 4: '700' },
    },
    code: {
      family: 'JetBrains Mono',
      fallbacks: '"SF Mono", Monaco, Consolas, monospace',
    },
  },
  motion: { fast: 125, medium: 300, slow: 700, ratio: 0.75 },
  syntax,
  tokens: {
    // Accent — teal only, never red/black/brown
    '--color-accent': [tokens.accent.light, tokens.accent.dark],
    '--color-accent-muted': [tokens.accent.mutedLight, tokens.accent.mutedDark],
    '--color-text-accent': [tokens.accent.light, tokens.accent.dark],
    '--color-icon-accent': [tokens.accent.light, tokens.accent.dark],
    '--color-on-accent': tokens.accent.onAccent,
    '--color-neutral': ['#0F172A0F', '#F1F5F91A'],

    // Backgrounds — modern slate/white light-first
    '--color-background-body': [tokens.background.bodyLight, tokens.background.bodyDark],
    '--color-background-surface': [tokens.background.surfaceLight, tokens.background.surfaceDark],
    '--color-background-card': [tokens.background.cardLight, tokens.background.cardDark],
    '--color-background-popover': [tokens.background.cardLight, tokens.background.cardDark],
    '--color-background-muted': [tokens.background.mutedLight, tokens.background.mutedDark],
    '--color-background-inverted': [tokens.text.primaryLight, tokens.background.bodyLight],
    '--color-overlay': ['#0F172A80', '#00000099'],
    '--color-overlay-hover': ['#0F172A0D', '#FFFFFF0D'],
    '--color-overlay-pressed': ['#0F172A1A', '#FFFFFF1A'],

    // Text — modern slate, not warm brown
    '--color-text-primary': [tokens.text.primaryLight, tokens.text.primaryDark],
    '--color-text-secondary': [tokens.text.secondaryLight, tokens.text.secondaryDark],
    '--color-text-disabled': [tokens.text.disabledLight, tokens.text.disabledDark],
    '--color-on-dark': '#ffffff',
    '--color-on-light': '#0F172A',

    // Icons
    '--color-icon-primary': [tokens.text.primaryLight, tokens.text.primaryDark],
    '--color-icon-secondary': [tokens.text.secondaryLight, tokens.text.secondaryDark],
    '--color-icon-disabled': [tokens.text.disabledLight, tokens.text.disabledDark],

    // Status — keep defaults but ensure success uses teal
    '--color-success': tokens.status.success,
    '--color-success-muted': tokens.status.successMuted,
    '--color-warning': tokens.status.warning,
    '--color-warning-muted': tokens.status.warningMuted,
    '--color-error': tokens.status.error,
    '--color-error-muted': tokens.status.errorMuted,
    '--color-on-success': '#ffffff',
    '--color-on-error': '#ffffff',
    '--color-on-warning': '#1C1917',

    // Borders — modern slate
    '--color-border': [tokens.border.light, tokens.border.dark],
    '--color-border-emphasized': [tokens.border.emphasizedLight, tokens.border.emphasizedDark],
    '--color-skeleton': ['#E2E8F0', '#334155'],
    '--color-shadow': ['#0F172A0A', '#0000004D'],
    '--color-tint-hover': ['black', 'white'],

    // Categorical — all use teal family for SmartKasi, keep others for charts
    '--color-background-teal': ['#CCFBF1', '#134E4A'],
    '--color-border-teal': ['#5EEAD4', '#0F766E'],
    '--color-icon-teal': [tokens.accent.light, tokens.accent.dark],
    '--color-text-teal': [tokens.accent.light, tokens.accent.dark],
    '--color-background-green': ['#CCFBF1', '#134E4A'],
    '--color-border-green': ['#5EEAD4', '#0F766E'],
    '--color-icon-green': [tokens.accent.light, tokens.accent.dark],
    '--color-text-green': [tokens.accent.light, tokens.accent.dark],

    // Radius — Township Warm is friendly, rounded
    '--radius-none': tokens.radius.none,
    '--radius-element': tokens.radius.element,
    '--radius-container': tokens.radius.container,
    '--radius-page': tokens.radius.page,
    '--radius-full': tokens.radius.full,
    '--radius-inner': '0.375rem',

    // Shadows — subtle modern, no brownish
    '--shadow-low': '0 1px 2px #0F172A0D, 0 4px 8px #0F172A0A',
    '--shadow-med': '0 4px 12px #0F172A0A, 0 8px 24px #0F172A0F',
    '--shadow-high': '0 8px 24px #0F172A0F, 0 16px 32px #0F172A14',

    // Element sizes
    '--size-element-sm': '32px',
    '--size-element-md': '40px',
    '--size-element-lg': '48px',
  },
  components: {
    button: {
      base: { paddingBlock: 'var(--spacing-3)', paddingInline: 'var(--spacing-4)' },
      'variant:secondary': {
        backgroundColor: 'transparent',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: tokens.accent.light,
        color: tokens.accent.light,
        ':hover': { backgroundColor: tokens.accent.mutedLight },
      },
      'variant:ghost': { color: tokens.accent.light },
    },
    card: {
      base: { borderRadius: 'var(--radius-container)', padding: 'var(--spacing-4)' },
    },
    section: {
      base: { padding: 'var(--spacing-4)' },
    },
  },
});

// Palettes for charts — teal family only, keep simple for now
export const smartkasiPalettes = {} as const;
