import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowDownRight, FlaskConical } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Component, useMemo, useRef, type ErrorInfo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { SiteContent } from '../i18n/content';

const vertexShader = `
  uniform float uTime;
  uniform float uScan;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  attribute float aSeed;
  attribute float aAccent;
  varying float vLight;
  varying float vAccent;

  void main() {
    vec3 base = position;
    float scan = smoothstep(-1.42, uScan, base.y);
    float frontier = 1.0 - smoothstep(0.0, 0.22, abs(base.y - uScan));
    float breath = sin(uTime * 1.2 + aSeed * 9.7) * 0.018;
    float noise = sin(base.x * 8.0 + uTime * 0.82 + aSeed * 12.0) *
      cos(base.z * 7.0 - uTime * 0.55 + aSeed * 6.0);
    float drift = mix(0.2, 0.035, scan);

    vec3 dir = normalize(vec3(
      sin(aSeed * 41.0),
      cos(aSeed * 29.0),
      sin(aSeed * 17.0)
    ));

    vec3 pos = base + dir * noise * drift;
    pos.x += uMouse.x * (0.08 + aSeed * 0.05) * scan;
    pos.y += uMouse.y * 0.035 * scan + breath * scan;
    pos.z += sin(uTime * 0.7 + base.x * 4.0) * 0.035 * scan;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float size = 2.0 + frontier * 4.8 + aAccent * 1.4;
    gl_PointSize = size * uPixelRatio * (4.2 / max(1.1, -mvPosition.z));
    vLight = clamp(0.09 + scan * 0.76 + frontier * 0.7 + breath * 3.0, 0.0, 1.0);
    vAccent = aAccent;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying float vLight;
  varying float vAccent;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float d = length(center);
    float alpha = smoothstep(0.5, 0.08, d) * vLight;
    vec3 cyan = vec3(0.32, 0.95, 1.0);
    vec3 white = vec3(0.9, 1.0, 0.96);
    vec3 amber = vec3(1.0, 0.69, 0.28);
    vec3 violet = vec3(0.72, 0.58, 1.0);
    vec3 base = mix(cyan, white, vLight);
    vec3 accent = mix(amber, violet, step(0.78, vAccent));
    vec3 color = mix(base, accent, smoothstep(0.7, 1.0, vAccent) * 0.52);
    gl_FragColor = vec4(color, alpha);
  }
`;

type ParticleCloud = {
  positions: Float32Array;
  seeds: Float32Array;
  accents: Float32Array;
};

type ParticleErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ParticleErrorBoundaryState = {
  hasError: boolean;
};

class ParticleErrorBoundary extends Component<
  ParticleErrorBoundaryProps,
  ParticleErrorBoundaryState
> {
  state: ParticleErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ParticleErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Hero particle scene failed; using static fallback.', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function getWebGLAvailability() {
  if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(context);
  } catch {
    return false;
  }
}

function HeroCanvasFallback() {
  return <div className="hero__canvas-fallback" aria-hidden="true" />;
}

function createRandom(seed = 7) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function pushLineParticle(
  target: number[],
  from: THREE.Vector3,
  to: THREE.Vector3,
  t: number,
  jitter: number,
  random: () => number,
) {
  const point = from.clone().lerp(to, t);
  point.x += (random() - 0.5) * jitter;
  point.y += (random() - 0.5) * jitter;
  point.z += (random() - 0.5) * jitter;
  target.push(point.x, point.y, point.z);
}

function generateParticles(count: number): ParticleCloud {
  const random = createRandom(42);
  const rawPositions: number[] = [];
  const cubeCorners = [
    new THREE.Vector3(-1.25, -0.82, -0.62),
    new THREE.Vector3(1.25, -0.82, -0.62),
    new THREE.Vector3(1.25, 0.82, -0.62),
    new THREE.Vector3(-1.25, 0.82, -0.62),
    new THREE.Vector3(-1.25, -0.82, 0.62),
    new THREE.Vector3(1.25, -0.82, 0.62),
    new THREE.Vector3(1.25, 0.82, 0.62),
    new THREE.Vector3(-1.25, 0.82, 0.62),
  ];
  const cubeEdges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ] as const;

  for (let i = 0; i < count; i += 1) {
    const mode = random();

    if (mode < 0.42) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const cubeFactor = 0.68 + random() * 0.26;
      const radius = 0.48 + random() * 0.34;
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      const maxAxis = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
      rawPositions.push(
        (x / maxAxis) * radius * cubeFactor,
        (y / maxAxis) * radius * cubeFactor,
        (z / maxAxis) * radius * cubeFactor,
      );
    } else if (mode < 0.72) {
      const theta = random() * Math.PI * 2;
      const ring = random() > 0.45 ? 1.0 : 0.66;
      const radius = 1.05 * ring + Math.sin(theta * 3.0) * 0.05;
      const tilt = (random() - 0.5) * 0.22;
      rawPositions.push(
        Math.cos(theta) * radius,
        Math.sin(theta * 2.0) * 0.08 + tilt,
        Math.sin(theta) * radius * 0.42,
      );
    } else if (mode < 0.9) {
      const edge = cubeEdges[Math.floor(random() * cubeEdges.length)];
      pushLineParticle(
        rawPositions,
        cubeCorners[edge[0]],
        cubeCorners[edge[1]],
        random(),
        0.04,
        random,
      );
    } else {
      const y = -0.95 + random() * 1.9;
      const theta = random() * Math.PI * 2;
      const radius = 0.18 + random() * 1.05;
      rawPositions.push(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius * 0.48,
      );
    }
  }

  const positions = new Float32Array(rawPositions);
  const seeds = new Float32Array(count);
  const accents = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    seeds[i] = random();
    const y = positions[i * 3 + 1];
    const isRing = Math.abs(y) < 0.16 && random() > 0.45;
    accents[i] = isRing ? 0.86 + random() * 0.14 : random() * 0.68;
  }

  return { positions, seeds, accents };
}

type ScannerPointsProps = {
  count: number;
  reducedMotion: boolean;
};

function ScannerPoints({ count, reducedMotion }: ScannerPointsProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector2());
  const startTime = useRef<number | null>(null);
  const particleData = useMemo(() => generateParticles(count), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScan: { value: reducedMotion ? 1.8 : -1.55 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.8) },
      uMouse: { value: new THREE.Vector2() },
    }),
    [reducedMotion],
  );

  useFrame((state) => {
    if (!materialRef.current || !groupRef.current) {
      return;
    }

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime;
    }

    const scanStart = startTime.current;
    const elapsed = state.clock.elapsedTime - scanStart;
    mouse.current.lerp(state.pointer, 0.07);
    materialRef.current.uniforms.uMouse.value.copy(mouse.current);
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uScan.value = reducedMotion
      ? 1.8
      : THREE.MathUtils.clamp(-1.55 + elapsed * 0.72, -1.55, 1.7);
    groupRef.current.rotation.y = reducedMotion ? -0.18 : -0.18 + Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
    groupRef.current.rotation.x = reducedMotion ? 0.08 : 0.08 + Math.sin(state.clock.elapsedTime * 0.12) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[particleData.seeds, 1]} />
          <bufferAttribute attach="attributes-aAccent" args={[particleData.accents, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          args={[
            {
              uniforms,
              vertexShader,
              fragmentShader,
              transparent: true,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            },
          ]}
        />
      </points>
    </group>
  );
}

function HologramFrame({ reducedMotion }: { reducedMotion: boolean }) {
  const frameRef = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const points = [
      -1.35, -0.9, -0.7, 1.35, -0.9, -0.7,
      1.35, -0.9, -0.7, 1.35, 0.9, -0.7,
      1.35, 0.9, -0.7, -1.35, 0.9, -0.7,
      -1.35, 0.9, -0.7, -1.35, -0.9, -0.7,
      -1.35, -0.9, 0.7, 1.35, -0.9, 0.7,
      1.35, -0.9, 0.7, 1.35, 0.9, 0.7,
      1.35, 0.9, 0.7, -1.35, 0.9, 0.7,
      -1.35, 0.9, 0.7, -1.35, -0.9, 0.7,
      -1.35, -0.9, -0.7, -1.35, -0.9, 0.7,
      1.35, -0.9, -0.7, 1.35, -0.9, 0.7,
      1.35, 0.9, -0.7, 1.35, 0.9, 0.7,
      -1.35, 0.9, -0.7, -1.35, 0.9, 0.7,
    ];
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return buffer;
  }, []);

  useFrame((state) => {
    if (!frameRef.current || reducedMotion) {
      return;
    }
    frameRef.current.rotation.y = -0.18 + Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    frameRef.current.rotation.x = 0.08 + Math.sin(state.clock.elapsedTime * 0.14) * 0.03;
  });

  return (
    <lineSegments ref={frameRef} geometry={geometry}>
      <lineBasicMaterial color="#66f9ff" transparent opacity={0.16} />
    </lineSegments>
  );
}

type HeroParticleScannerProps = {
  content: SiteContent['hero'];
  isCompact: boolean;
};

export function HeroParticleScanner({ content, isCompact }: HeroParticleScannerProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const webGLAvailable = useMemo(getWebGLAvailability, []);
  const count = reducedMotion ? 1500 : isCompact ? 2600 : 5600;
  const sceneClassName = webGLAvailable ? 'hero__scene' : 'hero__scene hero__scene--static';

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className={sceneClassName} aria-hidden="true">
        {webGLAvailable ? (
          <ParticleErrorBoundary fallback={<HeroCanvasFallback />}>
            <Canvas
              camera={{ position: [0, 0, isCompact ? 5.2 : 4.2], fov: isCompact ? 52 : 46 }}
              dpr={isCompact ? [1, 1.25] : [1, 1.7]}
              fallback={<HeroCanvasFallback />}
              gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
              frameloop={reducedMotion ? 'demand' : 'always'}
            >
              <color attach="background" args={['#050607']} />
              <fog attach="fog" args={['#050607', 4.2, 7.5]} />
              <ScannerPoints count={count} reducedMotion={reducedMotion} />
              <HologramFrame reducedMotion={reducedMotion} />
            </Canvas>
          </ParticleErrorBoundary>
        ) : (
          <HeroCanvasFallback />
        )}
        <div className="hero__mesh" />
        <div className="hero__scanner-line" />
        <div className="hero__noise" />
        <div className="hero__telemetry hero__telemetry--left">
          <span>{content.telemetryLeft.label}</span>
          <strong>{content.telemetryLeft.value}</strong>
        </div>
        <div className="hero__telemetry hero__telemetry--right">
          <span>{content.telemetryRight.label}</span>
          <strong>{content.telemetryRight.value}</strong>
        </div>
      </div>

      <motion.div
        className="hero__content"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="hero__kicker">{content.kicker}</p>
        <h1 id="hero-title">{content.title}</h1>
        <p className="hero__subtitle">{content.subtitle}</p>
        <div className="hero__actions" aria-label={content.actionsLabel}>
          <a className="button button--primary" href="#projects">
            {content.primaryCta} <ArrowDownRight size={18} aria-hidden="true" />
          </a>
          <a className="button button--ghost" href="#lab">
            {content.secondaryCta} <FlaskConical size={18} aria-hidden="true" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
