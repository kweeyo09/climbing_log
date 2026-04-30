import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../store/sessions';
import { colors, spacing, radius } from '../../constants/theme';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function StatsScreen() {
  const sessions = useSessionStore(s => s.sessions);

  const totalRoutes = sessions.reduce((acc, s) => acc + s.routes.length, 0);
  const totalMins   = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const locations   = [...new Set(sessions.map(s => s.location))];
  const topLoc      = locations.sort(
    (a, b) =>
      sessions.filter(s => s.location === b).length -
      sessions.filter(s => s.location === a).length,
  )[0];

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
            { value: sessions.length, label: 'Sessions',  sub: 'All time' },
            { value: totalRoutes,     label: 'Routes',    sub: 'Logged' },
            { value: `${Math.round(totalMins / 60)}h`, label: 'On Wall', sub: `${totalMins} min` },
            { value: locations.length, label: 'Locations', sub: 'Visited' },
          ].map(card => (
            <View key={card.label} style={s.statCard}>
              <Text style={s.statValue}>{card.value}</Text>
              <Text style={s.statLabel}>{card.label}</Text>
              <Text style={s.statSub}>{card.sub}</Text>
            </View>
          ))}
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
  accentLine:     { height: 2, marginHorizontal: spacing.lg, marginBottom: 14, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.6 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 10, marginBottom: spacing.lg },
  statCard:       { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  statValue:      { fontSize: 38, fontWeight: '900', color: colors.accent, lineHeight: 42 },
  statLabel:      { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  statSub:        { fontSize: 12, color: colors.text2, marginTop: 2 },
  sectionTitle:   { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  bigCard:        { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
  bigCardName:    { fontSize: 20, fontWeight: '700', color: colors.text },
  bigCardSub:     { fontSize: 12, color: colors.text2, marginTop: 4 },
  chartCard:      { marginHorizontal: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: 10 },
  barRow:         { flexDirection: 'row', alignItems: 'center', gap: 9 },
  barLabel:       { width: 28, fontSize: 10, fontWeight: '700', color: colors.text3, textAlign: 'right', letterSpacing: 0.5 },
  barTrack:       { flex: 1, height: 18, backgroundColor: colors.surface, borderRadius: 5, overflow: 'hidden' },
  barFill:        { height: '100%', backgroundColor: colors.accent, borderRadius: 5, opacity: 0.85 },
  barEmpty:       { width: 0 },
  barCount:       { width: 16, fontSize: 11, fontWeight: '700', color: colors.text3, textAlign: 'right' },
  barCountActive: { color: colors.accent },
  empty:          { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon:      { fontSize: 44, opacity: 0.3 },
  emptyText:      { color: colors.text3, fontSize: 13 },
});
