import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../store/sessions';
import { colors, spacing, radius } from '../../constants/theme';
import { FRENCH_GRADES, V_GRADES } from '../../constants/grades';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const V_CHART_GRADES = ['V0','V1','V2','V3','V4','V5','V6','V7'];

export default function StatsScreen() {
  const sessions = useSessionStore(s => s.sessions);

  const totalRoutes    = sessions.reduce((acc, s) => acc + s.routes.length, 0);
  const completedRoutes = sessions.reduce((acc, s) => acc + s.routes.filter(r => r.completed).length, 0);
  const completionPct  = totalRoutes > 0 ? Math.round((completedRoutes / totalRoutes) * 100) : 0;
  const totalMins      = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const locations      = [...new Set(sessions.map(s => s.location))];
  const topLoc         = [...locations].sort(
    (a, b) =>
      sessions.filter(s => s.location === b).length -
      sessions.filter(s => s.location === a).length,
  )[0];

  // PR tracking — highest completed grade per system across all sessions
  const allFrenchCompleted = sessions
    .filter(s => s.grade_system === 'french')
    .flatMap(s => s.routes.filter(r => r.completed).map(r => r.grade));
  const allVCompleted = sessions
    .filter(s => s.grade_system === 'v')
    .flatMap(s => s.routes.filter(r => r.completed).map(r => r.grade));

  const prFrench = allFrenchCompleted.length > 0
    ? allFrenchCompleted.reduce((best, g) =>
        FRENCH_GRADES.indexOf(g) > FRENCH_GRADES.indexOf(best) ? g : best,
        allFrenchCompleted[0])
    : null;
  const prV = allVCompleted.length > 0
    ? allVCompleted.reduce((best, g) =>
        V_GRADES.indexOf(g) > V_GRADES.indexOf(best) ? g : best,
        allVCompleted[0])
    : null;

  // Build last 6 months bar chart data
  const barData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const count = sessions.filter(s => {
      const sd = new Date(s.date + 'T12:00');
      return sd.getMonth() === m && sd.getFullYear() === y;
    }).length;
    return { label: MONTHS_SHORT[m], count };
  });
  const maxCount = Math.max(...barData.map(d => d.count), 1);

  // Grade distribution — V0–V7 completed routes only
  const vSessions = sessions.filter(s => s.grade_system === 'v');
  const gradeDistData = V_CHART_GRADES.map(grade => ({
    grade,
    count: vSessions.reduce((acc, s) =>
      acc + s.routes.filter(r => r.grade === grade && r.completed).length, 0),
  }));
  const maxGradeCount = Math.max(...gradeDistData.map(d => d.count), 1);
  const totalVRoutes  = gradeDistData.reduce((acc, d) => acc + d.count, 0);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.header}>
          <Text style={s.headerTitle}>STATS</Text>
          <Text style={s.headerSub}>Your climbing overview</Text>
        </View>
        <View style={s.accentLine} />

        {/* Summary cards */}
        <View style={s.grid}>
          {[
            { value: sessions.length,                        label: 'Sessions',   sub: 'All time' },
            { value: totalRoutes,                            label: 'Routes',     sub: 'Logged' },
            { value: `${Math.round(totalMins / 60)}h`,      label: 'On Wall',    sub: `${totalMins} min` },
            { value: locations.length,                       label: 'Locations',  sub: 'Visited' },
          ].map(card => (
            <View key={card.label} style={s.statCard}>
              <Text style={s.statValue}>{card.value}</Text>
              <Text style={s.statLabel}>{card.label}</Text>
              <Text style={s.statSub}>{card.sub}</Text>
            </View>
          ))}
        </View>

        {/* PR + Completion row */}
        <Text style={s.sectionTitle}>PERSONAL BESTS</Text>
        <View style={s.prRow}>
          {prFrench ? (
            <View style={[s.prCard, s.prCardAccent]}>
              <Text style={s.prGrade}>{prFrench}</Text>
              <Text style={s.prLabel}>French PR</Text>
            </View>
          ) : (
            <View style={s.prCard}>
              <Text style={s.prEmpty}>—</Text>
              <Text style={s.prLabel}>French PR</Text>
            </View>
          )}
          {prV ? (
            <View style={[s.prCard, s.prCardAccent]}>
              <Text style={s.prGrade}>{prV}</Text>
              <Text style={s.prLabel}>V-Scale PR</Text>
            </View>
          ) : (
            <View style={s.prCard}>
              <Text style={s.prEmpty}>—</Text>
              <Text style={s.prLabel}>V-Scale PR</Text>
            </View>
          )}
          <View style={s.prCard}>
            <Text style={s.prGrade}>{completionPct}%</Text>
            <Text style={s.prLabel}>Send rate</Text>
          </View>
          <View style={s.prCard}>
            <Text style={s.prGrade}>{completedRoutes}</Text>
            <Text style={s.prLabel}>Sends</Text>
          </View>
        </View>

        {/* Top location */}
        {topLoc && (
          <>
            <Text style={s.sectionTitle}>FAVOURITE SPOT</Text>
            <View style={s.bigCard}>
              <Text style={s.bigCardName}>{topLoc}</Text>
              <Text style={s.bigCardSub}>
                {sessions.filter(s => s.location === topLoc).length} sessions
              </Text>
            </View>
          </>
        )}

        {/* Monthly bar chart */}
        <Text style={s.sectionTitle}>MONTHLY SESSIONS</Text>
        <View style={s.chartCard}>
          {barData.map((bar, i) => (
            <View key={i} style={s.barRow}>
              <Text style={s.barLabel}>{bar.label}</Text>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFill,
                    { width: `${(bar.count / maxCount) * 100}%` },
                    bar.count === 0 && s.barEmpty,
                  ]}
                />
              </View>
              <Text style={[s.barCount, bar.count > 0 && s.barCountActive]}>
                {bar.count}
              </Text>
            </View>
          ))}
        </View>

        {/* Grade distribution chart — V-scale only */}
        <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>GRADE DISTRIBUTION</Text>
        <View style={s.chartCard}>
          {totalVRoutes === 0 ? (
            <Text style={s.gradeEmpty}>Log V-scale routes to see your grade spread.</Text>
          ) : (
            <>
              {gradeDistData.map((item) => (
                <View key={item.grade} style={s.barRow}>
                  <Text style={s.barLabel}>{item.grade}</Text>
                  <View style={s.barTrack}>
                    <View
                      style={[
                        s.barFillGrade,
                        { width: `${(item.count / maxGradeCount) * 100}%` },
                        item.count === 0 && s.barEmpty,
                      ]}
                    />
                  </View>
                  <Text style={[s.barCount, item.count > 0 && s.barCountGrade]}>
                    {item.count}
                  </Text>
                </View>
              ))}
              <Text style={s.gradeTotal}>{totalVRoutes} V-scale sends total</Text>
            </>
          )}
        </View>

        {sessions.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📊</Text>
            <Text style={s.emptyText}>Log sessions to see your stats!</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.bg },
  scroll:         { paddingBottom: 40 },
  header:         { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 12 },
  headerTitle:    { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  headerSub:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  accentLine:     { height: 2, marginHorizontal: spacing.lg, marginBottom: 14, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.7 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 10, marginBottom: spacing.lg },
  statCard:       { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  statValue:      { fontSize: 38, fontWeight: '900', color: colors.accent, lineHeight: 42 },
  statLabel:      { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  statSub:        { fontSize: 12, color: colors.text2, marginTop: 2 },
  sectionTitle:   { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  // PR row
  prRow:          { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: 8, marginBottom: spacing.lg },
  prCard:         { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 10, alignItems: 'center' },
  prCardAccent:   { borderColor: colors.accentBorder, backgroundColor: colors.accentDim },
  prGrade:        { fontSize: 20, fontWeight: '900', color: colors.accent, lineHeight: 24 },
  prEmpty:        { fontSize: 20, fontWeight: '900', color: colors.text3, lineHeight: 24 },
  prLabel:        { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: colors.text3, textTransform: 'uppercase', marginTop: 3, textAlign: 'center' },
  bigCard:        { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  bigCardName:    { fontSize: 20, fontWeight: '700', color: colors.text },
  bigCardSub:     { fontSize: 12, color: colors.text2, marginTop: 4 },
  chartCard:      { marginHorizontal: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: 10 },
  barRow:         { flexDirection: 'row', alignItems: 'center', gap: 9 },
  barLabel:       { width: 28, fontSize: 10, fontWeight: '700', color: colors.text3, textAlign: 'right', letterSpacing: 0.5 },
  barTrack:       { flex: 1, height: 18, backgroundColor: colors.surface, borderRadius: 5, overflow: 'hidden' },
  barFill:        { height: '100%', backgroundColor: colors.accent, borderRadius: 5, opacity: 0.80 },
  barFillGrade:   { height: '100%', backgroundColor: colors.highlight, borderRadius: 5, opacity: 0.85 },
  barEmpty:       { width: 0 },
  barCount:       { width: 16, fontSize: 11, fontWeight: '700', color: colors.text3, textAlign: 'right' },
  barCountActive: { color: colors.accent },
  barCountGrade:  { color: colors.highlight },
  gradeEmpty:     { fontSize: 13, color: colors.text3, textAlign: 'center', paddingVertical: 8 },
  gradeTotal:     { fontSize: 11, color: colors.text3, textAlign: 'right', marginTop: 2 },
  empty:          { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon:      { fontSize: 44, opacity: 0.3 },
  emptyText:      { color: colors.text3, fontSize: 13 },
});
