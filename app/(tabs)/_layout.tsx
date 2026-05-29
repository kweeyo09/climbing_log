import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../constants/theme';

const TAB_BAR_HEIGHT = 84;
const TAB_BAR_PADDING_TOP = 8;
const TAB_BAR_PADDING_BOTTOM = 12;
const TAB_ICON_SIZE = 26;

type TabIconKind = 'home' | 'log' | 'sessions' | 'progress' | 'profile';

const TAB_CONFIG: Array<{
  name: string;
  title: string;
  icon: TabIconKind;
}> = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'log', title: 'Log', icon: 'log' },
  { name: 'history', title: 'Sessions', icon: 'sessions' },
  { name: 'stats', title: 'Progress', icon: 'progress' },
  { name: 'profile', title: 'Profile', icon: 'profile' },
];

function TabIcon({ kind, color, focused }: { kind: TabIconKind; color: string; focused: boolean }) {
  const iconName = {
    home: focused ? 'home' : 'home-outline',
    log: focused ? 'add-circle' : 'add-circle-outline',
    sessions: focused ? 'calendar' : 'calendar-outline',
    progress: focused ? 'trending-up' : 'trending-up-outline',
    profile: focused ? 'person' : 'person-outline',
  }[kind] as keyof typeof Ionicons.glyphMap;

  return <Ionicons name={iconName} size={TAB_ICON_SIZE} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT,
          paddingBottom: TAB_BAR_PADDING_BOTTOM,
          paddingTop: TAB_BAR_PADDING_TOP,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
          elevation: 10,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 3,
        },
        tabBarIconStyle: {
          marginBottom: 2,
          marginTop: 0,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text2,
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontFamily: typography.family.label,
          fontWeight: typography.weight.semibold,
          letterSpacing: 0,
          lineHeight: 15,
          marginBottom: 0,
        },
      }}
    >
      {TAB_CONFIG.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <TabIcon kind={tab.icon} color={color} focused={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
