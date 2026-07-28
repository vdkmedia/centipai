import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CentiFigure } from '@/components/ui/centi-figure';
import { Centi } from '@/components/ui/centi';
import { Brand, Colors, Radius, Spacing } from '@/constants/theme';
import {
  CHANNELS,
  CHANNELS_PER_TYPE,
  POST_TYPES,
  SCHEDULE_SLOTS,
  generateDemoCaptions,
  nextId,
  type ChatMessage,
  type ChatPhoto,
  type PostTypeId,
} from '@/lib/chat';
import { useOnboarding } from '@/lib/onboarding';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width > 700;
  const { state } = useOnboarding();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      from: 'centi',
      kind: 'text',
      text: `Hoi! Drop een foto en vertel wat je wilt posten, dan schrijf ik captions in de stijl van ${
        state.brand.companyName || 'je bedrijf'
      }. 📸`,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [photos, setPhotos] = useState<ChatPhoto[]>([]);
  const [thinking, setThinking] = useState(false);
  const [chosenCaption, setChosenCaption] = useState<string | null>(null);
  const [channels, setChannels] = useState<string[]>(['instagram', 'facebook']);
  const [postType, setPostType] = useState<PostTypeId>('post');
  const [celebrate, setCelebrate] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollDown = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((p) => [...p, ...result.assets.map((a) => ({ uri: a.uri }))].slice(0, 4));
    }
  };

  const send = () => {
    const text = draft.trim();
    if (!text && photos.length === 0) return;

    const userMsg: ChatMessage = { id: nextId(), from: 'user', text: text || undefined, photos };
    setMessages((m) => [...m, userMsg]);
    setDraft('');
    setPhotos([]);
    setThinking(true);
    scrollDown();

    // DEMO: lokaal gegenereerd; later een backend-call naar Claude.
    setTimeout(() => {
      const captions = generateDemoCaptions(state.brand, text);
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          from: 'centi',
          kind: 'text',
          text: 'Kijk eens! Drie voorstellen in jouw stijl. Tik je favoriet aan. 👇',
        },
        { id: nextId(), from: 'centi', kind: 'captions', captions },
      ]);
      setThinking(false);
      scrollDown();
    }, 1600);
  };

  const chooseCaption = (caption: string) => {
    setChosenCaption(caption);
    setMessages((m) => [
      ...m,
      { id: nextId(), from: 'user', text: 'Deze wil ik gebruiken!' },
      { id: nextId(), from: 'centi', kind: 'schedule', caption },
    ]);
    scrollDown();
  };

  const schedule = (when: string) => {
    if (!chosenCaption) return;
    const supported = CHANNELS_PER_TYPE[postType];
    setMessages((m) => [
      ...m,
      {
        id: nextId(),
        from: 'centi',
        kind: 'planned',
        caption: chosenCaption,
        when,
        channels: CHANNELS.filter((c) => channels.includes(c.id) && supported.includes(c.id)).map(
          (c) => c.label,
        ),
        postType,
      },
    ]);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1500);
    scrollDown();
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={[styles.headerInner, isWide && styles.wideColumn]}>
          <CentiFigure size={46} happy={celebrate} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Centi</Text>
            <Text style={styles.headerSubtitle}>
              {thinking ? 'is aan het schrijven…' : 'online · schrijft in jouw stijl'}
            </Text>
          </View>
        </View>
      </View>

      {/* Berichten */}
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        contentContainerStyle={[styles.listContent, isWide && styles.wideColumn]}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onChooseCaption={chooseCaption}
            onSchedule={schedule}
            channels={channels}
            toggleChannel={(id) =>
              setChannels((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
            }
            postType={postType}
            setPostType={setPostType}
          />
        ))}
        {thinking ? (
          <View style={styles.centiRow}>
            <Centi size={40} thinking />
          </View>
        ) : null}
      </ScrollView>

      {/* Invoer */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        <View style={[styles.inputInner, isWide && styles.wideColumn]}>
          {photos.length > 0 ? (
            <View style={styles.photoPreviewRow}>
              {photos.map((p, i) => (
                <View key={p.uri + i}>
                  <Image source={{ uri: p.uri }} style={styles.photoPreview} />
                  <Pressable
                    style={styles.photoRemove}
                    onPress={() => setPhotos((arr) => arr.filter((_, idx) => idx !== i))}>
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.inputRow}>
            <Pressable onPress={pickPhotos} style={styles.photoBtn} accessibilityLabel="Foto toevoegen">
              <Text style={{ fontSize: 20 }}>📷</Text>
            </Pressable>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Bijv. maak een caption voor deze spare ribs"
              placeholderTextColor={Colors.textSecondary}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <Pressable
              onPress={send}
              style={[styles.sendBtn, !(draft.trim() || photos.length) && { opacity: 0.4 }]}
              accessibilityLabel="Versturen">
              <Text style={styles.sendBtnText}>➤</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function MessageBubble({
  msg,
  onChooseCaption,
  onSchedule,
  channels,
  toggleChannel,
  postType,
  setPostType,
}: {
  msg: ChatMessage;
  onChooseCaption: (c: string) => void;
  onSchedule: (when: string) => void;
  channels: string[];
  toggleChannel: (id: string) => void;
  postType: PostTypeId;
  setPostType: (t: PostTypeId) => void;
}) {
  if (msg.from === 'user') {
    return (
      <View style={styles.userWrap}>
        {msg.photos?.length ? (
          <View style={styles.userPhotos}>
            {msg.photos.map((p, i) => (
              <Image key={p.uri + i} source={{ uri: p.uri }} style={styles.userPhoto} />
            ))}
          </View>
        ) : null}
        {msg.text ? (
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{msg.text}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  if (msg.kind === 'text') {
    return (
      <View style={styles.centiRow}>
        <Centi size={40} message={msg.text} />
      </View>
    );
  }

  if (msg.kind === 'captions') {
    return (
      <View style={styles.captionList}>
        {msg.captions.map((c) => (
          <Pressable key={c} style={styles.captionCard} onPress={() => onChooseCaption(c)}>
            <Text style={styles.captionText}>{c}</Text>
            <Text style={styles.captionHint}>Tik om te kiezen</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (msg.kind === 'schedule') {
    return (
      <View style={styles.centiRow}>
        <View style={{ flex: 1, gap: Spacing.sm }}>
          <Centi size={40} message="Topkeuze! Wordt het een post, story of reel? En waar en wanneer plaatsen we hem?" />
          <View style={styles.chipsRow}>
            {POST_TYPES.map((t) => {
              const active = postType === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setPostType(t.id)}
                  style={[styles.typeChip, active && styles.typeChipActive]}>
                  <Text style={styles.typeChipEmoji}>{t.emoji}</Text>
                  <Text style={[styles.chipText, active && styles.typeChipTextActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.chipsRow}>
            {CHANNELS.map((ch) => {
              const supported = CHANNELS_PER_TYPE[postType].includes(ch.id);
              const active = supported && channels.includes(ch.id);
              return (
                <Pressable
                  key={ch.id}
                  disabled={!supported}
                  onPress={() => toggleChannel(ch.id)}
                  style={[styles.chip, active && styles.chipActive, !supported && styles.chipDisabled]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{ch.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {postType !== 'post' ? (
            <Text style={styles.formatHint}>
              {postType === 'story'
                ? 'Stories kunnen op Instagram en Facebook.'
                : 'Reels kunnen op Instagram, Facebook en TikTok.'}
            </Text>
          ) : null}
          <View style={styles.chipsRow}>
            {SCHEDULE_SLOTS.map((slot) => (
              <Pressable key={slot.id} onPress={() => onSchedule(slot.label)} style={styles.slotChip}>
                <Text style={styles.slotChipText}>{slot.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // planned
  return (
    <View style={styles.centiRow}>
      <View style={{ flex: 1, gap: Spacing.sm }}>
        <Centi
          size={40}
          mood="happy"
          message={`Ingepland als ${msg.postType === 'post' ? 'post' : msg.postType}! ${msg.when} op ${msg.channels.join(' en ')}. 🎉`}
        />
        <View style={styles.plannedCard}>
          <Text style={styles.plannedLabel}>
            {msg.postType === 'story' ? 'INGEPLANDE STORY' : msg.postType === 'reel' ? 'INGEPLANDE REEL' : 'INGEPLANDE POST'}
          </Text>
          <Text style={styles.plannedCaption}>{msg.caption}</Text>
          <Text style={styles.plannedMeta}>
            {msg.when} · {msg.channels.join(', ')} · wacht op goedkeuring
          </Text>
          {msg.postType === 'reel' ? (
            <Text style={styles.plannedMeta}>Tip: voeg een korte video toe voor het beste resultaat.</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, width: '100%', alignSelf: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  headerSubtitle: { fontSize: 12.5, color: Colors.textSecondary },
  wideColumn: { maxWidth: 640, alignSelf: 'center', width: '100%' },
  list: { flex: 1 },
  listContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  centiRow: { flexDirection: 'row', width: '100%' },
  userWrap: { alignItems: 'flex-end', gap: 6 },
  userPhotos: { flexDirection: 'row', gap: 6 },
  userPhoto: { width: 96, height: 96, borderRadius: Radius.md, backgroundColor: Colors.backgroundSoft },
  userBubble: {
    backgroundColor: Brand.pink,
    borderRadius: Radius.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  userText: { color: Colors.textInverse, fontSize: 15, lineHeight: 21 },
  captionList: { gap: Spacing.sm, marginLeft: 56 },
  captionCard: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    gap: 6,
  },
  captionText: { fontSize: 15, color: Colors.text, lineHeight: 21 },
  captionHint: { fontSize: 12, color: Brand.pink, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 56 },
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { borderColor: Brand.pink, backgroundColor: '#FEF5F9' },
  chipDisabled: { opacity: 0.35 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  typeChipActive: { borderColor: Brand.purple, backgroundColor: '#F6EEFD' },
  typeChipEmoji: { fontSize: 14 },
  typeChipTextActive: { color: Brand.purple },
  formatHint: { marginLeft: 56, fontSize: 12.5, color: Colors.textSecondary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Brand.pink },
  slotChip: {
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  slotChipText: { fontSize: 13.5, color: Colors.text, fontWeight: '600' },
  plannedCard: {
    marginLeft: 56,
    borderWidth: 1.5,
    borderColor: Brand.pink,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: '#FEF5F9',
    gap: 6,
  },
  plannedLabel: { fontSize: 11, fontWeight: '800', color: Brand.pink, letterSpacing: 1 },
  plannedCaption: { fontSize: 15, color: Colors.text, lineHeight: 21 },
  plannedMeta: { fontSize: 12.5, color: Colors.textSecondary },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
  },
  inputInner: { width: '100%', alignSelf: 'center', gap: Spacing.sm },
  photoPreviewRow: { flexDirection: 'row', gap: 8 },
  photoPreview: { width: 56, height: 56, borderRadius: Radius.sm, backgroundColor: Colors.backgroundSoft },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  photoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.card,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
