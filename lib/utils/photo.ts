export async function compressPhoto(file: File): Promise<string> {
  // On mobile, try canvas compression first; fall back to FileReader base64 if it fails
  return new Promise((resolve, reject) => {
    // Reject non-image files immediately
    if (!file.type.startsWith('image/') && file.type !== '') {
      reject(new Error('Not an image'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const MAX = 900;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else       { w = Math.round(w * MAX / h); h = MAX; }
        }
        // Ensure dimensions are valid
        if (!w || !h || w > 4096 || h > 4096) {
          w = Math.min(w || MAX, MAX);
          h = Math.min(h || MAX, MAX);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No canvas context');
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const result = canvas.toDataURL('image/jpeg', 0.72);
        if (!result || result === 'data:,') throw new Error('Empty canvas');
        resolve(result);
      } catch {
        URL.revokeObjectURL(url);
        // Fallback: read as-is via FileReader (no compression but works on all formats)
        fallbackRead(file, resolve, reject);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // HEIC/HEIF or unsupported format — try FileReader fallback
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
    if (result) resolve(result);
    else reject(new Error('FileReader empty'));
  };
  reader.onerror = () => reject(new Error('FileReader error'));
  reader.readAsDataURL(file);
}
