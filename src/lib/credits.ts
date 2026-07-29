import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

const DEMO_KEY = 'centipai.democredits.v1';
const DEMO_START = 25;

/**
 * Actueel creditsaldo. Ingelogd: uit de database (credit_balances, dus het
 * saldo van het bedrijfsaccount waarin je werkt). Demo-modus: lokale teller
 * die bij 25 start en per generate afloopt, zodat het gedrag voelbaar is.
 */
export async function getCreditBalance(): Promise<number> {
  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const { data: company } = await supabase.from('companies').select('id').limit(1).maybeSingle();
        if (company) {
          const { data } = await supabase
            .from('credit_balances')
            .select('balance')
            .eq('company_id', company.id)
            .maybeSingle();
          if (data) return data.balance ?? 0;
        }
      }
    } catch {
      // val terug op demo-teller
    }
  }
  const raw = await AsyncStorage.getItem(DEMO_KEY);
  return raw === null ? DEMO_START : Number(raw);
}

/** Demo-modus: 1 credit afboeken bij een generate (de backend doet dit zelf). */
export async function spendDemoCredit(): Promise<number> {
  const current = await getCreditBalance();
  const next = Math.max(0, current - 1);
  await AsyncStorage.setItem(DEMO_KEY, String(next));
  return next;
}
