import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

type FontFamily = 'oxanium' | 'oleo';
type Variant =
  | 'regular'
  | 'bold'
  | 'light'
  | 'semi'
  | 'extraLight'
  | 'medium';

interface Props extends TextProps {
  style?: TextStyle;
  font?: FontFamily; // Choose between Oxanium or Oleo
  variant?: Variant;
}

const fontMap: Record<FontFamily, Partial<Record<Variant, string>>> = {
  oxanium: {
    regular: 'Oxanium-Regular',
    bold: 'Oxanium-Bold',
    semi: 'Oxanium-SemiBold',
    medium: 'Oxanium-Medium',
    light: 'Oxanium-Light',
    extraLight: 'Oxanium-ExtraLight',
  },
  oleo: {
    regular: 'OleoScript-Regular',
    bold: 'OleoScript-Bold',
  },
};

export default function CustomText({
  children,
  style,
  font = 'oxanium',
  variant = 'regular',
  ...rest
}: Props) {
  const fontFamily = fontMap[font]?.[variant] || 'System';

  return (
    <Text
      {...rest}
      style={[{ fontFamily }, style]}
    >
      {children}
    </Text>
  );
}

// ----------======= READ ME =======----------
// CustomText.tsx component wrap React Native’s Text, apply your default font, and accept overrides.
// Replace all regular <Text> tags with <CustomText> so fonts are globally consistent, yet customizable per component.

// -------======= How to use =======---------
// // Oxanium SemiBold
// <CustomText font="oxanium" variant="semi" style={{ fontSize: 18 }}>
//   Hello from Oxanium SemiBold
// </CustomText>

// // Oleo Script Bold
// <CustomText font="oleo" variant="bold" style={{ fontSize: 24 }}>
//   Hello from Oleo Script Bold
// </CustomText>
