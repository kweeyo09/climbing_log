/**
 * Stats screen — pixel-perfect match to preview HTML #page-stats.
 *
 * Preview CSS reference:
 * .hdr-title{font-size:28px;font-weight:900;color:var(--text);letter-spacing:.5px;}
 * .hdr-sub{font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;margin-top:2px;}
 * .section-title{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--accent);text-transform:uppercase;padding:0 20px 10px;}
 * .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 20px;margin-bottom:20px;}
 * .stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:14px;}
 * .stat-val{font-size:36px;font-weight:900;color:var(--accent);line-height:1.1;}
 * .stat-lbl{font-size:10px;font-weight:700;letter-spacing:1px;color:var(--text3);text-transform:uppercase;margin-top:2px;}
 * .stat-sub{font-size:12px;color:var(--text2);margin-top:2px;}
 * .pr-row{display:flex;gap:8px;padding:0 20px;margin-bottom:20px;}
 * .pr-card{flex:1;background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:10px;text-align:center;}
 * .pr-card.hi{background:var(--accentDim);border-color:var(--accentBdr);}
 * .pr-grade{font-size:19px;font-weight:900;color:var(--accent);line-height:1.2;}
 * .pr-lbl{font-size:9px;font-weight:700;letter-spacing:.8px;color:var(--text3);text-transform:uppercase;margin-top:3px;}
 * .big-card{margin:0 20px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:14px;}
 * .big-name{font-size:17px;font-weight:700;color:var(--text);}
 * .big-sub{font-size:12px;color:var(--text2);margin-top:4px;}
 * .chart-card{margin:0 20px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:14px;gap:9px;}
 * .bar-row{display:flex;align-items:center;gap:9px;}
 * .bar-lbl{width:28px;font-size:10px;font-weight:700;color:var(--text3);text-align:right;letter-spacing:.5px;}
 * .bar-track{flex:1;height:16px;background:var(--surface);border-radius:5px;overflow:hidden;}
 * .bar-fill{height:100%;background:var(--accent);border-radius:5px;opacity:.8;}
 * .bar-fill.g{background:var(--hi);opacity:.85;}
 * .bar-cnt{width:16px;font-size:11px;font-weight:700;color:var(--text3);text-align:right;}
 */
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../store/sessions';
import { colors, typography } from '../../constants/theme';
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
    (a, b) => sessions.filter(s => s.location === b).length - sessions.filter(s => s.location === a).length,
  )[0];

  const allFrenchCompleted = sessions.filter(s => s.grade_system === 'french').flatMap(s => s.routes.filter(r => r.completed).map(r => r.grade));
  const allVCompleted      = sessions.filter(s => s.grade_system === 'v').flatMap(s => s.routes.filter(r => r.completed).map(r => r.grade));
  const allFrenchProject   = sessions.filter(s => s.grade_system === 'french').flatMap(s => s.routes.filter(r => !r.completed).map(r => r.grade));
  const allVProject        = sessions.filter(s => s.grade_system === 'v').flatMap(s => s.routes.filter(r => !r.completed).map(r => r.grade));

  const prFrench   = allFrenchCompleted.length > 0 ? allFrenchCompleted.reduce((b, g) => FRENCH_GRADES.indexOf(g) > FRENCH_GRADES.indexOf(b) ? g : b, allFrenchCompleted[0]) : '—';
  const prV        = allVCompleted.length > 0      ? allVCompleted.reduce((b, g) => V_GRADES.indexOf(g) > V_GRADES.indexOf(b) ? g : b, allVCompleted[0]) : '—';
  const projFrench = allFrenchProject.length > 0   ? allFrenchProject.reduce((b, g) => FRENCH_GRADES.indexOf(g) > FRENCH_GRADES.indexOf(b) ? g : b, allFrenchProject[0]) : '—';
  const projV      = allVProject.length > 0        ? allVProject.reduce((b, g) => V_GRADES.indexOf(g) > V_GRADES.indexOf(b) ? g : b, allVProject[0]) : '—';

  const barData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(); const y = d.getFullYear();
    return { label: MONTHS_SHORT[m], count: sessions.filter(s => { const sd = new Date(s.date + 'T12:00'); return sd.getMonth() === m && sd.getFullYear() === y; }).length };
  });
  const maxCount = Math.max(...barData.map(d => d.count), 1);

  const progressionData = sessions.slice(0, 10).reverse().map((s, i) => {
    const done = s.routes.filter(r => r.completed);
    const grades = s.grade_system === 'french' ? FRENCH_GRADES : V_GRADES;
    const topGradeStr = done.length > 0 ? done.reduce((best, r) => grades.indexOf(r.grade) > grades.indexOf(best.grade) ? r : best, done[0]).grade : null;
    const gradeIdx = topGradeStr ? grades.indexOf(topGradeStr) : -1;
    return { label: `S${i + 1}`, gradeIdx, gradeStr: topGradeStr };
  }).filter(d => d.gradeIdx >= 0);

  const vSessions    = sessions.filter(s => s.grade_system === 'v');
  const gradeDistData = V_CHART_GRADES.map(grade => ({ grade, count: vSessions.reduce((acc, s) => acc + s.routes.filter(r => r.grade === grade && r.completed).length, 0) }));
  const maxGradeCount = Math.max(...gradeDistData.map(d => d.count), 1);
  const totalVRoutes  = gradeDistData.reduce((acc, d) => acc + d.count, 0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* hdr */}
        <View style={s.hdr}>
          <Text style={s.hdrTitle}>📊 STATS</Text>
          <Text style={s.hdrSub}>Your climbing overview</Text>
        </View>
        <View style={s.accentLine} />

        {/* stat-grid — 2-column grid */}
        <View style={s.statGrid}>
          {[
            { val: sessions.length,                   lbl: '🧗 Sessions',  sub: 'all time' },
            { val: totalRoutes,                        lbl: '🪨 Routes',    sub: `${completedRoutes} sent` },
            { val: `${Math.round(totalMins / 60)}h`,  lbl: '⏱️ Hours',     sub: `${avgMins} min avg` },
            { val: `${sendRate}%`,                    lbl: '🎯 Send Rate', sub: 'completion rate' },
          ].map(card => (
            <View key={card.lbl} style={s.statCard}>
              <Text style={s.statVal}>{card.val}</Text>
              <Text style={s.statLbl}>{card.lbl}</Text>
              <Text style={s.statSub}>{card.sub}</Text>
            </View>
          ))}
        </View>

        {/* Personal bests */}
        <Text style={s.sectionTitle}>🏆 PERSONAL BESTS</Text>
        <View style={s.prRow}>
          <View style={[s.prCard, s.prCardHi]}>
            <Text style={s.prGrade}>{prFrench}</Text>
            <Text style={s.prLbl}>🇫🇷 French PR</Text>
          </View>
          <View style={[s.prCard, s.prCardHi]}>
            <Text style={s.prGrade}>{prV}</Text>
            <Text style={s.prLbl}>🇺🇸 V-Scale PR</Text>
          </View>
          <View style={s.prCard}>
            <Text style={s.prGrade}>{projFrench}</Text>
            <Text style={s.prLbl}>🎯 Fr Project</Text>
          </View>
          <View style={s.prCard}>
            <Text style={s.prGrade}>{projV}</Text>
            <Text style={s.prLbl}>🎯 V Project</Text>
          </View>
        </View>

        {/* Favourite spot */}
        {topLoc && (
          <>
            <Text style={s.sectionTitle}>❤️ FAVOURITE SPOT</Text>
            <View style={s.bigCard}>
              <Text style={s.bigName}>📍 {topLoc}</Text>
              <Text style={s.bigSub}>{sessions.filter(s => s.location === topLoc).length} session{sessions.filter(s => s.location === topLoc).length !== 1 ? 's' : ''}</Text>
            </View>
          </>
        )}

        {/* Monthly sessions bar chart */}
        <Text style={s.sectionTitle}>📅 MONTHLY SESSIONS</Text>
        <View style={s.chartCard}>
          {barData.map((bar, i) => (
            <View key={i} style={s.barRow}>
              <Text style={s.barLbl}>{bar.label}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${(bar.count / maxCount) * 100}%` as any }, bar.count === 0 && s.barEmpty]} />
              </View>
              <Text style={[s.barCnt, bar.count > 0 && s.barCntActive]}>{bar.count}</Text>
            </View>
          ))}
        </View>

        {/* Grade progression */}
        {progressionData.length >= 2 && (
          <>
            <Text style={[s.sectionTitle, { paddingTop: 16 }]}>📈 GRADE PROGRESSION</Text>
            <View style={[s.chartCard, { paddingBottom: 14 }]}>
              <View style={s.progChart}>
                {progressionData.map((d, i) => {
                  const maxIdx = Math.max(...progressionData.map(p => p.gradeIdx));
                  const minIdx = Math.min(...progressionData.map(p => p.gradeIdx));
                  const range  = maxIdx - minIdx || 1;
                  const heightPct = ((d.gradeIdx - minIdx) / range) * 70 + 10;
                  return (
                    <View key={i} style={s.progCol}>
                      <Text style={s.progGrade}>{d.gradeStr}</Text>
                      <View style={[s.progBar, { height: `${heightPct}%` as any }]} />
                      <Text style={s.progLabel}>{d.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Grade distribution */}
        <Text style={[s.sectionTitle, { paddingTop: 16 }]}>🎯 GRADE DISTRIBUTION</Text>
        <View style={s.chartCard}>
          {totalVRoutes === 0 ? (
            <Text style={s.gradeEmpty}>Log V-scale routes to see your grade spread.</Text>
          ) : (
            <>
              {gradeDistData.map(item => (
                <View key={item.grade} style={s.barRow}>
                  <Text style={s.barLbl}>{item.grade}</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFillG, { width: `${(item.count / maxGradeCount) * 100}%` as any }, item.count === 0 && s.barEmpty]} />
                  </View>
                  <Text style={[s.barCnt, item.count > 0 && s.barCntGrade]}>{item.count}</Text>
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
  safe:        { flex: 1, backgroundColor: colors.bg },
  // paddingBottom = tab bar height (78) so content clears the bar
  scroll:      { paddingBottom: 78 },

  // .hdr
  hdr:         { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  hdrTitle:    { fontSize: 28, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: 0.5 },
  hdrSub:      { fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  accentLine:  { height: 2, marginHorizontal: 20, marginBottom: 14, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.7 },

  // .section-title{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--accent);padding:0 20px 10px;}
  sectionTitle: { fontSize: 10, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1.5, color: colors.accent, textTransform: 'uppercase', paddingHorizontal: 20, paddingBottom: 10 },

  // .stat-grid{gap:10px;padding:0 20px;margin-bottom:20px;}
  statGrid:    { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  // .stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:14px;}
  statCard:    { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 },
  // .stat-val{font-size:36px;font-weight:900;color:var(--accent);line-height:1.1;}
  statVal:     { fontSize: 36, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.accent, lineHeight: 40 },
  // .stat-lbl{font-size:10px;font-weight:700;letter-spacing:1px;color:var(--text3);text-transform:uppercase;margin-top:2px;}
  statLbl:     { fontSize: 10, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  // .stat-sub{font-size:12px;color:var(--text2);margin-top:2px;}
  statSub:     { fontSize: 12, color: colors.text2, marginTop: 2 },

  // .pr-row{display:flex;gap:8px;padding:0 20px;margin-bottom:20px;}
  prRow:       { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  // .pr-card{flex:1;background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:10px;text-align:center;}
  prCard:      { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 10, alignItems: 'center' },
  // .pr-card.hi{background:var(--accentDim);border-color:var(--accentBdr);}
  prCardHi:    { backgroundColor: colors.accentDim, borderColor: colors.accentBdr },
  // .pr-grade{font-size:19px;font-weight:900;color:var(--accent);line-height:1.2;}
  prGrade:     { fontSize: 19, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.accent, lineHeight: 23 },
  // .pr-lbl{font-size:9px;font-weight:700;letter-spacing:.8px;color:var(--text3);text-transform:uppercase;margin-top:3px;}
  prLbl:       { fontSize: 9, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 0.8, color: colors.text3, textTransform: 'uppercase', marginTop: 3, textAlign: 'center' },

  // .big-card{margin:0 20px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:14px;}
  bigCard:     { marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 },
  bigName:     { fontSize: 17, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, color: colors.text },
  bigSub:      { fontSize: 12, color: colors.text2, marginTop: 4 },

  // .chart-card{margin:0 20px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:14px;gap:9px;}
  chartCard:   { marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, gap: 9 },
  // .bar-row{display:flex;align-items:center;gap:9px;}
  barRow:      { flexDirection: 'row', alignItems: 'center', gap: 9 },
  // .bar-lbl{width:28px;font-size:10px;font-weight:700;color:var(--text3);text-align:right;letter-spacing:.5px;}
  barLbl:      { width: 28, fontSize: 10, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, color: colors.text3, textAlign: 'right', letterSpacing: 0.5 },
  // .bar-track{flex:1;height:16px;background:var(--surface);border-radius:5px;overflow:hidden;}
  barTrack:    { flex: 1, height: 16, backgroundColor: colors.surface, borderRadius: 5, overflow: 'hidden' },
  // .bar-fill{height:100%;background:var(--accent);border-radius:5px;opacity:.8;}
  barFill:     { height: '100%', backgroundColor: colors.accent, borderRadius: 5, opacity: 0.8 },
  // .bar-fill.g{background:var(--hi);opacity:.85;}
  barFillG:    { height: '100%', backgroundColor: colors.highlight, borderRadius: 5, opacity: 0.85 },
  barEmpty:    { width: 0 },
  // .bar-cnt{width:16px;font-size:11px;font-weight:700;color:var(--text3);text-align:right;}
  barCnt:      { width: 16, fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, color: colors.text3, textAlign: 'right' },
  barCntActive: { color: colors.accent },
  barCntGrade: { color: colors.highlight },
  gradeEmpty:  { fontSize: 13, color: colors.text3, textAlign: 'center', paddingVertical: 8 },
  gradeTotal:  { fontSize: 11, color: colors.text3, textAlign: 'right', marginTop: 2 },

  // Progression chart
  progChart:   { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6, paddingTop: 8 },
  progCol:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  progBar:     { width: '60%', backgroundColor: colors.highlight, borderRadius: 4, opacity: 0.85, minHeight: 8 },
  progGrade:   { fontSize: 9, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, color: colors.highlight, marginBottom: 3, textAlign: 'center' },
  progLabel:   { fontSize: 9, color: colors.text3, marginTop: 4, textAlign: 'center' },

  empty:       { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon:   { fontSize: 44, opacity: 0.3 },
  emptyText:   { color: colors.text3, fontSize: 13 },
});
