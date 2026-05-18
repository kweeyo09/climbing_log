import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_BAR_HEIGHT = 78;
const TAB_BAR_PADDING_TOP = 10;
const TAB_BAR_PADDING_BOTTOM = 20;
const LOG_TAB_VERTICAL_OFFSET = 10;

const TAB_CONFIG: Array<{
  name:    string;
  title:   string;
  icon:    IoniconsName;
  iconOn:  IoniconsName;
}> = [
  { name: 'index',   title: 'Calendar', icon: 'calendar-outline',   iconOn: 'calendar'        },
  { name: 'log',     title: 'Log',      icon: 'add-circle-outline',  iconOn: 'add-circle'      },
  { name: 'history', title: 'Sessions', icon: 'list-outline',        iconOn: 'list'            },
  { name: 'stats',   title: 'Stats',    icon: 'bar-chart-outline',   iconOn: 'bar-chart'       },
];

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
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabelStyle: {
          fontSize:      10,
          fontWeight:    '700',
          letterSpacing: 0.6,
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
              <Ionicons
                name={focused ? tab.iconOn : tab.icon}
                size={22}
                color={color}
              />
            ),
            tabBarItemStyle: tab.name === 'log'
              ? { transform: [{ translateY: LOG_TAB_VERTICAL_OFFSET }] }
              : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}
