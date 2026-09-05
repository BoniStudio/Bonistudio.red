import { useEffect, useRef } from 'react';
import type { LabModuleId } from '../i18n/content';

type ExperimentFieldProps = {
  mode: LabModuleId;
  isCompact?: boolean;
};

type PointerState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
};

type SeedPoint = {
  x: number;
  y: number;
  size: number;
  phase: number;
  tone: number;
};

type SceneData = {
  particles: SeedPoint[];
  nodes: SeedPoint[];
};

type DrawState = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  pointer: PointerState;
  data: SceneData;
  compact: boolean;
};

const TAU = Math.PI * 2;
const archiveCodes = ['OVO', 'AMT', 'SLA', 'SSV', 'HCP', 'BNS'];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createSceneData(compact: boolean): SceneData {
  const random = createRandom(0xb01a57);
  const particleCount = compact ? 74 : 132;
  const nodeCount = compact ? 22 : 34;

  const makePoint = (): SeedPoint => ({
    x: random(),
    y: random(),
    size: 0.6 + random() * 1.8,
    phase: random() * TAU,
    tone: random(),
  });

  return {
    particles: Array.from({ length: particleCount }, makePoint),
    nodes: Array.from({ length: nodeCount }, makePoint),
  };
}

function drawBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  pointer: PointerState,
  accent: string,
) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#03050a';
  context.fillRect(0, 0, width, height);

  const glowX = width * (0.5 + pointer.x * 0.055);
  const glowY = height * (0.5 + pointer.y * 0.055);
  const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.7);
  glow.addColorStop(0, accent);
  glow.addColorStop(0.22, 'rgba(13, 24, 49, 0.34)');
  glow.addColorStop(1, 'rgba(3, 5, 10, 0)');
  context.globalAlpha = 0.2;
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = 1;

  const spacing = width < 600 ? 38 : 52;
  context.beginPath();
  context.strokeStyle = 'rgba(177, 215, 255, 0.045)';
  context.lineWidth = 1;
  for (let x = spacing * 0.5; x < width; x += spacing) {
    context.moveTo(Math.round(x) + 0.5, 0);
    context.lineTo(Math.round(x) + 0.5, height);
  }
  for (let y = spacing * 0.5; y < height; y += spacing) {
    context.moveTo(0, Math.round(y) + 0.5);
    context.lineTo(width, Math.round(y) + 0.5);
  }
  context.stroke();

  const vignette = context.createRadialGradient(width * 0.5, height * 0.48, 0, width * 0.5, height * 0.48, Math.max(width, height) * 0.76);
  vignette.addColorStop(0.45, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function drawFrameCorners(context: CanvasRenderingContext2D, width: number, height: number, color: string) {
  const inset = Math.max(14, Math.min(width, height) * 0.045);
  const length = Math.max(18, Math.min(width, height) * 0.055);

  context.save();
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.globalAlpha = 0.45;

  context.moveTo(inset, inset + length);
  context.lineTo(inset, inset);
  context.lineTo(inset + length, inset);
  context.moveTo(width - inset - length, inset);
  context.lineTo(width - inset, inset);
  context.lineTo(width - inset, inset + length);
  context.moveTo(inset, height - inset - length);
  context.lineTo(inset, height - inset);
  context.lineTo(inset + length, height - inset);
  context.moveTo(width - inset - length, height - inset);
  context.lineTo(width - inset, height - inset);
  context.lineTo(width - inset, height - inset - length);
  context.stroke();
  context.restore();
}

function drawScanner({ context, width, height, time, pointer, data }: DrawState) {
  drawBackdrop(context, width, height, pointer, 'rgba(46, 220, 255, 0.85)');

  const radius = Math.min(width, height) * 0.29;
  const centerX = width * 0.52 + pointer.x * radius * 0.08;
  const centerY = height * 0.5 + pointer.y * radius * 0.06;
  const scanProgress = (time * 0.115) % 1;
  const scanY = centerY - radius + scanProgress * radius * 2;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(time * 0.035 + pointer.x * 0.025);
  context.strokeStyle = 'rgba(94, 229, 255, 0.16)';
  context.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring += 1) {
    context.beginPath();
    context.ellipse(0, 0, radius * (ring / 4), radius * (ring / 4) * 0.52, 0, 0, TAU);
    context.stroke();
  }
  context.beginPath();
  context.ellipse(0, 0, radius * 0.64, radius, Math.PI * 0.5, 0, TAU);
  context.stroke();
  context.restore();

  context.save();
  context.globalCompositeOperation = 'lighter';
  for (const particle of data.particles) {
    const latitude = particle.y * 2 - 1;
    const latitudeRadius = Math.sqrt(Math.max(0, 1 - latitude * latitude));
    const angle = particle.x * TAU + time * (0.025 + particle.tone * 0.035);
    const depth = Math.sin(angle) * latitudeRadius;
    const x = centerX + Math.cos(angle) * latitudeRadius * radius;
    const y = centerY + latitude * radius + Math.sin(time * 0.7 + particle.phase) * 1.5;
    const scanDistance = Math.abs(y - scanY) / Math.max(1, radius);
    const scanned = Math.max(0, 1 - scanDistance * 8);
    const pointRadius = particle.size * (0.72 + (depth + 1) * 0.18) + scanned * 1.6;

    context.beginPath();
    context.fillStyle = scanned > 0.05
      ? `rgba(122, 244, 255, ${0.34 + scanned * 0.58})`
      : `rgba(134, 182, 209, ${0.12 + (depth + 1) * 0.12})`;
    context.arc(x, y, pointRadius, 0, TAU);
    context.fill();
  }
  context.restore();

  const beam = context.createLinearGradient(0, scanY - 34, 0, scanY + 34);
  beam.addColorStop(0, 'rgba(54, 220, 255, 0)');
  beam.addColorStop(0.48, 'rgba(54, 220, 255, 0.1)');
  beam.addColorStop(0.5, 'rgba(174, 250, 255, 0.72)');
  beam.addColorStop(0.52, 'rgba(54, 220, 255, 0.1)');
  beam.addColorStop(1, 'rgba(54, 220, 255, 0)');
  context.fillStyle = beam;
  context.fillRect(0, scanY - 34, width, 68);

  context.beginPath();
  context.moveTo(width * 0.08, scanY + 0.5);
  context.lineTo(width * 0.92, scanY + 0.5);
  context.strokeStyle = 'rgba(151, 246, 255, 0.7)';
  context.lineWidth = 1;
  context.stroke();
  drawFrameCorners(context, width, height, 'rgba(98, 231, 255, 0.85)');
}

function drawGrid({ context, width, height, time, pointer, data }: DrawState) {
  drawBackdrop(context, width, height, pointer, 'rgba(132, 96, 255, 0.82)');

  const marginX = width * 0.09;
  const marginY = height * 0.12;
  const fieldWidth = width - marginX * 2;
  const fieldHeight = height - marginY * 2;
  const positions = data.nodes.map((node) => {
    let x = marginX + node.x * fieldWidth + Math.sin(time * 0.18 + node.phase) * width * 0.006;
    let y = marginY + node.y * fieldHeight + Math.cos(time * 0.16 + node.phase) * height * 0.008;
    const pointerX = width * (pointer.x * 0.5 + 0.5);
    const pointerY = height * (pointer.y * 0.5 + 0.5);
    const deltaX = pointerX - x;
    const deltaY = pointerY - y;
    const distance = Math.hypot(deltaX, deltaY);

    if (pointer.active && distance < Math.min(width, height) * 0.28) {
      const influence = 1 - distance / (Math.min(width, height) * 0.28);
      x += deltaX * influence * 0.055;
      y += deltaY * influence * 0.055;
    }

    return { x, y };
  });

  context.save();
  context.globalCompositeOperation = 'lighter';
  for (let index = 0; index < positions.length; index += 1) {
    const current = positions[index];
    for (let neighbor = index + 1; neighbor < positions.length; neighbor += 1) {
      const next = positions[neighbor];
      const distance = Math.hypot(current.x - next.x, current.y - next.y);
      const threshold = Math.min(width, height) * 0.235;
      if (distance > threshold) {
        continue;
      }

      const alpha = (1 - distance / threshold) * 0.24;
      context.beginPath();
      context.moveTo(current.x, current.y);
      context.lineTo(next.x, next.y);
      context.strokeStyle = `rgba(117, 130, 255, ${alpha})`;
      context.lineWidth = 1;
      context.stroke();

      if ((index + neighbor) % 9 === 0) {
        const progress = (time * 0.15 + data.nodes[index].tone) % 1;
        const pulseX = current.x + (next.x - current.x) * progress;
        const pulseY = current.y + (next.y - current.y) * progress;
        context.beginPath();
        context.fillStyle = 'rgba(189, 236, 255, 0.7)';
        context.arc(pulseX, pulseY, 1.35, 0, TAU);
        context.fill();
      }
    }
  }

  positions.forEach((position, index) => {
    const node = data.nodes[index];
    const pulse = 0.5 + Math.sin(time * 1.1 + node.phase) * 0.5;
    context.beginPath();
    context.fillStyle = node.tone > 0.76
      ? `rgba(94, 227, 255, ${0.55 + pulse * 0.32})`
      : `rgba(151, 113, 255, ${0.34 + pulse * 0.3})`;
    context.arc(position.x, position.y, node.size + pulse * 1.15, 0, TAU);
    context.fill();

    if (node.tone > 0.83) {
      context.beginPath();
      context.strokeStyle = 'rgba(119, 229, 255, 0.22)';
      context.arc(position.x, position.y, 6 + pulse * 6, 0, TAU);
      context.stroke();
    }
  });
  context.restore();
  drawFrameCorners(context, width, height, 'rgba(160, 126, 255, 0.82)');
}

function drawOrganicPath(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  time: number,
  phase: number,
) {
  const steps = 72;
  context.beginPath();
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * TAU;
    const deformation =
      Math.sin(angle * 3 + time * 0.52 + phase) * 0.075
      + Math.sin(angle * 7 - time * 0.36 + phase * 1.7) * 0.035
      + Math.cos(angle * 11 + time * 0.19) * 0.018;
    const localRadius = radius * (1 + deformation);
    const x = centerX + Math.cos(angle) * localRadius;
    const y = centerY + Math.sin(angle) * localRadius * 0.86;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
}

function drawCursorMatter({ context, width, height, time, pointer, data }: DrawState) {
  drawBackdrop(context, width, height, pointer, 'rgba(75, 244, 194, 0.72)');

  const radius = Math.min(width, height) * 0.22;
  const centerX = width * 0.5 + pointer.x * width * 0.09;
  const centerY = height * 0.51 + pointer.y * height * 0.08;

  context.save();
  context.globalCompositeOperation = 'lighter';
  for (let layer = 5; layer >= 0; layer -= 1) {
    const layerRadius = radius * (0.64 + layer * 0.095);
    drawOrganicPath(context, centerX, centerY, layerRadius, time, layer * 0.91);
    context.fillStyle = layer === 0 ? 'rgba(132, 255, 224, 0.12)' : 'rgba(61, 193, 178, 0.018)';
    context.strokeStyle = layer % 2 === 0 ? 'rgba(101, 255, 221, 0.24)' : 'rgba(123, 164, 255, 0.18)';
    context.lineWidth = layer === 0 ? 1.3 : 0.75;
    context.fill();
    context.stroke();
  }

  for (let index = 0; index < data.particles.length; index += 2) {
    const particle = data.particles[index];
    const angle = particle.phase + time * (0.08 + particle.tone * 0.1);
    const orbit = radius * (1.18 + particle.x * 1.05);
    const x = centerX + Math.cos(angle) * orbit;
    const y = centerY + Math.sin(angle) * orbit * 0.62;
    context.beginPath();
    context.fillStyle = `rgba(111, 236, 218, ${0.08 + particle.tone * 0.28})`;
    context.arc(x, y, particle.size * 0.72, 0, TAU);
    context.fill();
  }
  context.restore();

  const crosshairX = width * (pointer.x * 0.5 + 0.5);
  const crosshairY = height * (pointer.y * 0.5 + 0.5);
  const crosshairAlpha = pointer.active ? 0.7 : 0.18;
  context.beginPath();
  context.strokeStyle = `rgba(173, 255, 235, ${crosshairAlpha})`;
  context.lineWidth = 1;
  context.arc(crosshairX, crosshairY, 11, 0, TAU);
  context.moveTo(crosshairX - 18, crosshairY);
  context.lineTo(crosshairX + 18, crosshairY);
  context.moveTo(crosshairX, crosshairY - 18);
  context.lineTo(crosshairX, crosshairY + 18);
  context.stroke();
  drawFrameCorners(context, width, height, 'rgba(91, 238, 204, 0.8)');
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width * 0.5, height * 0.5);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function drawArchive({ context, width, height, time, pointer, compact }: DrawState) {
  drawBackdrop(context, width, height, pointer, 'rgba(255, 183, 88, 0.78)');

  const columns = compact || width < 560 ? 2 : 3;
  const rows = Math.ceil(archiveCodes.length / columns);
  const marginX = width * (columns === 2 ? 0.1 : 0.085);
  const marginY = height * 0.13;
  const gap = Math.max(10, Math.min(width, height) * 0.035);
  const cardWidth = (width - marginX * 2 - gap * (columns - 1)) / columns;
  const cardHeight = (height - marginY * 2 - gap * (rows - 1)) / rows;
  const parallaxX = pointer.x * width * 0.012;
  const parallaxY = pointer.y * height * 0.012;

  context.save();
  context.font = `${Math.max(10, Math.min(14, cardHeight * 0.16))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.textBaseline = 'middle';

  archiveCodes.forEach((code, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const phase = index * 0.83;
    const floatY = Math.sin(time * 0.46 + phase) * Math.min(4, cardHeight * 0.04);
    const x = marginX + column * (cardWidth + gap) + parallaxX * (column - (columns - 1) * 0.5);
    const y = marginY + row * (cardHeight + gap) + floatY + parallaxY * (row - (rows - 1) * 0.5);
    const scan = (time * 0.12 + index * 0.17) % 1;

    roundedRectPath(context, x, y, cardWidth, cardHeight, 10);
    const cardGradient = context.createLinearGradient(x, y, x + cardWidth, y + cardHeight);
    cardGradient.addColorStop(0, 'rgba(255, 196, 105, 0.075)');
    cardGradient.addColorStop(1, 'rgba(100, 120, 190, 0.035)');
    context.fillStyle = cardGradient;
    context.fill();
    context.strokeStyle = index === archiveCodes.length - 1
      ? 'rgba(111, 228, 255, 0.52)'
      : 'rgba(255, 204, 126, 0.22)';
    context.lineWidth = index === archiveCodes.length - 1 ? 1.25 : 1;
    context.stroke();

    context.fillStyle = index === archiveCodes.length - 1
      ? 'rgba(144, 238, 255, 0.88)'
      : 'rgba(255, 220, 169, 0.76)';
    context.fillText(code, x + cardWidth * 0.11, y + cardHeight * 0.32);

    context.fillStyle = 'rgba(207, 219, 238, 0.14)';
    context.fillRect(x + cardWidth * 0.11, y + cardHeight * 0.57, cardWidth * 0.72, 1);
    context.fillRect(x + cardWidth * 0.11, y + cardHeight * 0.71, cardWidth * (0.35 + (index % 3) * 0.12), 1);

    const scanX = x + scan * cardWidth;
    const scanGradient = context.createLinearGradient(scanX - 18, 0, scanX + 18, 0);
    scanGradient.addColorStop(0, 'rgba(255, 210, 139, 0)');
    scanGradient.addColorStop(0.5, 'rgba(255, 210, 139, 0.12)');
    scanGradient.addColorStop(1, 'rgba(255, 210, 139, 0)');
    context.fillStyle = scanGradient;
    context.fillRect(scanX - 18, y + 1, 36, cardHeight - 2);
  });

  context.restore();
  drawFrameCorners(context, width, height, 'rgba(255, 198, 108, 0.76)');
}

function drawScene(mode: LabModuleId, state: DrawState) {
  switch (mode) {
    case 'scanner':
      drawScanner(state);
      break;
    case 'grid':
      drawGrid(state);
      break;
    case 'cursor':
      drawCursorMatter(state);
      break;
    case 'archive':
      drawArchive(state);
      break;
  }
}

export function ExperimentField({ mode, isCompact = false }: ExperimentFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });

    if (!canvas || !context) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const sceneData = createSceneData(isCompact);
    const pointer: PointerState = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
    };

    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let elapsed = 1.4;
    let previousTime = performance.now();
    let frameId: number | null = null;
    let inViewport = true;
    let reducedMotion = reducedMotionQuery.matches;
    let finePointer = finePointerQuery.matches;

    const canRender = () => inViewport && document.visibilityState !== 'hidden';

    const render = (now: number) => {
      frameId = null;
      const delta = clamp((now - previousTime) / 1000, 0, 0.05);
      previousTime = now;

      if (!reducedMotion) {
        elapsed += delta;
        pointer.x += (pointer.targetX - pointer.x) * 0.075;
        pointer.y += (pointer.targetY - pointer.y) * 0.075;
      } else {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawScene(mode, {
        context,
        width,
        height,
        time: elapsed,
        pointer,
        data: sceneData,
        compact: isCompact,
      });

      if (!reducedMotion && canRender()) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const requestRender = () => {
      if (!canRender() || frameId !== null) {
        return;
      }

      if (reducedMotion) {
        render(performance.now());
      } else {
        previousTime = performance.now();
        frameId = window.requestAnimationFrame(render);
      }
    };

    const stopRendering = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const syncSize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, isCompact ? 1.3 : 1.75);

      if (nextWidth === width && nextHeight === height && nextPixelRatio === pixelRatio) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      requestRender();
    };

    const drawStaticFrame = () => {
      if (reducedMotion && canRender()) {
        render(performance.now());
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer) {
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      pointer.targetX = clamp(((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1, -1, 1);
      pointer.targetY = clamp(((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1, -1, 1);
      pointer.active = true;
      drawStaticFrame();
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      pointer.active = false;
      drawStaticFrame();
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      stopRendering();
      previousTime = performance.now();
      requestRender();
    };

    const handleFinePointerChange = (event: MediaQueryListEvent) => {
      finePointer = event.matches;
      if (!finePointer) {
        handlePointerLeave();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopRendering();
      } else {
        previousTime = performance.now();
        requestRender();
      }
    };

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(syncSize);
    resizeObserver?.observe(canvas);

    const intersectionObserver = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
        ([entry]) => {
          inViewport = entry?.isIntersecting ?? true;
          if (inViewport) {
            previousTime = performance.now();
            requestRender();
          } else {
            stopRendering();
          }
        },
        { rootMargin: '160px 0px', threshold: 0 },
      );
    intersectionObserver?.observe(canvas);

    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    finePointerQuery.addEventListener('change', handleFinePointerChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!resizeObserver) {
      window.addEventListener('resize', syncSize, { passive: true });
    }

    syncSize();
    requestRender();

    return () => {
      stopRendering();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      finePointerQuery.removeEventListener('change', handleFinePointerChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!resizeObserver) {
        window.removeEventListener('resize', syncSize);
      }
    };
  }, [isCompact, mode]);

  return (
    <canvas
      ref={canvasRef}
      className={`experiment-field experiment-field--${mode}`}
      width={960}
      height={540}
      aria-hidden="true"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: '#03050a',
      }}
    />
  );
}
