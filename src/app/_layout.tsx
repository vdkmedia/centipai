import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { OnboardingProvider } from '@/lib/onboarding';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        />
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
