import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../store/sessions';
import { getTopGrade } from '../../constants/grades';
import { colors, typography } from '../../constants/theme';

const TAB_BAR_HEIGHT = 92;
const DEMO_IMAGE: ImageSourcePropType = require('../../assets/mockups/indoor_bouldering_activity.jpg');
const AVATAR_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80';

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function isSameOrAfter(a: Date, b: Date) {
  return a.getTime() >= b.getTime();
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function shortLocation(loc: string): string {
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  return parts.length > 2 ? parts[0] : loc;
}

function MiniTrend() {
  return (
    <View style={s.chartWrap}>
      <View style={s.chartLabels}>
        {['V6', 'V4', 'V2', 'V0'].map(label => <Text key={label} style={s.chartLabel}>{label}</Text>)}
      </View>
      <View style={s.chartArea}>
        {[0, 1, 2, 3].map(i => <View key={i} style={[s.gridLine, { top: 16 + i * 42 }]} />)}
        <View style={[s.segment, s.seg1]} />
        <View style={[s.segment, s.seg2]} />
        <View style={[s.segment, s.seg3]} />
        <View style={[s.segment, s.seg4]} />
        <View style={[s.point, { left: '6%', top: 109 }]} />
        <View style={[s.point, { left: '28%', top: 91 }]} />
        <View style={[s.point, { left: '53%', top: 78 }]} />
        <View style={[s.point, { left: '75%', top: 91 }]} />
        <View style={s.pointActive} />
        <View style={s.chartDates}>
          {['May 12', 'May 19', 'May 26', 'Jun 2', 'Jun 9'].map(label => <Text key={label} style={s.chartDate}>{label}</Text>)}
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const sessions = useSessionStore(st => st.sessions);
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekSessions = sessions.filter(session => isSameOrAfter(new Date(`${session.date}T12:00`), weekStart));
  const latestSession = sessions[0];
  const allRoutes = sessions.flatMap(session => session.routes);
  const weekRoutes = weekSessions.reduce((sum, session) => sum + session.routes.length, 0);
  const weekSends = weekSessions.reduce((sum, session) => sum + session.routes.filter(route => route.completed).length, 0);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const topGrade = latestSession ? getTopGrade(latestSession.routes, latestSession.grade_system) : getTopGrade(allRoutes, 'v');
  const hasData = sessions.length > 0;

  const displaySessions = hasData ? weekSessions.length : 3;
  const displayDuration = hasData ? formatDuration(weekMinutes) : '6h 20m';
  const displayRoutes = hasData ? weekRoutes : 42;
  const displayTopGrade = topGrade || 'V5';
  const displayLocation = latestSession ? shortLocation(latestSession.location) : 'City Bouldering Aldgate';
  const displayRecentDuration = latestSession ? formatDuration(latestSession.duration || 0) : '1h 45m';
  const displayRecentRoutes = latestSession ? latestSession.routes.length : 12;
  const displayRecentSends = latestSession ? latestSession.routes.filter(route => route.completed).length : 8;
  const recentImage: ImageSourcePropType = latestSession?.photo_uris?.[0] ? { uri: latestSession.photo_uris[0] } : DEMO_IMAGE;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Image source={{ uri: AVATAR_IMAGE }} style={s.avatar} accessibilityLabel="Profile avatar" />
          <Text style={[s.brand, isNarrow && s.brandSmall]}>Ascenta</Text>
          <View style={s.backupPill}>
            <Ionicons name="checkmark-circle-outline" size={19} color={colors.accent} />
            <Text style={s.backupText}>Backed up</Text>
          </View>
          <TouchableOpacity style={s.bellButton} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={31} color={colors.accentDark} />
          </TouchableOpacity>
        </View>

        <View style={s.weekCard}>
          <Text style={s.cardHeading}>THIS WEEK</Text>
          <View style={s.metricRow}>
            <View style={s.metricItem}>
              <Ionicons name="trail-sign-outline" size={31} color={colors.accent} />
              <Text style={s.metricValue}>{displaySessions}</Text>
              <Text style={s.metricCaption}>sessions</Text>
            </View>
            <View style={s.verticalRule} />
            <View style={s.metricItemWide}>
              <Ionicons name="time-outline" size={32} color={colors.accent} />
              <Text style={s.metricValue}>{displayDuration}</Text>
            </View>
            <View style={s.verticalRule} />
            <View style={s.metricItem}>
              <Ionicons name="git-merge-outline" size={33} color={colors.accent} />
              <Text style={s.metricValue}>{displayRoutes}</Text>
              <Text style={s.metricCaption}>routes</Text>
            </View>
            <View style={s.verticalRule} />
            <View style={s.metricItem}>
              <Ionicons name="image-outline" size={34} color={colors.accent} />
              <Text style={s.hardestLabel}>Hardest</Text>
              <Text style={s.metricValue}>{displayTopGrade}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.logButton} onPress={() => router.push('/(tabs)/log')} activeOpacity={0.86}>
            <Text style={s.logButtonText}>Log climb</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={s.activityCard}
          activeOpacity={0.86}
          onPress={() => latestSession ? router.push(`/session/${latestSession.id}`) : router.push('/(tabs)/log')}
        >
          <View style={s.cardTitleRow}>
            <Text style={s.cardHeading}>RECENT ACTIVITY</Text>
            <Ionicons name="chevron-forward" size={30} color={colors.accent} />
          </View>
          <View style={s.activityBody}>
            <Image source={recentImage} style={s.activityImage} accessibilityLabel="Recent climbing activity" />
            <View style={s.activityCopy}>
              <Text style={s.activityTitle} numberOfLines={2}>{displayLocation}</Text>
              <Text style={s.activityMeta}>Today · {displayRecentDuration} · {displayRecentRoutes} routes</Text>
              <View style={s.pillStack}>
                <View style={s.statPill}>
                  <Text style={s.pillGrade}>{displayTopGrade}</Text>
                  <Text style={s.pillLabel}>top grade</Text>
                </View>
                <View style={s.statPillSmall}>
                  <Text style={s.pillGrade}>{displayRecentSends}</Text>
                  <Text style={s.pillLabel}>sends</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.trendCard} activeOpacity={0.86} onPress={() => router.push('/(tabs)/stats')}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardHeading}>GRADE TREND</Text>
            <Ionicons name="chevron-forward" size={30} color={colors.accent} />
          </View>
          <MiniTrend />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: TAB_BAR_HEIGHT + 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 47, height: 47, borderRadius: 24, backgroundColor: colors.surface },
  brand: { flex: 1, fontSize: 43, lineHeight: 48, letterSpacing: -1.4, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  brandSmall: { fontSize: 37, letterSpacing: -1.1 },
  backupPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.accentDim, borderRadius: 22, paddingHorizontal: 13, paddingVertical: 8 },
  backupText: { fontSize: 15, color: colors.accent, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold },
  bellButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },

  weekCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 18, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  cardHeading: { fontSize: 22, lineHeight: 26, letterSpacing: -0.2, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 18 },
  metricItem: { flex: 1, minHeight: 96, alignItems: 'center', justifyContent: 'flex-start' },
  metricItemWide: { flex: 1.35, minHeight: 96, alignItems: 'center', justifyContent: 'flex-start' },
  metricValue: { marginTop: 8, fontSize: 32, lineHeight: 36, letterSpacing: -1.1, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, textAlign: 'center' },
  metricCaption: { marginTop: 0, fontSize: 15, lineHeight: 18, color: colors.text2, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium, textAlign: 'center' },
  hardestLabel: { marginTop: 5, fontSize: 15, color: colors.text2, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium, textAlign: 'center' },
  verticalRule: { width: 1, height: 72, backgroundColor: colors.border, marginHorizontal: 9 },
  logButton: { height: 58, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  logButtonText: { fontSize: 25, color: colors.inverseText, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, letterSpacing: -0.3 },

  activityCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 18, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  activityBody: { flexDirection: 'row', gap: 16 },
  activityImage: { width: 168, height: 141, borderRadius: 16, backgroundColor: colors.surface },
  activityCopy: { flex: 1, paddingTop: 5 },
  activityTitle: { fontSize: 22, lineHeight: 27, letterSpacing: -0.5, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  activityMeta: { marginTop: 7, fontSize: 15, lineHeight: 20, color: colors.text2, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  pillStack: { alignItems: 'flex-start', gap: 10, marginTop: 19 },
  statPill: { flexDirection: 'row', alignItems: 'baseline', gap: 9, backgroundColor: colors.accentDim, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 8 },
  statPillSmall: { flexDirection: 'row', alignItems: 'baseline', gap: 8, backgroundColor: colors.accentDim, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 8 },
  pillGrade: { fontSize: 29, lineHeight: 32, color: colors.accent, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, letterSpacing: -0.4 },
  pillLabel: { fontSize: 15, color: colors.accentDark, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold },

  trendCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 18, minHeight: 232, shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  chartWrap: { flexDirection: 'row', height: 162 },
  chartLabels: { width: 28, paddingTop: 4, justifyContent: 'space-between', paddingBottom: 23 },
  chartLabel: { fontSize: 14, color: colors.text2, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  chartArea: { flex: 1, position: 'relative', borderBottomWidth: 1, borderBottomColor: colors.border, marginLeft: 8, marginTop: 2 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderTopColor: '#D8D1E5', borderStyle: 'dashed' },
  segment: { position: 'absolute', height: 3, backgroundColor: colors.accent, borderRadius: 2, transformOrigin: 'left center' },
  seg1: { left: '7%', top: 115, width: '22%', transform: [{ rotate: '-8deg' }] },
  seg2: { left: '29%', top: 98, width: '24%', transform: [{ rotate: '-4deg' }] },
  seg3: { left: '53%', top: 84, width: '23%', transform: [{ rotate: '7deg' }] },
  seg4: { left: '76%', top: 93, width: '21%', transform: [{ rotate: '-12deg' }] },
  point: { position: 'absolute', width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  pointActive: { position: 'absolute', right: 5, top: 68, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, borderWidth: 4, borderColor: colors.accentDim },
  chartDates: { position: 'absolute', left: 0, right: 0, bottom: -28, flexDirection: 'row', justifyContent: 'space-between' },
  chartDate: { fontSize: 13, color: colors.text2, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
});
