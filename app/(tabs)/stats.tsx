import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../store/sessions';
import { colors, spacing, radius } from '../../constants/theme';
import { FRENCH_GRADES, V_GRADES } from '../../constants/grades';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const V_CHART_GRADES = ['V0','V1','V2','V3','V4','V5','V6','V7'];

export default function StatsScreen() {
  const sessions = useSessionStore(s => s.sessions);

  const totalRoutes     = sessions.reduce((acc, s) => acc + s.routes.length, 0);
  const completedRoutes = sessions.reduce((acc, s) => acc + s.routes.filter(r => r.completed).length, 0);
  const sendRate        = totalRoutes > 0 ? Math.round((completedRoutes / totalRoutes) * 100) : 0;
  const totalMins       = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgMins         = sessions.length > 0 ? Math.round(totalMins / sessions.length) : 0;
  const locations       = [...new Set(sessions.map(s => s.location))];
  const topLoc          = [...locations].sort(
    (a, b) =>
      sessions.filter(s => s.location === b).length -
      sessions.filter(s => s.location === a).length,
  )[0];

  // PR tracking — highest completed grade per system
  const allFrenchCompleted = sessions
    .filter(s => s.grade_system === 'french')
    .flatMap(s => s.routes.filter(r => r.completed).map(r => r.grade));
  const allVCompleted = sessions
    .filter(s => s.grade_system === 'v')
    .flatMap(s => s.routes.filter(r => r.completed).map(r => r.grade));

  // Project tracking — highest incomplete grade per system
  const allFrenchProject = sessions
    .filter(s => s.grade_system === 'french')
    .flatMap(s => s.routes.filter(r => !r.completed).map(r => r.grade));
  const allVProject = sessions
    .filter(s => s.grade_system === 'v')
    .flatMap(s => s.routes.filter(r => !r.completed).map(r => r.grade));

  const prFrench = allFrenchCompleted.length > 0
    ? allFrenchCompleted.reduce((best, g) =>
        FRENCH_GRADES.indexOf(g) > FRENCH_GRADES.indexOf(best) ? g : best,
        allFrenchCompleted[0])
    : '—';
  const prV = allVCompleted.length > 0
    ? allVCompleted.reduce((best, g) =>
        V_GRADES.indexOf(g) > V_GRADES.indexOf(best) ? g : best,
        allVCompleted[0])
    : '—';
  const projFrench = allFrenchProject.length > 0
    ? allFrenchProject.reduce((best, g) =>
        FRENCH_GRADES.indexOf(g) > FRENCH_GRADES.indexOf(best) ? g : best,
        allFrenchProject[0])
    : '—';
  const projV = allVProject.length > 0
    ? allVProject.reduce((best, g) =>
        V_GRADES.indexOf(g) > V_GRADES.indexOf(best) ? g : best,
        allVProject[0])
    : '—';

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

  // Grade progression — top grade per session over time (last 10 sessions)
  const progressionData = sessions
    .slice(0, 10)
    .reverse()
    .map((s, i) => {
      const done = s.routes.filter(r => r.completed);
      const grades = s.grade_system === 'french' ? FRENCH_GRADES : V_GRADES;
      const topGradeStr = done.length > 0
        ? done.reduce((best, r) =>
            grades.indexOf(r.grade) > grades.indexOf(best.grade) ? r : best, done[0]).grade
        : null;
      const gradeIdx = topGradeStr ? grades.indexOf(topGradeStr) : -1;
      return { label: `S${i + 1}`, gradeIdx, gradeStr: topGradeStr, system: s.grade_system };
    })
    .filter(d => d.gradeIdx >= 0);

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
          <Text style={s.headerTitle}>📊 STATS</Text>
          <Text style={s.headerSub}>Your climbing overview</Text>
        </View>
        <View style={s.accentLine} />

        {/* Summary cards — matching preview 4-card grid */}
        <View style={s.grid}>
          {[
            { value: sessions.length,                        label: '🧗 Sessions',   sub: 'all time' },
            { value: totalRoutes,                            label: '🪨 Routes',     sub: `${completedRoutes} sent` },
            { value: `${Math.round(totalMins / 60)}h`,      label: '⏱️ Hours',      sub: `${avgMins} min avg` },
            { value: `${sendRate}%`,                        label: '🎯 Send Rate',  sub: 'completion rate' },
          ].map(card => (
            <View key={card.label} style={s.statCard}>
              <Text style={s.statValue}>{card.value}</Text>
              <Text style={s.statLabel}>{card.label}</Text>
              <Text style={s.statSub}>{card.sub}</Text>
            </View>
          ))}
        </View>

        {/* PR + Project row — 4 cards matching preview */}
        <Text style={s.sectionTitle}>🏆 PERSONAL BESTS</Text>
        <View style={s.prRow}>
          <View style={[s.prCard, s.prCardAccent]}>
            <Text style={s.prGrade}>{prFrench}</Text>
            <Text style={s.prLabel}>🇫🇷 French PR</Text>
          </View>
          <View style={[s.prCard, s.prCardAccent]}>
            <Text style={s.prGrade}>{prV}</Text>
            <Text style={s.prLabel}>🇺🇸 V-Scale PR</Text>
          </View>
          <View style={s.prCard}>
            <Text style={s.prGrade}>{projFrench}</Text>
            <Text style={s.prLabel}>🎯 Fr Project</Text>
          </View>
          <View style={s.prCard}>
            <Text style={s.prGrade}>{projV}</Text>
            <Text style={s.prLabel}>🎯 V Project</Text>
          </View>
        </View>

        {/* Favourite spot */}
        {topLoc && (
          <>
            <Text style={s.sectionTitle}>❤️ FAVOURITE SPOT</Text>
            <View style={s.bigCard}>
              <Text style={s.bigCardName}>📍 {topLoc}</Text>
              <Text style={s.bigCardSub}>
                {sessions.filter(s => s.location === topLoc).length} session{sessions.filter(s => s.location === topLoc).length !== 1 ? 's' : ''}
              </Text>
            </View>
          </>
        )}

        {/* Monthly bar chart */}
        <Text style={s.sectionTitle}>📅 MONTHLY SESSIONS</Text>
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

        {/* Grade progression chart */}
        {progressionData.length >= 2 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>📈 GRADE PROGRESSION</Text>
            <View style={[s.chartCard, { paddingBottom: spacing.md }]}>
              <View style={s.progressionChart}>
                {progressionData.map((d, i) => {
                  const maxIdx = Math.max(...progressionData.map(p => p.gradeIdx));
                  const minIdx = Math.min(...progressionData.map(p => p.gradeIdx));
                  const range  = maxIdx - minIdx || 1;
                  const heightPct = ((d.gradeIdx - minIdx) / range) * 70 + 10;
                  return (
                    <View key={i} style={s.progressionCol}>
                      <Text style={s.progressionGrade}>{d.gradeStr}</Text>
                      <View style={[s.progressionBar, { height: `${heightPct}%` as any }]} />
                      <Text style={s.progressionLabel}>{d.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Grade distribution chart — V-scale only */}
        <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>🎯 GRADE DISTRIBUTION</Text>
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
  scroll:         { paddingBottom: 78 },
  header:         { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 12 },
  headerTitle:    { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  headerSub:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  accentLine:     { height: 2, marginHorizontal: spacing.lg, marginBottom: 14, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.7 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 10, marginBottom: spacing.lg },
  statCard:       { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  statValue:      { fontSize: 36, fontWeight: '900', color: colors.accent, lineHeight: 40 },
  statLabel:      { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  statSub:        { fontSize: 12, color: colors.text2, marginTop: 2 },
  sectionTitle:   { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  // PR row
  prRow:          { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: 8, marginBottom: spacing.lg },
  prCard:         { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 10, alignItems: 'center' },
  prCardAccent:   { borderColor: colors.accentBorder, backgroundColor: colors.accentDim },
  prGrade:        { fontSize: 19, fontWeight: '900', color: colors.accent, lineHeight: 23 },
  prLabel:        { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: colors.text3, textTransform: 'uppercase', marginTop: 3, textAlign: 'center' },
  bigCard:        { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  bigCardName:    { fontSize: 17, fontWeight: '700', color: colors.text },
  bigCardSub:     { fontSize: 12, color: colors.text2, marginTop: 4 },
  chartCard:      { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: 9 },
  barRow:         { flexDirection: 'row', alignItems: 'center', gap: 9 },
  barLabel:       { width: 28, fontSize: 10, fontWeight: '700', color: colors.text3, textAlign: 'right', letterSpacing: 0.5 },
  barTrack:       { flex: 1, height: 16, backgroundColor: colors.surface, borderRadius: 5, overflow: 'hidden' },
  barFill:        { height: '100%', backgroundColor: colors.accent, borderRadius: 5, opacity: 0.80 },
  barFillGrade:   { height: '100%', backgroundColor: colors.highlight, borderRadius: 5, opacity: 0.85 },
  barEmpty:       { width: 0 },
  barCount:       { width: 16, fontSize: 11, fontWeight: '700', color: colors.text3, textAlign: 'right' },
  barCountActive: { color: colors.accent },
  barCountGrade:  { color: colors.highlight },
  gradeEmpty:     { fontSize: 13, color: colors.text3, textAlign: 'center', paddingVertical: 8 },
  gradeTotal:     { fontSize: 11, color: colors.text3, textAlign: 'right', marginTop: 2 },
  empty:             { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon:         { fontSize: 44, opacity: 0.3 },
  emptyText:         { color: colors.text3, fontSize: 13 },
  // Progression chart
  progressionChart:  { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6, paddingTop: 8 },
  progressionCol:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  progressionBar:    { width: '60%', backgroundColor: colors.highlight, borderRadius: 4, opacity: 0.85, minHeight: 8 },
  progressionGrade:  { fontSize: 9, fontWeight: '700', color: colors.highlight, marginBottom: 3, textAlign: 'center' },
  progressionLabel:  { fontSize: 9, color: colors.text3, marginTop: 4, textAlign: 'center' },
});
