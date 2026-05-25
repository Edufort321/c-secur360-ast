import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET  = 'equipment-photos';
const MAX_B64 = 2_000_000;

// ─── Upload vers Supabase Storage (fallback base64 si bucket absent) ──────────

export async function uploadPhoto(
  file: File,
  tenant: string,
  supabase: SupabaseClient,
): Promise<string> {
  const blob = await compressToBlob(file);
  // compressToBlob retourne toujours un JPEG (ou original si tout a échoué)
  const compressed = blob !== file;
  const mime = compressed ? 'image/jpeg' : (file.type || 'image/jpeg');
  const ext  = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';

  try {
    const path = `${tenant}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: mime, upsert: false });

    if (!error) {
      return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
  } catch { /* réseau → fallback */ }

  if (!compressed) throw new Error('PHOTO_NO_STORAGE');
  return blobToDataUrl(blob);
}

// ─── Compression vers JPEG Blob ───────────────────────────────────────────────

export async function compressToBlob(file: File): Promise<Blob> {
  // HEIC/HEIF : canvas ne peut pas décoder → convertir en JPEG d'abord
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
    || /\.(heic|heif)$/i.test(file.name);

  if (isHeic) {
    try {
      const { default: heic2any } = await import('heic2any');
      const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.82 });
      const jpeg = Array.isArray(result) ? result[0] : result;
      // Compresser davantage via canvas
      const asFile = new File([jpeg], 'photo.jpg', { type: 'image/jpeg' });
      const dataUrl = await tryCanvas(asFile);
      if (dataUrl) return await fetch(dataUrl).then(r => r.blob());
      return jpeg;
    } catch {
      // heic2any indisponible → retourner l'original (Storage peut le stocker)
      return file;
    }
  }

  const dataUrl = await tryCanvas(file);
  if (dataUrl) return await fetch(dataUrl).then(r => r.blob());
  return file;
}

// ─── Canvas : essaie 640px puis 400px ────────────────────────────────────────

async function tryCanvas(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      for (const [maxDim, quality] of [[640, 0.72], [400, 0.60]] as [number, number][]) {
        try {
          let w = img.width  || maxDim;
          let h = img.height || maxDim;
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
          if (!result || result === 'data:,' || result.length < 200) continue;
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

// ─── Blob → data URL (base64) ─────────────────────────────────────────────────

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => {
      const result = e.target?.result as string;
      if (!result) { reject(new Error('FileReader empty')); return; }
      if (result.length > MAX_B64) { reject(new Error('PHOTO_TOO_LARGE')); return; }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}
