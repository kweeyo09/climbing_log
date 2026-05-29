/**
 * Core design tokens for the Ascenta mobile app.
 *
 * The refreshed visual direction uses a pure white athletic canvas, crisp white
 * cards, and a vibrant purple accent system to feel premium, focused, and sporty.
 */
import { Platform } from 'react-native';

const beatriceFallback = Platform.select({
  web: '"Beatrice Standard", Beatrice, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Beatrice Standard',
});

export const typography = {
  family: {
    regular: beatriceFallback,
    semibold: Platform.select({
      web: '"Beatrice Standard Semibold", "Beatrice Standard", Beatrice, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      default: 'Beatrice Standard Semibold',
    }),
    bold: Platform.select({
      web: '"Beatrice Standard Bold", "Beatrice Standard", Beatrice, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      default: 'Beatrice Standard Bold',
    }),
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const fonts = typography.family;

export const colors = {
  bg:           '#FFFFFF',
  card:         '#FFFFFF',
  surface:      '#F5F2FF',
  surfaceStrong:'#EEE8FF',
  border:       '#E4DDF5',

  accent:       '#7C3AED',
  accent2:      '#A855F7',
  accentDark:   '#3B0764',
  accentDim:    'rgba(124,58,237,0.10)',
  accentBorder: 'rgba(124,58,237,0.32)',
  accentBdr:    'rgba(124,58,237,0.32)',

  highlight:    '#A855F7',
  highlightDim: 'rgba(168,85,247,0.12)',
  highlightBdr: 'rgba(168,85,247,0.34)',

  success:      '#16A34A',
  successDim:   'rgba(22,163,74,0.10)',
  successBdr:   'rgba(22,163,74,0.28)',

  error:        '#C2410C',
  errorDim:     'rgba(194,65,12,0.10)',
  errorBdr:     'rgba(194,65,12,0.28)',

  text:         '#171321',
  text2:        '#5E5874',
  text3:        '#8F87A3',
  inverseText:  '#FFFFFF',
  shadow:       '#4C1D95',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
