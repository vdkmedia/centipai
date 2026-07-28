import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

interface Props {
  children: ReactNode;
  /** Vaste balk onderaan (bijv. de doorgaan-knop). */
  footer?: ReactNode;
  scroll?: boolean;
  /** Maximale kolombreedte op brede (desktop-)schermen. */
  maxWidth?: number;
}

/**
 * Standaard schermwrapper. Op desktop-web wordt de content gecentreerd
 * in een kolom van max 560px zodat de app ook op laptops goed oogt.
 */
export function Screen({ children, footer, scroll = true, maxWidth = 560 }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width > 700;

  const content = (
    <View style={[styles.column, isWide && { maxWidth }]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.md }]}
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.root, styles.scrollContent, { paddingTop: insets.top + Spacing.md }]}>
          {content}
        </View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <View style={[styles.column, isWide && { maxWidth }]}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  column: { width: '100%', alignSelf: 'center' },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
});
