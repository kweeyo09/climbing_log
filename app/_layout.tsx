import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSessionStore } from '../store/sessions';

export default function RootLayout() {
  const loadSessions = useSessionStore(s => s.loadSessions);

  // Load persisted sessions from SQLite when the app first opens
  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        {/* session/[id] slides up as a modal sheet */}
        <Stack.Screen
          name="session/[id]"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
}
