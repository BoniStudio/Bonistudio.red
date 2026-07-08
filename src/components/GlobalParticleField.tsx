import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const fieldVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aSize;
  attribute float aTone;
  varying float vAlpha;
  varying float vTone;

  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.055 + aSeed * 16.0) * 0.05;
    pos.y += cos(uTime * 0.045 + aSeed * 11.0) * 0.08;
    pos.z += sin(uTime * 0.035 + aSeed * 9.0) * 0.05;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (5.6 / max(2.4, -mvPosition.z));
    vAlpha = 0.18 + aTone * 0.16;
    vTone = aTone;
  }
`;

const fieldFragmentShader = `
  precision mediump float;
  varying float vAlpha;
  varying float vTone;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(point);
    float alpha = smoothstep(0.5, 0.08, distanceToCenter) * vAlpha;
    vec3 white = vec3(0.86, 0.9, 0.9);
    vec3 cyan = vec3(0.0, 0.9, 1.0);
    vec3 lime = vec3(0.7, 1.0, 0.38);
    vec3 purple = vec3(0.66, 0.33, 0.97);
    vec3 accent = mix(cyan, lime, smoothstep(0.2, 0.58, vTone));
    accent = mix(accent, purple, smoothstep(0.72, 1.0, vTone) * 0.55);
    vec3 color = mix(white, accent, 0.34);
    gl_FragColor = vec4(color, alpha);
  }
`;

type FieldData = {
  positions: Float32Array;
  seeds: Float32Array;
  sizes: Float32Array;
  tones: Float32Array;
};

function getWebGLAvailability() {
  if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function createRandom(seed = 17) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createFieldData(count: number): FieldData {
  const random = createRandom(91);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const tones = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const depth = random();
    positions[i * 3] = (random() - 0.5) * 15.5;
    positions[i * 3 + 1] = (random() - 0.5) * 9.5;
    positions[i * 3 + 2] = -1.2 - depth * 5.8;
    seeds[i] = random();
    sizes[i] = 1.1 + random() * 2.2;
    tones[i] = random();
  }

  return { positions, seeds, sizes, tones };
}

function FieldPoints({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const data = useMemo(() => createFieldData(count), [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio, 1.35) },
    }),
    [],
  );

  useFrame((state) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value = reducedMotion
      ? 0
      : state.clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seeds, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
        <bufferAttribute attach="attributes-aTone" args={[data.tones, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[
          {
            uniforms,
            vertexShader: fieldVertexShader,
            fragmentShader: fieldFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          },
        ]}
      />
    </points>
  );
}

type GlobalParticleFieldProps = {
  isCompact: boolean;
};

export function GlobalParticleField({ isCompact }: GlobalParticleFieldProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const webGLAvailable = useMemo(getWebGLAvailability, []);
  const count = reducedMotion ? 320 : isCompact ? 720 : 1800;

  if (!webGLAvailable) {
    return null;
  }

  return (
    <div className="global-particle-field" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 48 }}
        dpr={isCompact ? [1, 1.1] : [1, 1.35]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <FieldPoints count={count} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
