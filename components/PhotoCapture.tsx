import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../constants/theme';

interface PhotoCaptureProps {
  value?: string | null;
  onChange: (uri: string | null) => void;
  label?: string;
  helperText?: string;
}

export default function PhotoCapture({
  value,
  onChange,
  label = 'Photo',
  helperText = 'Add an optional photo from your climbing session.',
}: PhotoCaptureProps) {
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  const openCamera = async () => {
    if (isOpeningCamera) return;

    try {
      setIsOpeningCamera(true);

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera permission needed',
          'Camera access is required to take a session photo. You can enable it in your device settings.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Camera unavailable', 'We could not open the camera. Please try again.');
    } finally {
      setIsOpeningCamera(false);
    }
  };

  const removePhoto = () => {
    onChange(null);
  };

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.label}>{label.toUpperCase()}</Text>
        {value ? <Text style={s.status}>ADDED</Text> : null}
      </View>

      {value ? (
        <View style={s.previewCard}>
          <Image
            source={{ uri: value }}
            style={s.preview}
            resizeMode="cover"
            accessibilityLabel="Selected climbing session photo preview"
          />
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.secondaryBtn]}
              onPress={openCamera}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
              disabled={isOpeningCamera}
            >
              <Text style={[s.actionText, s.secondaryText]}>
                {isOpeningCamera ? 'Opening…' : 'Retake'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.removeBtn]}
              onPress={removePhoto}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              disabled={isOpeningCamera}
            >
              <Text style={[s.actionText, s.removeText]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={s.addBtn}
          onPress={openCamera}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Add photo"
          accessibilityHint="Opens the native camera to take a climbing session photo"
          disabled={isOpeningCamera}
        >
          {isOpeningCamera ? (
            <ActivityIndicator color={colors.highlight} />
          ) : (
            <Text style={s.addBtnText}>＋ Add Photo</Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={s.helper}>{helperText}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.text3 },
  status: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: colors.success },
  addBtn: {
    minHeight: 48,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.highlight,
    borderRadius: 13,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: colors.highlight, letterSpacing: 0.5 },
  previewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: 190, backgroundColor: colors.card },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  actionBtn: {
    minHeight: 44,
    flex: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  secondaryBtn: { backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accentBorder },
  removeBtn: { backgroundColor: colors.errorDim, borderWidth: 1, borderColor: colors.errorBdr },
  actionText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  secondaryText: { color: colors.accent },
  removeText: { color: colors.error },
  helper: { fontSize: 12, lineHeight: 17, color: colors.text2 },
});
