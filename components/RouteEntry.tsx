import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, radius, spacing } from '../constants/theme';
import type { ClimbStyle } from '../types';

// Note: install @react-native-picker/picker:
//   npx expo install @react-native-picker/picker

interface Props {
  grade:         string;
  style:         ClimbStyle;
  completed:     boolean;
  grades:        string[];
  styles:        string[];
  onGradeChange: (grade: string) => void;
  onStyleChange: (style: string) => void;
  onToggle:      () => void;
  onRemove:      () => void;
}

export default function RouteEntry({
  grade, style, completed, grades, styles,
  onGradeChange, onStyleChange, onToggle, onRemove,
}: Props) {
  return (
    <View style={s.row}>
      {/* Grade picker */}
      <View style={[s.pickerWrap, s.gradeWrap]}>
        <Picker
          selectedValue={grade}
          onValueChange={onGradeChange}
          style={s.picker}
          dropdownIconColor={colors.text2}
          itemStyle={{ color: colors.text, fontSize: 13 }}
        >
          {grades.map(g => (
            <Picker.Item key={g} label={g} value={g} color={colors.text} />
          ))}
        </Picker>
      </View>

      {/* Style picker */}
      <View style={[s.pickerWrap, s.styleWrap]}>
        <Picker
          selectedValue={style}
          onValueChange={onStyleChange}
          style={s.picker}
          dropdownIconColor={colors.text2}
          itemStyle={{ color: colors.text, fontSize: 13 }}
        >
          {styles.map(st => (
            <Picker.Item key={st} label={st} value={st} color={colors.text} />
          ))}
        </Picker>
      </View>

      {/* Completed toggle */}
      <TouchableOpacity
        style={[s.toggle, completed && s.toggleDone]}
        onPress={onToggle}
        activeOpacity={0.75}
      >
        <Text style={[s.toggleText, completed && s.toggleTextDone]}>
          {completed ? '✓' : '○'}
        </Text>
      </TouchableOpacity>

      {/* Remove button */}
      <TouchableOpacity style={s.remove} onPress={onRemove} activeOpacity={0.7}>
        <Text style={s.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row:            { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, marginBottom: 7, gap: 7 },
  pickerWrap:     { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, overflow: 'hidden', height: 40, justifyContent: 'center' },
  gradeWrap:      { width: 90 },
  styleWrap:      { flex: 1 },
  picker:         { color: colors.text, height: 40 },
  toggle:         { width: 36, height: 36, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  toggleDone:     { backgroundColor: colors.successDim, borderColor: colors.successBdr },
  toggleText:     { fontSize: 14, color: colors.text3 },
  toggleTextDone: { color: colors.success, fontWeight: '700' },
  remove:         { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  removeText:     { fontSize: 18, color: colors.text3, lineHeight: 20 },
});
