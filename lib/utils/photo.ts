// Max base64 size we'll store in the DB (~1.5 MB compressed file → ~2 MB base64)
const MAX_B64 = 2_000_000;

export async function compressPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/') && file.type !== '') {
    throw new Error('Not an image');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Try increasingly aggressive compression; last resort is FileReader fallback
      for (const [maxDim, quality] of [[640, 0.72], [400, 0.60]] as [number, number][]) {
        try {
          let w = img.width || maxDim;
          let h = img.height || maxDim;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
            else       { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          w = Math.min(w, 4096); h = Math.min(h, 4096);

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          ctx.drawImage(img, 0, 0, w, h);
          const result = canvas.toDataURL('image/jpeg', quality);
          // drawImage can fail silently on iOS (OOM) → produces empty canvas
          if (!result || result === 'data:,' || result.length < 100) continue;
          if (result.length <= MAX_B64) {
            URL.revokeObjectURL(url);
            resolve(result);
            return;
          }
          // Still too large → try next smaller size
        } catch {
          // canvas failed → try next
        }
      }

      URL.revokeObjectURL(url);
      // All canvas attempts failed — try FileReader (no compression)
      fallbackRead(file, resolve, reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // HEIC/HEIF or unsupported format — try FileReader
      fallbackRead(file, resolve, reject);
    };

    img.src = url;
  });
}

function fallbackRead(
  file: File,
  resolve: (v: string) => void,
  reject: (e: Error) => void,
) {
  const reader = new FileReader();
  reader.onload = e => {
    const result = e.target?.result as string;
    if (!result) { reject(new Error('FileReader empty')); return; }
    if (result.length > MAX_B64) {
      // Photo too large to store as base64 in DB
      reject(new Error('PHOTO_TOO_LARGE'));
      return;
    }
    resolve(result);
  };
  reader.onerror = () => reject(new Error('FileReader error'));
  reader.readAsDataURL(file);
}
