import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET    = 'equipment-photos';
const MAX_B64   = 2_000_000; // 2 MB max pour le fallback base64

// ─── Upload vers Supabase Storage (fallback base64 si bucket absent) ──────────

export async function uploadPhoto(
  file: File,
  tenant: string,
  supabase: SupabaseClient,
): Promise<string> {
  const blob = await compressToBlob(file);

  try {
    const path = `${tenant}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

    if (!error) {
      return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
    // Bucket absent ou autre erreur Storage → fallback base64
  } catch {
    // Network error → fallback base64
  }

  // Fallback : convertir le blob en base64 (compatible ancien fonctionnement)
  return blobToDataUrl(blob);
}

// ─── Compression vers Blob ────────────────────────────────────────────────────

export async function compressToBlob(file: File): Promise<Blob> {
  const dataUrl = await tryCanvas(file);
  if (dataUrl) return await fetch(dataUrl).then(r => r.blob());
  // Fallback : fichier original (Storage peut gérer jusqu'à 10 MB)
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
          // drawImage échoue silencieusement sur iOS OOM → canvas vide
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
