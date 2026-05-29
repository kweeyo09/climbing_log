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

type WeeklyStatIcon = 'sessions' | 'duration' | 'routes' | 'hardest';

function StatIcon({ variant }: { variant: WeeklyStatIcon }) {
  if (variant === 'duration') {
    return (
      <View style={s.statIconFrame} accessibilityElementsHidden>
        <View style={s.clockRing} />
        <View style={s.clockHandVertical} />
        <View style={s.clockHandHorizontal} />
      </View>
    );
  }

  if (variant === 'routes') {
    return (
      <View style={s.statIconFrame} accessibilityElementsHidden>
        <View style={s.routeLineA} />
        <View style={s.routeLineB} />
        <View style={[s.routeNode, s.routeNodeTop]} />
        <View style={[s.routeNode, s.routeNodeMiddle]} />
        <View style={[s.routeNode, s.routeNodeBottom]} />
      </View>
    );
  }

  if (variant === 'hardest') {
    return (
      <View style={s.statIconFrame} accessibilityElementsHidden>
        <View style={s.hardestDot} />
        <View style={s.hardestPeakLeft} />
        <View style={s.hardestPeakRight} />
        <View style={s.hardestSmallPeakLeft} />
        <View style={s.hardestSmallPeakRight} />
        <View style={s.hardestBase} />
      </View>
    );
  }

  return (
    <View style={s.statIconFrame} accessibilityElementsHidden>
      <View style={s.sessionsCircle} />
      <View style={s.sessionsPeakLeft} />
      <View style={s.sessionsPeakRight} />
      <View style={s.sessionsSmallPeakLeft} />
      <View style={s.sessionsSmallPeakRight} />
    </View>
  );
}

function MiniTrend() {
  return (
    <View style={s.chartWrap}>
      <View style={s.chartLabels}>
        {['V6', 'V4', 'V2', 'V0'].map(label => <Text key={label} style={s.chartLabel}>{label}</Text>)}
      </View>
      <View style={s.chartColumn}>
        <View style={s.chartArea}>
          {[0, 1, 2, 3].map(i => <View key={i} style={[s.gridLine, { top: 12 + i * 35 }]} />)}
          <View style={[s.segment, s.seg1]} />
          <View style={[s.segment, s.seg2]} />
          <View style={[s.segment, s.seg3]} />
          <View style={[s.segment, s.seg4]} />
          <View style={[s.point, { left: '6%', top: 91 }]} />
          <View style={[s.point, { left: '28%', top: 76 }]} />
          <View style={[s.point, { left: '53%', top: 65 }]} />
          <View style={[s.point, { left: '75%', top: 76 }]} />
          <View style={s.pointActive} />
        </View>
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
            <Ionicons name="checkmark-circle-outline" size={17} color={colors.accent} />
            <Text style={s.backupText}>Backed up</Text>
          </View>
          <TouchableOpacity style={s.bellButton} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={28} color={colors.accentDark} />
          </TouchableOpacity>
        </View>

        <View style={s.weekCard}>
          <Text style={s.cardHeading}>THIS WEEK</Text>
          <View style={s.metricRow}>
            <View style={s.metricItem}>
              <StatIcon variant="sessions" />
              <Text style={s.metricValue}>{displaySessions}</Text>
              <Text style={s.metricCaption}>sessions</Text>
            </View>
            <View style={s.verticalRule} />
            <View style={s.metricItemWide}>
              <StatIcon variant="duration" />
              <Text style={s.metricValue}>{displayDuration}</Text>
            </View>
            <View style={s.verticalRule} />
            <View style={s.metricItem}>
              <StatIcon variant="routes" />
              <Text style={s.metricValue}>{displayRoutes}</Text>
              <Text style={s.metricCaption}>routes</Text>
            </View>
            <View style={s.verticalRule} />
            <View style={s.metricItem}>
              <StatIcon variant="hardest" />
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
            <Ionicons name="chevron-forward" size={25} color={colors.accent} />
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
            <Ionicons name="chevron-forward" size={25} color={colors.accent} />
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
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: TAB_BAR_HEIGHT + 26 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 22 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface },
  brand: { flex: 1, fontSize: 40, lineHeight: 44, letterSpacing: -1.3, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  brandSmall: { fontSize: 34, letterSpacing: -1 },
  backupPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentDim, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  backupText: { fontSize: 13, color: colors.accent, fontFamily: typography.family.label, fontWeight: typography.weight.medium },
  bellButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },

  weekCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16, marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  cardHeading: { fontSize: 19, lineHeight: 23, letterSpacing: 0.2, color: colors.accentDark, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17, marginBottom: 16 },
  statIconFrame: { width: 38, height: 34, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  sessionsCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2.7, borderColor: colors.accent, position: 'absolute', top: 2, left: 4 },
  sessionsPeakLeft: { position: 'absolute', width: 12, height: 3, backgroundColor: colors.accent, left: 10, top: 18, borderRadius: 3, transform: [{ rotate: '35deg' }] },
  sessionsPeakRight: { position: 'absolute', width: 17, height: 3, backgroundColor: colors.accent, left: 17, top: 16, borderRadius: 3, transform: [{ rotate: '-38deg' }] },
  sessionsSmallPeakLeft: { position: 'absolute', width: 10, height: 3, backgroundColor: colors.accent, left: 12, top: 20, borderRadius: 3, transform: [{ rotate: '-35deg' }] },
  sessionsSmallPeakRight: { position: 'absolute', width: 8, height: 3, backgroundColor: colors.accent, left: 9, top: 17, borderRadius: 3, transform: [{ rotate: '-35deg' }] },
  clockRing: { position: 'absolute', width: 31, height: 31, borderRadius: 16, borderWidth: 2.7, borderColor: colors.accent, left: 4, top: 2 },
  clockHandVertical: { position: 'absolute', width: 3, height: 11, backgroundColor: colors.accent, left: 18, top: 8, borderRadius: 3 },
  clockHandHorizontal: { position: 'absolute', width: 10, height: 3, backgroundColor: colors.accent, left: 18, top: 17, borderRadius: 3 },
  routeLineA: { position: 'absolute', width: 3, height: 17, backgroundColor: colors.accent, left: 13, top: 10, borderRadius: 3, transform: [{ rotate: '-1deg' }] },
  routeLineB: { position: 'absolute', width: 3, height: 18, backgroundColor: colors.accent, left: 21, top: 7, borderRadius: 3, transform: [{ rotate: '-42deg' }] },
  routeNode: { position: 'absolute', width: 9, height: 9, borderRadius: 5, borderWidth: 2.7, borderColor: colors.accent, backgroundColor: colors.card },
  routeNodeTop: { left: 20, top: 3 },
  routeNodeMiddle: { left: 9, top: 15 },
  routeNodeBottom: { left: 10, top: 26 },
  hardestDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, borderWidth: 2.7, borderColor: colors.accent, left: 18, top: 2, backgroundColor: colors.card },
  hardestPeakLeft: { position: 'absolute', width: 23, height: 3, backgroundColor: colors.accent, left: 7, top: 23, borderRadius: 3, transform: [{ rotate: '-42deg' }] },
  hardestPeakRight: { position: 'absolute', width: 20, height: 3, backgroundColor: colors.accent, left: 20, top: 22, borderRadius: 3, transform: [{ rotate: '42deg' }] },
  hardestSmallPeakLeft: { position: 'absolute', width: 13, height: 3, backgroundColor: colors.accent, left: 6, top: 24, borderRadius: 3, transform: [{ rotate: '42deg' }] },
  hardestSmallPeakRight: { position: 'absolute', width: 12, height: 3, backgroundColor: colors.accent, left: 17, top: 24, borderRadius: 3, transform: [{ rotate: '-42deg' }] },
  hardestBase: { position: 'absolute', width: 32, height: 3, backgroundColor: colors.accent, left: 3, top: 30, borderRadius: 3 },
  metricItem: { flex: 1, minHeight: 82, alignItems: 'center', justifyContent: 'flex-start' },
  metricItemWide: { flex: 1.3, minHeight: 82, alignItems: 'center', justifyContent: 'flex-start' },
  metricValue: { marginTop: 7, fontSize: 28, lineHeight: 32, letterSpacing: -0.8, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, textAlign: 'center' },
  metricCaption: { marginTop: 0, fontSize: 14, lineHeight: 16, color: colors.text2, fontFamily: typography.family.label, fontWeight: typography.weight.medium, textAlign: 'center' },
  hardestLabel: { marginTop: 4, fontSize: 14, color: colors.text2, fontFamily: typography.family.label, fontWeight: typography.weight.medium, textAlign: 'center' },
  verticalRule: { width: 1, height: 60, backgroundColor: colors.border, marginHorizontal: 8 },
  logButton: { height: 52, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  logButtonText: { fontSize: 22, color: colors.inverseText, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, letterSpacing: -0.2 },

  activityCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.055, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  activityBody: { flexDirection: 'row', gap: 14 },
  activityImage: { width: 148, height: 124, borderRadius: 14, backgroundColor: colors.surface },
  activityCopy: { flex: 1, paddingTop: 3 },
  activityTitle: { fontSize: 20, lineHeight: 24, letterSpacing: 0, color: colors.accentDark, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold },
  activityMeta: { marginTop: 6, fontSize: 13, lineHeight: 18, color: colors.text2, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  pillStack: { alignItems: 'flex-start', gap: 8, marginTop: 15 },
  statPill: { flexDirection: 'row', alignItems: 'baseline', gap: 7, backgroundColor: colors.accentDim, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 7 },
  statPillSmall: { flexDirection: 'row', alignItems: 'baseline', gap: 7, backgroundColor: colors.accentDim, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 7 },
  pillGrade: { fontSize: 25, lineHeight: 28, color: colors.accent, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, letterSpacing: -0.3 },
  pillLabel: { fontSize: 14, color: colors.accentDark, fontFamily: typography.family.label, fontWeight: typography.weight.medium },

  trendCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, minHeight: 218, shadowColor: colors.shadow, shadowOpacity: 0.045, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  chartWrap: { flexDirection: 'row', height: 154 },
  chartLabels: { width: 28, paddingTop: 2, justifyContent: 'space-between', paddingBottom: 28 },
  chartLabel: { fontSize: 13, lineHeight: 17, color: colors.text2, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  chartColumn: { flex: 1, marginLeft: 8 },
  chartArea: { height: 118, position: 'relative', borderBottomWidth: 1, borderBottomColor: colors.border, marginTop: 2 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderTopColor: '#D8D1E5', borderStyle: 'dashed' },
  segment: { position: 'absolute', height: 3, backgroundColor: colors.accent, borderRadius: 2, transformOrigin: 'left center' },
  seg1: { left: '7%', top: 96, width: '22%', transform: [{ rotate: '-8deg' }] },
  seg2: { left: '29%', top: 82, width: '24%', transform: [{ rotate: '-4deg' }] },
  seg3: { left: '53%', top: 70, width: '23%', transform: [{ rotate: '7deg' }] },
  seg4: { left: '76%', top: 78, width: '21%', transform: [{ rotate: '-12deg' }] },
  point: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  pointActive: { position: 'absolute', right: 5, top: 56, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, borderWidth: 4, borderColor: colors.accentDim },
  chartDates: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 9 },
  chartDate: { fontSize: 12, lineHeight: 16, color: colors.text2, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
});
