import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { Screen } from '@/components/ui/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/lib/onboarding';

/**
 * "Centi trainen": eigen AI-regels toevoegen en verwijderen.
 * Elke regel wordt bij elke caption-generatie aan de prompt toegevoegd.
 */
export default function AiRulesScreen() {
  const { state, addRule, removeRule } = useOnboarding();
  const [draft, setDraft] = useState('');
  const rules = state.brand.customRules;

  const submit = () => {
    if (draft.trim().length < 3) return;
    addRule(draft);
    setDraft('');
  };

  return (
    <Screen footer={<GradientButton title="Klaar" onPress={() => router.back()} />}>
      <View style={styles.header}>
        <Centi message={'Hier train je mij. Vertel wat ik altijd of juist nooit moet doen, en ik onthoud het voor elke caption. Regel niet meer nodig? Dan gooi je hem weer weg.'} />
      </View>

      <Text style={styles.heading}>Centi trainen</Text>

      <Text style={styles.label}>Nieuwe regel</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={'Bijv. "Gebruik altijd emoticons, maar nooit 🙏"'}
          placeholderTextColor={Colors.textSecondary}
          onSubmitEditing={submit}
          returnKeyType="done"
          multiline
        />
      </View>
      <GradientButton title="Regel toevoegen" disabled={draft.trim().length < 3} onPress={submit} />

      <Text style={styles.sectionTitle}>Jouw regels ({rules.length})</Text>
      {rules.length === 0 ? (
        <Text style={styles.empty}>
          Nog geen eigen regels. Voorbeelden: "Noem altijd onze openingstijden op vrijdag",
          "Gebruik nooit uitroeptekens", "Sluit altijd af met #ribhousetexas".
        </Text>
      ) : (
        <View style={styles.ruleList}>
          {rules.map((rule, index) => (
            <View key={`${index}-${rule}`} style={styles.ruleCard}>
              <Text style={styles.ruleText}>{rule}</Text>
              <Pressable
                onPress={() => removeRule(index)}
                hitSlop={10}
                accessibilityLabel={`Verwijder regel: ${rule}`}
                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  heading: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  label: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  inputRow: { marginBottom: Spacing.sm },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.card,
    minHeight: 56,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  empty: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  ruleList: { gap: Spacing.sm },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.card,
  },
  ruleText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: Colors.danger, fontSize: 14, fontWeight: '700' },
});
