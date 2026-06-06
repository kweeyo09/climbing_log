import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, typography, spacing } from '../constants/theme';

export default function AccountDetailsScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [authProvider, setAuthProvider] = useState('email');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const dn = user.user_metadata?.display_name ?? '';
        setDisplayName(dn);
        setNameInput(dn);
        setUserEmail(user.email ?? '');
        setAuthProvider(user.app_metadata?.provider ?? 'email');
      }
    });
  }, []);

  const name = displayName || (userEmail ? userEmail.split('@')[0] : 'Climber');
  const avatarLetter = (displayName || userEmail || 'C')[0].toUpperCase();

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    await supabase?.auth.updateUser({ data: { display_name: nameInput.trim() } });
    setDisplayName(nameInput.trim());
    setSaving(false);
    setEditingName(false);
  };

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
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>{avatarLetter}</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <TouchableOpacity style={s.fieldRow} onPress={() => { setNameInput(displayName); setEditingName(true); }} activeOpacity={0.8}>
            <Ionicons name="person-outline" size={20} color={colors.accentDark} />
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Display name</Text>
              <Text style={s.fieldValue}>{name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text3} />
          </TouchableOpacity>
          <View style={s.divider} />
          <View style={s.fieldRow}>
            <Ionicons name="mail-outline" size={20} color={colors.accentDark} />
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Email</Text>
              <Text style={s.fieldValue}>{userEmail || '—'}</Text>
            </View>
            <Ionicons name="lock-closed-outline" size={16} color={colors.text3} />
          </View>
        </View>

        <View style={s.card}>
          <View style={s.fieldRow}>
            <Ionicons name={authProvider === 'apple' ? 'logo-apple' : 'mail-outline'} size={20} color={colors.accentDark} />
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Signed in with</Text>
              <Text style={s.fieldValue}>{authProvider === 'apple' ? 'Apple' : 'Email'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Display name</Text>
            <TextInput
              style={s.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={colors.text3}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setEditingName(false)} activeOpacity={0.8}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalSave, saving && s.modalSaveDisabled]} onPress={handleSaveName} activeOpacity={0.85} disabled={saving}>
                <Text style={s.modalSaveText}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarWrap:      { width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  avatar:          { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:    { fontSize: 42, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: '#EDE9FE', lineHeight: 48 },

  card:            { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  fieldRow:        { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18 },
  fieldBody:       { flex: 1 },
  fieldLabel:      { fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text3, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  fieldValue:      { fontSize: 17, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  divider:         { height: 1, backgroundColor: colors.border, marginLeft: 52 },

  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard:       { width: '100%', maxWidth: 340, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 20 },
  modalTitle:      { fontSize: 20, fontFamily: typography.family.labelBold, fontWeight: typography.weight.semibold, color: colors.text, marginBottom: 14 },
  modalInput:      { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, padding: 13, fontSize: 15, color: colors.text, marginBottom: 16 },
  modalActions:    { flexDirection: 'row', gap: 10 },
  modalCancel:     { flex: 1, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text2 },
  modalSave:       { flex: 1, padding: 13, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center' },
  modalSaveDisabled: { opacity: 0.5 },
  modalSaveText:   { fontSize: 15, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: '#fff' },
});
