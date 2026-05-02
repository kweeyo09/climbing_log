import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getTopGrade } from '../constants/grades';
import { colors, spacing, radius } from '../constants/theme';
import type { Session } from '../types';

interface Props {
  session: Session;
  onPress: () => void;
}

export default function SessionCard({ session, onPress }: Props) {
  const topGrade = getTopGrade(session.routes, session.grade_system);

  const fmtDate = (ds: string) => {
    const d = new Date(ds + 'T12:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const completedRoutes = session.routes.filter(r => r.completed);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.header}>
        <Text style={s.location}>{session.location}</Text>
        <Text style={s.date}>{fmtDate(session.date)}</Text>
      </View>

      <View style={s.stats}>
        {session.duration > 0 && (
          <Text style={s.stat}>⏱ {session.duration}min</Text>
        )}
        <Text style={s.stat}>🧗 {session.routes.length} routes</Text>
        {topGrade && <Text style={s.stat}>🏆 {topGrade}</Text>}
        {!session.synced && <Text style={s.unsyncedDot}>●</Text>}
      </View>

      {session.routes.length > 0 && (
        <View style={s.pills}>
          {session.routes.slice(0, 7).map((r, i) => (
            <View key={i} style={[s.pill, r.completed ? s.pillDone : s.pillFail]}>
              <Text style={[s.pillText, r.completed && s.pillTextDone]}>
                {r.grade} {r.completed ? '✓' : '○'}
              </Text>
            </View>
          ))}
          {session.routes.length > 7 && (
            <View style={s.pill}>
              <Text style={s.pillText}>+{session.routes.length - 7}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:         { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: colors.accent },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  location:     { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  date:         { fontSize: 11, color: colors.text2, marginLeft: spacing.sm, marginTop: 2 },
  stats:        { flexDirection: 'row', gap: 14, alignItems: 'center' },
  stat:         { fontSize: 12, color: colors.text2, fontWeight: '500' },
  unsyncedDot:  { fontSize: 8, color: colors.text3, marginLeft: 'auto' },
  pills:        { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 },
  pill:         { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  pillDone:     { backgroundColor: colors.successDim, borderColor: colors.successBdr },
  pillFail:     { opacity: 0.5 },
  pillText:     { fontSize: 11, fontWeight: '600', color: colors.text2 },
  pillTextDone: { color: colors.success },
});
