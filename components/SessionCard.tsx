import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getTopGrade } from '../constants/grades';
import { colors, radius, typography } from '../constants/theme';
import type { Session } from '../types';

function shortLocation(loc: string): string {
  if (!loc) return loc;
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 2) return loc;
  const venue = parts[0];
  const city = parts.slice(1).find(p => p.length > 3 && !/^\d+$/.test(p) && !/^[A-Z]{1,2}\d/.test(p));
  return city ? `${venue}, ${city}` : venue;
}

function fmtDate(ds: string) {
  const d = new Date(ds + 'T12:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface Props {
  session: Session;
  onPress: () => void;
}

export default function SessionCard({ session, onPress }: Props) {
  const topGrade = getTopGrade(session.routes, session.grade_system);
  const sentRoutes = session.routes.filter(route => route.completed).length;
  const coverPhoto = session.photo_uris?.[0];
  const syncLabel = session.synced ? 'Backed up' : 'On device';

  return (
    <TouchableOpacity
      style={s.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Open climbing session at ${shortLocation(session.location)} on ${fmtDate(session.date)}`}
    >
      <View style={s.topRow}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={s.cover} resizeMode="cover" />
        ) : (
          <View style={s.coverFallback}>
            <Text style={s.coverFallbackText}>A</Text>
          </View>
        )}

        <View style={s.content}>
          <View style={s.metaRow}>
            <Text style={s.date}>{fmtDate(session.date)}</Text>
            <View style={[s.syncPill, !session.synced && s.syncPillLocal]}>
              <Text style={[s.syncText, !session.synced && s.syncTextLocal]}>{syncLabel}</Text>
            </View>
          </View>

          <Text style={s.location} numberOfLines={2}>{shortLocation(session.location)}</Text>

          <View style={s.metricsRow}>
            {session.duration > 0 && (
              <View style={s.metric}>
                <Text style={s.metricValue}>{session.duration}</Text>
                <Text style={s.metricLabel}>MIN</Text>
              </View>
            )}
            <View style={s.metric}>
              <Text style={s.metricValue}>{sentRoutes}/{session.routes.length}</Text>
              <Text style={s.metricLabel}>SENDS</Text>
            </View>
            {topGrade && (
              <View style={s.metric}>
                <Text style={s.metricValue}>{topGrade}</Text>
                <Text style={s.metricLabel}>TOP</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {session.routes.length > 0 && (
        <View style={s.gradeStrip}>
          {session.routes.slice(0, 6).map((route, index) => (
            <View key={`${route.grade}-${index}`} style={[s.gradePill, route.completed && s.gradePillDone]}>
              <Text style={[s.gradeText, route.completed && s.gradeTextDone]}>{route.grade}</Text>
            </View>
          ))}
          {session.routes.length > 6 && (
            <View style={s.gradePill}>
              <Text style={s.gradeText}>+{session.routes.length - 6}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  topRow: { flexDirection: 'row', gap: 12 },
  cover: { width: 86, height: 98, borderRadius: 18, backgroundColor: colors.surface },
  coverFallback: {
    width: 86,
    height: 98,
    borderRadius: 18,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    fontSize: 34,
    fontFamily: typography.family.bold,
    fontWeight: typography.weight.heavy,
    color: colors.accent,
  },
  content: { flex: 1, minHeight: 98 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 },
  date: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
    fontWeight: typography.weight.bold,
    color: colors.text3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  syncPill: {
    borderRadius: 999,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  syncPillLocal: { backgroundColor: colors.accentDim, borderColor: colors.accentBorder },
  syncText: {
    fontSize: 9,
    fontFamily: typography.family.semibold,
    fontWeight: typography.weight.bold,
    color: colors.accent,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  syncTextLocal: { color: colors.accent },
  location: {
    fontSize: 19,
    fontFamily: typography.family.bold,
    fontWeight: typography.weight.heavy,
    color: colors.text,
    lineHeight: 23,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 'auto' },
  metric: { flex: 1 },
  metricValue: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    fontWeight: typography.weight.heavy,
    color: colors.accentDark,
    lineHeight: 21,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: typography.family.semibold,
    fontWeight: typography.weight.bold,
    color: colors.text3,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  gradeStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gradePill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gradePillDone: { backgroundColor: colors.accentDim, borderColor: colors.accentBorder },
  gradeText: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
    fontWeight: typography.weight.bold,
    color: colors.text2,
  },
  gradeTextDone: { color: colors.accent },
});
