import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../store/sessions';
import { colors, typography } from '../../constants/theme';
import { V_GRADES } from '../../constants/grades';

const V_CHART_GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

type MixItem = {
  label: 'Boulder' | 'Top rope' | 'Lead';
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
};

function formatHours(minutes: number) {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

function highestVGrade(grades: string[]) {
  if (grades.length === 0) return '—';
  return grades.reduce((best, grade) => (V_GRADES.indexOf(grade) > V_GRADES.indexOf(best) ? grade : best), grades[0]);
}

export default function StatsScreen() {
  const sessions = useSessionStore(s => s.sessions);

  const totalRoutes = sessions.reduce((acc, session) => acc + session.routes.length, 0);
  const completedRoutes = sessions.reduce((acc, session) => acc + session.routes.filter(route => route.completed).length, 0);
  const totalMins = sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
  const completedVGrades = sessions
    .filter(session => session.grade_system === 'v')
    .flatMap(session => session.routes.filter(route => route.completed).map(route => route.grade));
  const topVGrade = highestVGrade(completedVGrades);
  const longestSession = sessions.reduce((best, session) => Math.max(best, session.duration || 0), 0);
  const mostRoutes = sessions.reduce((best, session) => Math.max(best, session.routes.length), 0);

  const mix: MixItem[] = [
    {
      label: 'Boulder',
      icon: 'ellipse-outline',
      count: sessions.reduce((acc, session) => acc + session.routes.filter(route => route.style === 'Boulder').length, 0),
    },
    {
      label: 'Top rope',
      icon: 'git-branch-outline',
      count: sessions.reduce((acc, session) => acc + session.routes.filter(route => route.style === 'Top Rope' || route.style === 'Auto-belay').length, 0),
    },
    {
      label: 'Lead',
      icon: 'trail-sign-outline',
      count: sessions.reduce((acc, session) => acc + session.routes.filter(route => route.style === 'Lead').length, 0),
    },
  ];
  const mixTotal = Math.max(mix.reduce((acc, item) => acc + item.count, 0), 1);

  const vSessions = sessions
    .filter(session => session.grade_system === 'v')
    .slice(0, 8)
    .reverse()
    .map(session => {
      const done = session.routes.filter(route => route.completed);
      const bestRoute = done.reduce<typeof done[number] | null>((best, route) => {
        if (!best) return route;
        return V_GRADES.indexOf(route.grade) > V_GRADES.indexOf(best.grade) ? route : best;
      }, null);
      return bestRoute ? { date: session.date, grade: bestRoute.grade, index: V_GRADES.indexOf(bestRoute.grade) } : null;
    })
    .filter(Boolean) as Array<{ date: string; grade: string; index: number }>;

  const chartPoints = (vSessions.length >= 2 ? vSessions : [
    { date: '2026-04-20', grade: 'V2', index: 2 },
    { date: '2026-04-27', grade: 'V3', index: 3 },
    { date: '2026-05-04', grade: 'V3', index: 3 },
    { date: '2026-05-11', grade: 'V4', index: 4 },
    { date: '2026-05-18', grade: topVGrade !== '—' ? topVGrade : 'V5', index: Math.max(V_GRADES.indexOf(topVGrade), 5) },
  ]).slice(0, 5);
  const chartMin = Math.min(...chartPoints.map(point => point.index), 2);
  const chartMax = Math.max(...chartPoints.map(point => point.index), 6);
  const chartRange = chartMax - chartMin || 1;
  const positionedPoints = chartPoints.map((point, index) => ({
    ...point,
    x: chartPoints.length === 1 ? 50 : 10 + (index * 80) / (chartPoints.length - 1),
    y: 78 - ((point.index - chartMin) / chartRange) * 56,
  }));
  const newBest = topVGrade !== '—' ? topVGrade : positionedPoints[positionedPoints.length - 1]?.grade ?? 'V5';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Text style={s.screenTitle}>Progress</Text>
          <View style={s.rangePill}>
            <Ionicons name="calendar-outline" size={16} color={colors.accentDark} />
            <Text style={s.rangeText}>Last 30 days</Text>
            <Ionicons name="chevron-down" size={15} color={colors.accentDark} />
          </View>
        </View>

        <View style={s.metricRow}>
          <View style={[s.metricCard, s.metricUnderline]}>
            <View style={s.metricIconBubble}>
              <Ionicons name="triangle-outline" size={18} color={colors.accent} />
            </View>
            <Text style={s.metricLabel}>Sessions</Text>
            <Text style={s.metricValue}>{sessions.length}</Text>
          </View>
          <View style={[s.metricCard, s.metricUnderlineStrong]}>
            <View style={s.metricIconBubbleStrong}>
              <Ionicons name="time-outline" size={19} color={colors.accentDark} />
            </View>
            <Text style={s.metricLabel}>Hours</Text>
            <Text style={s.metricValue}>{formatHours(totalMins)}</Text>
          </View>
          <View style={[s.metricCard, s.metricUnderline]}>
            <View style={s.metricIconBubble}>
              <Ionicons name="flag-outline" size={18} color={colors.accent} />
            </View>
            <Text style={s.metricLabel}>Sends</Text>
            <Text style={s.metricValue}>{completedRoutes}</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Grade progression</Text>
            <View style={s.bestPill}>
              <Ionicons name="star" size={13} color={colors.accent} />
              <Text style={s.bestPillText}>New best {newBest}</Text>
            </View>
          </View>
          <View style={s.chartWrap}>
            {V_CHART_GRADES.slice().reverse().map((grade, index) => (
              <View key={grade} style={[s.gridLine, { top: 14 + index * 25 }] as any}>
                <Text style={s.gridLabel}>{grade}</Text>
                <View style={s.gridRule} />
              </View>
            ))}
            <View style={s.lineShade} />
            {positionedPoints.slice(0, -1).map((point, index) => {
              const next = positionedPoints[index + 1];
              const dx = next.x - point.x;
              const dy = next.y - point.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return (
                <View
                  key={`${point.date}-${next.date}`}
                  style={[
                    s.lineSegment,
                    {
                      left: `${point.x}%` as any,
                      top: `${point.y}%` as any,
                      width: `${length}%` as any,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
            {positionedPoints.map((point, index) => (
              <View
                key={`${point.date}-${index}`}
                style={[
                  s.point,
                  index === positionedPoints.length - 1 && s.pointActive,
                  { left: `${point.x}%` as any, top: `${point.y}%` as any },
                ]}
              />
            ))}
          </View>
          <View style={s.axisRow}>
            {positionedPoints.map((point, index) => (
              <Text key={`${point.date}-${index}`} style={s.axisLabel}>{new Date(point.date + 'T12:00').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</Text>
            ))}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Climbing mix</Text>
          <View style={s.mixList}>
            {mix.map((item, index) => {
              const pct = Math.round((item.count / mixTotal) * 100);
              return (
                <View key={item.label} style={s.mixRow}>
                  <View style={index === 0 ? s.mixIconBubble : s.mixIconBubbleStrong}>
                    <Ionicons name={item.icon} size={16} color={index === 0 ? colors.accent : colors.accentDark} />
                  </View>
                  <Text style={s.mixLabel}>{item.label}</Text>
                  <View style={s.mixTrack}>
                    <View style={[index === 0 ? s.mixFill : s.mixFillStrong, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={s.mixPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Personal bests</Text>
          <View style={s.bestRow}>
            <View style={s.bestItem}>
              <View style={s.bestIconBubble}>
                <Ionicons name="triangle-outline" size={17} color={colors.accent} />
              </View>
              <Text style={s.bestLabel}>Hardest send</Text>
              <Text style={s.bestValue}>{topVGrade}</Text>
            </View>
            <View style={s.bestDivider} />
            <View style={s.bestItem}>
              <View style={s.bestIconBubbleStrong}>
                <Ionicons name="timer-outline" size={17} color={colors.accentDark} />
              </View>
              <Text style={s.bestLabel}>Longest session</Text>
              <Text style={s.bestValueStrong}>{Math.floor(longestSession / 60)}h {longestSession % 60}m</Text>
            </View>
            <View style={s.bestDivider} />
            <View style={s.bestItem}>
              <View style={s.bestIconBubble}>
                <Ionicons name="bar-chart" size={17} color={colors.accent} />
              </View>
              <Text style={s.bestLabel}>Most routes</Text>
              <Text style={s.bestValue}>{mostRoutes}</Text>
            </View>
          </View>
        </View>

        {sessions.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No progress data yet</Text>
            <Text style={s.emptyText}>Log your first session to start building your performance history.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 112, paddingTop: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  screenTitle: { fontSize: 52, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.text, letterSpacing: -1.6, lineHeight: 54 },
  rangePill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 15, paddingHorizontal: 11, paddingVertical: 9, shadowColor: colors.shadow, shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  rangeText: { fontSize: 15, fontFamily: typography.family.label, fontWeight: typography.weight.medium, color: colors.text },
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: { flex: 1, minHeight: 132, backgroundColor: colors.card, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 12, shadowColor: colors.shadow, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2, overflow: 'hidden' },
  metricUnderline: { borderBottomColor: colors.accent, borderBottomWidth: 2 },
  metricUnderlineStrong: { borderBottomColor: colors.accentDark, borderBottomWidth: 2 },
  metricIconBubble: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentDim, marginBottom: 12 },
  metricIconBubbleStrong: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceStrong, marginBottom: 12 },
  metricLabel: { fontSize: 18, fontFamily: typography.family.label, fontWeight: typography.weight.medium, color: colors.text2, marginBottom: 6 },
  metricValue: { fontSize: 36, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, color: colors.text, letterSpacing: -0.9, lineHeight: 40 },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.04, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 24, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.text, letterSpacing: -0.5, lineHeight: 25 },
  bestPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentDim, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 7 },
  bestPillText: { fontSize: 14, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.accent },
  chartWrap: { height: 176, position: 'relative', marginTop: 4, overflow: 'visible' },
  gridLine: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  gridLabel: { width: 28, fontSize: 13, lineHeight: 17, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, color: colors.text2 },
  gridRule: { flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  lineShade: { position: 'absolute', left: 40, right: 12, bottom: 26, height: 78, backgroundColor: colors.accentDim, borderTopLeftRadius: 20, borderTopRightRadius: 20, opacity: 0.68 },
  lineSegment: { position: 'absolute', height: 2.5, backgroundColor: colors.accentDark, borderRadius: 3, marginLeft: 34, transformOrigin: 'left center' as any },
  point: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentDark, marginLeft: 31, marginTop: -3 },
  pointActive: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, borderWidth: 3, borderColor: '#EDE9FE', marginLeft: 26, marginTop: -8 },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 44, paddingRight: 8, marginTop: 6 },
  axisLabel: { fontSize: 12, lineHeight: 16, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, color: colors.text2 },
  mixList: { gap: 12, marginTop: 14 },
  mixRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mixIconBubble: { width: 31, height: 31, borderRadius: 9, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' },
  mixIconBubbleStrong: { width: 31, height: 31, borderRadius: 9, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
  mixLabel: { width: 72, fontSize: 17, fontFamily: typography.family.label, fontWeight: typography.weight.medium, color: colors.text },
  mixTrack: { flex: 1, height: 10, borderRadius: 7, backgroundColor: colors.surface, overflow: 'hidden' },
  mixFill: { height: '100%', borderRadius: 8, backgroundColor: colors.accent },
  mixFillStrong: { height: '100%', borderRadius: 8, backgroundColor: colors.accentDark },
  mixPct: { width: 40, textAlign: 'right', fontSize: 15, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, color: colors.text },
  bestRow: { flexDirection: 'row', alignItems: 'stretch', marginTop: 12 },
  bestItem: { flex: 1, alignItems: 'center' },
  bestIconBubble: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  bestIconBubbleStrong: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  bestLabel: { fontSize: 12, fontFamily: typography.family.label, fontWeight: typography.weight.medium, color: colors.text2, textAlign: 'center', minHeight: 28 },
  bestValue: { fontSize: 24, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, color: colors.accent, lineHeight: 28, letterSpacing: -0.4 },
  bestValueStrong: { fontSize: 23, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, color: colors.accentDark, lineHeight: 28, letterSpacing: -0.6 },
  bestDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 7 },
  empty: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, alignItems: 'center' },
  emptyTitle: { fontSize: 22, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.text, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.text2, textAlign: 'center', lineHeight: 20 },
});
