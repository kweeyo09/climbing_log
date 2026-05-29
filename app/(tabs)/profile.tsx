import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../store/sessions';
import { colors, typography } from '../../constants/theme';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
};

function showComingSoon(label: string) {
  Alert.alert(label, 'This account feature is part of the launch-ready sync and account roadmap.');
}

export default function ProfileScreen() {
  const sessions = useSessionStore(s => s.sessions);
  const syncedSessions = sessions.filter(session => session.synced).length;
  const photoCount = sessions.reduce((acc, session) => acc + (session.photo_uris?.length ?? 0), 0);
  const backedUpPhotoCount = sessions.reduce((acc, session) => acc + (session.synced ? (session.photo_uris?.length ?? 0) : 0), 0);
  const allBackedUp = sessions.length > 0 && syncedSessions === sessions.length;

  const menuItems: MenuItem[] = [
    { label: 'Account details', icon: 'person-circle-outline', onPress: () => showComingSoon('Account details') },
    { label: 'Privacy policy', icon: 'shield-checkmark-outline', onPress: () => showComingSoon('Privacy policy') },
    { label: 'Export data', icon: 'download-outline', onPress: () => showComingSoon('Export data') },
    { label: 'Delete account', icon: 'trash-outline', destructive: true, onPress: () => showComingSoon('Delete account') },
    { label: 'Support', icon: 'headset-outline', onPress: () => showComingSoon('Support') },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Text style={s.screenTitle}>Profile</Text>
          <View style={s.brandMark}>
            <Text style={s.brandMarkText}>A</Text>
          </View>
        </View>

        <TouchableOpacity style={s.profileCard} activeOpacity={0.86} onPress={() => showComingSoon('Account profile')} accessibilityRole="button" accessibilityLabel="Open account profile details">
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>A</Text>
            </View>
          </View>
          <View style={s.profileCopy}>
            <Text style={s.name}>Angel</Text>
            <Text style={s.handle}>@angelclimbs</Text>
            <View style={s.applePill}>
              <Ionicons name="logo-apple" size={18} color={colors.accentDark} />
              <Text style={s.appleText}>Signed in with Apple</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={28} color={colors.text2} />
        </TouchableOpacity>

        <View style={s.syncCard}>
          <View style={s.cloudPanel}>
            <View style={s.cloudOrbit} />
            <View style={s.cloudShape}>
              <Ionicons name="cloud" size={96} color={colors.accent} />
              <View style={s.checkBadge}>
                <Ionicons name="checkmark" size={26} color={colors.accent} />
              </View>
            </View>
          </View>
          <View style={s.syncDivider} />
          <View style={s.syncCopy}>
            <Text style={s.syncTitle}>{allBackedUp ? 'All sessions backed up' : `${syncedSessions}/${sessions.length} sessions backed up`}</Text>
            <View style={s.syncStatusRow}>
              <View style={s.statusDot} />
              <Text style={s.syncStatus}>{sessions.length === 0 ? 'Ready when you log your first session' : 'Last sync 2 min ago'}</Text>
            </View>
            <View style={s.syncRule} />
            <View style={s.photoBackupRow}>
              <Ionicons name="image-outline" size={30} color={colors.accentDark} />
              <Text style={s.photoBackupText}>Photos <Text style={s.photoBackupNumber}>{backedUpPhotoCount || photoCount}</Text> backed up</Text>
            </View>
          </View>
        </View>

        <View style={s.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuRow, index !== menuItems.length - 1 && s.menuDivider]}
              activeOpacity={0.82}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Ionicons name={item.icon} size={31} color={item.destructive ? colors.error : colors.accentDark} />
              <Text style={[s.menuLabel, item.destructive && s.menuLabelDestructive]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={23} color={colors.text2} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.privacyNote}>
          <View style={s.privacyShield}>
            <Ionicons name="shield" size={34} color={colors.accentDark} />
          </View>
          <Text style={s.privacyText}>Your gym notes and photos stay private unless you choose to share.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 112 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  screenTitle: { fontSize: 56, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.text, letterSpacing: -2.1, lineHeight: 62 },
  brandMark: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { fontSize: 58, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.accent, lineHeight: 62, transform: [{ skewX: '-7deg' }] },
  profileCard: { minHeight: 154, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 18, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.045, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarLetter: { fontSize: 48, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: '#EDE9FE', lineHeight: 52 },
  profileCopy: { flex: 1 },
  name: { fontSize: 34, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.text, letterSpacing: -1, lineHeight: 38 },
  handle: { fontSize: 19, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.accentDark, marginTop: 4, marginBottom: 12 },
  applePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 8 },
  appleText: { fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  syncCard: { minHeight: 194, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentDim, borderRadius: 24, borderWidth: 1, borderColor: colors.accentBorder, padding: 18, marginBottom: 14, overflow: 'hidden' },
  cloudPanel: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
  cloudOrbit: { position: 'absolute', width: 126, height: 126, borderRadius: 63, borderWidth: 1.5, borderColor: colors.accentBorder, borderStyle: 'dashed' },
  cloudShape: { width: 120, height: 100, alignItems: 'center', justifyContent: 'center' },
  checkBadge: { position: 'absolute', bottom: 15, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  syncDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.accentBorder, marginHorizontal: 18 },
  syncCopy: { flex: 1 },
  syncTitle: { fontSize: 24, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.accentDark, letterSpacing: -0.5, lineHeight: 29 },
  syncStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  syncStatus: { fontSize: 16, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  syncRule: { height: 1, backgroundColor: colors.accentBorder, marginVertical: 16 },
  photoBackupRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  photoBackupText: { flex: 1, fontSize: 18, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text, lineHeight: 24 },
  photoBackupNumber: { color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy },
  menuCard: { backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 18, shadowColor: colors.shadow, shadowOpacity: 0.035, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  menuRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 20 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 20, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  menuLabelDestructive: { color: colors.error },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingBottom: 6 },
  privacyShield: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentDim },
  privacyText: { flex: 1, fontSize: 16, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text2, lineHeight: 22 },
});
