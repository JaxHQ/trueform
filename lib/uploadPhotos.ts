import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

const getMimeType = (uri: string): string => {
  if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
  if (uri.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
};

export const uploadPhotosToStorage = async (
  photoUris: string[],
  userId: string
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (let i = 0; i < photoUris.length; i++) {
    const uri = photoUris[i];
    const fileName = `${userId}_${Date.now()}_${i}.jpg`;
    const fileType = getMimeType(uri);

    try {
      const fileBuffer = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const byteCharacters = atob(fileBuffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType });

      const { error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(`user_uploads/${userId}/${fileName}`, blob, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload failed for ${fileName}:`, uploadError.message);
        continue;
      }

      const { data } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(`user_uploads/${userId}/${fileName}`);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }

  return uploadedUrls;
};