import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../store/sessions';
import { getTopGrade, V_GRADES } from '../../constants/grades';
import { colors, typography } from '../../constants/theme';

const TAB_BAR_HEIGHT = 92;
const DEMO_IMAGE: ImageSourcePropType = require('../../assets/mockups/indoor_bouldering_activity.jpg');
const STAT_ICONS: Record<WeeklyStatIcon, ImageSourcePropType> = {
  sessions: require('../../assets/icons/stat_sessions.png'),
  duration: require('../../assets/icons/stat_clock.png'),
  routes: require('../../assets/icons/stat_routes.png'),
  hardest: require('../../assets/icons/stat_hardest.png'),
};

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
  return (
    <Image
      source={STAT_ICONS[variant]}
      style={s.statIconImage}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

function MiniTrend({ points }: { points: Array<{ date: string; grade: string; index: number }> }) {
  const CHART_LABELS = ['V6', 'V4', 'V2', 'V0'];
  const minIdx = Math.min(...points.map(p => p.index), 0);
  const maxIdx = Math.max(...points.map(p => p.index), 6);
  const range = maxIdx - minIdx || 1;
  const positioned = points.map((p, i) => ({
    ...p,
    x: points.length === 1 ? 50 : 6 + (i * 88) / (points.length - 1),
    y: 90 - ((p.index - minIdx) / range) * 75,
  }));

  return (
    <View style={s.chartWrap}>
      <View style={s.chartLabels}>
        {CHART_LABELS.map(label => <Text key={label} style={s.chartLabel}>{label}</Text>)}
      </View>
      <View style={s.chartColumn}>
        <View style={s.chartArea}>
          {[0, 1, 2, 3].map(i => <View key={i} style={[s.gridLine, { top: 12 + i * 35 }]} />)}
          {positioned.slice(0, -1).map((p, i) => {
            const next = positioned[i + 1];
            const dx = next.x - p.x;
            const dy = next.y - p.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={`seg-${i}`}
                style={[s.segment, { left: `${p.x}%` as any, top: `${p.y}%` as any, width: `${len}%` as any, transform: [{ rotate: `${angle}deg` }] }]}
              />
            );
          })}
          {positioned.map((p, i) => (
            <View key={`pt-${i}`} style={[i === positioned.length - 1 ? s.pointActive : s.point, { left: `${p.x}%` as any, top: `${p.y}%` as any }]} />
          ))}
        </View>
        <View style={s.chartDates}>
          {positioned.map(p => (
            <Text key={p.date} style={s.chartDate}>{new Date(p.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
          ))}
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

  const trendPoints = sessions
    .filter(s => s.grade_system === 'v')
    .slice(0, 5)
    .reverse()
    .map(s => {
      const done = s.routes.filter(r => r.completed);
      const best = done.reduce<typeof done[number] | null>((b, r) => {
        if (!b) return r;
        return V_GRADES.indexOf(r.grade) > V_GRADES.indexOf(b.grade) ? r : b;
      }, null);
      return best ? { date: s.date, grade: best.grade, index: V_GRADES.indexOf(best.grade) } : null;
    })
    .filter(Boolean) as Array<{ date: string; grade: string; index: number }>;
  const hasTrend = trendPoints.length >= 2;

  const displaySessions = weekSessions.length;
  const displayDuration = weekMinutes > 0 ? formatDuration(weekMinutes) : '--';
  const displayRoutes = weekRoutes;
  const displayTopGrade = topGrade || '--';
  const displayLocation = latestSession ? shortLocation(latestSession.location) : '';
  const displayRecentDuration = latestSession ? formatDuration(latestSession.duration || 0) : '';
  const displayRecentRoutes = latestSession ? latestSession.routes.length : 0;
  const displayRecentSends = latestSession ? latestSession.routes.filter(route => route.completed).length : 0;
  const recentImage: ImageSourcePropType = latestSession?.photo_uris?.[0] ? { uri: latestSession.photo_uris[0] } : DEMO_IMAGE;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.avatar}>
            <Ionicons name="person-outline" size={22} color={colors.text3} />
          </View>
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
              <Text style={s.metricValueDuration}>{displayDuration}</Text>
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

        {hasData && (
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
        )}

        {hasTrend && (
          <TouchableOpacity style={s.trendCard} activeOpacity={0.86} onPress={() => router.push('/(tabs)/stats')}>
            <View style={s.cardTitleRow}>
              <Text style={s.cardHeading}>GRADE TREND</Text>
              <Ionicons name="chevron-forward" size={25} color={colors.accent} />
            </View>
            <MiniTrend points={trendPoints} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: TAB_BAR_HEIGHT + 26 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 22 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  brand: { flex: 1, fontSize: 40, lineHeight: 44, letterSpacing: -1.3, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  brandSmall: { fontSize: 34, letterSpacing: -1 },
  backupPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentDim, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  backupText: { fontSize: 13, color: colors.accent, fontFamily: typography.family.label, fontWeight: typography.weight.medium },
  bellButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },

  weekCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16, marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  cardHeading: { fontSize: 19, lineHeight: 23, letterSpacing: 0.2, color: colors.accentDark, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17, marginBottom: 16 },
  statIconImage: { width: 36, height: 36 },
  metricItem: { flex: 1, minHeight: 82, alignItems: 'center', justifyContent: 'flex-start' },
  metricItemWide: { flex: 1.3, minHeight: 82, alignItems: 'center', justifyContent: 'flex-start' },
  metricValue: { marginTop: 4, fontSize: 28, lineHeight: 32, letterSpacing: -0.8, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, textAlign: 'center' },
  metricValueDuration: { marginTop: 4, fontSize: 22, lineHeight: 26, letterSpacing: -0.5, color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, textAlign: 'center' },
  metricCaption: { marginTop: 0, fontSize: 14, lineHeight: 16, color: colors.text2, fontFamily: typography.family.label, fontWeight: typography.weight.medium, textAlign: 'center' },
  hardestLabel: { marginTop: 2, fontSize: 14, color: colors.text2, fontFamily: typography.family.label, fontWeight: typography.weight.medium, textAlign: 'center' },
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
