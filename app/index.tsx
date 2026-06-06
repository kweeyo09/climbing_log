import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { hasSeenOnboarding } from './onboarding';
import { colors } from '../constants/theme';

export default function Index() {
  const [target, setTarget] = useState<'/(tabs)' | '/onboarding' | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then(seen => {
      setTarget(seen ? '/(tabs)' : '/onboarding');
    });
  }, []);

  if (!target) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <Redirect href={target} />;
}
