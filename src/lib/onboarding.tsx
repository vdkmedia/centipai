import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AccountType = 'company' | 'agency';

/**
 * Het brandprofiel dat bij elke caption-generatie wordt meegestuurd.
 * Ingevuld via de onboarding: websitelink + 4 vragen.
 */
export interface BrandProfile {
  companyName: string;
  website: string;
  /** Vraag 1 — type bedrijf/branche */
  industry: string | null;
  /** Vraag 2 — toon: 1 = heel persoonlijk … 5 = strikt zakelijk */
  tone: number | null;
  /** Vraag 3 — je of u */
  formOfAddress: 'je' | 'u' | null;
  /** Vraag 4 — taal van de captions + emoji-gebruik */
  language: 'nl' | 'en' | 'de' | 'fr' | null;
  useEmoji: boolean;
}

export interface OnboardingState {
  accountType: AccountType | null;
  brand: BrandProfile;
}

const EMPTY: OnboardingState = {
  accountType: null,
  brand: {
    companyName: '',
    website: '',
    industry: null,
    tone: null,
    formOfAddress: null,
    language: null,
    useEmoji: true,
  },
};

interface OnboardingContextValue {
  state: OnboardingState;
  setAccountType: (t: AccountType) => void;
  updateBrand: (patch: Partial<BrandProfile>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const STORAGE_KEY = 'centipai.onboarding.v1';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(EMPTY);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setState({ ...EMPTY, ...JSON.parse(raw), brand: { ...EMPTY.brand, ...JSON.parse(raw).brand } });
        } catch {
          // corrupt opgeslagen state → opnieuw beginnen
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      state,
      setAccountType: (accountType) => setState((s) => ({ ...s, accountType })),
      updateBrand: (patch) => setState((s) => ({ ...s, brand: { ...s.brand, ...patch } })),
      reset: () => setState(EMPTY),
    }),
    [state],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}

export const TONE_LABELS: Record<number, string> = {
  1: 'Heel persoonlijk',
  2: 'Persoonlijk',
  3: 'Neutraal',
  4: 'Zakelijk',
  5: 'Strikt zakelijk',
};

export const LANGUAGE_LABELS: Record<NonNullable<BrandProfile['language']>, string> = {
  nl: 'Nederlands',
  en: 'Engels',
  de: 'Duits',
  fr: 'Frans',
};
