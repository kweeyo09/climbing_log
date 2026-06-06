import { useEffect } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useSessionStore } from '../store/sessions';
import { colors, typography } from '../constants/theme';

const defaultTextStyle = {
  fontFamily: typography.family.regular,
  color: colors.text,
};

(Text as unknown as { defaultProps?: { style?: unknown } }).defaultProps = {
  ...(Text as unknown as { defaultProps?: { style?: unknown } }).defaultProps,
  style: [
    (Text as unknown as { defaultProps?: { style?: unknown } }).defaultProps?.style,
    defaultTextStyle,
  ],
};

(TextInput as unknown as { defaultProps?: { style?: unknown; placeholderTextColor?: string } }).defaultProps = {
  ...(TextInput as unknown as { defaultProps?: { style?: unknown; placeholderTextColor?: string } }).defaultProps,
  placeholderTextColor: colors.text3,
  style: [
    (TextInput as unknown as { defaultProps?: { style?: unknown } }).defaultProps?.style,
    defaultTextStyle,
  ],
};

export default function RootLayout() {
  const loadSessions = useSessionStore(s => s.loadSessions);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    'BarlowCondensed-Regular': require('../assets/fonts/BarlowCondensed-Regular.ttf'),
    'BarlowCondensed-Medium': require('../assets/fonts/BarlowCondensed-Medium.ttf'),
    'BarlowCondensed-SemiBold': require('../assets/fonts/BarlowCondensed-SemiBold.ttf'),
    'BarlowCondensed-Bold': require('../assets/fonts/BarlowCondensed-Bold.ttf'),
    'Barlow Condensed': require('../assets/fonts/BarlowCondensed-Regular.ttf'),
  });

  useEffect(() => {
    loadSessions();
  }, []);

  if (!fontsLoaded && Platform.OS !== 'web') {
    return <View style={styles.loadingShell} />;
  }

  const app = (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="session/[id]" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="account-details" />
        <Stack.Screen name="privacy-policy" />
        <Stack.Screen name="delete-account" />
        <Stack.Screen name="support" />
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
  loadingShell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  webPreviewShell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  webPreviewFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    backgroundColor: colors.bg,
  },
});
