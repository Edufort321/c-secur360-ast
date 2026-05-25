import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'equipment-photos';

export async function uploadPhoto(
  file: File,
  tenant: string,
  supabase: SupabaseClient,
): Promise<string> {
  const blob = await compressToBlob(file);
  const path = `${tenant}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function compressToBlob(file: File): Promise<Blob> {
  const dataUrl = await tryCanvas(file);
  if (dataUrl) return await fetch(dataUrl).then(r => r.blob());
  return file; // original, Supabase Storage can handle up to 10 MB
}

async function tryCanvas(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      for (const [maxDim, quality] of [[640, 0.72], [400, 0.60]] as [number, number][]) {
        try {
          let w = img.width || maxDim, h = img.height || maxDim;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
            else       { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          ctx.drawImage(img, 0, 0, w, h);
          const result = canvas.toDataURL('image/jpeg', quality);
          if (!result || result === 'data:,' || result.length < 100) continue;
          URL.revokeObjectURL(url);
          resolve(result);
          return;
        } catch { continue; }
      }
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}
