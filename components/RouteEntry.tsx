import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import type { ClimbStyle } from '../types';

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

const STYLE_EMOJI: Record<string, string> = {
  'Lead':       '🧗 Lead',
  'Top Rope':   '🔄 Top Rope',
  'Boulder':    '🤸 Boulder',
  'Auto-belay': '🤖 Auto-belay',
};

interface PickerModalProps {
  visible: boolean;
  items: string[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
  label: (val: string) => string;
}

function PickerModal({ visible, items, selected, onSelect, onClose, label }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={m.sheet}>
        <View style={m.handle} />
        <FlatList
          data={items}
          keyExtractor={i => i}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[m.option, item === selected && m.optionSelected]}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={[m.optionText, item === selected && m.optionTextSelected]}>
                {label(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

export default function RouteEntry({
  grade, style, completed, grades, styles,
  onGradeChange, onStyleChange, onToggle, onRemove,
}: Props) {
  const [gradeOpen, setGradeOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  return (
    <View style={s.row}>
      {/* Grade selector */}
      <TouchableOpacity style={[s.pickerWrap, s.gradeWrap]} onPress={() => setGradeOpen(true)} activeOpacity={0.8}>
        <Text style={s.pickerText}>{grade}</Text>
        <Text style={s.caret}>▾</Text>
      </TouchableOpacity>

      {/* Style selector */}
      <TouchableOpacity style={[s.pickerWrap, s.styleWrap]} onPress={() => setStyleOpen(true)} activeOpacity={0.8}>
        <Text style={s.pickerText}>{STYLE_EMOJI[style] ?? style}</Text>
        <Text style={s.caret}>▾</Text>
      </TouchableOpacity>

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

      <PickerModal
        visible={gradeOpen}
        items={grades}
        selected={grade}
        onSelect={onGradeChange}
        onClose={() => setGradeOpen(false)}
        label={v => v}
      />
      <PickerModal
        visible={styleOpen}
        items={styles}
        selected={style}
        onSelect={onStyleChange}
        onClose={() => setStyleOpen(false)}
        label={v => STYLE_EMOJI[v] ?? v}
      />
    </View>
  );
}

const s = StyleSheet.create({
  row:            { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.xs, marginBottom: 7, gap: 5 },
  pickerWrap:     { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, height: 38, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, justifyContent: 'space-between' },
  gradeWrap:      { width: 72 },
  styleWrap:      { flex: 1 },
  pickerText:     { color: colors.text, fontSize: 13, fontFamily: typography.family.regular, fontWeight: typography.weight.medium },
  caret:          { color: colors.text3, fontSize: 10, marginLeft: 2 },
  toggle:         { width: 34, height: 34, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  toggleDone:     { backgroundColor: colors.accentDim, borderColor: colors.accentBorder },
  toggleText:     { fontSize: 14, color: colors.text3 },
  toggleTextDone: { color: colors.accent, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold },
  remove:         { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  removeText:     { fontSize: 18, color: colors.text3, lineHeight: 20 },
});

const m = StyleSheet.create({
  overlay:             { flex: 1, backgroundColor: 'rgba(23, 19, 33, 0.42)' },
  sheet:               { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', paddingBottom: 20 },
  handle:              { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  option:              { paddingVertical: 14, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionSelected:      { backgroundColor: colors.accentDim },
  optionText:          { color: colors.text, fontSize: 16 },
  optionTextSelected:  { color: colors.accent, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold },
});
