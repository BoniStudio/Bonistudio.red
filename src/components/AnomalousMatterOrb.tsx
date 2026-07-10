import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const sharedNoise = `
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 10.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 c = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 d = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, c.yyy));
    vec3 x0 = v - i + dot(i, c.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + c.xxx;
    vec3 x2 = x0 - i2 + c.yyy;
    vec3 x3 = x0 - d.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * d.wyz - d.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const surfaceVertexShader = `
  precision highp float;

  uniform float uTime;
  uniform float uDisplacement;
  uniform vec2 uMouse;
  varying vec3 vDirection;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vSurfaceNoise;
  varying float vFold;

  ${sharedNoise}

  void main() {
    vec3 direction = normalize(position);
    float low = snoise(direction * 1.55 + vec3(uTime * 0.045, -uTime * 0.035, uTime * 0.025));
    float mid = snoise(direction * 3.8 + vec3(-uTime * 0.075, uTime * 0.052, uTime * 0.03));
    float high = snoise(direction * 8.4 + vec3(uTime * 0.105, uTime * 0.032, -uTime * 0.08));
    float fold = pow(abs(sin(low * 3.2 + mid * 2.1 + direction.y * 4.8 + uTime * 0.22)), 3.2);
    float slowWave = sin(direction.x * 4.1 + direction.z * 3.4 + low * 2.8 + uTime * 0.18) * 0.045;
    float displacement = (low * 0.58 + mid * 0.3 + high * 0.1 + fold * 0.3 + slowWave) * uDisplacement;

    vec3 transformed = position + normal * displacement;
    transformed.x += uMouse.x * 0.022;
    transformed.y += uMouse.y * 0.016;

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

    vDirection = direction;
    vNormal = normalize(normalMatrix * normalize(normal + direction * displacement));
    vWorldPosition = worldPosition.xyz;
    vSurfaceNoise = low * 0.5 + 0.5;
    vFold = fold;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const surfaceFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uOpacity;
  uniform float uLineGain;
  uniform vec3 pointLightPosition;
  varying vec3 vDirection;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vSurfaceNoise;
  varying float vFold;

  ${sharedNoise}

  float contourLine(float field, float target, float width) {
    return smoothstep(width, 0.0, abs(field - target));
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(pointLightPosition - vWorldPosition);
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.15);

    vec3 flow = vDirection + vec3(
      snoise(vDirection * 2.1 + vec3(uTime * 0.08, 0.0, 0.0)),
      snoise(vDirection * 2.4 + vec3(0.0, -uTime * 0.07, 0.0)),
      snoise(vDirection * 2.0 + vec3(0.0, 0.0, uTime * 0.05))
    ) * 0.18;

    float fieldA = snoise(flow * 3.1 + vec3(uTime * 0.12, -uTime * 0.045, uTime * 0.03));
    float fieldB = snoise(flow * 6.2 + vec3(-uTime * 0.07, uTime * 0.1, -uTime * 0.055));
    float fieldC = snoise(flow * 10.0 + vec3(uTime * 0.05, uTime * 0.025, -uTime * 0.09));
    float field = fieldA * 0.66 + fieldB * 0.27 + fieldC * 0.12;

    float filament =
      contourLine(field, 0.18, 0.035) * 0.9 +
      contourLine(field, -0.24, 0.028) * 0.62 +
      contourLine(fieldB + fieldA * 0.28, 0.36, 0.03) * 0.38;
    filament *= smoothstep(0.08, 0.78, vFold + vSurfaceNoise * 0.55);

    float innerGlow = smoothstep(0.48, 0.95, fieldA * 0.5 + 0.5) * 0.18;
    float microDensity = 0.38 + vSurfaceNoise * 0.32 + vFold * 0.2;

    vec3 graphite = vec3(0.055, 0.06, 0.066);
    vec3 smoke = vec3(0.33, 0.35, 0.36);
    vec3 silver = vec3(0.78, 0.82, 0.82);
    vec3 white = vec3(0.96, 0.98, 0.98);
    vec3 softCyan = vec3(0.62, 0.88, 0.94);

    vec3 base = mix(graphite, smoke, microDensity);
    base = mix(base, silver, diffuse * 0.26 + fresnel * 0.22);
    vec3 energy = mix(white, softCyan, 0.12);
    vec3 color = base + energy * filament * (0.62 * uLineGain);
    color += white * (innerGlow + fresnel * 0.12);

    float alpha = uOpacity * (0.2 + diffuse * 0.07 + fresnel * 0.38 + vFold * 0.1 + filament * 0.32 * uLineGain);
    gl_FragColor = vec4(color, alpha);
  }
`;

const pointVertexShader = `
  precision highp float;

  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vTone;

  ${sharedNoise}

  void main() {
    vec3 direction = normalize(position);
    float low = snoise(direction * 1.7 + vec3(uTime * 0.04, -uTime * 0.03, uTime * 0.02));
    float mid = snoise(direction * 5.2 + vec3(-uTime * 0.07, uTime * 0.04, -uTime * 0.055));
    float fold = pow(abs(sin(low * 3.0 + mid * 1.8 + direction.y * 4.2 + uTime * 0.18)), 3.0);
    vec3 transformed = direction * (1.13 + low * 0.064 + mid * 0.03 + fold * 0.05 + (aSeed - 0.5) * 0.016);
    transformed.x += uMouse.x * 0.024;
    transformed.y += uMouse.y * 0.017;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vTone = low * 0.5 + 0.5;
    vAlpha = 0.15 + vTone * 0.23 + fold * 0.18;
    gl_PointSize = (0.4 + fold * 0.32 + aSeed * 0.14) * uPixelRatio * (5.0 / max(2.4, -mvPosition.z));
  }
`;

const pointFragmentShader = `
  precision highp float;

  varying float vAlpha;
  varying float vTone;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float dotShape = smoothstep(0.5, 0.06, length(point));
    vec3 gray = vec3(0.68, 0.7, 0.7);
    vec3 white = vec3(0.94, 0.96, 0.96);
    vec3 color = mix(gray, white, smoothstep(0.38, 0.9, vTone));
    gl_FragColor = vec4(color, dotShape * vAlpha);
  }
`;

type AnomalousMatterOrbProps = {
  className?: string;
  isCompact?: boolean;
  reducedMotion?: boolean;
};

type SurfaceUniforms = {
  uTime: { value: number };
  uDisplacement: { value: number };
  uMouse: { value: THREE.Vector2 };
  uOpacity: { value: number };
  uLineGain: { value: number };
  pointLightPosition: { value: THREE.Vector3 };
};

type PointUniforms = {
  uTime: { value: number };
  uPixelRatio: { value: number };
  uMouse: { value: THREE.Vector2 };
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

function createSeededRandom(seed = 2718) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createSurfaceParticleGeometry(count: number) {
  const random = createSeededRandom(908);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * goldenAngle + (random() - 0.5) * 0.018;
    const radius = 1 + (random() - 0.5) * 0.018;

    positions[i * 3] = Math.cos(theta) * radiusAtY * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
    seeds[i] = random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

function createSurfaceUniforms(opacity: number, displacement: number, lineGain: number): SurfaceUniforms {
  return {
    uTime: { value: 0 },
    uDisplacement: { value: displacement },
    uMouse: { value: new THREE.Vector2() },
    uOpacity: { value: opacity },
    uLineGain: { value: lineGain },
    pointLightPosition: { value: new THREE.Vector3(2.1, 1.65, 3.2) },
  };
}

export function AnomalousMatterOrb({
  className = '',
  isCompact = false,
  reducedMotion = false,
}: AnomalousMatterOrbProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount || !getWebGLAvailability()) {
      setFallback(true);
      return undefined;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let usesWindowResize = false;
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();

    const syncSize = () => {
      if (!renderer || !camera) {
        return;
      }

      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const cleanup = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      resizeObserver?.disconnect();
      if (usesWindowResize) {
        window.removeEventListener('resize', syncSize);
      }
      window.removeEventListener('pointermove', handlePointerMove);

      materials.forEach((material) => material.dispose());
      geometries.forEach((geometry) => geometry.dispose());

      if (renderer) {
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer = null;
      }
    };

    function handlePointerMove(event: PointerEvent) {
      targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetPointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    }

    try {
      const scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
      camera.position.set(0, 0, isCompact ? 5.45 : 5.15);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isCompact,
        powerPreference: isCompact ? 'low-power' : 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.12 : 1.42));
      renderer.domElement.setAttribute('aria-hidden', 'true');
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      group.rotation.set(0.1, -0.34, -0.04);
      scene.add(group);

      const surfaceSegments = reducedMotion ? 96 : isCompact ? 112 : 160;
      const coreGeometry = new THREE.SphereGeometry(1.13, surfaceSegments, surfaceSegments);
      const shellGeometry = new THREE.SphereGeometry(1.13, isCompact ? 104 : 152, isCompact ? 104 : 152);
      const pointGeometry = createSurfaceParticleGeometry(reducedMotion ? 9000 : isCompact ? 14000 : 32000);
      geometries.push(coreGeometry, shellGeometry, pointGeometry);

      const coreUniforms = createSurfaceUniforms(isCompact ? 0.42 : 0.5, 0.13, 1.34);
      const shellUniforms = createSurfaceUniforms(isCompact ? 0.09 : 0.12, 0.2, 0.5);
      const pointUniforms: PointUniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, isCompact ? 1.12 : 1.42) },
        uMouse: { value: new THREE.Vector2() },
      };

      const coreMaterial = new THREE.ShaderMaterial({
        uniforms: coreUniforms,
        vertexShader: surfaceVertexShader,
        fragmentShader: surfaceFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.FrontSide,
      });
      const shellMaterial = new THREE.ShaderMaterial({
        uniforms: shellUniforms,
        vertexShader: surfaceVertexShader,
        fragmentShader: surfaceFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.FrontSide,
      });
      const pointMaterial = new THREE.ShaderMaterial({
        uniforms: pointUniforms,
        vertexShader: pointVertexShader,
        fragmentShader: pointFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      materials.push(coreMaterial, shellMaterial, pointMaterial);

      const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
      shellMesh.scale.setScalar(1.1);
      const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
      const microPoints = new THREE.Points(pointGeometry, pointMaterial);
      microPoints.scale.setScalar(1.03);
      group.add(shellMesh, coreMesh, microPoints);

      syncSize();
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(syncSize);
        resizeObserver.observe(mount);
      } else {
        usesWindowResize = true;
        window.addEventListener('resize', syncSize, { passive: true });
      }

      window.addEventListener('pointermove', handlePointerMove, { passive: true });

      const animate = (elapsedMs: number) => {
        const time = elapsedMs * 0.001;
        pointer.lerp(targetPointer, 0.035);
        const animatedTime = reducedMotion ? 0 : time;

        coreUniforms.uTime.value = animatedTime;
        shellUniforms.uTime.value = animatedTime;
        pointUniforms.uTime.value = animatedTime;
        coreUniforms.uMouse.value.copy(pointer);
        shellUniforms.uMouse.value.copy(pointer);
        pointUniforms.uMouse.value.copy(pointer);
        coreUniforms.pointLightPosition.value.set(2.05 + pointer.x * 0.5, 1.55 + pointer.y * 0.36, 3.15);
        shellUniforms.pointLightPosition.value.copy(coreUniforms.pointLightPosition.value);

        group.rotation.y = -0.34 + (reducedMotion ? 0 : time * 0.028) + pointer.x * 0.045;
        group.rotation.x = 0.1 + pointer.y * 0.032;
        shellMesh.rotation.y = reducedMotion ? 0 : -time * 0.016;
        shellMesh.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.11) * 0.025;
        microPoints.rotation.y = reducedMotion ? 0 : time * 0.018;

        if (renderer && camera) {
          renderer.render(scene, camera);
        }

        if (!reducedMotion) {
          frameRef.current = window.requestAnimationFrame(animate);
        }
      };

      frameRef.current = window.requestAnimationFrame(animate);
      setFallback(false);
      return cleanup;
    } catch (error) {
      console.error('Anomalous orb renderer unavailable.', error);
      cleanup();
      setFallback(true);
      return undefined;
    }
  }, [isCompact, reducedMotion]);

  return (
    <div className={`anomalous-orb ${fallback ? 'anomalous-orb--fallback' : ''} ${className}`}>
      <div className="anomalous-orb__mount" ref={mountRef} aria-hidden="true" />
      {fallback ? <div className="anomalous-orb__fallback" aria-hidden="true" /> : null}
    </div>
  );
}
