import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../constants/theme';

const FAQ = [
  {
    q: 'How do I log a session?',
    a: 'Tap the gold + button on the Home or History tab to start a new session log.',
  },
  {
    q: 'Is my data backed up?',
    a: "If you're signed in, sessions sync automatically to the cloud. You can see sync status on your Profile.",
  },
  {
    q: 'Which grade systems are supported?',
    a: 'Ascenta supports V-Scale (bouldering), French Sport, and Yosemite Decimal System (YDS).',
  },
  {
    q: 'Can I add photos to sessions?',
    a: 'Yes — tap the photo icon when logging a session to attach images from your camera or library.',
  },
  {
    q: 'How do I cancel my account?',
    a: 'Go to Profile → Delete account. All data is removed within 30 days.',
  },
];

export default function SupportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.navIcon} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={27} color={colors.accent} />
        </TouchableOpacity>
        <Text style={s.navTitle}>SUPPORT</Text>
        <View style={s.navIcon} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Contact options */}
        <View style={s.card}>
          <TouchableOpacity style={s.contactRow} activeOpacity={0.82} onPress={() => Linking.openURL('mailto:support@ascenta.app')}>
            <View style={s.contactIcon}>
              <Ionicons name="mail-outline" size={22} color={colors.accentDark} />
            </View>
            <View style={s.contactBody}>
              <Text style={s.contactTitle}>Email support</Text>
              <Text style={s.contactSub}>support@ascenta.app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text3} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.contactRow} activeOpacity={0.82} onPress={() => Linking.openURL('https://ascenta.app/feedback')}>
            <View style={s.contactIcon}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.accentDark} />
            </View>
            <View style={s.contactBody}>
              <Text style={s.contactTitle}>Send feedback</Text>
              <Text style={s.contactSub}>Feature requests and bug reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text3} />
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={s.sectionLabel}>Frequently asked</Text>
        <View style={s.card}>
          {FAQ.map((item, i) => (
            <View key={item.q}>
              <View style={s.faqRow}>
                <Text style={s.faqQ}>{item.q}</Text>
                <Text style={s.faqA}>{item.a}</Text>
              </View>
              {i < FAQ.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        <View style={s.versionRow}>
          <Text style={s.version}>Ascenta v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.bg },
  topBar:        { height: 54, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navIcon:       { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle:      { fontSize: 22, fontFamily: typography.family.labelBold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: 1 },
  scroll:        { paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 112 },

  card:          { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },

  contactRow:    { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18 },
  contactIcon:   { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' },
  contactBody:   { flex: 1 },
  contactTitle:  { fontSize: 17, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  contactSub:    { fontSize: 13, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, color: colors.text2, marginTop: 2 },
  divider:       { height: 1, backgroundColor: colors.border, marginLeft: 18 },

  sectionLabel:  { fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text3, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  faqRow:        { paddingHorizontal: 18, paddingVertical: 16 },
  faqQ:          { fontSize: 15, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, marginBottom: 5 },
  faqA:          { fontSize: 14, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, color: colors.text2, lineHeight: 21 },

  versionRow:    { alignItems: 'center', paddingTop: 8 },
  version:       { fontSize: 12, color: colors.text3, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
});
