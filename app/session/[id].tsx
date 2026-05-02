import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../store/sessions';
import { getTopGrade } from '../../constants/grades';
import { colors, spacing, radius } from '../../constants/theme';

export default function SessionDetailScreen() {
  const { id }        = useLocalSearchParams<{ id: string }>();
  const router        = useRouter();
  const sessions      = useSessionStore(s => s.sessions);
  const deleteSession = useSessionStore(s => s.deleteSession);

  const session = sessions.find(s => s.id === id);

  if (!session) {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={{ color: colors.text, padding: spacing.lg }}>Session not found.</Text>
      </SafeAreaView>
    );
  }

  const topGrade = getTopGrade(session.routes, session.grade_system);

  const fmtDate = (ds: string) => {
    const d = new Date(ds + 'T12:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure? This can\'t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(session.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Drag handle */}
      <View style={s.handle} />

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Back / close + Edit row */}
        <View style={s.topRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={22} color={colors.text2} />
            <Text style={s.backText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => router.push({ pathname: '/(tabs)/log', params: { editId: session.id } })}
            activeOpacity={0.75}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.accent} />
            <Text style={s.editBtnText}>Edit Session</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={s.location}>{session.location}</Text>
        <Text style={s.date}>{fmtDate(session.date)}</Text>

        {/* Stat chips */}
        <View style={s.chips}>
          {session.duration > 0 && (
            <View style={s.chip}><Text style={s.chipText}>⏱  {session.duration} min</Text></View>
          )}
          <View style={s.chip}><Text style={s.chipText}>🧗  {session.routes.length} routes</Text></View>
          {topGrade && (
            <View style={[s.chip, s.chipAccent]}><Text style={[s.chipText, s.chipTextAccent]}>🏆  {topGrade}</Text></View>
          )}
          <View style={s.chip}>
            <Text style={s.chipText}>{session.grade_system === 'french' ? '🇫🇷 French' : '🇺🇸 V-Scale'}</Text>
          </View>
        </View>

        {/* Routes */}
        {session.routes.length > 0 && (
          <>
            <Text style={s.sectionTitle}>ROUTES</Text>
            <View style={s.routeList}>
              {session.routes.map((route, i) => (
                <View
                  key={i}
                  style={[s.routeRow, route.completed ? s.routeRowDone : s.routeRowFail]}
                >
                  <Text style={[s.routeGrade, route.completed && s.routeGradeDone]}>
                    {route.grade}
                  </Text>
                  <Text style={s.routeStyle}>{route.style}</Text>
                  <Text style={[s.routeStatus, route.completed && s.routeStatusDone]}>
                    {route.completed ? '✓ Sent' : '○ Project'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Reflections */}
        {session.reflections ? (
          <>
            <Text style={s.sectionTitle}>REFLECTIONS</Text>
            <View style={s.reflBox}>
              <Text style={s.reflText}>"{session.reflections}"</Text>
            </View>
          </>
        ) : null}

        {/* Sync status */}
        <Text style={s.syncStatus}>
          {session.synced ? '☁️  Synced to cloud' : '📱  Saved locally (will sync when online)'}
        </Text>

        {/* Delete */}
        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={s.deleteBtnText}>Delete Session</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: colors.card },
  handle:          { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  scroll:          { paddingHorizontal: spacing.lg, paddingBottom: 48 },
  topRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  backBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText:        { color: colors.text2, fontSize: 14 },
  editBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accentBorder, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText:     { fontSize: 12, fontWeight: '700', color: colors.accent },
  location:        { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  date:            { fontSize: 13, color: colors.text2, marginTop: 4, marginBottom: spacing.md },
  chips:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  chip:            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  chipText:        { fontSize: 13, fontWeight: '600', color: colors.text2 },
  chipAccent:      { backgroundColor: colors.accentDim, borderColor: colors.accentBorder },
  chipTextAccent:  { color: colors.accent, fontWeight: '700' },
  sectionTitle:    { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.text3, marginBottom: spacing.sm },
  routeList:       { gap: 6, marginBottom: spacing.lg },
  routeRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, gap: 12 },
  routeRowDone:    { borderColor: colors.successBdr, backgroundColor: colors.successDim },
  routeRowFail:    { opacity: 0.6 },
  routeGrade:      { fontSize: 15, fontWeight: '700', color: colors.text2, width: 46 },
  routeGradeDone:  { color: colors.success },
  routeStyle:      { flex: 1, fontSize: 13, color: colors.text2 },
  routeStatus:     { fontSize: 12, fontWeight: '700', color: colors.text3 },
  routeStatusDone: { color: colors.success },
  reflBox:         { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  reflText:        { fontSize: 14, color: colors.text2, lineHeight: 22, fontStyle: 'italic' },
  syncStatus:      { fontSize: 12, color: colors.text3, marginBottom: spacing.lg, textAlign: 'center' },
  deleteBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.errorDim, borderWidth: 1, borderColor: colors.errorBdr, borderRadius: radius.md, padding: spacing.md },
  deleteBtnText:   { fontSize: 13, fontWeight: '700', color: colors.error, letterSpacing: 0.5 },
});
