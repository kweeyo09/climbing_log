import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getTopGrade } from '../constants/grades';
import { colors, spacing, radius } from '../constants/theme';
import type { Session } from '../types';

/** Show only "Venue, City" — strip street/postcode like the preview HTML */
function shortLocation(loc: string): string {
  if (!loc) return loc;
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 2) return loc;
  const venue = parts[0];
  const city  = parts.slice(1).find(p => p.length > 3 && !/^\d+$/.test(p) && !/^[A-Z]{1,2}\d/.test(p));
  return city ? `${venue}, ${city}` : venue;
}

interface Props {
  session: Session;
  onPress: () => void;
}

export default function SessionCard({ session, onPress }: Props) {
  const router   = useRouter();
  const topGrade = getTopGrade(session.routes, session.grade_system);

  const fmtDate = (ds: string) => {
    const d = new Date(ds + 'T12:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const completedRoutes = session.routes.filter(r => r.completed);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.header}>
        <Text style={s.location} numberOfLines={1}>{shortLocation(session.location)}</Text>
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
                {r.grade} {r.completed ? '\u2713' : '\u25cb'}
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

      {/* Edit button matching preview */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => router.push(`/session/${session.id}`)}
          activeOpacity={0.7}
        >
          <Text style={s.editBtnText}>{'\u270F\uFE0F Edit Session'}</Text>
        </TouchableOpacity>
      </View>
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
  actions:      { flexDirection: 'row', marginTop: 10 },
  editBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(106,90,205,0.12)', borderWidth: 1, borderColor: 'rgba(106,90,205,0.32)', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4 },
  editBtnText:  { fontSize: 11, fontWeight: '700', color: colors.accent, letterSpacing: 0.3 },
});
