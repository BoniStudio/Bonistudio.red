import { useEffect, useRef, useState, type CSSProperties } from 'react';

type SignalFieldProps = {
  className?: string;
  isCompact?: boolean;
  reducedMotion?: boolean;
  style?: CSSProperties;
};

type SignalSeed = {
  phase: number;
  position: number;
  speed: number;
  spread: number;
  weight: number;
};

type SignalNode = {
  x: number;
  y: number;
  phase: number;
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

function createSignalSeeds(count: number, random: () => number): SignalSeed[] {
  return Array.from({ length: count }, () => ({
    phase: random() * TAU,
    position: random(),
    speed: 0.28 + random() * 0.72,
    spread: random() * 2 - 1,
    weight: 0.4 + random() * 1.35,
  }));
}

function createSignalNodes(count: number, random: () => number): SignalNode[] {
  return Array.from({ length: count }, () => ({
    x: 0.08 + random() * 0.84,
    y: 0.04 + random() * 0.92,
    phase: random() * TAU,
    radius: 0.7 + random() * 1.7,
    tone: random(),
  }));
}

function traceMonolith(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  inset = 0,
) {
  const left = x + inset;
  const top = y + inset;
  const right = x + width - inset;
  const bottom = y + height - inset;
  const notch = Math.max(3, width * 0.045);

  context.beginPath();
  context.moveTo(left + width * 0.12, top);
  context.lineTo(right - width * 0.17, top);
  context.lineTo(right, top + height * 0.075);
  context.lineTo(right - notch, bottom - height * 0.06);
  context.lineTo(right - width * 0.11, bottom);
  context.lineTo(left + width * 0.08, bottom - height * 0.018);
  context.lineTo(left, bottom - height * 0.12);
  context.lineTo(left + notch, top + height * 0.08);
  context.closePath();
}

function useMediaPreference(query: string, fallback: boolean) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return fallback;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }

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

    if (!root || !canvas || !context) {
      return undefined;
    }

    const random = createRandom(0xb01a57);
    const threads = createSignalSeeds(isCompact ? 22 : 46, random);
    const nodes = createSignalNodes(isCompact ? 34 : 76, random);
    const dust = createSignalNodes(isCompact ? 24 : 58, random);
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const size = { width: 0, height: 0, dpr: 1 };
    let animationFrame = 0;
    let lastFrame = -Infinity;
    let destroyed = false;
    let inViewport = true;

    const draw = (milliseconds: number) => {
      const width = size.width;
      const height = size.height;

      if (width <= 0 || height <= 0) {
        return;
      }

      const time = isStatic ? 7.4 : milliseconds * 0.001;
      const shortestSide = Math.min(width, height);
      const monolithHeight = Math.min(height * 0.82, width * 1.08);
      const monolithWidth = Math.min(width * 0.47, monolithHeight * 0.56);
      const centerX = width * 0.56 + pointer.x * shortestSide * 0.022;
      const centerY = height * 0.51 + pointer.y * shortestSide * 0.014;
      const originX = centerX - monolithWidth * 0.5;
      const originY = centerY - monolithHeight * 0.5;

      context.clearRect(0, 0, width, height);
      context.save();

      const atmosphere = context.createRadialGradient(
        centerX + monolithWidth * 0.08,
        centerY,
        0,
        centerX,
        centerY,
        monolithHeight * 0.72,
      );
      atmosphere.addColorStop(0, 'rgba(115, 92, 255, 0.105)');
      atmosphere.addColorStop(0.32, 'rgba(120, 232, 246, 0.055)');
      atmosphere.addColorStop(0.7, 'rgba(201, 255, 56, 0.018)');
      atmosphere.addColorStop(1, 'rgba(5, 5, 6, 0)');
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      context.translate(centerX, centerY);
      context.transform(1, pointer.y * 0.008, pointer.x * -0.012, 1, -centerX, -centerY);

      for (let ring = 4; ring >= 1; ring -= 1) {
        const ringInset = -ring * Math.max(9, monolithWidth * 0.04);
        traceMonolith(context, originX, originY, monolithWidth, monolithHeight, ringInset);
        context.strokeStyle = `rgba(120, 232, 246, ${0.013 + ring * 0.008})`;
        context.lineWidth = 0.7;
        context.stroke();
      }

      traceMonolith(context, originX, originY, monolithWidth, monolithHeight);
      const surface = context.createLinearGradient(originX, originY, originX + monolithWidth, originY + monolithHeight);
      surface.addColorStop(0, 'rgba(243, 240, 232, 0.075)');
      surface.addColorStop(0.22, 'rgba(18, 18, 24, 0.74)');
      surface.addColorStop(0.62, 'rgba(7, 7, 10, 0.88)');
      surface.addColorStop(1, 'rgba(115, 92, 255, 0.12)');
      context.fillStyle = surface;
      context.shadowColor = 'rgba(120, 232, 246, 0.12)';
      context.shadowBlur = Math.max(18, shortestSide * 0.035);
      context.fill();
      context.shadowBlur = 0;

      context.save();
      traceMonolith(context, originX, originY, monolithWidth, monolithHeight, 1);
      context.clip();

      const innerLight = context.createLinearGradient(originX, originY, originX + monolithWidth, originY);
      innerLight.addColorStop(0, 'rgba(120, 232, 246, 0.025)');
      innerLight.addColorStop(0.48, 'rgba(243, 240, 232, 0.015)');
      innerLight.addColorStop(0.72, 'rgba(115, 92, 255, 0.05)');
      innerLight.addColorStop(1, 'rgba(201, 255, 56, 0.025)');
      context.fillStyle = innerLight;
      context.fillRect(originX, originY, monolithWidth, monolithHeight);

      context.globalCompositeOperation = 'lighter';
      threads.forEach((thread, index) => {
        const baseX = originX + monolithWidth * (0.11 + thread.position * 0.78);
        const amplitude = monolithWidth * (0.018 + Math.abs(thread.spread) * 0.032);
        const points = 18;

        context.beginPath();
        for (let point = 0; point <= points; point += 1) {
          const progress = point / points;
          const wave = Math.sin(progress * TAU * (1.25 + (index % 4) * 0.21) + thread.phase + time * thread.speed);
          const interference = Math.sin(progress * TAU * 3.1 - time * 0.31 + thread.phase) * 0.32;
          const x = baseX + (wave + interference) * amplitude + pointer.x * progress * 5;
          const y = originY + progress * monolithHeight;

          if (point === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        const isAccent = index % 9 === 0;
        context.strokeStyle = isAccent
          ? `rgba(201, 255, 56, ${0.07 + thread.weight * 0.045})`
          : `rgba(120, 232, 246, ${0.035 + thread.weight * 0.032})`;
        context.lineWidth = isAccent ? 0.8 : 0.45;
        context.stroke();
      });

      nodes.forEach((node, index) => {
        const pulse = 0.55 + Math.sin(time * 0.8 + node.phase) * 0.28;
        const drift = isStatic ? 0 : Math.sin(time * 0.32 + node.phase) * 3.2;
        const x = originX + node.x * monolithWidth + drift + pointer.x * (node.y - 0.5) * 5;
        const y = originY + node.y * monolithHeight;
        const alpha = (index % 7 === 0 ? 0.48 : 0.19) * pulse;

        context.beginPath();
        context.arc(x, y, node.radius * (0.72 + pulse * 0.34), 0, TAU);
        context.fillStyle = node.tone > 0.86
          ? `rgba(201, 255, 56, ${alpha})`
          : node.tone > 0.62
            ? `rgba(115, 92, 255, ${alpha})`
            : `rgba(120, 232, 246, ${alpha})`;
        context.fill();
      });

      const scanProgress = isStatic ? 0.42 : (time * 0.085) % 1;
      const scanY = originY + scanProgress * monolithHeight;
      const scan = context.createLinearGradient(originX, scanY, originX + monolithWidth, scanY);
      scan.addColorStop(0, 'rgba(201, 255, 56, 0)');
      scan.addColorStop(0.28, 'rgba(201, 255, 56, 0.1)');
      scan.addColorStop(0.56, 'rgba(243, 240, 232, 0.34)');
      scan.addColorStop(1, 'rgba(120, 232, 246, 0)');
      context.fillStyle = scan;
      context.fillRect(originX, scanY - 0.5, monolithWidth, 1);

      context.restore();

      traceMonolith(context, originX, originY, monolithWidth, monolithHeight);
      const edge = context.createLinearGradient(originX, originY, originX + monolithWidth, originY + monolithHeight);
      edge.addColorStop(0, 'rgba(243, 240, 232, 0.42)');
      edge.addColorStop(0.27, 'rgba(120, 232, 246, 0.16)');
      edge.addColorStop(0.7, 'rgba(115, 92, 255, 0.22)');
      edge.addColorStop(1, 'rgba(201, 255, 56, 0.2)');
      context.strokeStyle = edge;
      context.lineWidth = 0.9;
      context.stroke();

      context.globalCompositeOperation = 'lighter';
      dust.forEach((particle) => {
        const orbit = Math.sin(time * particle.radius * 0.12 + particle.phase);
        const side = particle.x < 0.5 ? -1 : 1;
        const x = centerX + side * (monolithWidth * (0.58 + particle.x * 0.62)) + orbit * 9;
        const y = originY + particle.y * monolithHeight + Math.cos(time * 0.24 + particle.phase) * 5;
        const alpha = 0.04 + Math.max(0, Math.sin(time * 0.52 + particle.phase)) * 0.13;

        context.beginPath();
        context.arc(x, y, Math.max(0.45, particle.radius * 0.42), 0, TAU);
        context.fillStyle = particle.tone > 0.78
          ? `rgba(201, 255, 56, ${alpha})`
          : `rgba(120, 232, 246, ${alpha})`;
        context.fill();
      });

      context.restore();
    };

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const dprLimit = isCompact ? 1.25 : 1.8;
      const dpr = clamp(window.devicePixelRatio || 1, 1, dprLimit);

      if (width === size.width && height === size.height && dpr === size.dpr) {
        return;
      }

      size.width = width;
      size.height = height;
      size.dpr = dpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(isStatic ? 7400 : performance.now());
    };

    const tick = (now: number) => {
      if (destroyed || isStatic || !inViewport || document.hidden) {
        return;
      }

      animationFrame = window.requestAnimationFrame(tick);
      if (now - lastFrame < 1000 / 45) {
        return;
      }

      lastFrame = now;
      pointer.x += (pointer.targetX - pointer.x) * 0.065;
      pointer.y += (pointer.targetY - pointer.y) * 0.065;
      draw(now);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!hasFinePointer || isStatic) {
        return;
      }

      const bounds = root.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
      pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
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

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(resize);

    resizeObserver?.observe(root);
    intersectionObserver?.observe(root);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', resetPointer);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resize();

    if (!isStatic) {
      animationFrame = window.requestAnimationFrame(tick);
    }

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
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        contain: 'layout paint style',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}

export type { SignalFieldProps };
