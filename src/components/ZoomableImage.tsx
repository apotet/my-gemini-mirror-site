import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imgClassName?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  caption,
  className = '',
  imgClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // Reset when image changes
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    scaleRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
  }, [src]);

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const applyScaleAt = useCallback((nextScale: number, clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = clientX - rect.left - rect.width / 2;
    const cy = clientY - rect.top - rect.height / 2;
    const prev = scaleRef.current;
    const s = clampScale(nextScale);
    if (s === prev) return;

    // Keep point under cursor stable while zooming
    const ratio = s / prev;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const nx = cx - (cx - ox) * ratio;
    const ny = cy - (cy - oy) * ratio;

    if (s === 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      scaleRef.current = 1;
      offsetRef.current = { x: 0, y: 0 };
    } else {
      setScale(s);
      setOffset({ x: nx, y: ny });
      scaleRef.current = s;
      offsetRef.current = { x: nx, y: ny };
    }
  }, []);

  // Wheel zoom (desktop) — non-passive so we can prevent page scroll while zooming
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Always intercept over the image so page doesn't scroll while zooming
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.12 : 1 / 1.12;
      applyScaleAt(scaleRef.current * factor, e.clientX, e.clientY);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyScaleAt]);

  const touchDistance = (t: TouchList) => {
    if (t.length < 2) return 0;
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.hypot(dx, dy);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        dist: touchDistance(e.touches),
        scale: scaleRef.current,
      };
      dragRef.current = null;
    } else if (e.touches.length === 1 && scaleRef.current > 1) {
      dragRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        ox: offsetRef.current.x,
        oy: offsetRef.current.y,
      };
      pinchRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = touchDistance(e.touches);
      if (pinchRef.current.dist <= 0) return;
      const next = pinchRef.current.scale * (dist / pinchRef.current.dist);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      applyScaleAt(next, midX, midY);
    } else if (e.touches.length === 1 && dragRef.current && scaleRef.current > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - dragRef.current.x;
      const dy = e.touches[0].clientY - dragRef.current.y;
      const next = {
        x: dragRef.current.ox + dx,
        y: dragRef.current.oy + dy,
      };
      setOffset(next);
      offsetRef.current = next;
    }
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
    dragRef.current = null;
    if (scaleRef.current <= 1.02) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      scaleRef.current = 1;
      offsetRef.current = { x: 0, y: 0 };
    }
  };

  // Double-click / double-tap to reset
  const onDoubleClick = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    scaleRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
  };

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-black/60 p-2 ${className}`}>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl touch-none select-none cursor-zoom-in"
        style={{ touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onDoubleClick={onDoubleClick}
        title="Колесо мыши или щипок пальцами — масштаб"
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          loading="lazy"
          className={`max-h-80 w-full object-contain rounded-xl mx-auto pointer-events-none ${imgClassName}`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: pinchRef.current || dragRef.current ? 'none' : 'transform 0.08s ease-out',
          }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      {caption && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1.5 font-mono">
          {caption}
        </p>
      )}
    </div>
  );
};
