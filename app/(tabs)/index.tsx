/**
 * Calendar screen — matches the preview HTML exactly.
 * Design: ASCENTA header, bordered accent grid, filled day cells, gold hold FAB.
 * NOTE: All emoji are literal UTF-8 characters — no unicode escape sequences.
 */
import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../store/sessions';
import SessionCard from '../../components/SessionCard';
import { colors, spacing, radius } from '../../constants/theme';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['S','M','T','W','T','F','S'];

export default function CalendarScreen() {
  const router   = useRouter();
  const sessions = useSessionStore(s => s.sessions);

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

  const dateString = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const sessionsForDay = (day: number) =>
    sessions.filter(s => s.date === dateString(day));

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const monthSessions = sessions.filter(s => {
    const d = new Date(s.date + 'T12:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>
            <Text style={s.accent}>ASCENTA</Text>
            <Text> 🧗</Text>
          </Text>
          <Text style={s.headerSub}>{MONTHS[month]} {year}</Text>
        </View>
        <View style={s.accentLine} />

        {/* Month navigator */}
        <View style={s.monthNav}>
          <Pressable style={s.navBtn} onPress={prevMonth}>
            <Text style={s.navBtnText}>‹</Text>
          </Pressable>
          <Text style={s.monthTitle}>{MONTHS[month].toUpperCase()} {year}</Text>
          <Pressable style={s.navBtn} onPress={nextMonth}>
            <Text style={s.navBtnText}>›</Text>
          </Pressable>
        </View>

        {/* Calendar grid */}
        <View style={s.gridCard}>
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
                style={[s.dayCell, active && s.dayCellActive, tod && !active && s.dayCellToday]}
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

        {/* Section title */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            📅 THIS MONTH — {monthSessions.length} SESSION{monthSessions.length !== 1 ? 'S' : ''}
          </Text>
        </View>

        {/* Session cards or empty state */}
        {monthSessions.length > 0 ? (
          monthSessions.slice(0, 5).map(sess => (
            <SessionCard
              key={sess.id}
              session={sess}
              onPress={() => router.push(`/session/${sess.id}`)}
            />
          ))
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🧗</Text>
            <Text style={s.emptyText}>No sessions this month yet.{'\n'}Time to get on the wall!</Text>
          </View>
        )}

        {/* Bottom padding so last card clears the FAB */}
        <View style={{ height: 80 }} />

      </ScrollView>

      {/* FAB — climbing hold shape */}
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
  scroll:         { paddingBottom: 0 },

  header:         { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 8 },
  headerTitle:    { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  accent:         { color: colors.accent },
  headerSub:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 1 },
  accentLine:     { height: 2, marginHorizontal: spacing.lg, marginBottom: 8, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.6 },

  monthNav:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: 8 },
  navBtn:         { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(106,90,205,0.18)' },
  navBtnText:     { color: colors.text, fontSize: 22, lineHeight: 26 },
  monthTitle:     { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 1, textTransform: 'uppercase' },

  gridCard:       {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(106,90,205,0.32)',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(106,90,205,0.06)',
    padding: 10,
    gap: 3,
  },
  dayName:        { width: '14.28%', textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.text3, paddingBottom: 8, letterSpacing: 0.5 },
  dayCell:        { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  dayCellActive:  { backgroundColor: '#6A5ACD' },
  dayCellToday:   { borderWidth: 1.5, borderColor: colors.accent },
  dayNum:         { fontSize: 14, fontWeight: '500', color: colors.text2, lineHeight: 16 },
  dayNumActive:   { color: '#fff', fontWeight: '700' },
  dayNumToday:    { color: colors.accent, fontWeight: '800' },

  sectionHeader:  { paddingHorizontal: spacing.lg, paddingTop: 14, paddingBottom: 10 },
  sectionTitle:   { fontSize: 10, fontWeight: '700', color: colors.accent, letterSpacing: 1.5, textTransform: 'uppercase' },

  empty:          { alignItems: 'center', paddingVertical: 36 },
  emptyIcon:      { fontSize: 40, opacity: 0.3 },
  emptyText:      { color: colors.text3, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 },

  // Climbing hold FAB — asymmetric blob, sits just above tab bar
  fab:            {
    position: 'absolute',
    bottom: 12,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: colors.highlight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    transform: [{ rotate: '-12deg' }],
  },
  fabIcon:        { color: '#1a1612', fontSize: 26, fontWeight: '400', lineHeight: 30, transform: [{ rotate: '12deg' }] },
});
