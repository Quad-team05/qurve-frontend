import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

const FONT_REGULAR = '42dotSans-Regular';
const FONT_MEDIUM = '42dotSans-Medium';
const FONT_BOLD = '42dotSans-Bold';
const FONT_EXTRABOLD = '42dotSans-ExtraBold';
const FONT_LIGHT = '42dotSans-Light';

function resolveFontFamily(weight?: TextStyle['fontWeight']) {
  if (!weight || weight === 'normal') return FONT_REGULAR;
  if (weight === 'bold') return FONT_BOLD;

  const numeric = Number(weight);
  if (Number.isNaN(numeric)) return FONT_REGULAR;
  if (numeric <= 300) return FONT_LIGHT;
  if (numeric <= 400) return FONT_REGULAR;
  if (numeric <= 600) return FONT_MEDIUM;
  if (numeric <= 700) return FONT_BOLD;
  return FONT_EXTRABOLD;
}

function resolveFontFamilyFromClassName(className?: string) {
  if (!className) return undefined;

  const classes = className.split(/\s+/);

  if (classes.includes('font-black') || classes.includes('font-extrabold')) {
    return FONT_EXTRABOLD;
  }
  if (classes.includes('font-bold') || classes.includes('font-semibold')) {
    return FONT_BOLD;
  }
  if (classes.includes('font-medium')) {
    return FONT_MEDIUM;
  }
  if (classes.includes('font-light')) {
    return FONT_LIGHT;
  }

  return undefined;
}

export function with42dotSans(style?: StyleProp<TextStyle>, className?: string) {
  const flattened = StyleSheet.flatten(style) ?? {};
  const familyFromClassName = resolveFontFamilyFromClassName(className);

  if (flattened.fontFamily) {
    return flattened;
  }

  const fontFamily = familyFromClassName ?? resolveFontFamily(flattened.fontWeight);
  return {
    ...flattened,
    fontFamily,
    fontWeight: undefined,
  } satisfies TextStyle;
}
