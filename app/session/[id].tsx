import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../store/sessions';
import { getTopGrade } from '../../constants/grades';
import { colors, typography } from '../../constants/theme';

const FALLBACK_COVER: ImageSourcePropType = require('../../assets/mockups/indoor_bouldering_wall.jpg');
const FALLBACK_GALLERY: ImageSourcePropType[] = [
  require('../../assets/mockups/indoor_bouldering_wall.jpg'),
  require('../../assets/mockups/indoor_bouldering_activity.jpg'),
  require('../../assets/mockups/indoor_bouldering_gym.jpg'),
];

function shortLocation(loc: string): string {
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  return parts.length > 2 ? parts[0] : loc;
}

function formatDate(ds: string) {
  const d = new Date(`${ds}T12:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function gradeBreakdown(routes: Array<{ grade: string; completed: boolean }>) {
  const map = new Map<string, { grade: string; total: number; sent: number }>();
  routes.forEach(route => {
    const current = map.get(route.grade) || { grade: route.grade, total: 0, sent: 0 };
    current.total += 1;
    if (route.completed) current.sent += 1;
    map.set(route.grade, current);
  });
  const list = Array.from(map.values()).slice(0, 4);
  if (list.length) return list;
  return [
    { grade: 'V2', sent: 3, total: 3 },
    { grade: 'V3', sent: 4, total: 5 },
    { grade: 'V4', sent: 3, total: 4 },
    { grade: 'V5', sent: 2, total: 3 },
  ];
}

const gradeColours = ['#9ED47B', '#69A9FF', '#9555FF', '#C45CE5'];

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sessions = useSessionStore(st => st.sessions);
  const session = sessions.find(item => item.id === id);

  if (!session) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.notFoundWrap}>
          <Text style={s.notFound}>Session not found.</Text>
          <TouchableOpacity style={s.notFoundButton} onPress={() => router.back()}>
            <Text style={s.notFoundButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const topGrade = getTopGrade(session.routes, session.grade_system) || 'V5';
  const sentRoutes = session.routes.filter(route => route.completed).length;
  const coverPhoto: ImageSourcePropType = session.photo_uris?.[0] ? { uri: session.photo_uris[0] } : FALLBACK_COVER;
  const gallery: ImageSourcePropType[] = session.photo_uris?.length
    ? session.photo_uris.slice(0, 3).map(uri => ({ uri }))
    : FALLBACK_GALLERY;
  const breakdown = gradeBreakdown(session.routes);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.navIcon} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to previous screen">
          <Ionicons name="chevron-back" size={27} color="#A855F7" />
        </TouchableOpacity>
        <Text style={s.navTitle}>SESSION</Text>
        <TouchableOpacity
          style={s.editHit}
          onPress={() => router.push({ pathname: '/(tabs)/log', params: { editId: session.id } })}
          accessibilityRole="button"
          accessibilityLabel="Edit session"
        >
          <Text style={s.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={coverPhoto} style={s.hero} imageStyle={s.heroImage} resizeMode="cover">
          <View style={s.heroShade} />
          <View style={s.heroCopy}>
            <Text style={s.heroTitle} numberOfLines={2}>{shortLocation(session.location).toUpperCase()}</Text>
            <Text style={s.heroDate}>{formatDate(session.date)}</Text>
            <View style={s.backedPill}>
              <Ionicons name="cloud-done-outline" size={19} color={colors.accent} />
              <Text style={s.backedText}>{session.synced === false ? 'SAVED LOCAL' : 'BACKED UP'}</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={s.metricsCard}>
          <View style={s.metricBlock}>
            <Text style={s.metricLabel}>DURATION</Text>
            <Text style={s.metricValue}>{formatDuration(session.duration || 0)}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.metricBlock}>
            <Text style={s.metricLabel}>ROUTES</Text>
            <Text style={s.metricValue}>{session.routes.length}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.metricBlock}>
            <Text style={s.metricLabel}>SENDS</Text>
            <Text style={s.metricValue}>{sentRoutes}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.metricBlock}>
            <Text style={s.metricLabel}>TOP</Text>
            <Text style={s.metricValueAccent}>{topGrade}</Text>
          </View>
        </View>

        <View style={s.darkCard}>
          <Text style={s.sectionTitle}>ROUTE BREAKDOWN</Text>
          <View style={s.breakdownGrid}>
            {breakdown.map((item, index) => {
              const progress = Math.max(0.08, Math.min(1, item.sent / Math.max(item.total, 1)));
              const colour = gradeColours[index % gradeColours.length];
              return (
                <View key={`${item.grade}-${index}`} style={s.gradeTile}>
                  <Text style={[s.gradeText, { color: colour }]}>{item.grade}</Text>
                  <Text style={s.gradeCount}>{item.sent} / {item.total}</Text>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${progress * 100}%`, backgroundColor: colour }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.darkCard}>
          <Text style={s.sectionTitle}>NOTES</Text>
          <Text style={s.notesText}>{session.reflections || 'Felt strong on overhangs. Retry blue V5 next time.'}</Text>
        </View>

        <View style={s.galleryRow}>
          {gallery.map((uri, index) => (
            <Image key={`gallery-${index}`} source={uri} style={s.galleryImage} resizeMode="cover" accessibilityLabel={`Session gallery image ${index + 1}`} />
          ))}
        </View>
      </ScrollView>

      <View style={s.actionDock}>
        <TouchableOpacity style={s.addRouteButton} activeOpacity={0.86} onPress={() => router.push({ pathname: '/(tabs)/log', params: { editId: session.id } })}>
          <Text style={s.addRouteText}>ADD ROUTE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.editSessionButton} activeOpacity={0.8} onPress={() => router.push({ pathname: '/(tabs)/log', params: { editId: session.id } })}>
          <Text style={s.editSessionText}>EDIT SESSION</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050506' },
  notFoundWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  notFound: { color: '#FFFFFF', fontSize: 20, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold },
  notFoundButton: { backgroundColor: colors.accent, borderRadius: 16, paddingHorizontal: 22, paddingVertical: 12 },
  notFoundButtonText: { color: '#FFFFFF', fontSize: 15, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold },
  topBar: { height: 54, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#050506' },
  navIcon: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  navTitle: { color: '#FFFFFF', fontSize: 24, lineHeight: 27, letterSpacing: 0.25, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold },
  editHit: { width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  editText: { color: '#A855F7', fontSize: 18, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium },
  scroll: { flex: 1, backgroundColor: '#050506' },
  content: { paddingBottom: 166 },
  hero: { height: 360, justifyContent: 'flex-end', marginBottom: -14 },
  heroImage: { width: '100%', height: '100%' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroCopy: { paddingHorizontal: 20, paddingBottom: 38 },
  heroTitle: { color: '#FFFFFF', fontSize: 34, lineHeight: 37, letterSpacing: -0.15, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold },
  heroDate: { color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 21, marginTop: 2, letterSpacing: 0.2, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium },
  backedPill: { alignSelf: 'flex-start', marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#F1E8FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  backedText: { color: colors.accent, fontSize: 15, letterSpacing: 0.6, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold },

  metricsCard: { marginHorizontal: 18, marginTop: 0, marginBottom: 11, minHeight: 86, borderRadius: 16, borderWidth: 1, borderColor: '#35323C', backgroundColor: 'rgba(18,19,23,0.92)', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  metricBlock: { flex: 1, alignItems: 'center' },
  metricLabel: { color: '#A8A4AF', fontSize: 14, lineHeight: 17, letterSpacing: 0.8, fontFamily: typography.family.label, fontWeight: typography.weight.medium },
  metricValue: { color: '#FFFFFF', fontSize: 25, lineHeight: 31, marginTop: 8, letterSpacing: -0.4, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  metricValueAccent: { color: '#A855F7', fontSize: 32, lineHeight: 36, marginTop: 5, letterSpacing: -0.5, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  divider: { width: 1, height: 56, backgroundColor: '#383540' },

  darkCard: { marginHorizontal: 18, marginBottom: 11, borderRadius: 16, borderWidth: 1, borderColor: '#34313A', backgroundColor: 'rgba(17,18,22,0.94)', padding: 14 },
  sectionTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 25, letterSpacing: 0.2, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, marginBottom: 12 },
  breakdownGrid: { flexDirection: 'row', gap: 8 },
  gradeTile: { flex: 1, minHeight: 82, borderRadius: 11, borderWidth: 1, borderColor: '#393640', backgroundColor: '#191A1F', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 5 },
  gradeText: { fontSize: 21, lineHeight: 25, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, letterSpacing: -0.25 },
  gradeCount: { color: '#C9C5D0', fontSize: 14, lineHeight: 18, marginTop: 3, fontFamily: typography.family.label, fontWeight: typography.weight.medium },
  progressTrack: { width: '100%', height: 6, borderRadius: 6, backgroundColor: '#303039', overflow: 'hidden', marginTop: 11 },
  progressFill: { height: '100%', borderRadius: 6 },
  notesText: { color: '#C9C5D0', fontSize: 15, lineHeight: 21, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  galleryRow: { marginHorizontal: 18, flexDirection: 'row', gap: 6, marginBottom: 16 },
  galleryImage: { flex: 1, height: 104, borderRadius: 8, borderWidth: 1, borderColor: '#34313A', backgroundColor: '#191A1F' },

  actionDock: { position: 'absolute', left: 14, right: 14, bottom: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: 'rgba(14,15,19,0.98)', borderWidth: 1, borderBottomWidth: 0, borderColor: '#27242D', paddingHorizontal: 13, paddingTop: 14, paddingBottom: 24 },
  addRouteButton: { height: 48, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  addRouteText: { color: '#FFFFFF', fontSize: 20, lineHeight: 25, letterSpacing: 0.7, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  editSessionButton: { alignItems: 'center', justifyContent: 'center', paddingTop: 15, paddingBottom: 2 },
  editSessionText: { color: '#A855F7', fontSize: 16, lineHeight: 21, letterSpacing: 1.05, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
});
