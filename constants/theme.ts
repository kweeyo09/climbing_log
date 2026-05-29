/**
 * Core design tokens for the Ascenta mobile app.
 *
 * The refreshed visual direction uses a soft lavender-white athletic canvas,
 * crisp white cards, and a vibrant purple accent system to feel premium,
 * focused, and sporty.
 */
import { Platform } from 'react-native';

const interRegularFamily = Platform.select({
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Inter-Regular',
});

const interMediumFamily = Platform.select({
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Inter-Medium',
});

const interSemiBoldFamily = Platform.select({
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Inter-SemiBold',
});

const interBoldFamily = Platform.select({
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Inter-Bold',
});

const barlowCondensedRegularFamily = Platform.select({
  web: '"Barlow Condensed", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'BarlowCondensed-Regular',
});

const barlowCondensedSemiBoldFamily = Platform.select({
  web: '"Barlow Condensed", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'BarlowCondensed-SemiBold',
});

const barlowCondensedBoldFamily = Platform.select({
  web: '"Barlow Condensed", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'BarlowCondensed-Bold',
});

export const typography = {
  family: {
    regular: interRegularFamily,
    medium: interMediumFamily,
    semibold: interSemiBoldFamily,
    bold: interBoldFamily,
    label: barlowCondensedSemiBoldFamily,
    labelRegular: barlowCondensedRegularFamily,
    labelBold: barlowCondensedBoldFamily,
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
  bg:           '#F8F6FF',
  card:         '#FFFFFF',
  surface:      '#F1ECFF',
  surfaceStrong:'#E9DDFF',
  border:       '#E4DDF5',

  accent:       '#7C3AED',
  accent2:      '#7C3AED',
  accentDark:   '#3B0764',
  accentDim:    'rgba(124,58,237,0.10)',
  accentBorder: 'rgba(124,58,237,0.32)',
  accentBdr:    'rgba(124,58,237,0.32)',

  highlight:    '#7C3AED',
  highlightDim: 'rgba(124,58,237,0.10)',
  highlightBdr: 'rgba(124,58,237,0.32)',

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
