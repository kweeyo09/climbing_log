/**
 * Onboarding screen — 4 steps matching the preview HTML exactly.
 * Steps: Welcome → Log Sessions → Watch Improve → Sync Progress (sign-in)
 * Shown only on first launch; dismissed via AsyncStorage flag.
 */
import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { colors, spacing, radius, typography } from '../constants/theme';

const ONBOARDING_KEY = 'ascenta_onboarding_done';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {}
}

const STEPS = [
  {
    icon:  '\uD83E\uDDD7',
    title: 'Welcome to',
    titleHighlight: 'ASCENTA',
    desc:  'Your personal climbing journal. Track every session, every send, every project — all in one place.',
    type:  'info',
  },
  {
    icon:  '\uD83D\uDCC5',
    title: 'Log your',
    titleHighlight: 'sessions',
    desc:  'Tap the gold + button anytime to quickly record where you climbed, how long, and every route you attempted.',
    type:  'info',
  },
  {
    icon:  '\uD83D\uDCC8',
    title: 'Watch yourself',
    titleHighlight: 'improve',
    desc:  'Your Stats screen tracks your grade progression over time, personal bests, and send rate. The wall is waiting.',
    type:  'info',
  },
  {
    icon:  '\u2601\uFE0F',
    title: 'Sync your',
    titleHighlight: 'progress',
    desc:  'Create a free account to back up your sessions and access them on any device.',
    type:  'signin',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step,  setStep]  = useState(0);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const current = STEPS[step];
  const isSignIn = current.type === 'signin';
  const isLast   = step === STEPS.length - 1;

  const finish = async () => {
    await markOnboardingDone();
    router.replace('/(tabs)');
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      await finish();
    }
  };

  const handleSignInWithEmail = async () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) { setEmailError('Please enter your email'); return; }
    if (!emailRe.test(email.trim())) { setEmailError('Invalid email — try again'); return; }
    if (!supabase) { await finish(); return; }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (error) { setEmailError(error.message); return; }
    setEmailSent(true);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length < 6) { setOtpError('Enter the 6-character code from your email'); return; }
    if (!supabase) { await finish(); return; }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    });
    setLoading(false);

    if (error) { setOtpError(error.message); return; }
    await finish();
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress dots */}
        <View style={s.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[s.dot, i <= step && s.dotDone]} />
          ))}
        </View>

        {/* Body */}
        <ScrollView
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.icon}>{current.icon}</Text>
          <Text style={s.title}>
            {current.title}{' '}
            <Text style={s.titleHi}>{current.titleHighlight}</Text>
          </Text>
          <Text style={s.desc}>{current.desc}</Text>

          {isSignIn && !emailSent && (
            <View style={s.authBlock}>
              <TouchableOpacity style={[s.authBtn, s.authApple]} onPress={finish} activeOpacity={0.85}>
                <Text style={s.authAppleText}>Continue with Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.authBtn, s.authGoogle]} onPress={finish} activeOpacity={0.85}>
                <Text style={s.authGoogleText}>Continue with Google</Text>
              </TouchableOpacity>
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or</Text>
                <View style={s.dividerLine} />
              </View>
              <TextInput
                style={[s.emailInput, emailError ? s.emailInputError : null]}
                value={email}
                onChangeText={v => { setEmail(v); setEmailError(''); }}
                placeholder="Enter your email address"
                placeholderTextColor={colors.text3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {emailError ? <Text style={s.emailError}>{emailError}</Text> : null}
              <TouchableOpacity style={[s.authBtn, s.authEmail, loading && s.authBtnDisabled]} onPress={handleSignInWithEmail} activeOpacity={0.85} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.inverseText} /> : <Text style={s.authEmailText}>Continue with Email</Text>}
              </TouchableOpacity>
            </View>
          )}

          {isSignIn && emailSent && (
            <View style={s.authBlock}>
              <Text style={s.otpHint}>We sent a code to <Text style={s.otpEmail}>{email}</Text></Text>
              <TextInput
                style={[s.emailInput, otpError ? s.emailInputError : null]}
                value={otp}
                onChangeText={v => { setOtp(v.trim().slice(0, 6)); setOtpError(''); }}
                placeholder="Enter code"
                placeholderTextColor={colors.text3}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="one-time-code"
                maxLength={6}
                editable={!loading}
              />
              {otpError ? <Text style={s.emailError}>{otpError}</Text> : null}
              <TouchableOpacity style={[s.authBtn, s.authEmail, loading && s.authBtnDisabled]} onPress={handleVerifyOtp} activeOpacity={0.85} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.inverseText} /> : <Text style={s.authEmailText}>Verify Code</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.skipBtn} onPress={() => { setEmailSent(false); setOtp(''); setOtpError(''); }} activeOpacity={0.7}>
                <Text style={s.skipText}>Use a different email</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          {!isSignIn && (
            <TouchableOpacity style={s.mainBtn} onPress={handleNext} activeOpacity={0.88}>
              <Text style={s.mainBtnText}>{step === 0 ? 'Get Started' : 'Next'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.skipBtn} onPress={finish} activeOpacity={0.7}>
            <Text style={s.skipText}>
              {isSignIn ? 'Skip for now — use offline' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.bg },

  // Progress dots
  dots:           { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  dot:            { flex: 1, maxWidth: 80, height: 3, borderRadius: 2, backgroundColor: colors.border },
  dotDone:        { backgroundColor: colors.highlight },

  // Body
  body:           { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24, textAlign: 'center' },
  icon:           { fontSize: 64, marginBottom: 20, textAlign: 'center' },
  title:          { fontSize: 26, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: 0.5, marginBottom: 10, lineHeight: 32, textAlign: 'center' },
  titleHi:        { color: colors.highlight },
  desc:           { fontSize: 15, color: colors.text2, lineHeight: 24, maxWidth: 280, textAlign: 'center' },

  // Auth block (sign-in step)
  authBlock:      { width: '100%', marginTop: 20, gap: 10 },
  authBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, borderRadius: 14 },
  authApple:      { backgroundColor: colors.text },
  authAppleText:  { color: colors.inverseText, fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 0.3 },
  authGoogle:     { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  authGoogleText: { color: colors.text, fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 0.3 },
  authEmail:      { backgroundColor: colors.highlight },
  authEmailText:  { color: colors.inverseText, fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 0.3 },
  divider:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText:    { fontSize: 12, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text3 },
  emailInput:     { width: '100%', backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, padding: 13, fontSize: 14, color: colors.text },
  emailInputError:{ borderColor: colors.error },
  emailError:     { fontSize: 12, color: colors.error, alignSelf: 'flex-start', marginTop: -4 },
  authBtnDisabled:{ opacity: 0.6 },
  otpHint:        { fontSize: 14, color: colors.text2, textAlign: 'center', lineHeight: 20 },
  otpEmail:       { color: colors.highlight, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold },

  // Footer
  footer:         { paddingHorizontal: spacing.lg, paddingBottom: 32 },
  mainBtn:        { backgroundColor: colors.highlight, borderRadius: radius.lg, padding: 18, alignItems: 'center', marginBottom: 0 },
  mainBtnText:    { fontSize: 16, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.inverseText, letterSpacing: 1 },
  skipBtn:        { padding: 12, alignItems: 'center' },
  skipText:       { fontSize: 13, color: colors.text3, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold },
});
