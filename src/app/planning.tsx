import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { Screen } from '@/components/ui/screen';
import { Brand, Colors, Radius, Spacing } from '@/constants/theme';
import { META_SYNC_WINDOW_DAYS, formatPlanDate } from '@/lib/chat';
import { getCreditBalance } from '@/lib/credits';
import { listPlannedPosts, type PlannedPost } from '@/lib/planner';

const TYPE_LABELS = { post: 'Post', story: 'Story', reel: 'Reel' } as const;
const CHANNEL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  threads: 'Threads',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  google_business: 'Google Mijn Bedrijf',
};

const FILTERS = [
  { id: 'all', label: 'Alle' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'threads', label: 'Threads' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'google_business', label: 'Google Mijn Bedrijf' },
] as const;

export default function PlanningScreen() {
  const [posts, setPosts] = useState<PlannedPost[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useFocusEffect(
    useCallback(() => {
      void listPlannedPosts().then(setPosts);
      void getCreditBalance().then(setCredits);
    }, []),
  );

  const upcoming = posts.filter(
    (p) =>
      new Date(p.scheduledAt).getTime() >= Date.now() - 3600_000 &&
      (filter === 'all' || p.channels.includes(filter)),
  );

  return (
    <Screen
      footer={<GradientButton title="Nieuwe post maken met Centi" onPress={() => router.push('/chat')} />}>
      <View style={styles.topRow}>
        <Text style={styles.heading}>Planning</Text>
        <Pressable onPress={() => router.push('/credits')} style={styles.creditsBadge}>
          <Text style={styles.creditsBadgeText}>⚡ {credits ?? '…'} credits</Text>
          <Text style={styles.creditsBadgeSub}>tik om bij te kopen</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.filterChip, active && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {upcoming.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Centi
            message={
              filter === 'all'
                ? 'Nog niks ingepland! Stuur me een foto in de chat en we zetten je eerste post in de planning.'
                : 'Niks ingepland voor dit kanaal. Kies een ander filter of plan iets nieuws in via de chat.'
            }
          />
        </View>
      ) : (
        <View style={styles.list}>
          {upcoming.map((post) => {
            const date = new Date(post.scheduledAt);
            const days = Math.ceil((date.getTime() - Date.now()) / (24 * 3600 * 1000));
            const hasMeta = post.channels.some((c) =>
              ['instagram', 'facebook', 'threads'].includes(c),
            );
            return (
              <View key={post.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{TYPE_LABELS[post.postType]}</Text>
                  </View>
                  <Text style={styles.date}>{formatPlanDate(date)}</Text>
                </View>
                <Text style={styles.caption} numberOfLines={3}>
                  {post.caption}
                </Text>
                <Text style={styles.meta}>
                  {post.channels.map((c) => CHANNEL_LABELS[c] ?? c).join(' · ')}
                </Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>
                      {post.status === 'scheduled' ? 'Ingepland' : 'Wacht op goedkeuring'}
                    </Text>
                  </View>
                  {hasMeta ? (
                    <View style={[styles.statusChip, styles.syncChip]}>
                      <Text style={[styles.statusChipText, styles.syncChipText]}>
                        {days <= META_SYNC_WINDOW_DAYS ? 'Synct met Meta' : `Meta-sync over ${days - META_SYNC_WINDOW_DAYS} dagen`}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.hint}>
        Je kunt tot een jaar vooruit plannen. Meta (Instagram, Facebook en Threads) accepteert zelf
        maximaal {META_SYNC_WINDOW_DAYS} dagen vooruit; posts die verder weg staan bewaart Centi en
        synct hij automatisch zodra ze binnen dat venster vallen.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heading: { fontSize: 28, fontWeight: '800', color: Colors.text },
  creditsBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF5F9',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  creditsBadgeText: { fontSize: 14, fontWeight: '800', color: Brand.pink },
  creditsBadgeSub: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
  emptyWrap: { marginTop: Spacing.lg },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  filterChip: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: { borderColor: Brand.pink, backgroundColor: '#FEF5F9' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: Brand.pink },
  list: { gap: Spacing.md },
  card: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typeBadge: {
    backgroundColor: '#F6EEFD',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeBadgeText: { fontSize: 12, fontWeight: '800', color: Brand.purple },
  date: { flex: 1, fontSize: 13.5, fontWeight: '700', color: Colors.text },
  caption: { fontSize: 14.5, color: Colors.text, lineHeight: 20 },
  meta: { fontSize: 12.5, color: Colors.textSecondary },
  statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statusChip: {
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  syncChip: { backgroundColor: '#FEF5F9' },
  syncChipText: { color: Brand.pink },
  hint: {
    marginTop: Spacing.xl,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
