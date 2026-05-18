import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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

  const app = (
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

  if (Platform.OS !== 'web') {
    return app;
  }

  return (
    <View style={styles.webPreviewShell}>
      <View style={styles.webPreviewFrame}>{app}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webPreviewShell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#d9d0c0',
  },
  webPreviewFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    backgroundColor: '#efe7d8',
  },
});
