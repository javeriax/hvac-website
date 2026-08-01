'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconRefresh, IconSignature } from '@/components/icons';
import { Button, TextField } from '@/components/ui';

/**
 * Canvas signature capture (bonus feature). Exports a trimmed PNG data URL,
 * which the API forwards to Cloudinary and stores against the job.
 */
export function SignaturePad({
  onCapture,
  busy,
  defaultName,
}: {
  onCapture: (dataUrl: string, signedBy: string) => void;
  busy?: boolean;
  defaultName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [name, setName] = useState(defaultName ?? '');

  // Size the backing store to the device pixel ratio so strokes stay crisp.
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--c-ink')
      .trim()
      .split(' ')
      .length === 3
      ? `rgb(${getComputedStyle(document.documentElement).getPropertyValue('--c-ink')})`
      : '#111';
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pointFrom(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pointFrom(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const capture = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk || !name.trim()) return;

    // Flatten onto white so the PNG reads correctly in both themes and in print.
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);

    onCapture(out.toDataURL('image/png'), name.trim());
  };

  return (
    <div className="space-y-4">
      <TextField
        label="Signed by"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Customer's full name"
        required
      />

      <div>
        <span className="label">Signature</span>
        <div className="relative overflow-hidden rounded-xl border border-dashed border-line bg-sunken">
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="h-40 w-full touch-none"
            style={{ cursor: 'crosshair' }}
          />
          {!hasInk && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p className="flex items-center gap-2 text-[13px] text-faint">
                <IconSignature className="h-4 w-4" />
                Ask the customer to sign here
              </p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-8 bottom-8 h-px bg-line" />
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={clear} disabled={!hasInk}>
          <IconRefresh className="h-3.5 w-3.5" />
          Clear
        </Button>
        <Button size="sm" onClick={capture} disabled={!hasInk || !name.trim()} loading={busy}>
          Save signature
        </Button>
      </div>
    </div>
  );
}
