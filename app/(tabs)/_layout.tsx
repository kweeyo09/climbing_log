import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

const TAB_BAR_HEIGHT = 82;
const TAB_BAR_PADDING_TOP = 8;
const TAB_BAR_PADDING_BOTTOM = 12;
const TAB_ICON_SIZE = 22;

type TabIconKind = 'calendar' | 'log' | 'sessions' | 'stats';

const TAB_CONFIG: Array<{
  name:  string;
  title: string;
  icon:  TabIconKind;
}> = [
  { name: 'index',   title: 'Calendar', icon: 'calendar' },
  { name: 'log',     title: 'Log',      icon: 'log'      },
  { name: 'history', title: 'Sessions', icon: 'sessions' },
  { name: 'stats',   title: 'Stats',    icon: 'stats'    },
];

function TabIcon({ kind, color, focused }: { kind: TabIconKind; color: string; focused: boolean }) {
  const strokeWidth = focused ? 2.4 : 2;

  if (kind === 'calendar') {
    return (
      <View style={[styles.iconFrame, { borderColor: color, borderWidth: strokeWidth }]}>
        <View style={[styles.calendarTopRule, { backgroundColor: color }]} />
        <View style={styles.calendarRingsRow}>
          <View style={[styles.calendarRing, { backgroundColor: color }]} />
          <View style={[styles.calendarRing, { backgroundColor: color }]} />
        </View>
        <View style={styles.calendarGridRow}>
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (kind === 'log') {
    return (
      <View style={[styles.logCircle, { borderColor: color, borderWidth: strokeWidth }]}>
        <View style={[styles.logPlusVertical, { backgroundColor: color }]} />
        <View style={[styles.logPlusHorizontal, { backgroundColor: color }]} />
      </View>
    );
  }

  if (kind === 'sessions') {
    return (
      <View style={styles.sessionsIcon}>
        {[0, 1, 2].map(item => (
          <View key={item} style={styles.sessionRow}>
            <View style={[styles.sessionDot, { backgroundColor: color }]} />
            <View style={[styles.sessionLine, { backgroundColor: color }]} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.statsIcon}>
      <View style={[styles.statsBar, styles.statsBarShort, { backgroundColor: color }]} />
      <View style={[styles.statsBar, styles.statsBarTall, { backgroundColor: color }]} />
      <View style={[styles.statsBar, styles.statsBarMedium, { backgroundColor: color }]} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor:  colors.border,
          height:          TAB_BAR_HEIGHT,
          paddingBottom:   TAB_BAR_PADDING_BOTTOM,
          paddingTop:      TAB_BAR_PADDING_TOP,
        },
        tabBarItemStyle: {
          alignItems:     'center',
          justifyContent: 'center',
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginBottom: 3,
          marginTop:    0,
        },
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabelStyle: {
          fontSize:      10,
          fontWeight:    '700',
          letterSpacing: 0.6,
          lineHeight:    13,
          marginBottom:  0,
          textTransform: 'uppercase',
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

const styles = StyleSheet.create({
  iconFrame: {
    width:        TAB_ICON_SIZE,
    height:       TAB_ICON_SIZE,
    borderRadius: 5,
    position:     'relative',
  },
  calendarTopRule: {
    height:   2,
    left:     3,
    position: 'absolute',
    right:    3,
    top:      6,
  },
  calendarRingsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    left:           5,
    position:       'absolute',
    right:          5,
    top:            3,
  },
  calendarRing: {
    borderRadius: 2,
    height:       4,
    width:        3,
  },
  calendarGridRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    left:           6,
    position:       'absolute',
    right:          6,
    top:            12,
  },
  calendarDot: {
    borderRadius: 2,
    height:       4,
    width:        4,
  },
  logCircle: {
    alignItems:      'center',
    borderRadius:    TAB_ICON_SIZE / 2,
    height:          TAB_ICON_SIZE,
    justifyContent:  'center',
    position:        'relative',
    width:           TAB_ICON_SIZE,
  },
  logPlusHorizontal: {
    borderRadius: 1,
    height:       2.4,
    position:     'absolute',
    width:        10,
  },
  logPlusVertical: {
    borderRadius: 1,
    height:       10,
    position:     'absolute',
    width:        2.4,
  },
  sessionsIcon: {
    gap:            3,
    height:         TAB_ICON_SIZE,
    justifyContent: 'center',
    width:          TAB_ICON_SIZE,
  },
  sessionRow: {
    alignItems:    'center',
    flexDirection: 'row',
    gap:           4,
  },
  sessionDot: {
    borderRadius: 2,
    height:       4,
    width:        4,
  },
  sessionLine: {
    borderRadius: 2,
    height:       3,
    width:        14,
  },
  statsIcon: {
    alignItems:     'flex-end',
    flexDirection:  'row',
    gap:            3,
    height:         TAB_ICON_SIZE,
    justifyContent: 'center',
    width:          TAB_ICON_SIZE,
  },
  statsBar: {
    borderRadius: 2,
    width:        4,
  },
  statsBarShort: {
    height: 8,
  },
  statsBarTall: {
    height: 18,
  },
  statsBarMedium: {
    height: 13,
  },
});
