/**
 * SessionCard — matches preview HTML .sess-card exactly.
 *
 * Preview CSS reference:
 * .sess-card{background:var(--card);border:1px solid var(--border);border-radius:var(--rl);
 *   padding:14px;margin:0 16px 10px;border-left:3px solid var(--accent);}
 * .card-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;}
 * .card-loc{font-size:15px;font-weight:700;color:var(--text);flex:1;}
 * .card-date{font-size:11px;color:var(--text2);margin-left:8px;margin-top:2px;white-space:nowrap;}
 * .card-stats{display:flex;gap:10px;align-items:center;}
 * .card-stat{font-size:12px;color:var(--text2);font-weight:500;}
 * .pills{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}
 * .pill{background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:2px 7px;
 *   font-size:11px;font-weight:600;color:var(--text2);}
 * .pill.done{background:var(--okDim);border-color:var(--okBdr);color:var(--ok);}
 * .pill.fail{opacity:.5;}
 *
 * NOTE: Edit button is NOT shown here — it only appears on the detail screen.
 */
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getTopGrade } from '../constants/grades';
import { colors } from '../constants/theme';
import type { Session } from '../types';

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
  const topGrade = getTopGrade(session.routes, session.grade_system);

  const fmtDate = (ds: string) => {
    const d = new Date(ds + 'T12:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      {/* card-hdr */}
      <View style={s.cardHdr}>
        <Text style={s.cardLoc} numberOfLines={1}>{shortLocation(session.location)}</Text>
        <Text style={s.cardDate}>{fmtDate(session.date)}</Text>
      </View>

      {/* card-stats */}
      <View style={s.cardStats}>
        {session.duration > 0 && (
          <Text style={s.cardStat}>⏱ {session.duration}min</Text>
        )}
        <Text style={s.cardStat}>🧗 {session.routes.length} routes</Text>
        {topGrade && <Text style={s.cardStat}>🏆 {topGrade}</Text>}
        {!session.synced && <Text style={s.unsyncedDot}>●</Text>}
      </View>

      {/* pills */}
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
  // .sess-card
  card:         {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,          // --rl
    padding: 14,               // matches preview padding:14px
    marginHorizontal: 16,      // matches preview margin:0 16px 10px
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  // .card-hdr
  cardHdr:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  // .card-loc
  cardLoc:      { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  // .card-date
  cardDate:     { fontSize: 11, color: colors.text2, marginLeft: 8, marginTop: 2 },
  // .card-stats
  cardStats:    { flexDirection: 'row', gap: 10, alignItems: 'center' },
  // .card-stat
  cardStat:     { fontSize: 12, color: colors.text2, fontWeight: '500' },
  unsyncedDot:  { fontSize: 8, color: colors.text3, marginLeft: 'auto' },
  // .pills
  pills:        { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  // .pill
  pill:         { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  // .pill.done
  pillDone:     { backgroundColor: colors.successDim, borderColor: colors.successBdr },
  // .pill.fail
  pillFail:     { opacity: 0.5 },
  pillText:     { fontSize: 11, fontWeight: '600', color: colors.text2 },
  // .pill.done color
  pillTextDone: { color: colors.success },
});
