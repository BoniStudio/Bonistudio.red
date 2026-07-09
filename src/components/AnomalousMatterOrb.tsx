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

const orbVertexShader = `
  precision highp float;

  uniform float uTime;
  uniform float uScan;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vNoise;
  varying float vRidge;
  varying float vScan;

  ${sharedNoise}

  void main() {
    vec3 direction = normalize(position);
    float longitude = atan(direction.z, direction.x);
    float low = snoise(direction * 1.85 + vec3(uTime * 0.08, -uTime * 0.05, uTime * 0.04));
    float mid = snoise(direction * 4.7 + vec3(-uTime * 0.12, uTime * 0.08, uTime * 0.03));
    float high = snoise(direction * 10.2 + vec3(uTime * 0.16, uTime * 0.03, -uTime * 0.11));
    float wave = sin(longitude * 6.0 + direction.y * 8.0 + uTime * 0.72) * 0.052;
    float ridge = pow(abs(sin(longitude * 5.0 + low * 3.2 + uTime * 0.42)), 5.0);
    float displacement = low * 0.2 + mid * 0.095 + high * 0.026 + wave + ridge * 0.09;

    vec3 transformed = position + normal * displacement;
    transformed.x += uMouse.x * 0.03;
    transformed.y += uMouse.y * 0.02;

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

    vNormal = normalize(normalMatrix * normalize(normal + direction * displacement));
    vWorldPosition = worldPosition.xyz;
    vNoise = low * 0.5 + 0.5;
    vRidge = ridge;
    vScan = 1.0 - smoothstep(0.0, 0.075, abs(direction.y - uScan));

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const orbFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 pointLightPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vNoise;
  varying float vRidge;
  varying float vScan;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(pointLightPosition - vWorldPosition);
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float rim = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.45);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.58 + vNoise * 7.0);

    vec3 graphite = vec3(0.09, 0.105, 0.12);
    vec3 silver = vec3(0.82, 0.9, 0.94);
    vec3 cyan = vec3(0.42, 0.91, 1.0);
    vec3 blue = vec3(0.34, 0.52, 0.94);
    vec3 violet = vec3(0.55, 0.44, 0.86);

    vec3 color = mix(graphite, silver, 0.28 + diffuse * 0.38 + vRidge * 0.3);
    color = mix(color, cyan, rim * 0.18 + vScan * 0.16);
    color = mix(color, blue, vNoise * 0.12);
    color = mix(color, violet, pulse * 0.045);

    float alpha = uOpacity * (0.15 + diffuse * 0.18 + rim * 0.36 + vRidge * 0.16 + vScan * 0.18);
    gl_FragColor = vec4(color, alpha);
  }
`;

const pointVertexShader = `
  precision highp float;

  uniform float uTime;
  uniform float uScan;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vNoise;
  varying float vRidge;
  varying float vScan;

  ${sharedNoise}

  void main() {
    vec3 direction = normalize(position);
    float longitude = atan(direction.z, direction.x);
    float low = snoise(direction * 1.85 + vec3(uTime * 0.08, -uTime * 0.05, uTime * 0.04));
    float mid = snoise(direction * 5.0 + vec3(-uTime * 0.11, uTime * 0.08, uTime * 0.04));
    float high = snoise(direction * 12.0 + vec3(uTime * 0.14, uTime * 0.03, -uTime * 0.1));
    float ridge = pow(abs(sin(longitude * 5.0 + low * 3.2 + uTime * 0.42)), 5.0);
    float displacement = low * 0.22 + mid * 0.11 + high * 0.035 + ridge * 0.11;
    vec3 transformed = position + normal * displacement;
    transformed.x += uMouse.x * 0.035;
    transformed.y += uMouse.y * 0.024;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vNoise = low * 0.5 + 0.5;
    vRidge = ridge;
    vScan = 1.0 - smoothstep(0.0, 0.075, abs(direction.y - uScan));
    vAlpha = 0.18 + vNoise * 0.26 + ridge * 0.3 + vScan * 0.36;
    gl_PointSize = (0.95 + vRidge * 1.35 + vScan * 1.7) * uPixelRatio * (4.6 / max(2.25, -mvPosition.z));
  }
`;

const pointFragmentShader = `
  precision highp float;

  varying float vAlpha;
  varying float vNoise;
  varying float vRidge;
  varying float vScan;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float dotShape = smoothstep(0.48, 0.08, length(point));
    vec3 silver = vec3(0.86, 0.94, 0.98);
    vec3 cyan = vec3(0.42, 0.91, 1.0);
    vec3 violet = vec3(0.55, 0.44, 0.86);
    vec3 color = mix(silver, cyan, vRidge * 0.22 + vScan * 0.2);
    color = mix(color, violet, smoothstep(0.66, 1.0, vNoise) * 0.12);
    gl_FragColor = vec4(color, dotShape * vAlpha);
  }
`;

type AnomalousMatterOrbProps = {
  className?: string;
  isCompact?: boolean;
  reducedMotion?: boolean;
};

type OrbUniforms = {
  uTime: { value: number };
  uScan: { value: number };
  uMouse: { value: THREE.Vector2 };
  uPixelRatio: { value: number };
  uOpacity: { value: number };
  pointLightPosition: { value: THREE.Vector3 };
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

function createHaloGeometry(radius: number) {
  const positions: number[] = [];
  const segmentCount = 196;
  const random = createSeededRandom(921);
  const tilts = [
    { x: 0.18, y: 0.08, z: -0.14, scale: 0.72 },
    { x: -0.2, y: 0.18, z: 0.54, scale: 0.6 },
    { x: 0.1, y: -0.12, z: 1.12, scale: 0.84 },
    { x: -0.38, y: 0.06, z: -0.64, scale: 0.54 },
  ];

  tilts.forEach((tilt, ringIndex) => {
    const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(tilt.x, tilt.y, tilt.z));
    const wobble = 0.04 + random() * 0.035;

    for (let i = 0; i < segmentCount; i += 1) {
      const a = (i / segmentCount) * Math.PI * 2;
      const b = ((i + 1) / segmentCount) * Math.PI * 2;
      const waveA = Math.sin(a * (3 + ringIndex) + ringIndex) * wobble;
      const waveB = Math.sin(b * (3 + ringIndex) + ringIndex) * wobble;
      const pointA = new THREE.Vector3(
        Math.cos(a) * (radius + waveA),
        Math.sin(a * 2.0 + ringIndex) * wobble,
        Math.sin(a) * (radius * tilt.scale + waveA),
      ).applyMatrix4(matrix);
      const pointB = new THREE.Vector3(
        Math.cos(b) * (radius + waveB),
        Math.sin(b * 2.0 + ringIndex) * wobble,
        Math.sin(b) * (radius * tilt.scale + waveB),
      ).applyMatrix4(matrix);

      positions.push(pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createFilamentGeometry(radius: number, segmentCount: number) {
  const random = createSeededRandom(404);
  const positions: number[] = [];

  for (let i = 0; i < segmentCount; i += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const length = 0.16 + random() * 0.34;
    const start = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    ).multiplyScalar(radius * (0.64 + random() * 0.42));
    const tangent = new THREE.Vector3(-start.z, start.y * 0.2, start.x).normalize();
    const end = start.clone().add(tangent.multiplyScalar(length));

    positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
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
      camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0, isCompact ? 5.4 : 5.0);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isCompact,
        powerPreference: isCompact ? 'low-power' : 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.15 : 1.5));
      renderer.domElement.setAttribute('aria-hidden', 'true');
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      group.rotation.set(0.12, -0.42, -0.06);
      scene.add(group);

      const radius = 1.42;
      const detail = reducedMotion ? 4 : isCompact ? 5 : 6;
      const orbGeometry = new THREE.IcosahedronGeometry(radius, detail);
      const haloGeometry = createHaloGeometry(radius * 1.23);
      const filamentGeometry = createFilamentGeometry(radius, isCompact ? 62 : 108);
      geometries.push(orbGeometry, haloGeometry, filamentGeometry);

      const uniforms: OrbUniforms = {
        uTime: { value: 0 },
        uScan: { value: -0.7 },
        uMouse: { value: new THREE.Vector2() },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, isCompact ? 1.15 : 1.5) },
        uOpacity: { value: isCompact ? 0.72 : 0.82 },
        pointLightPosition: { value: new THREE.Vector3(2.3, 1.9, 3.2) },
      };

      const meshMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: orbVertexShader,
        fragmentShader: orbFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        wireframe: true,
      });
      const pointMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: pointVertexShader,
        fragmentShader: pointFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const haloMaterial = new THREE.LineBasicMaterial({
        color: 0xcfeeff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      });
      const filamentMaterial = new THREE.LineBasicMaterial({
        color: 0x8fdfff,
        transparent: true,
        opacity: 0.09,
        blending: THREE.AdditiveBlending,
      });
      materials.push(meshMaterial, pointMaterial, haloMaterial, filamentMaterial);

      const orbMesh = new THREE.Mesh(orbGeometry, meshMaterial);
      const points = new THREE.Points(orbGeometry, pointMaterial);
      const halos = new THREE.LineSegments(haloGeometry, haloMaterial);
      const filaments = new THREE.LineSegments(filamentGeometry, filamentMaterial);
      group.add(filaments, halos, orbMesh, points);

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
        pointer.lerp(targetPointer, 0.04);
        uniforms.uTime.value = reducedMotion ? 0 : time;
        uniforms.uMouse.value.copy(pointer);
        uniforms.uScan.value = Math.sin(time * 0.34) * 0.82;
        uniforms.pointLightPosition.value.set(2.25 + pointer.x * 0.72, 1.8 + pointer.y * 0.46, 3.1);

        group.rotation.y = -0.42 + (reducedMotion ? 0 : time * 0.04) + pointer.x * 0.06;
        group.rotation.x = 0.12 + pointer.y * 0.04;
        halos.rotation.z = reducedMotion ? -0.06 : -0.06 + time * 0.016;
        filaments.rotation.y = reducedMotion ? 0 : Math.sin(time * 0.12) * 0.035;

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
