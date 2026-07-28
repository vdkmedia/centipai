import { Platform } from 'react-native';

/**
 * CentipAI designsysteem — afgeleid van de logo-gradient
 * (oranje → roze/magenta → paars, Instagram-achtig).
 */
export const Brand = {
  orange: '#F7941D',
  pink: '#EE2A7B',
  purple: '#8A2BE2',
  gradient: ['#F7941D', '#EE2A7B', '#8A2BE2'] as const,
  gradientStart: { x: 0, y: 0 },
  gradientEnd: { x: 1, y: 1 },
} as const;

export const Colors = {
  text: '#1A1A1E',
  textSecondary: '#60646C',
  textInverse: '#FFFFFF',
  background: '#FFFFFF',
  backgroundSoft: '#F7F7FA',
  card: '#FFFFFF',
  border: '#E4E5EA',
  borderActive: Brand.pink,
  success: '#1FA85C',
  danger: '#D6314A',
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded' },
  android: { sans: 'sans-serif', rounded: 'sans-serif' },
  default: {
    sans: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    rounded: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
})!;
