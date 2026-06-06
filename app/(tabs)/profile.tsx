import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessionStore } from '../../store/sessions';
import { supabase } from '../../lib/supabase';
import { colors, typography } from '../../constants/theme';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
};

export default function ProfileScreen() {
  const router = useRouter();
  const sessions = useSessionStore(s => s.sessions);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setIsSignedIn(!!data.session);
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('ascenta_onboarding_done');
    router.replace('/onboarding');
  };
  const syncedSessions = sessions.filter(session => session.synced).length;
  const photoCount = sessions.reduce((acc, session) => acc + (session.photo_uris?.length ?? 0), 0);
  const backedUpPhotoCount = sessions.reduce((acc, session) => acc + (session.synced ? (session.photo_uris?.length ?? 0) : 0), 0);
  const allBackedUp = sessions.length > 0 && syncedSessions === sessions.length;

  const menuItems: MenuItem[] = [
    { label: 'Account details', icon: 'person-circle-outline', onPress: () => router.push('/account-details') },
    { label: 'Privacy policy', icon: 'shield-checkmark-outline', onPress: () => router.push('/privacy-policy') },
    { label: 'Delete account', icon: 'trash-outline', destructive: true, onPress: () => router.push('/delete-account') },
    { label: 'Support', icon: 'headset-outline', onPress: () => router.push('/support') },
    { label: 'Log out', icon: 'log-out-outline', destructive: true, onPress: handleLogout },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Text style={s.screenTitle}>Profile</Text>
          <Image source={require('../../assets/logo_default.png')} style={s.brandMark} accessibilityLabel="Ascenta logo" resizeMode="contain" />
        </View>

        <TouchableOpacity style={s.profileCard} activeOpacity={0.86} onPress={() => router.push('/account-details')} accessibilityRole="button" accessibilityLabel="Open account profile details">
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>A</Text>
            </View>
          </View>
          <View style={s.profileCopy}>
            <Text style={s.name}>Angel</Text>
            <Text style={s.handle}>@angelclimbs</Text>
            {isSignedIn && (
              <View style={s.applePill}>
                <Ionicons name="logo-apple" size={16} color={colors.accentDark} />
                <Text style={s.appleText}>Signed in with Apple</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text2} />
        </TouchableOpacity>

        <View style={s.syncCard}>
          <View style={s.cloudPanel}>
            <View style={s.cloudOrbit} />
            <View style={s.cloudShape}>
              <Ionicons name="cloud" size={78} color={colors.accent} />
              <View style={s.checkBadge}>
                <Ionicons name="checkmark" size={22} color={colors.accent} />
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
              <Ionicons name="image-outline" size={26} color={colors.accentDark} />
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
              <Ionicons name={item.icon} size={27} color={item.destructive ? colors.error : colors.accentDark} />
              <Text style={[s.menuLabel, item.destructive && s.menuLabelDestructive]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text2} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.privacyNote}>
          <View style={s.privacyShield}>
            <Ionicons name="shield" size={28} color={colors.accentDark} />
          </View>
          <Text style={s.privacyText}>Your gym notes and photos stay private unless you choose to share.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 112 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  screenTitle: { fontSize: 52, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.text, letterSpacing: -1.8, lineHeight: 54 },
  brandMark: { width: 56, height: 56, backgroundColor: colors.bg },
  profileCard: { minHeight: 136, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 16, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.04, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  avatarWrap: { width: 86, height: 86, borderRadius: 43, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarLetter: { fontSize: 38, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold, color: '#EDE9FE', lineHeight: 42 },
  profileCopy: { flex: 1 },
  name: { fontSize: 34, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.text, letterSpacing: -0.8, lineHeight: 34 },
  handle: { fontSize: 18, fontFamily: typography.family.label, fontWeight: typography.weight.medium, color: colors.accentDark, marginTop: 3, marginBottom: 10 },
  applePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  appleText: { fontSize: 13, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium, color: colors.text },
  syncCard: { minHeight: 168, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentDim, borderRadius: 22, borderWidth: 1, borderColor: colors.accentBorder, padding: 16, marginBottom: 14, overflow: 'hidden' },
  cloudPanel: { width: 108, height: 108, alignItems: 'center', justifyContent: 'center' },
  cloudOrbit: { position: 'absolute', width: 104, height: 104, borderRadius: 52, borderWidth: 1.2, borderColor: colors.accentBorder, borderStyle: 'dashed' },
  cloudShape: { width: 96, height: 82, alignItems: 'center', justifyContent: 'center' },
  checkBadge: { position: 'absolute', bottom: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accentBorder, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  syncDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.accentBorder, marginHorizontal: 15 },
  syncCopy: { flex: 1 },
  syncTitle: { fontSize: 24, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.accentDark, letterSpacing: -0.4, lineHeight: 26 },
  syncStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  syncStatus: { fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium, color: colors.text },
  syncRule: { height: 1, backgroundColor: colors.accentBorder, marginVertical: 13 },
  photoBackupRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  photoBackupText: { flex: 1, fontSize: 16, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium, color: colors.text, lineHeight: 22 },
  photoBackupNumber: { color: colors.accentDark, fontFamily: typography.family.bold, fontWeight: typography.weight.semibold },
  menuCard: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 16, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  menuRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 20, fontFamily: typography.family.label, fontWeight: typography.weight.medium, color: colors.text },
  menuLabelDestructive: { color: colors.error },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 6 },
  privacyShield: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentDim },
  privacyText: { flex: 1, fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.medium, color: colors.text2, lineHeight: 20 },
});
