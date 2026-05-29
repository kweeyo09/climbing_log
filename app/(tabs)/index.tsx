/**
 * Calendar screen — pixel-perfect match to preview HTML.
 *
 * ROOT CAUSE OF SQUASH: Using flexWrap + aspectRatio on day cells means the
 * grid height is dynamic and gets compressed by flex layout when sessions appear.
 *
 * FIX: Compute an explicit pixel height for the grid using useWindowDimensions,
 * then set it as a hardcoded `height` on calGrid. The grid can NEVER flex or shrink.
 *
 * Layout structure (top-down, no flex fighting):
 *   SafeAreaView (flex:1, bg)
 *     calHdr          — fixed height
 *     calAccent       — fixed 2px
 *     monthNav        — fixed height
 *     calGrid         — FIXED PIXEL HEIGHT (computed once from screen width)
 *     ScrollView      — flex:1, takes all remaining space
 *       sectionTitle
 *       session cards
 *     FAB             — position:absolute, bottom = tab bar height + 12
 */
import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../store/sessions';
import SessionCard from '../../components/SessionCard';
import { colors, typography } from '../../constants/theme';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['S','M','T','W','T','F','S'];

// Tab bar height from _layout.tsx
const TAB_BAR_HEIGHT = 78;

export default function CalendarScreen() {
  const router   = useRouter();
  const sessions = useSessionStore(st => st.sessions);
  const { width } = useWindowDimensions();
  const mobileFrameWidth = Math.min(width, 430);

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

  // Compute the number of grid rows needed (day-names row + week rows)
  const totalCells = firstWeekDay + daysInMonth;
  const weekRows   = Math.ceil(totalCells / 7);
  const gridRows   = 1 + weekRows; // 1 header row + week rows

  // Compute exact pixel height for the grid:
  //   gridWidth = screen width - 2*16 (horizontal margin) - 2*10 (padding) - 2*2 (border)
  //   cellWidth = (gridWidth - 6*3) / 7   (6 gaps of 3px between 7 columns)
  //   dayNameRowH = cellWidth * 0.6 + 8   (approx, text is smaller)
  //   cellH = cellWidth (square, aspect-ratio:1)
  //   totalH = padding*2 + dayNameRowH + weekRows*cellWidth + (weekRows)*3 (row gaps)
  const gridInnerWidth = mobileFrameWidth - 32 - 20 - 4; // margins + padding + border
  const cellSize       = Math.floor((gridInnerWidth - 6 * 3) / 7);
  const dayNameRowH    = 10 + 8; // font-size:10 + paddingBottom:8
  const gridHeight     = 10 + 10 + dayNameRowH + weekRows * cellSize + (weekRows - 1) * 3 + 4;
  // 10 top padding + 10 bottom padding + header row + week rows + row gaps + border

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
        <Text style={s.calSub}>{MONTHS[month].toUpperCase()} {year}</Text>
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

      {/* cal-grid — FIXED PIXEL HEIGHT, never flexes */}
      <View style={[s.calGrid, { height: gridHeight }]}>
        {DAY_NAMES.map((d, i) => (
          <View key={`dn${i}`} style={{ width: cellSize, alignItems: 'center', paddingBottom: 8 }}>
            <Text style={s.dayName}>{d}</Text>
          </View>
        ))}
        {Array.from({ length: firstWeekDay }).map((_, i) => (
          <View key={`e${i}`} style={{ width: cellSize, height: cellSize }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day     = i + 1;
          const daySess = sessionsForDay(day);
          const active  = daySess.length > 0;
          const tod     = isToday(day);
          return (
            <TouchableOpacity
              key={day}
              style={[
                s.dayCell,
                { width: cellSize, height: cellSize },
                active && s.dayCellActive,
              ]}
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

      {/* cal-section — flex:1 takes all remaining space below the grid */}
      <ScrollView style={s.calSection} contentContainerStyle={s.calSectionContent}>
        <Text style={s.sectionTitle}>
          {'📅 THIS MONTH — ' + monthSessions.length + ' SESSION' + (monthSessions.length !== 1 ? 'S' : '')}
        </Text>

        {monthSessions.length > 0 ? (
          monthSessions.slice(0, 10).map(sess => (
            <SessionCard
              key={sess.id}
              session={sess}
              onPress={() => router.push(`/session/${sess.id}`)}
            />
          ))
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🧗</Text>
            <Text style={s.emptyText}>{'No sessions this month yet.\nTime to get on the wall!'}</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB — position:absolute, bottom = TAB_BAR_HEIGHT + 12 so it sits just above the tab bar */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push('/(tabs)/log')}
        activeOpacity={0.85}
      >
        <View style={s.fabShardTop} />
        <View style={s.fabShardSide} />
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.bg },

  calHdr:      { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  calTitle:    { fontSize: 30, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: 0.5 },
  bl:          { color: colors.accent },
  calSub:      { fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 1 },
  calAccent:   { height: 2, marginHorizontal: 20, marginBottom: 8, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.6 },

  monthNav:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  navBtn:      { width: 36, height: 36, backgroundColor: colors.card, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.accentBorder },
  navBtnText:  { color: colors.text, fontSize: 22, lineHeight: 26 },
  monthTitle:  { fontSize: 16, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.text, letterSpacing: 1, textTransform: 'uppercase' },

  // Grid: horizontal layout with wrap. Height is set dynamically via inline style.
  calGrid:     {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.accentBorder,
    borderRadius: 16,
    backgroundColor: colors.accentDim,
    padding: 10,
    gap: 3,
    // NO flex here — height is set via inline style to prevent squashing
  },

  dayName:     { fontSize: 10, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, color: colors.text3, letterSpacing: 0.5 },
  dayCell:     { alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  dayCellActive: { backgroundColor: colors.accent },
  dayNum:      { fontSize: 14, fontFamily: typography.family.regular, fontWeight: typography.weight.medium, color: colors.text2, lineHeight: 16 },
  dayNumActive: { color: colors.inverseText, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold },
  dayNumToday: { color: colors.accent, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy },

  // flex:1 so this takes all remaining vertical space below the fixed grid
  calSection:  { flex: 1 },
  // paddingBottom just enough to clear the FAB (62px tall) + 8px breathing room
  calSectionContent: { paddingBottom: TAB_BAR_HEIGHT + 70 },

  sectionTitle: { fontSize: 10, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1.5, color: colors.accent, textTransform: 'uppercase', paddingHorizontal: 20, paddingBottom: 10 },

  emptyState:  { alignItems: 'center', paddingVertical: 36 },
  emptyIcon:   { fontSize: 40, opacity: 0.3 },
  emptyText:   { color: colors.text3, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8 },

  // FAB: low, organic climbing-hold shape with uneven edges and layered facets.
  fab:         {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT - 10,
    right: 18,
    width: 64,
    height: 58,
    backgroundColor: colors.highlight,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 26,
    borderBottomLeftRadius: 9,
    transform: [{ rotate: '-11deg' }, { skewX: '-4deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent2,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    overflow: 'hidden',
  },
  fabShardTop: {
    position: 'absolute',
    top: -7,
    left: 18,
    width: 30,
    height: 18,
    backgroundColor: '#A78BFA',
    borderRadius: 4,
    transform: [{ rotate: '18deg' }],
  },
  fabShardSide: {
    position: 'absolute',
    right: -8,
    bottom: 10,
    width: 20,
    height: 24,
    backgroundColor: colors.accent,
    borderRadius: 5,
    transform: [{ rotate: '-20deg' }],
    opacity: 0.65,
  },
  fabIcon:     { color: colors.inverseText, fontSize: 28, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, lineHeight: 32, transform: [{ rotate: '11deg' }, { skewX: '4deg' }] },
});
