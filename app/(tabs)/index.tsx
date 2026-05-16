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
  const firstWeekDay = new Date(year, month, 1).getDay(); // 0=Sun

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
            {' 🧗'}
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

        {/* Calendar grid — bordered card matching preview */}
        <View style={s.gridCard}>
          {DAY_NAMES.map((d, i) => (
            <Text key={i} style={s.dayName}>{d}</Text>
          ))}

          {/* Empty cells before the first day */}
          {Array(firstWeekDay).fill(null).map((_, i) => (
            <View key={`e${i}`} style={s.dayCell} />
          ))}

          {/* Day cells */}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day     = i + 1;
            const daySess = sessionsForDay(day);
            const active  = daySess.length > 0;
            const tod     = isToday(day);

            return (
              <TouchableOpacity
                key={day}
                style={[s.dayCell, active && s.dayCellActive]}
                onPress={() => active && router.push(`/session/${daySess[0].id}`)}
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

        {/* This month's sessions */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            📅 THIS MONTH — {monthSessions.length} SESSION{monthSessions.length !== 1 ? 'S' : ''}
          </Text>
        </View>

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

      </ScrollView>

      {/* FAB quick-log button */}
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
  scroll:         { paddingBottom: 32 },
  header:         { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 12 },
  headerTitle:    { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  accent:         { color: colors.accent },
  headerSub:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  accentLine:     { height: 2, marginHorizontal: spacing.lg, marginBottom: 14, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.6 },
  monthNav:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: 14 },
  navBtn:         { width: 36, height: 36, backgroundColor: colors.surface, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  navBtnText:     { color: colors.text, fontSize: 20 },
  monthTitle:     { fontSize: 16, fontWeight: '700', color: colors.text, letterSpacing: 1, textTransform: 'uppercase' },
  gridCard:       { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: spacing.lg, marginBottom: 12, borderWidth: 2, borderColor: colors.accentBorder, borderRadius: radius.lg, backgroundColor: 'rgba(106,90,205,0.06)', padding: 10, gap: 3 },
  dayName:        { width: '14.28%', textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.text3, textTransform: 'uppercase', paddingBottom: 8, letterSpacing: 0.5 },
  dayCell:        { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  dayCellActive:  { backgroundColor: colors.accent },
  dayNum:         { fontSize: 14, fontWeight: '500', color: colors.text2, lineHeight: 16 },
  dayNumActive:   { color: '#fff', fontWeight: '700' },
  dayNumToday:    { color: colors.accent, fontWeight: '800' },
  fab:            { position: 'absolute', bottom: 24, right: 20, width: 62, height: 58, borderRadius: 28, backgroundColor: colors.highlight, alignItems: 'center', justifyContent: 'center', shadowColor: colors.highlight, shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  fabIcon:        { color: '#1a1612', fontSize: 28, fontWeight: '300', lineHeight: 32, marginTop: -2 },
  sectionHeader:  { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  sectionTitle:   { fontSize: 10, fontWeight: '700', color: colors.accent, letterSpacing: 1.5, textTransform: 'uppercase' },
  empty:          { alignItems: 'center', paddingVertical: 48 },
  emptyIcon:      { fontSize: 44, opacity: 0.3 },
  emptyText:      { color: colors.text3, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
