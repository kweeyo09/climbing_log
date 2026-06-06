import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../constants/theme';

export default function AccountDetailsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.navIcon} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={27} color={colors.accent} />
        </TouchableOpacity>
        <Text style={s.navTitle}>ACCOUNT</Text>
        <View style={s.navIcon} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>A</Text>
            </View>
          </View>
          <TouchableOpacity style={s.changePhotoPill} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={15} color={colors.accent} />
            <Text style={s.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={s.card}>
          <View style={s.fieldRow}>
            <Ionicons name="person-outline" size={20} color={colors.accentDark} />
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Display name</Text>
              <Text style={s.fieldValue}>Angel</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text3} />
          </View>
          <View style={s.divider} />
          <View style={s.fieldRow}>
            <Ionicons name="at-outline" size={20} color={colors.accentDark} />
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Username</Text>
              <Text style={s.fieldValue}>@angelclimbs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text3} />
          </View>
          <View style={s.divider} />
          <View style={s.fieldRow}>
            <Ionicons name="mail-outline" size={20} color={colors.accentDark} />
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Email</Text>
              <Text style={s.fieldValue}>Signed in with Apple</Text>
            </View>
            <Ionicons name="lock-closed-outline" size={16} color={colors.text3} />
          </View>
        </View>

        {/* Signed in with */}
        <View style={s.card}>
          <View style={s.fieldRow}>
            <Ionicons name="logo-apple" size={20} color={colors.accentDark} />
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Signed in with</Text>
              <Text style={s.fieldValue}>Apple</Text>
            </View>
          </View>
        </View>

        <Text style={s.hint}>Editing account details will be available in an upcoming update.</Text>
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

  avatarSection:   { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatarWrap:      { width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, marginBottom: 12 },
  avatar:          { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:    { fontSize: 42, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: '#EDE9FE', lineHeight: 48 },
  changePhotoPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accentBorder, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  changePhotoText: { fontSize: 13, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.accent },

  card:            { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  fieldRow:        { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18 },
  fieldBody:       { flex: 1 },
  fieldLabel:      { fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text3, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  fieldValue:      { fontSize: 17, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  divider:         { height: 1, backgroundColor: colors.border, marginLeft: 52 },

  hint:            { fontSize: 13, color: colors.text3, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20, marginTop: 4 },
});
