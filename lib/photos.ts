import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const PHOTO_DIR = `${FileSystem.documentDirectory ?? ''}session-photos`;
const DEFAULT_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET || 'session-photos';

const uriExtension = (uri: string): string => {
  const cleanUri = uri.split('?')[0] ?? uri;
  const ext = cleanUri.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'jpg';
};

const ensurePhotoDir = async () => {
  if (!FileSystem.documentDirectory) return;
  const info = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
};

export const copyPhotoToAppSandbox = async (uri: string): Promise<string> => {
  if (!FileSystem.documentDirectory || uri.startsWith(FileSystem.documentDirectory)) {
    return uri;
  }

  await ensurePhotoDir();
  const ext = uriExtension(uri);
  const destination = `${PHOTO_DIR}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
};

export const compressPhoto = async (uri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return result.uri;
};

export interface UploadedPhotoResult {
  local_uri: string;
  remote_url: string;
  storage_path: string;
  uploaded_at: string;
}

export const uploadPhotoToSupabase = async (
  uri: string,
  sessionId: string,
  userId: string,
): Promise<UploadedPhotoResult | null> => {
  if (!supabase) return null;

  const compressedUri = await compressPhoto(uri);
  const base64 = await FileSystem.readAsStringAsync(compressedUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const uploadedAt = new Date().toISOString();
  const storagePath = `${userId}/${sessionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage
    .from(DEFAULT_BUCKET)
    .upload(storagePath, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(storagePath);

  return {
    local_uri: uri,
    remote_url: data.publicUrl,
    storage_path: storagePath,
    uploaded_at: uploadedAt,
  };
};

export const deleteLocalPhoto = async (uri: string): Promise<void> => {
  try {
    if (!uri.startsWith(FileSystem.documentDirectory ?? '')) return;
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Best-effort cleanup only; never block session deletion on file cleanup.
  }
};
