import { useEffect, useRef, useState, type CSSProperties } from 'react';

type SignalFieldProps = {
  className?: string;
  isCompact?: boolean;
  reducedMotion?: boolean;
  style?: CSSProperties;
};

type NetworkNode = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  radius: number;
  tone: number;
};

const TAU = Math.PI * 2;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createNodes(count: number, random: () => number): NetworkNode[] {
  return Array.from({ length: count }, () => ({
    x: 0.03 + random() * 0.94,
    y: 0.05 + random() * 0.9,
    phase: random() * TAU,
    speed: 0.18 + random() * 0.46,
    radius: 0.7 + random() * 1.65,
    tone: random(),
  }));
}

function useMediaPreference(query: string, fallback: boolean) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return fallback;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export function SignalField({
  className,
  isCompact = false,
  reducedMotion = false,
  style,
}: SignalFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemReducedMotion = useMediaPreference('(prefers-reduced-motion: reduce)', false);
  const hasFinePointer = useMediaPreference('(pointer: fine)', false);
  const isStatic = isCompact || reducedMotion || systemReducedMotion;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!root || !canvas || !context) return undefined;

    const random = createRandom(0xb01a57);
    const nodes = createNodes(isCompact ? 28 : 68, random);
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const size = { width: 0, height: 0, dpr: 1 };
    let animationFrame = 0;
    let lastFrame = -Infinity;
    let destroyed = false;
    let inViewport = true;

    const draw = (milliseconds: number) => {
      const { width, height } = size;
      if (width <= 0 || height <= 0) return;

      const time = isStatic ? 11.8 : milliseconds * 0.001;
      const shortestSide = Math.min(width, height);
      const positioned = nodes.map((node) => ({
        ...node,
        px: node.x * width + Math.sin(time * node.speed + node.phase) * shortestSide * 0.012 + pointer.x * shortestSide * (node.y - 0.5) * 0.018,
        py: node.y * height + Math.cos(time * node.speed * 0.72 + node.phase) * shortestSide * 0.009 + pointer.y * shortestSide * (node.x - 0.5) * 0.014,
      }));

      context.clearRect(0, 0, width, height);
      context.save();

      const atmosphere = context.createRadialGradient(width * 0.64, height * 0.46, 0, width * 0.64, height * 0.46, shortestSide * 0.72);
      atmosphere.addColorStop(0, 'rgba(201, 255, 56, 0.055)');
      atmosphere.addColorStop(0.34, 'rgba(120, 232, 246, 0.04)');
      atmosphere.addColorStop(0.7, 'rgba(115, 92, 255, 0.025)');
      atmosphere.addColorStop(1, 'rgba(5, 5, 6, 0)');
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      const scanX = width * ((time * 0.035) % 1);
      const scan = context.createLinearGradient(scanX - 80, 0, scanX + 80, 0);
      scan.addColorStop(0, 'rgba(120, 232, 246, 0)');
      scan.addColorStop(0.5, 'rgba(120, 232, 246, 0.045)');
      scan.addColorStop(1, 'rgba(120, 232, 246, 0)');
      context.fillStyle = scan;
      context.fillRect(scanX - 80, 0, 160, height);

      const connectionRadius = isCompact ? shortestSide * 0.24 : shortestSide * 0.21;
      positioned.forEach((node, index) => {
        for (let next = index + 1; next < positioned.length; next += 1) {
          const target = positioned[next];
          const deltaX = target.px - node.px;
          const deltaY = target.py - node.py;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > connectionRadius) continue;

          const alpha = (1 - distance / connectionRadius) * 0.11;
          const gradient = context.createLinearGradient(node.px, node.py, target.px, target.py);
          gradient.addColorStop(0, `rgba(120, 232, 246, ${alpha})`);
          gradient.addColorStop(1, target.tone > 0.72
            ? `rgba(201, 255, 56, ${alpha * 0.9})`
            : `rgba(115, 92, 255, ${alpha * 0.8})`);
          context.beginPath();
          context.moveTo(node.px, node.py);
          context.lineTo(target.px, target.py);
          context.strokeStyle = gradient;
          context.lineWidth = 0.55;
          context.stroke();
        }
      });

      context.globalCompositeOperation = 'lighter';
      positioned.forEach((node, index) => {
        const pulse = 0.62 + Math.sin(time * 0.9 + node.phase) * 0.25;
        const alpha = index % 11 === 0 ? 0.62 : 0.24;
        context.beginPath();
        context.arc(node.px, node.py, node.radius * (0.8 + pulse * 0.45), 0, TAU);
        context.fillStyle = node.tone > 0.82
          ? `rgba(201, 255, 56, ${alpha * pulse})`
          : node.tone > 0.58
            ? `rgba(115, 92, 255, ${alpha * pulse})`
            : `rgba(120, 232, 246, ${alpha * pulse})`;
        context.fill();

        if (index % 17 === 0) {
          context.beginPath();
          context.arc(node.px, node.py, 8 + pulse * 5, 0, TAU);
          context.strokeStyle = `rgba(201, 255, 56, ${0.08 * pulse})`;
          context.lineWidth = 0.6;
          context.stroke();
        }
      });

      context.restore();
    };

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const dpr = clamp(window.devicePixelRatio || 1, 1, isCompact ? 1.2 : 1.65);
      if (width === size.width && height === size.height && dpr === size.dpr) return;

      size.width = width;
      size.height = height;
      size.dpr = dpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(isStatic ? 11800 : performance.now());
    };

    const tick = (now: number) => {
      if (destroyed || isStatic || !inViewport || document.hidden) return;
      animationFrame = window.requestAnimationFrame(tick);
      if (now - lastFrame < 1000 / 40) return;
      lastFrame = now;
      pointer.x += (pointer.targetX - pointer.x) * 0.055;
      pointer.y += (pointer.targetY - pointer.y) * 0.055;
      draw(now);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!hasFinePointer || isStatic) return;
      const bounds = root.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (!inside) {
        pointer.targetX = 0;
        pointer.targetY = 0;
        return;
      }
      pointer.targetX = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
      pointer.targetY = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
    };

    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const handleVisibilityChange = () => {
      window.cancelAnimationFrame(animationFrame);
      if (!document.hidden && inViewport && !isStatic) {
        lastFrame = -Infinity;
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    const intersectionObserver = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
        inViewport = entry?.isIntersecting ?? true;
        window.cancelAnimationFrame(animationFrame);
        if (inViewport && !document.hidden && !isStatic) {
          lastFrame = -Infinity;
          animationFrame = window.requestAnimationFrame(tick);
        }
      }, { rootMargin: '160px 0px', threshold: 0 });

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(root);
    intersectionObserver?.observe(root);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', resetPointer);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resize();
    if (!isStatic) animationFrame = window.requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', resetPointer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasFinePointer, isCompact, isStatic]);

  return (
    <div
      ref={rootRef}
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', contain: 'layout paint style', ...style }}
    >
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}

export type { SignalFieldProps };
