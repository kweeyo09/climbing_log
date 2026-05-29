import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../store/sessions';
import SessionCard from '../../components/SessionCard';
import { colors, typography } from '../../constants/theme';

export default function HistoryScreen() {
  const router = useRouter();
  const sessions = useSessionStore(s => s.sessions);
  const loading = useSessionStore(s => s.loading);
  const totalRoutes = sessions.reduce((sum, session) => sum + session.routes.length, 0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.hdr}>
        <Text style={s.eyebrow}>ACTIVITY FEED</Text>
        <Text style={s.hdrTitle}>Sessions</Text>
        <Text style={s.hdrSub}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} · {totalRoutes} routes tracked</Text>
      </View>

      {loading ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>Loading sessions</Text>
          <Text style={s.emptyText}>Getting your climbing history ready.</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyOrb}><Text style={s.emptyOrbText}>A</Text></View>
          <Text style={s.emptyTitle}>Build your activity feed</Text>
          <Text style={s.emptyText}>Every climb you log becomes a session card with routes, photos, grades, and sync status.</Text>
          <TouchableOpacity style={s.emptyCta} onPress={() => router.push('/(tabs)/log')} activeOpacity={0.85}>
            <Text style={s.emptyCtaText}>Log your first session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <SessionCard session={item} onPress={() => router.push(`/session/${item.id}`)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hdr: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  eyebrow: { fontSize: 12, fontFamily: typography.family.label, fontWeight: typography.weight.bold, color: colors.accent, letterSpacing: 1.7, textTransform: 'uppercase', marginBottom: 6 },
  hdrTitle: { fontSize: 38, fontFamily: typography.family.labelBold, fontWeight: typography.weight.heavy, color: colors.text, letterSpacing: -0.7, lineHeight: 38 },
  hdrSub: { fontSize: 13, color: colors.text3, marginTop: 4 },
  list: { paddingTop: 2, paddingBottom: 104 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, gap: 10 },
  emptyOrb: { width: 72, height: 72, borderRadius: 26, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyOrbText: { fontSize: 34, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.accent },
  emptyTitle: { fontSize: 25, fontFamily: typography.family.labelBold, fontWeight: typography.weight.heavy, color: colors.text, textAlign: 'center', letterSpacing: -0.4 },
  emptyText: { color: colors.text2, fontSize: 14, textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  emptyCta: { backgroundColor: colors.accent, borderRadius: 18, paddingHorizontal: 20, paddingVertical: 13, marginTop: 10 },
  emptyCtaText: { color: colors.inverseText, fontSize: 14, fontFamily: typography.family.bold, fontWeight: typography.weight.bold },
});
