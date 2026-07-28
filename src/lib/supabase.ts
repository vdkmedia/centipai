import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// Tijdens de statische web-export draait deze module in Node zonder
// `window`; de client mag dan niet aangemaakt worden (sessie-opslag heeft
// de browser nodig). In de browser en op iOS/Android is hij er gewoon.
const isStaticRender = Platform.OS === 'web' && typeof window === 'undefined';

/**
 * Supabase-client. `null` zolang de env-vars niet zijn gezet (zie SETUP.md);
 * de app werkt dan in demo-modus zonder accounts.
 */
export const supabase: SupabaseClient | null =
  supabaseConfigured && !isStaticRender
    ? createClient(url!, anonKey!, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
