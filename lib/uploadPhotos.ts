import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

const getMimeType = (uri: string): string => {
  const lowered = uri.toLowerCase();
  if (lowered.endsWith('.jpg') || lowered.endsWith('.jpeg')) return 'image/jpeg';
  if (lowered.endsWith('.png')) return 'image/png';
  if (lowered.endsWith('.webp')) return 'image/webp';
  if (lowered.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
};

export const uploadPhotosToStorage = async (
  photoUris: string[],
  userId: string
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (let i = 0; i < photoUris.length; i++) {
    const uri = photoUris[i];
    const mime = getMimeType(uri);
    const ext = mime.split('/')[1];
    const fileName = `${userId}_${Date.now()}_${i}.${ext}`;
    const path = `user_uploads/${userId}/${fileName}`;

    try {
      // Read binary data
      const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to Uint8Array
      const binary = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

      const { error } = await supabase.storage
        .from('meal-photos')
        .upload(path, binary, {
          contentType: mime,
          upsert: false,
        });

      if (error) {
        console.error('Upload failed:', error.message);
        continue;
      }

      const { data } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(path);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      } else {
        console.warn('No public URL returned for:', path);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  }

  return uploadedUrls;
};