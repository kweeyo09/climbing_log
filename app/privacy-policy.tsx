import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../constants/theme';

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'We collect the data you enter directly: session logs, route grades, notes, and photos. If you create an account, we store your email address to identify your account.',
  },
  {
    title: 'How we use it',
    body: 'Your data is used exclusively to provide the Ascenta service — syncing your sessions across devices and showing your progress over time. We never sell your data.',
  },
  {
    title: 'Storage',
    body: 'Session data and photos are stored securely in Supabase cloud infrastructure. All data is encrypted in transit and at rest. Local sessions stay only on your device until you enable sync.',
  },
  {
    title: 'Your rights',
    body: 'You can export or delete all your data at any time from within the app. Deleting your account permanently removes all data from our servers within 30 days.',
  },
  {
    title: 'Third parties',
    body: 'We use Supabase for backend services and Expo for the app runtime. Neither receives your climbing data for advertising or analytics purposes.',
  },
  {
    title: 'Contact',
    body: 'Questions about privacy? Reach us through the Support page or at privacy@ascenta.app.',
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.navIcon} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={27} color={colors.accent} />
        </TouchableOpacity>
        <Text style={s.navTitle}>PRIVACY</Text>
        <View style={s.navIcon} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroBadge}>
          <View style={s.heroBadgeIcon}>
            <Ionicons name="shield-checkmark" size={34} color={colors.accent} />
          </View>
          <Text style={s.heroTitle}>Privacy Policy</Text>
          <Text style={s.heroSub}>Last updated June 2025</Text>
        </View>

        <View style={s.card}>
          {SECTIONS.map((section, i) => (
            <View key={section.title}>
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>{section.title}</Text>
                <Text style={s.sectionBody}>{section.body}</Text>
              </View>
              {i < SECTIONS.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        <Text style={s.foot}>By using Ascenta, you agree to this policy.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.bg },
  topBar:         { height: 54, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navIcon:        { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle:       { fontSize: 22, fontFamily: typography.family.labelBold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: 1 },
  scroll:         { paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 112 },

  heroBadge:      { alignItems: 'center', marginBottom: 24, marginTop: 4 },
  heroBadgeIcon:  { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle:      { fontSize: 26, fontFamily: typography.family.labelBold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: -0.4, marginBottom: 4 },
  heroSub:        { fontSize: 13, color: colors.text3, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium },

  card:           { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  sectionRow:     { paddingHorizontal: 18, paddingVertical: 18 },
  sectionTitle:   { fontSize: 15, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, marginBottom: 6 },
  sectionBody:    { fontSize: 14, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, color: colors.text2, lineHeight: 22 },
  divider:        { height: 1, backgroundColor: colors.border, marginHorizontal: 18 },

  foot:           { fontSize: 12, color: colors.text3, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },
});
