import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../constants/theme';

const CONSEQUENCES = [
  'All session logs and route history',
  'Uploaded photos and videos',
  'Progress stats and personal bests',
  'Your account and profile data',
];

export default function DeleteAccountScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.navIcon} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={27} color={colors.accent} />
        </TouchableOpacity>
        <Text style={s.navTitle}>DELETE ACCOUNT</Text>
        <View style={s.navIcon} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Warning banner */}
        <View style={s.warnCard}>
          <View style={s.warnIconWrap}>
            <Ionicons name="warning" size={30} color={colors.error} />
          </View>
          <Text style={s.warnTitle}>This cannot be undone</Text>
          <Text style={s.warnBody}>
            Deleting your account permanently removes all data from Ascenta's servers within 30 days. There is no way to recover it.
          </Text>
        </View>

        {/* What gets deleted */}
        <Text style={s.sectionLabel}>What will be deleted</Text>
        <View style={s.card}>
          {CONSEQUENCES.map((item, i) => (
            <View key={item}>
              <View style={s.consequenceRow}>
                <View style={s.errorDot} />
                <Text style={s.consequenceText}>{item}</Text>
              </View>
              {i < CONSEQUENCES.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        {/* Export reminder */}
        <View style={s.exportCard}>
          <Ionicons name="download-outline" size={22} color={colors.accentDark} />
          <View style={s.exportBody}>
            <Text style={s.exportTitle}>Export your data first</Text>
            <Text style={s.exportSub}>Data export will be available in an upcoming update.</Text>
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity style={s.deleteBtn} activeOpacity={0.85} onPress={() => router.back()}>
          <Ionicons name="trash-outline" size={18} color={colors.inverseText} />
          <Text style={s.deleteBtnText}>Request account deletion</Text>
        </TouchableOpacity>

        <Text style={s.foot}>You'll receive a confirmation email. Deletion is processed within 30 days.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: colors.bg },
  topBar:          { height: 54, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navIcon:         { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle:        { fontSize: 22, fontFamily: typography.family.labelBold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: 1 },
  scroll:          { paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 112 },

  warnCard:        { backgroundColor: colors.errorDim, borderRadius: 22, borderWidth: 1, borderColor: colors.errorBdr, padding: 20, alignItems: 'center', marginBottom: 24, gap: 8 },
  warnIconWrap:    { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(194,65,12,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  warnTitle:       { fontSize: 20, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.error, textAlign: 'center' },
  warnBody:        { fontSize: 14, color: colors.text2, textAlign: 'center', lineHeight: 22, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },

  sectionLabel:    { fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text3, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  card:            { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  consequenceRow:  { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18 },
  errorDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  consequenceText: { flex: 1, fontSize: 15, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium, color: colors.text },
  divider:         { height: 1, backgroundColor: colors.border, marginLeft: 40 },

  exportCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 24 },
  exportBody:      { flex: 1 },
  exportTitle:     { fontSize: 15, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, marginBottom: 2 },
  exportSub:       { fontSize: 13, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, color: colors.text2, lineHeight: 18 },

  deleteBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.error, borderRadius: 16, padding: 18, marginBottom: 14 },
  deleteBtnText:   { fontSize: 16, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.inverseText, letterSpacing: 0.3 },

  foot:            { fontSize: 12, color: colors.text3, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },
});
