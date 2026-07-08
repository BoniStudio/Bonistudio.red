import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowDownRight, FlaskConical } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Component, useMemo, useRef, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { SiteContent } from '../i18n/content';

const earthVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  attribute float aSeed;
  attribute float aTone;
  attribute float aDetach;
  attribute float aSignal;
  varying float vAlpha;
  varying float vTone;
  varying float vSignal;
  varying float vDetach;

  void main() {
    vec3 direction = normalize(position);
    vec3 tangent = normalize(cross(direction, vec3(0.0, 1.0, 0.0)) + vec3(0.001, 0.0, 0.0));
    vec3 side = normalize(cross(direction, tangent));
    float lane = sin((direction.x * 10.0) + (direction.y * 18.0) + uTime * 0.68 + aSeed * 7.0);
    float pulse = sin(uTime * (0.32 + aTone * 0.5) + aSeed * 19.0);
    float stream = smoothstep(0.45, 1.0, lane) * (0.012 + aSignal * 0.025);
    float breathing = pulse * (0.006 + aDetach * 0.035);

    vec3 pos = position;
    pos += tangent * (stream + breathing);
    pos += side * sin(uTime * 0.2 + aSeed * 13.0) * 0.008;
    pos += direction * (sin(uTime * 0.42 + aSeed * 23.0) * 0.012 + aDetach * 0.04);
    pos.x += uMouse.x * (0.035 + aDetach * 0.055);
    pos.y += uMouse.y * (0.022 + aDetach * 0.035);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float distanceScale = 5.2 / max(2.1, -mvPosition.z);
    float pointSize = mix(1.2, 2.55, aSignal) + aDetach * 0.68 + stream * 44.0;
    gl_PointSize = pointSize * uPixelRatio * distanceScale;
    vAlpha = (0.34 + aSignal * 0.62 + stream * 5.2) * (1.0 - aDetach * 0.22);
    vTone = aTone;
    vSignal = aSignal;
    vDetach = aDetach;
  }
`;

const earthFragmentShader = `
  precision mediump float;
  varying float vAlpha;
  varying float vTone;
  varying float vSignal;
  varying float vDetach;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float d = length(point);
    float softDot = smoothstep(0.5, 0.08, d);
    float core = smoothstep(0.26, 0.0, d);
    vec3 white = vec3(0.9, 0.96, 0.95);
    vec3 graphite = vec3(0.34, 0.39, 0.4);
    vec3 cyan = vec3(0.0, 0.9, 1.0);
    vec3 lime = vec3(0.71, 1.0, 0.36);
    vec3 purple = vec3(0.66, 0.33, 0.97);
    vec3 amber = vec3(0.96, 0.62, 0.08);
    vec3 accent = mix(cyan, lime, smoothstep(0.18, 0.48, vTone));
    accent = mix(accent, purple, smoothstep(0.52, 0.78, vTone) * 0.7);
    accent = mix(accent, amber, smoothstep(0.84, 1.0, vTone) * 0.55);
    vec3 base = mix(graphite, white, 0.42 + vSignal * 0.42);
    vec3 color = mix(base, accent, 0.2 + vSignal * 0.28 + vDetach * 0.12);
    float alpha = softDot * vAlpha + core * 0.16;
    gl_FragColor = vec4(color, alpha);
  }
`;

type EarthParticleData = {
  positions: Float32Array;
  seeds: Float32Array;
  tones: Float32Array;
  detaches: Float32Array;
  signals: Float32Array;
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
    console.error('Particle earth scene failed; using static fallback.', error, errorInfo.componentStack);
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

function createRandom(seed = 7) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function signalFromDirection(direction: THREE.Vector3) {
  const longitude = Math.atan2(direction.z, direction.x);
  const latitude = Math.asin(direction.y);
  const wave =
    Math.sin(longitude * 2.4 + latitude * 6.2) +
    Math.sin(longitude * 5.7 - latitude * 3.1) * 0.62 +
    Math.cos(longitude * 8.8 + latitude * 1.7) * 0.38;
  return THREE.MathUtils.clamp((wave + 1.55) / 3.1, 0.05, 1);
}

function createEarthParticleData(count: number): EarthParticleData {
  const random = createRandom(137);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const tones = new Float32Array(count);
  const detaches = new Float32Array(count);
  const signals = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const direction = new THREE.Vector3();

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * goldenAngle;
    direction.set(Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY).normalize();

    const signal = signalFromDirection(direction);
    const detach = random() > 0.925 ? random() : 0;
    const radius = detach > 0
      ? 1.5 + detach * 0.72 + random() * 0.08
      : 1.42 + (signal - 0.5) * 0.025 + random() * 0.018;
    const jitter = detach > 0 ? 0.03 + detach * 0.04 : 0.006;

    positions[i * 3] = direction.x * radius + (random() - 0.5) * jitter;
    positions[i * 3 + 1] = direction.y * radius + (random() - 0.5) * jitter;
    positions[i * 3 + 2] = direction.z * radius + (random() - 0.5) * jitter;
    seeds[i] = random();
    tones[i] = random();
    detaches[i] = detach;
    signals[i] = Math.pow(signal, 1.45);
  }

  return { positions, seeds, tones, detaches, signals };
}

function getEarthParticleCount(isCompact: boolean, reducedMotion: boolean) {
  if (reducedMotion) {
    return 14000;
  }

  if (isCompact) {
    return 42000;
  }

  if (typeof navigator === 'undefined') {
    return 120000;
  }

  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = 'deviceMemory' in navigator ? Number(navigator.deviceMemory) : 8;

  if (cores <= 4 || memory <= 4) {
    return 86000;
  }

  return 180000;
}

function createConnectionGeometry(segmentCount: number) {
  const random = createRandom(404);
  const positions: number[] = [];
  const radius = 1.53;

  for (let i = 0; i < segmentCount; i += 1) {
    const latA = (random() - 0.5) * Math.PI * 0.92;
    const lonA = random() * Math.PI * 2;
    const latB = THREE.MathUtils.clamp(latA + (random() - 0.5) * 0.7, -1.2, 1.2);
    const lonB = lonA + (random() - 0.5) * 0.95;
    const a = new THREE.Vector3(
      Math.cos(latA) * Math.cos(lonA),
      Math.sin(latA),
      Math.cos(latA) * Math.sin(lonA),
    ).multiplyScalar(radius + random() * 0.05);
    const b = new THREE.Vector3(
      Math.cos(latB) * Math.cos(lonB),
      Math.sin(latB),
      Math.cos(latB) * Math.sin(lonB),
    ).multiplyScalar(radius + random() * 0.05);

    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function HeroCanvasFallback() {
  return (
    <div className="particle-earth-fallback" aria-hidden="true">
      {Array.from({ length: 96 }).map((_, index) => (
        <span key={index} style={{ '--fallback-index': index } as CSSProperties} />
      ))}
    </div>
  );
}

function ParticleEarth({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2());
  const particleData = useMemo(() => createEarthParticleData(count), [count]);
  const lineGeometry = useMemo(() => createConnectionGeometry(count > 100000 ? 150 : 82), [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio, 1.65) },
      uMouse: { value: new THREE.Vector2() },
    }),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current || !materialRef.current) {
      return;
    }

    mouse.current.lerp(state.pointer, 0.045);
    materialRef.current.uniforms.uMouse.value.copy(mouse.current);
    materialRef.current.uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    groupRef.current.rotation.y = -0.32 + state.clock.elapsedTime * (reducedMotion ? 0 : 0.045) + mouse.current.x * 0.08;
    groupRef.current.rotation.x = 0.08 + mouse.current.y * 0.045;
    groupRef.current.rotation.z = -0.08;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#8beeff" transparent opacity={0.16} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[particleData.seeds, 1]} />
          <bufferAttribute attach="attributes-aTone" args={[particleData.tones, 1]} />
          <bufferAttribute attach="attributes-aDetach" args={[particleData.detaches, 1]} />
          <bufferAttribute attach="attributes-aSignal" args={[particleData.signals, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          args={[
            {
              uniforms,
              vertexShader: earthVertexShader,
              fragmentShader: earthFragmentShader,
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

function HeroBrandTitle({ title, reducedMotion }: { title: string; reducedMotion: boolean }) {
  return (
    <h1 id="hero-title" aria-label={title}>
      {Array.from(title).map((letter, index) => {
        const className = [
          'hero-title__letter',
          letter === 'B' ? 'hero-title__letter--b' : '',
          letter === 'S' ? 'hero-title__letter--s' : '',
        ].filter(Boolean).join(' ');

        return (
          <motion.span
            aria-hidden="true"
            className={className}
            initial={reducedMotion ? false : { opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.62, delay: 0.18 + index * 0.035, ease: [0.22, 1, 0.36, 1] }}
            key={`${letter}-${index}`}
          >
            {letter}
          </motion.span>
        );
      })}
    </h1>
  );
}

type HeroParticleScannerProps = {
  content: SiteContent['hero'];
  isCompact: boolean;
};

export function HeroParticleScanner({ content, isCompact }: HeroParticleScannerProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const webGLAvailable = useMemo(getWebGLAvailability, []);
  const count = getEarthParticleCount(isCompact, reducedMotion);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__layout">
        <motion.div
          className="hero__copy"
          initial={reducedMotion ? false : { opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hero__kicker">{content.kicker}</p>
          <HeroBrandTitle title={content.title} reducedMotion={reducedMotion} />
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

        <motion.div
          className="hero__visual"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96, filter: 'blur(14px)' }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={webGLAvailable ? 'particle-earth-shell' : 'particle-earth-shell particle-earth-shell--static'}>
            {webGLAvailable ? (
              <ParticleErrorBoundary fallback={<HeroCanvasFallback />}>
                <Canvas
                  camera={{ position: [0, 0, isCompact ? 5.2 : 4.6], fov: isCompact ? 45 : 39 }}
                  dpr={isCompact ? [1, 1.15] : [1, 1.55]}
                  fallback={<HeroCanvasFallback />}
                  gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                  frameloop={reducedMotion ? 'demand' : 'always'}
                >
                  <ParticleEarth count={count} reducedMotion={reducedMotion} />
                </Canvas>
              </ParticleErrorBoundary>
            ) : (
              <HeroCanvasFallback />
            )}
            <div className="particle-earth-shell__scan" />
            <div className="particle-earth-shell__axis" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero__stats"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.76, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {content.stats.map((stat) => (
          <div className={`hero-stat hero-stat--${stat.tone}`} key={`${stat.label}-${stat.value}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
