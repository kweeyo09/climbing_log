import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { copyPhotoToAppSandbox } from '../lib/photos';
import { colors, radius, spacing, typography } from '../constants/theme';

const MAX_PHOTOS = 10;

interface PhotoCaptureProps {
  value?: string[];
  onChange: (uris: string[]) => void;
  label?: string;
  helperText?: string;
  maxPhotos?: number;
}

export default function PhotoCapture({
  value = [],
  onChange,
  label = 'Photos',
  helperText = 'Add optional photos from your climbing session.',
  maxPhotos = MAX_PHOTOS,
}: PhotoCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const remainingSlots = Math.max(maxPhotos - value.length, 0);
  const hasPhotos = value.length > 0;

  const persistAndAppend = async (uris: string[]) => {
    const nextUris = uris.slice(0, remainingSlots);
    if (nextUris.length === 0) {
      Alert.alert('Photo limit reached', `You can add up to ${maxPhotos} photos per session.`);
      return;
    }

    setIsProcessing(true);
    try {
      const persistedUris = await Promise.all(nextUris.map(copyPhotoToAppSandbox));
      onChange([...value, ...persistedUris]);
    } catch {
      Alert.alert('Photo unavailable', 'We could not save that photo locally. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhoto = async () => {
    if (isProcessing) return;
    if (remainingSlots <= 0) {
      Alert.alert('Photo limit reached', `You can add up to ${maxPhotos} photos per session.`);
      return;
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera permission needed',
          'Camera access is required to take a session photo. You can enable it in your device settings.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await persistAndAppend([result.assets[0].uri]);
      }
    } catch {
      Alert.alert('Camera unavailable', 'We could not open the camera. Please try again.');
    }
  };

  const chooseFromLibrary = async () => {
    if (isProcessing) return;
    if (remainingSlots <= 0) {
      Alert.alert('Photo limit reached', `You can add up to ${maxPhotos} photos per session.`);
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo library permission needed',
          'Photo library access is required to choose session photos. You can enable it in your device settings.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.85,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        await persistAndAppend(result.assets.map(asset => asset.uri).filter(Boolean));
      }
    } catch {
      Alert.alert('Library unavailable', 'We could not open your photo library. Please try again.');
    }
  };

  const openPhotoOptions = () => {
    Alert.alert(
      'Add photos',
      `Choose how you want to add photos. ${remainingSlots} ${remainingSlots === 1 ? 'slot' : 'slots'} left.`,
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: chooseFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const removePhoto = (uri: string) => {
    onChange(value.filter(existingUri => existingUri !== uri));
  };

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.label}>{label.toUpperCase()}</Text>
        {hasPhotos ? <Text style={s.status}>{value.length}/{maxPhotos} ADDED</Text> : null}
      </View>

      {hasPhotos ? (
        <View style={s.previewCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.thumbnailStrip}
            accessibilityLabel="Selected climbing session photos"
          >
            {value.map((uri, index) => (
              <View key={`${uri}-${index}`} style={s.thumbnailWrap}>
                <Image
                  source={{ uri }}
                  style={s.thumbnail}
                  resizeMode="cover"
                  accessibilityLabel={`Selected climbing session photo ${index + 1}`}
                />
                <TouchableOpacity
                  style={s.removeChip}
                  onPress={() => removePhoto(uri)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  disabled={isProcessing}
                >
                  <Ionicons name="close" size={14} color={colors.inverseText} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.secondaryBtn, remainingSlots <= 0 && s.disabledBtn]}
              onPress={openPhotoOptions}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Add more photos"
              disabled={isProcessing || remainingSlots <= 0}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <Text style={[s.actionText, s.secondaryText]}>Add More</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.emptyCard}>
          <TouchableOpacity
            style={s.addBtn}
            onPress={takePhoto}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            accessibilityHint="Opens the native camera to take a climbing session photo"
            disabled={isProcessing}
          >
            <Ionicons name="camera-outline" size={18} color={colors.highlight} />
            <Text style={s.addBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.addBtn}
            onPress={chooseFromLibrary}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Choose photos from library"
            accessibilityHint="Opens your photo library and supports selecting multiple photos"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.highlight} />
            ) : (
              <>
                <Ionicons name="images-outline" size={18} color={colors.highlight} />
                <Text style={s.addBtnText}>Choose Photos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={s.helper}>{helperText}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 10, fontFamily: typography.family.semibold, fontWeight: typography.weight.bold, letterSpacing: 1.5, color: colors.text3 },
  status: { fontSize: 9, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, letterSpacing: 1.2, color: colors.success },
  emptyCard: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addBtn: {
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.highlight,
    borderRadius: 13,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 13, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, color: colors.highlight, letterSpacing: 0.5 },
  previewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  thumbnailStrip: { gap: spacing.sm, padding: spacing.sm },
  thumbnailWrap: { width: 112, height: 112, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.card },
  thumbnail: { width: '100%', height: '100%', backgroundColor: colors.card },
  removeChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(23, 19, 33, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
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
  disabledBtn: { opacity: 0.55 },
  actionText: { fontSize: 13, fontFamily: typography.family.bold, fontWeight: typography.weight.heavy, letterSpacing: 0.5 },
  secondaryText: { color: colors.accent },
  helper: { fontSize: 12, lineHeight: 17, color: colors.text2 },
});
