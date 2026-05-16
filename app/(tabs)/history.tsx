/**
 * Sessions screen — matches preview HTML #page-sessions exactly.
 *
 * Preview CSS:
 * .hdr-title{font-size:28px;font-weight:900;color:var(--text);letter-spacing:.5px;}
 * .hdr-sub{font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;}
 * Sessions list uses .sess-card (see SessionCard.tsx)
 */
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../store/sessions';
import SessionCard from '../../components/SessionCard';
import { colors } from '../../constants/theme';

export default function HistoryScreen() {
  const router   = useRouter();
  const sessions = useSessionStore(s => s.sessions);
  const loading  = useSessionStore(s => s.loading);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* hdr */}
      <View style={s.hdr}>
        <Text style={s.hdrTitle}>📋 SESSIONS</Text>
        <Text style={s.hdrSub}>{sessions.length} total session{sessions.length !== 1 ? 's' : ''}</Text>
      </View>
      <View style={s.accentLine} />

      {loading ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Loading…</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyText}>No sessions yet.{'\n'}Log your first climb!</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onPress={() => router.push(`/session/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.bg },
  // .hdr matches preview .hdr class padding
  hdr:         { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  // .hdr-title{font-size:28px;font-weight:900;color:var(--text);letter-spacing:.5px;}
  hdrTitle:    { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  // .hdr-sub{font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;margin-top:2px;}
  hdrSub:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  accentLine:  { height: 2, marginHorizontal: 20, marginBottom: 14, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.6 },
  list:        { paddingTop: 4, paddingBottom: 32 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon:   { fontSize: 44, opacity: 0.3 },
  emptyText:   { color: colors.text3, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
