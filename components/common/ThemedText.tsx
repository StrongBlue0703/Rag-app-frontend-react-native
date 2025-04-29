import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'error' | 'success' | 'warning';
  accessibilityRole?: 'text' | 'header' | 'link' | 'alert' | 'none';
  accessibilityLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  accessibilityRole,
  accessibilityLevel,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const linkColor = useThemeColor({}, 'link');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  // Set default accessibility role based on type if not provided
  const defaultAccessibilityRole = accessibilityRole || (
    type === 'title' || type === 'subtitle' ? 'header' :
    type === 'link' ? 'link' :
    type === 'error' ? 'alert' :
    'text'
  );

  // Set default accessibility level based on type if not provided
  const defaultAccessibilityLevel = accessibilityLevel || (
    type === 'title' ? 1 :
    type === 'subtitle' ? 2 :
    undefined
  );

  const textColor = 
    type === 'link' ? linkColor :
    type === 'error' ? errorColor :
    type === 'success' ? successColor :
    type === 'warning' ? warningColor :
    color;

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      accessibilityRole={defaultAccessibilityRole}
      accessibilityLevel={defaultAccessibilityLevel}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});