import { supabase } from './supabaseClient';

const BUCKET = 'images';

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Obrázok sa nepodarilo načítať.'));
    reader.readAsDataURL(file);
  });

const extensionFor = (file: File) => {
  const fromName = file.name.split('.').pop();
  if (fromName && fromName.length > 0 && fromName.length <= 5) return fromName.toLowerCase();
  return (file.type.split('/').pop() || 'png').toLowerCase();
};

/**
 * Returns a URL for an admin-uploaded image. With Supabase it uploads to the
 * public `images` bucket (requires an authenticated admin session) and returns
 * the public URL; without Supabase it falls back to a base64 data URL, matching
 * the previous demo behaviour.
 */
export const uploadImage = async (file: File, folder = 'uploads'): Promise<string> => {
  if (!supabase) return readAsDataUrl(file);

  const unique = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${folder}/${unique}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(`Nahranie obrázka zlyhalo: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};
