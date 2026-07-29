import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PostTypeId } from '@/lib/chat';
import { supabase } from '@/lib/supabase';

export interface PlannedPost {
  id: string;
  caption: string;
  postType: PostTypeId;
  channels: string[];
  scheduledAt: string; // ISO
  status: 'pending_approval' | 'scheduled';
  createdAt: string;
}

const STORAGE_KEY = 'centipai.planner.v1';

/**
 * Planner-opslag: altijd lokaal (zodat de planning ook in demo-modus werkt),
 * en daarnaast in de Supabase posts-tabel zodra er een ingelogde sessie is.
 */
export async function addPlannedPost(post: Omit<PlannedPost, 'id' | 'createdAt'>): Promise<PlannedPost> {
  const full: PlannedPost = {
    ...post,
    id: `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    createdAt: new Date().toISOString(),
  };

  const list = await listPlannedLocal();
  list.push(full);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));

  // Ingelogd? Dan ook echt opslaan in de database.
  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (userId) {
        const { data: company } = await supabase.from('companies').select('id').limit(1).maybeSingle();
        if (company) {
          await supabase.from('posts').insert({
            company_id: company.id,
            created_by: userId,
            post_type: post.postType,
            caption: post.caption,
            channels: post.channels,
            status: post.status,
            scheduled_at: post.scheduledAt,
          });
        }
      }
    } catch {
      // Lokale opslag is leidend; databasefouten mogen de flow niet breken
    }
  }

  return full;
}

async function listPlannedLocal(): Promise<PlannedPost[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlannedPost[]) : [];
  } catch {
    return [];
  }
}

export async function listPlannedPosts(): Promise<PlannedPost[]> {
  // Database eerst (bron van waarheid als je bent ingelogd), anders lokaal
  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const { data } = await supabase
          .from('posts')
          .select('id, caption, post_type, channels, status, scheduled_at, created_at')
          .order('scheduled_at', { ascending: true });
        if (data && data.length > 0) {
          return data.map((p) => ({
            id: p.id,
            caption: p.caption,
            postType: p.post_type as PostTypeId,
            channels: p.channels ?? [],
            scheduledAt: p.scheduled_at,
            status: (p.status === 'scheduled' ? 'scheduled' : 'pending_approval') as PlannedPost['status'],
            createdAt: p.created_at,
          }));
        }
      }
    } catch {
      // stil terugvallen op lokaal
    }
  }
  const local = await listPlannedLocal();
  return local.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}
