/**
 * Calendar screen — pixel-perfect match to preview HTML.
 *
 * Key CSS values from preview (all literal, no unicode escapes):
 * .cal-hdr{padding:10px 20px 6px;}
 * .cal-title{font-size:30px;font-weight:900;letter-spacing:.5px;}
 * .cal-title .bl{color:var(--accent);}
 * .cal-sub{font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;}
 * .cal-accent{height:2px;margin:0 20px 8px;background:var(--accent);opacity:.6;}
 * .month-nav{padding:0 20px 8px;}
 * .nav-btn{width:36px;height:36px;background:rgba(255,255,255,.55);border:1px solid rgba(106,90,205,0.18);border-radius:8px;}
 * .cal-grid{grid-template-columns:repeat(7,1fr);gap:3px;padding:10px;margin:0 16px 12px;
 *   border:2px solid var(--accentBdr);border-radius:var(--rl);background:rgba(106,90,205,0.06);}
 * .day-name{font-size:10px;font-weight:700;color:var(--text3);padding-bottom:8px;letter-spacing:.5px;}
 * .day-cell{aspect-ratio:1;border-radius:8px;}
 * .day-cell.has-sess{background:#6A5ACD;}
 * .day-num{font-size:14px;font-weight:500;color:var(--text2);}
 * .day-num.today{color:var(--accent);font-weight:800;}
 * .day-num.has-sess{color:#fff;font-weight:700;}
 * .section-title{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--accent);padding:0 20px 10px;}
 * FAB: bottom:90px;right:20px;width:62px;height:58px;clip-path:polygon(18% 0%,82% 4%,100% 28%,96% 72%,78% 100%,22% 98%,4% 74%,0% 30%)
 */
import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../store/sessions';
import SessionCard from '../../components/SessionCard';
import { colors } from '../../constants/theme';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['S','M','T','W','T','F','S'];

export default function CalendarScreen() {
  const router   = useRouter();
  const sessions = useSessionStore(st => st.sessions);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year,  setYear]  = useState(today.getFullYear());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekDay = new Date(year, month, 1).getDay();

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const sessionsForDay = (day: number) =>
    sessions.filter(s => s.date === dateStr(day));

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const monthSessions = sessions.filter(s => {
    const d = new Date(s.date + 'T12:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* cal-hdr */}
      <View style={s.calHdr}>
        <Text style={s.calTitle}>
          <Text style={s.bl}>ASCENTA</Text>
          <Text> 🧗</Text>
        </Text>
        <Text style={s.calSub}>{MONTHS[month]} {year}</Text>
      </View>

      {/* cal-accent line */}
      <View style={s.calAccent} />

      {/* month-nav */}
      <View style={s.monthNav}>
        <Pressable style={s.navBtn} onPress={prevMonth}>
          <Text style={s.navBtnText}>‹</Text>
        </Pressable>
        <Text style={s.monthTitle}>{MONTHS[month].toUpperCase()} {year}</Text>
        <Pressable style={s.navBtn} onPress={nextMonth}>
          <Text style={s.navBtnText}>›</Text>
        </Pressable>
      </View>

      {/* cal-grid — fixed 7-column grid */}
      <View style={s.calGrid}>
        {DAY_NAMES.map((d, i) => (
          <Text key={i} style={s.dayName}>{d}</Text>
        ))}
        {Array.from({ length: firstWeekDay }).map((_, i) => (
          <View key={`e${i}`} style={s.dayCell} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day     = i + 1;
          const daySess = sessionsForDay(day);
          const active  = daySess.length > 0;
          const tod     = isToday(day);
          return (
            <TouchableOpacity
              key={day}
              style={[s.dayCell, active && s.dayCellActive]}
              onPress={() => active ? router.push(`/session/${daySess[0].id}`) : undefined}
              activeOpacity={active ? 0.7 : 1}
            >
              <Text style={[
                s.dayNum,
                active && s.dayNumActive,
                tod && !active && s.dayNumToday,
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* cal-section — scrollable sessions list */}
      <ScrollView style={s.calSection} contentContainerStyle={s.calSectionContent}>
        <Text style={s.sectionTitle}>
          📅 THIS MONTH — {monthSessions.length} SESSION{monthSessions.length !== 1 ? 'S' : ''}
        </Text>

        {monthSessions.length > 0 ? (
          monthSessions.slice(0, 5).map(sess => (
            <SessionCard
              key={sess.id}
              session={sess}
              onPress={() => router.push(`/session/${sess.id}`)}
            />
          ))
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🧗</Text>
            <Text style={s.emptyText}>No sessions this month yet.{'\n'}Time to get on the wall!</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB — climbing hold polygon, exact preview values */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push('/(tabs)/log')}
        activeOpacity={0.85}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.bg },

  // .cal-hdr{padding:10px 20px 6px;}
  calHdr:         { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  // .cal-title{font-size:30px;font-weight:900;letter-spacing:.5px;}
  calTitle:       { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  // .cal-title .bl{color:var(--accent);}
  bl:             { color: colors.accent },
  // .cal-sub{font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;}
  calSub:         { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 1 },
  // .cal-accent{height:2px;margin:0 20px 8px;background:var(--accent);opacity:.6;}
  calAccent:      { height: 2, marginHorizontal: 20, marginBottom: 8, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.6 },

  // .month-nav{display:flex;align-items:center;justify-content:space-between;padding:0 20px 8px;}
  monthNav:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  // .nav-btn{width:36px;height:36px;background:rgba(255,255,255,.55);border:1px solid rgba(106,90,205,0.18);border-radius:8px;}
  navBtn:         { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(106,90,205,0.18)' },
  navBtnText:     { color: colors.text, fontSize: 22, lineHeight: 26 },
  monthTitle:     { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 1, textTransform: 'uppercase' },

  // .cal-grid{gap:3px;padding:10px;margin:0 16px 12px;border:2px solid var(--accentBdr);border-radius:var(--rl);background:rgba(106,90,205,0.06);}
  calGrid:        {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(106,90,205,0.32)',
    borderRadius: 16,
    backgroundColor: 'rgba(106,90,205,0.06)',
    padding: 10,
    gap: 3,
  },
  // .day-name{font-size:10px;font-weight:700;color:var(--text3);padding-bottom:8px;letter-spacing:.5px;}
  dayName:        { width: '14.28%', textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.text3, paddingBottom: 8, letterSpacing: 0.5 },
  // .day-cell{aspect-ratio:1;border-radius:8px;}
  dayCell:        { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  // .day-cell.has-sess{background:#6A5ACD;}
  dayCellActive:  { backgroundColor: '#6A5ACD' },
  // .day-num{font-size:14px;font-weight:500;color:var(--text2);}
  dayNum:         { fontSize: 14, fontWeight: '500', color: colors.text2, lineHeight: 16 },
  // .day-num.has-sess{color:#fff;font-weight:700;}
  dayNumActive:   { color: '#fff', fontWeight: '700' },
  // .day-num.today{color:var(--accent);font-weight:800;}
  dayNumToday:    { color: colors.accent, fontWeight: '800' },

  // .cal-section{flex:1;overflow-y:auto;}
  calSection:     { flex: 1 },
  calSectionContent: { paddingBottom: 100 },

  // .section-title{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--accent);padding:0 20px 10px;}
  sectionTitle:   { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.accent, textTransform: 'uppercase', paddingHorizontal: 20, paddingBottom: 10 },

  // .empty-state
  emptyState:     { alignItems: 'center', paddingVertical: 36 },
  emptyIcon:      { fontSize: 40, opacity: 0.3 },
  emptyText:      { color: colors.text3, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 },

  // FAB — exact preview clip-path shape, bottom:90px to sit above tab bar
  fab:            {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 62,
    height: 58,
    backgroundColor: colors.highlight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 36,
    borderBottomLeftRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(232,197,71,0.50)',
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  fabIcon:        { color: '#1a1612', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
