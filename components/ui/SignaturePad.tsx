'use client';
// Pad de signature tactile/souris réutilisable. Contrôlé : appelle onChange(dataUrl PNG) au relâchement.
// Réutilise le pattern des permis (pointer events, touch-none). `value` (data URL) pré-affiche une signature.
import React, { useEffect, useRef } from 'react';

export function SignaturePad({ value, onChange, width = 360, height = 100, label }: {
  value?: string | null; onChange: (dataUrl: string) => void; width?: number; height?: number; label?: string;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const ctx = () => cv.current!.getContext('2d')!;
  const clearCanvas = () => { const c = cv.current!; const x = ctx(); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); };

  // Initialisation + pré-affichage d'une signature existante.
  useEffect(() => {
    const c = cv.current; if (!c) return;
    clearCanvas();
    if (value && value.startsWith('data:')) {
      const img = new Image();
      img.onload = () => { try { ctx().drawImage(img, 0, 0, c.width, c.height); } catch {} };
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (cv.current!.width / r.width), y: (e.clientY - r.top) * (cv.current!.height / r.height) };
  };

  return (
    <div>
      {label && <div className="mb-1 text-xs font-semibold text-gray-500">{label}</div>}
      <canvas
        ref={cv} width={width} height={height}
        className="w-full touch-none rounded-lg border border-gray-300 bg-white dark:border-gray-600"
        style={{ height, cursor: 'crosshair' }}
        onPointerDown={e => { drawing.current = true; last.current = pos(e); (e.target as Element).setPointerCapture?.(e.pointerId); }}
        onPointerMove={e => { if (!drawing.current) return; const x = ctx(); const p = pos(e); x.strokeStyle = '#111827'; x.lineWidth = 2.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(last.current!.x, last.current!.y); x.lineTo(p.x, p.y); x.stroke(); last.current = p; }}
        onPointerUp={() => { if (!drawing.current) return; drawing.current = false; try { onChange(cv.current!.toDataURL('image/png')); } catch {} }}
        onPointerLeave={() => { if (drawing.current) { drawing.current = false; try { onChange(cv.current!.toDataURL('image/png')); } catch {} } }}
      />
      <button type="button" onClick={() => { clearCanvas(); onChange(''); }} className="mt-1 text-xs text-gray-500 hover:text-rose-600">Effacer</button>
    </div>
  );
}
