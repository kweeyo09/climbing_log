import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSessionStore } from '../store/sessions';
import { hasSeenOnboarding } from './onboarding';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const loadSessions = useSessionStore(s => s.loadSessions);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Load sessions from AsyncStorage
      await loadSessions();
      // Check if onboarding has been seen
      const seen = await hasSeenOnboarding();
      if (!seen) {
        router.replace('/onboarding');
      }
      setChecked(true);
    };
    init();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="session/[id]"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
}
