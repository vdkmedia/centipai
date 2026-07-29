import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { Screen } from '@/components/ui/screen';
import { Brand, Colors, Radius, Spacing } from '@/constants/theme';
import { router } from 'expo-router';

interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

interface GbProfile {
  address: string;
  phone: string;
  hours: DayHours[];
}

const DAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
const DEFAULT: GbProfile = {
  address: '',
  phone: '',
  hours: DAYS.map((_, i) => ({ open: i < 6, from: '09:00', to: '17:00' })),
};
const STORAGE_KEY = 'centipai.googlebusiness.v1';

/**
 * Google Mijn Bedrijf: bedrijfsinfo en openingstijden beheren. Wordt lokaal
 * bewaard; zodra het Google Business Profile-kanaal gekoppeld is, pushen we
 * wijzigingen via de API direct naar Google.
 */
export default function GoogleBusinessScreen() {
  const [profile, setProfile] = useState<GbProfile>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setProfile({ ...DEFAULT, ...JSON.parse(raw) });
        } catch {
          // ongeldig → defaults
        }
      }
    });
  }, []);

  const save = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateDay = (index: number, patch: Partial<DayHours>) => {
    setProfile((p) => ({
      ...p,
      hours: p.hours.map((h, i) => (i === index ? { ...h, ...patch } : h)),
    }));
  };

  return (
    <Screen
      footer={
        <View style={{ gap: Spacing.sm }}>
          {saved ? <Text style={styles.savedText}>✓ Opgeslagen</Text> : null}
          <GradientButton title="Opslaan" onPress={save} />
          <GradientButton title="Terug naar het menu" variant="outline" onPress={() => router.back()} />
        </View>
      }>
      <View style={styles.header}>
        <Centi message="Hier beheer je je Google Mijn Bedrijf-gegevens. Zodra je Google-kanaal gekoppeld is push ik wijzigingen direct door naar Google." />
      </View>

      <Text style={styles.heading}>Google Mijn Bedrijf</Text>

      <Text style={styles.label}>Adres</Text>
      <TextInput
        style={styles.input}
        value={profile.address}
        onChangeText={(v) => setProfile((p) => ({ ...p, address: v }))}
        placeholder="Straat 1, 1234 AB Plaats"
        placeholderTextColor={Colors.textSecondary}
      />

      <Text style={styles.label}>Telefoonnummer</Text>
      <TextInput
        style={styles.input}
        value={profile.phone}
        onChangeText={(v) => setProfile((p) => ({ ...p, phone: v }))}
        placeholder="0612345678"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="phone-pad"
      />

      <Text style={styles.sectionTitle}>Openingstijden</Text>
      <View style={styles.daysList}>
        {DAYS.map((day, i) => {
          const h = profile.hours[i];
          return (
            <View key={day} style={styles.dayRow}>
              <Text style={styles.dayName}>{day}</Text>
              {h.open ? (
                <View style={styles.timesRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={h.from}
                    onChangeText={(v) => updateDay(i, { from: v })}
                    placeholder="09:00"
                    placeholderTextColor={Colors.textSecondary}
                  />
                  <Text style={styles.timeDash}>tot</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={h.to}
                    onChangeText={(v) => updateDay(i, { to: v })}
                    placeholder="17:00"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              ) : (
                <Text style={styles.closedText}>Gesloten</Text>
              )}
              <Switch
                value={h.open}
                onValueChange={(v) => updateDay(i, { open: v })}
                trackColor={{ true: Brand.pink, false: Colors.border }}
                thumbColor="#fff"
              />
            </View>
          );
        })}
      </View>

      <Text style={styles.hint}>
        Nog niet gekoppeld aan Google? Wijzigingen worden alvast bewaard en gesynct zodra je het
        Google Mijn Bedrijf-kanaal verbindt.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  heading: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  label: { fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: Spacing.md, marginBottom: Spacing.sm },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.card,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  daysList: { gap: Spacing.sm },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.card,
  },
  dayName: { width: 88, fontSize: 14, fontWeight: '700', color: Colors.text },
  timesRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeInput: {
    flex: 1,
    maxWidth: 74,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    backgroundColor: Colors.backgroundSoft,
  },
  timeDash: { fontSize: 13, color: Colors.textSecondary },
  closedText: { flex: 1, fontSize: 14, color: Colors.textSecondary, fontStyle: 'italic' },
  hint: { marginTop: Spacing.lg, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  savedText: { textAlign: 'center', color: Colors.success, fontWeight: '700', fontSize: 14 },
});
