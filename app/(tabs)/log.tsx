import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity,
  Pressable, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../store/sessions';
import RouteEntry from '../../components/RouteEntry';
import LocationSearch from '../../components/LocationSearch';
import PhotoCapture from '../../components/PhotoCapture';
import { CLIMB_STYLES, getGrades } from '../../constants/grades';
import { colors, spacing, radius, typography } from '../../constants/theme';
import type { GradeSystem, ClimbStyle } from '../../types';

interface DraftRoute {
  tempId:    number;
  grade:     string;
  style:     ClimbStyle;
  completed: boolean;
}

const todayISO = () => new Date().toISOString().split('T')[0];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function dateFromISO(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day, 12);
}

function isoFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReadableDate(iso: string): string {
  const parsed = dateFromISO(iso);
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
}

function calendarDays(monthDate: Date): Date[] {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12);
  const firstWeekday = firstOfMonth.getDay();
  return Array.from({ length: 42 }, (_, index) => (
    new Date(monthDate.getFullYear(), monthDate.getMonth(), index - firstWeekday + 1, 12)
  ));
}

export default function LogScreen() {
  const router      = useRouter();
  const addSession  = useSessionStore(s => s.addSession);

  const [date,        setDate]        = useState(todayISO());
  const [calendarOpen,setCalendarOpen]= useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => dateFromISO(todayISO()));
  const [location,    setLocation]    = useState('');
  const [duration,    setDuration]    = useState('');
  const [gradeSystem, setGradeSystem] = useState<GradeSystem>('french');
  const [routes,      setRoutes]      = useState<DraftRoute[]>([]);
  const [photoUris,   setPhotoUris]   = useState<string[]>([]);
  const [reflections, setReflections] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const grades = getGrades(gradeSystem);
  const selectedDate = dateFromISO(date);
  const selectedDateISO = isoFromDate(selectedDate);
  const currentMonthDays = calendarDays(calendarMonth);

  const openCalendar = () => {
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 12));
    setCalendarOpen(true);
  };

  const selectDate = (nextDate: Date) => {
    setDate(isoFromDate(nextDate));
    setCalendarOpen(false);
  };

  const switchGradeSystem = (sys: GradeSystem) => {
    setGradeSystem(sys);
    setRoutes([]); // clear routes — grades are incompatible across systems
  };

  const addRoute = () => {
    setRoutes(rs => [
      ...rs,
      { tempId: Date.now(), grade: grades[5], style: 'Lead', completed: true },
    ]);
  };

  const updateRoute = (tempId: number, field: keyof DraftRoute, value: unknown) => {
    setRoutes(rs => rs.map(r => r.tempId === tempId ? { ...r, [field]: value } : r));
  };

  const removeRoute = (tempId: number) => {
    setRoutes(rs => rs.filter(r => r.tempId !== tempId));
  };

  const handleSave = async () => {
    const trimmedLocation = location.trim();
    const trimmedDuration = duration.trim();
    const durationMinutes = parseInt(trimmedDuration, 10);

    const missingFields: string[] = [];
    if (!trimmedLocation) missingFields.push('location');
    if (!trimmedDuration || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      missingFields.push('duration');
    }

    if (missingFields.length > 0) {
      setValidationMessage(
        missingFields.length === 2
          ? 'Please enter a location and duration before saving your session.'
          : `Please enter a ${missingFields[0]} before saving your session.`,
      );
      return;
    }

    await addSession({
      date,
      location:     trimmedLocation,
      duration:     durationMinutes,
      grade_system: gradeSystem,
      reflections:  reflections.trim(),
      photo_uris:   photoUris,
      routes:       routes.map(({ grade, style, completed }) => ({
        grade, style, completed,
      })),
    });
    // Reset form
    setDate(todayISO());
    setCalendarMonth(dateFromISO(todayISO()));
    setLocation('');
    setDuration('');
    setGradeSystem('french');
    setRoutes([]);
    setPhotoUris([]);
    setReflections('');

    router.push('/(tabs)/history');
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Text style={s.headerTitle}>✏️ LOG SESSION</Text>
          <Text style={s.headerSub}>Record your climb 🧗</Text>
        </View>
        <View style={s.accentLine} />

        <View style={s.form}>

          {/* Date */}
          <View style={s.field}>
            <Text style={s.label}>📆 DATE</Text>
            <TouchableOpacity
              style={s.dateButton}
              onPress={openCalendar}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={`Choose session date. Current date is ${formatReadableDate(date)}`}
            >
              <View>
                <Text style={s.dateButtonText}>{formatReadableDate(date)}</Text>
                <Text style={s.dateButtonMeta}>{date}</Text>
              </View>
              <Text style={s.dateButtonAction}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={s.field}>
            <Text style={s.label}>
              📍 LOCATION / GYM
              <Text style={s.placesBadge}>  PLACES</Text>
            </Text>
            <LocationSearch value={location} onChange={setLocation} />
          </View>

          {/* Duration */}
          <View style={s.field}>
            <Text style={s.label}>⏱️ DURATION (MINUTES)</Text>
            <TextInput
              style={s.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 90"
              placeholderTextColor={colors.text3}
              keyboardType="number-pad"
              keyboardAppearance="dark"
            />
          </View>

          {/* Grade system toggle */}
          <View style={s.field}>
            <Text style={s.label}>🎯 GRADE SYSTEM</Text>
            <View style={s.toggle}>
              {(['french', 'v'] as GradeSystem[]).map(sys => (
                <Pressable
                  key={sys}
                  style={[s.toggleBtn, gradeSystem === sys && s.toggleBtnOn]}
                  onPress={() => switchGradeSystem(sys)}
                >
                  <Text style={[s.toggleBtnText, gradeSystem === sys && s.toggleBtnTextOn]}>
                    {sys === 'french' ? '🇫🇷 French 6a…' : '🇺🇸 V-Scale V3…'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Routes */}
          <View style={s.field}>
            <Text style={s.label}>🪨 ROUTES ({routes.length})</Text>
            {routes.map(route => (
              <RouteEntry
                key={route.tempId}
                grade={route.grade}
                style={route.style}
                completed={route.completed}
                grades={grades}
                styles={[...CLIMB_STYLES]}
                onGradeChange={v  => updateRoute(route.tempId, 'grade',     v)}
                onStyleChange={v  => updateRoute(route.tempId, 'style',     v as ClimbStyle)}
                onToggle={()      => updateRoute(route.tempId, 'completed', !route.completed)}
                onRemove={()      => removeRoute(route.tempId)}
              />
            ))}
            <TouchableOpacity style={s.addRouteBtn} onPress={addRoute} activeOpacity={0.7}>
              <Text style={s.addRouteBtnText}>＋ Add Route</Text>
            </TouchableOpacity>
          </View>

          {/* Photo */}
          <View style={s.field}>
            <PhotoCapture
              value={photoUris}
              onChange={setPhotoUris}
              label="📷 Photos"
              helperText="Optional. Take a photo or choose multiple images to remember the session."
            />
          </View>

          {/* Reflections */}
          <View style={s.field}>
            <Text style={s.label}>💭 REFLECTIONS</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={reflections}
              onChangeText={setReflections}
              placeholder={'How did it feel? What clicked?\nWhat to work on next time?'}
              placeholderTextColor={colors.text3}
              multiline
              numberOfLines={4}
              keyboardAppearance="dark"
            />
          </View>

          <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>💾 SAVE SESSION</Text>
          </TouchableOpacity>

          <View style={{ height: 16 }} />

        </View>
      </ScrollView>

      <Modal
        visible={calendarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.calendarCard}>
            <View style={s.calendarHeader}>
              <TouchableOpacity
                style={s.calendarNavButton}
                onPress={() => setCalendarMonth(current => shiftMonth(current, -1))}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <Text style={s.calendarNavText}>‹</Text>
              </TouchableOpacity>
              <View style={s.calendarTitleWrap}>
                <Text style={s.calendarTitle}>
                  {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </Text>
                <Text style={s.calendarSubtitle}>Pick your session date</Text>
              </View>
              <TouchableOpacity
                style={s.calendarNavButton}
                onPress={() => setCalendarMonth(current => shiftMonth(current, 1))}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <Text style={s.calendarNavText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={s.weekdayRow}>
              {WEEKDAYS.map((day, index) => (
                <Text key={`${day}-${index}`} style={s.weekdayText}>{day}</Text>
              ))}
            </View>

            <View style={s.calendarGrid}>
              {currentMonthDays.map(day => {
                const dayISO = isoFromDate(day);
                const isSelected = dayISO === selectedDateISO;
                const isToday = dayISO === todayISO();
                const isOutsideMonth = day.getMonth() !== calendarMonth.getMonth();
                return (
                  <TouchableOpacity
                    key={dayISO}
                    style={[
                      s.dayButton,
                      isToday && s.dayButtonToday,
                      isSelected && s.dayButtonSelected,
                    ]}
                    onPress={() => selectDate(day)}
                    activeOpacity={0.78}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${formatReadableDate(dayISO)}`}
                  >
                    <Text
                      style={[
                        s.dayButtonText,
                        isOutsideMonth && s.dayButtonTextMuted,
                        isToday && s.dayButtonTextToday,
                        isSelected && s.dayButtonTextSelected,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={s.calendarFooter}>
              <TouchableOpacity
                style={s.calendarSecondaryButton}
                onPress={() => selectDate(new Date())}
                activeOpacity={0.8}
              >
                <Text style={s.calendarSecondaryText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.calendarPrimaryButton}
                onPress={() => setCalendarOpen(false)}
                activeOpacity={0.85}
              >
                <Text style={s.calendarPrimaryText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={validationMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setValidationMessage(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard} accessibilityRole="alert">
            <Text style={s.modalTitle}>Missing information</Text>
            <Text style={s.modalText}>{validationMessage}</Text>
            <TouchableOpacity
              style={s.modalButton}
              onPress={() => setValidationMessage(null)}
              activeOpacity={0.85}
            >
              <Text style={s.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: colors.bg },
  scroll:          { paddingBottom: 40 },
  header:          { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 12 },
  headerTitle:     { fontSize: 28, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, letterSpacing: 0.5 },
  headerSub:       { fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1.5, color: colors.text3, textTransform: 'uppercase', marginTop: 2 },
  accentLine:      { height: 2, marginHorizontal: spacing.lg, marginBottom: 14, backgroundColor: colors.accent, borderRadius: 1, opacity: 0.6 },
  form:            { paddingHorizontal: spacing.lg },
  field:           { marginBottom: spacing.lg },
  label:           { fontSize: 10, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1.5, color: colors.text3, marginBottom: 7 },
  placesBadge:     { fontSize: 9, color: colors.accent, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold },
  input:           { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontSize: 14, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  dateButton:      { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateButtonText:  { color: colors.text, fontSize: 15, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold },
  dateButtonMeta:  { color: colors.text3, fontSize: 11, fontFamily: typography.family.regular, fontWeight: typography.weight.regular, marginTop: 2 },
  dateButtonAction:{ color: colors.accent, fontSize: 12, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, textTransform: 'uppercase', letterSpacing: 0.8 },
  textarea:        { height: 88, textAlignVertical: 'top' },
  toggle:          { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 4, gap: 4 },
  toggleBtn:       { flex: 1, paddingVertical: 9, borderRadius: radius.sm, alignItems: 'center' },
  toggleBtnOn:     { backgroundColor: colors.accent },
  toggleBtnText:   { fontSize: 12, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, color: colors.text2, textTransform: 'uppercase', letterSpacing: 0.5 },
  toggleBtnTextOn: { color: colors.inverseText },
  // Gold dashed add-route button matching preview
  addRouteBtn:     { backgroundColor: 'transparent', borderWidth: 2, borderStyle: 'dashed', borderColor: colors.highlight, borderRadius: 13, padding: 12, alignItems: 'center' },
  addRouteBtnText: { fontSize: 13, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.highlight, letterSpacing: 0.5 },
  saveBtn:         { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 17, alignItems: 'center', marginTop: 4 },
  saveBtnText:     { fontSize: 16, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.inverseText, letterSpacing: 1.5 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(23, 19, 33, 0.42)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard:       { width: '100%', maxWidth: 340, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  modalTitle:      { fontSize: 18, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text, marginBottom: spacing.sm },
  modalText:       { fontSize: 14, lineHeight: 20, color: colors.text2, marginBottom: spacing.lg, fontFamily: typography.family.regular, fontWeight: typography.weight.regular },
  modalButton:     { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  modalButtonText: { fontSize: 14, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.inverseText, letterSpacing: 1 },
  calendarCard:    { width: '100%', maxWidth: 372, backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  calendarHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  calendarTitleWrap:{ alignItems: 'center', flex: 1 },
  calendarTitle:   { fontSize: 20, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text },
  calendarSubtitle:{ marginTop: 2, fontSize: 11, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text3, textTransform: 'uppercase', letterSpacing: 1.1 },
  calendarNavButton:{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  calendarNavText: { fontSize: 30, lineHeight: 32, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.accent },
  weekdayRow:      { flexDirection: 'row', marginBottom: spacing.sm },
  weekdayText:     { flex: 1, textAlign: 'center', fontSize: 11, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.text3, letterSpacing: 0.7 },
  calendarGrid:    { flexDirection: 'row', flexWrap: 'wrap' },
  dayButton:       { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  dayButtonToday:  { backgroundColor: colors.accentDim },
  dayButtonSelected:{ backgroundColor: colors.accent },
  dayButtonText:   { fontSize: 14, fontFamily: typography.family.semibold, fontWeight: typography.weight.semibold, color: colors.text },
  dayButtonTextMuted:{ color: colors.text3, opacity: 0.45 },
  dayButtonTextToday:{ color: colors.accent },
  dayButtonTextSelected:{ color: colors.inverseText },
  calendarFooter:  { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  calendarSecondaryButton:{ flex: 1, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: 'center' },
  calendarSecondaryText:{ fontSize: 13, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.accent, letterSpacing: 0.7, textTransform: 'uppercase' },
  calendarPrimaryButton:{ flex: 1, borderRadius: radius.md, backgroundColor: colors.accent, paddingVertical: 12, alignItems: 'center' },
  calendarPrimaryText:{ fontSize: 13, fontFamily: typography.family.bold, fontWeight: typography.weight.bold, color: colors.inverseText, letterSpacing: 0.7, textTransform: 'uppercase' },
});
