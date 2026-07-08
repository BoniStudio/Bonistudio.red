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

const globeVertexShader = `
  precision highp float;
  uniform float uTime;
  uniform float uScan;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vNoise;
  varying float vScan;

  ${sharedNoise}

  void main() {
    vec3 direction = normalize(position);
    float lowNoise = snoise(direction * 2.8 + vec3(uTime * 0.08, -uTime * 0.04, uTime * 0.05));
    float highNoise = snoise(direction * 8.6 + vec3(-uTime * 0.11, uTime * 0.07, uTime * 0.04));
    float latitudeBand = pow(abs(sin(direction.y * 19.0)), 8.0) * 0.015;
    float displacement = lowNoise * 0.075 + highNoise * 0.025 + latitudeBand;

    vec3 transformed = position + normal * displacement;
    transformed.x += uMouse.x * 0.018;
    transformed.y += uMouse.y * 0.012;

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

    vNormal = normalize(normalMatrix * normalize(normal + direction * displacement));
    vWorldPosition = worldPosition.xyz;
    vNoise = lowNoise * 0.5 + 0.5;
    vScan = 1.0 - smoothstep(0.0, 0.08, abs(direction.y - uScan));

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const globeFragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec3 pointLightPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vNoise;
  varying float vScan;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(pointLightPosition - vWorldPosition);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float rim = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.2);
    float dataPulse = 0.5 + 0.5 * sin(uTime * 0.8 + vNoise * 8.0);

    vec3 deep = vec3(0.03, 0.08, 0.12);
    vec3 cyan = vec3(0.41, 0.91, 1.0);
    vec3 blue = vec3(0.30, 0.55, 1.0);
    vec3 violet = vec3(0.56, 0.42, 1.0);
    vec3 cool = mix(cyan, blue, smoothstep(0.25, 0.9, vNoise));
    cool = mix(cool, violet, rim * 0.24);
    vec3 color = mix(deep, cool, 0.28 + diffuse * 0.34 + rim * 0.42 + vScan * 0.34);
    color += cyan * vScan * (0.18 + dataPulse * 0.12);

    float alpha = 0.16 + diffuse * 0.18 + rim * 0.26 + vScan * 0.18;
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
  varying float vScan;
  varying float vNoise;

  ${sharedNoise}

  void main() {
    vec3 direction = normalize(position);
    float lowNoise = snoise(direction * 2.8 + vec3(uTime * 0.08, -uTime * 0.04, uTime * 0.05));
    float highNoise = snoise(direction * 10.0 + vec3(uTime * 0.04, uTime * 0.12, -uTime * 0.08));
    vec3 transformed = position + normal * (lowNoise * 0.095 + highNoise * 0.026);
    transformed.x += uMouse.x * 0.02;
    transformed.y += uMouse.y * 0.014;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vScan = 1.0 - smoothstep(0.0, 0.08, abs(direction.y - uScan));
    vNoise = lowNoise * 0.5 + 0.5;
    vAlpha = 0.22 + vNoise * 0.34 + vScan * 0.46;
    gl_PointSize = (1.1 + vNoise * 1.4 + vScan * 2.4) * uPixelRatio * (4.8 / max(2.1, -mvPosition.z));
  }
`;

const pointFragmentShader = `
  precision highp float;
  varying float vAlpha;
  varying float vScan;
  varying float vNoise;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float dotShape = smoothstep(0.5, 0.08, length(point));
    vec3 cyan = vec3(0.41, 0.91, 1.0);
    vec3 blue = vec3(0.30, 0.55, 1.0);
    vec3 color = mix(cyan, blue, smoothstep(0.3, 1.0, vNoise));
    color += cyan * vScan * 0.28;
    gl_FragColor = vec4(color, dotShape * vAlpha);
  }
`;

type ParticleGlobeProps = {
  className?: string;
  isCompact?: boolean;
  reducedMotion?: boolean;
};

type GlobeUniforms = {
  uTime: { value: number };
  uScan: { value: number };
  uMouse: { value: THREE.Vector2 };
  uPixelRatio: { value: number };
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

function createGuideGeometry(radius: number) {
  const positions: number[] = [];
  const segmentCount = 112;
  const latitudes = [-0.82, -0.48, -0.18, 0.18, 0.48, 0.82];

  latitudes.forEach((latitude) => {
    const y = Math.sin(latitude) * radius;
    const ringRadius = Math.cos(latitude) * radius;

    for (let i = 0; i < segmentCount; i += 1) {
      const a = (i / segmentCount) * Math.PI * 2;
      const b = ((i + 1) / segmentCount) * Math.PI * 2;
      positions.push(
        Math.cos(a) * ringRadius,
        y,
        Math.sin(a) * ringRadius,
        Math.cos(b) * ringRadius,
        y,
        Math.sin(b) * ringRadius,
      );
    }
  });

  for (let meridian = 0; meridian < 8; meridian += 1) {
    const rotation = (meridian / 8) * Math.PI;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    for (let i = 0; i < segmentCount; i += 1) {
      const a = (i / segmentCount) * Math.PI * 2;
      const b = ((i + 1) / segmentCount) * Math.PI * 2;
      const ax = Math.cos(a) * radius;
      const ay = Math.sin(a) * radius;
      const bx = Math.cos(b) * radius;
      const by = Math.sin(b) * radius;
      positions.push(ax * cos, ay, ax * sin, bx * cos, by, bx * sin);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createOrbitGeometry(radius: number) {
  const positions: number[] = [];
  const segmentCount = 180;
  const tilts = [
    { x: 0.2, z: -0.22, scale: 0.7 },
    { x: -0.18, z: 0.56, scale: 0.62 },
    { x: 0.12, z: 1.02, scale: 0.78 },
  ];

  tilts.forEach((tilt) => {
    const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(tilt.x, 0, tilt.z));

    for (let i = 0; i < segmentCount; i += 1) {
      const a = (i / segmentCount) * Math.PI * 2;
      const b = ((i + 1) / segmentCount) * Math.PI * 2;
      const pointA = new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius * tilt.scale).applyMatrix4(matrix);
      const pointB = new THREE.Vector3(Math.cos(b) * radius, 0, Math.sin(b) * radius * tilt.scale).applyMatrix4(matrix);
      positions.push(pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createSeededRandom(seed = 137) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createConnectionGeometry(radius: number, segmentCount: number) {
  const random = createSeededRandom(811);
  const positions: number[] = [];

  for (let i = 0; i < segmentCount; i += 1) {
    const latitudeA = (random() - 0.5) * Math.PI * 0.92;
    const longitudeA = random() * Math.PI * 2;
    const latitudeB = THREE.MathUtils.clamp(latitudeA + (random() - 0.5) * 0.52, -1.18, 1.18);
    const longitudeB = longitudeA + (random() - 0.5) * 0.88;
    const surfaceOffset = radius + random() * 0.055;
    const pointA = new THREE.Vector3(
      Math.cos(latitudeA) * Math.cos(longitudeA),
      Math.sin(latitudeA),
      Math.cos(latitudeA) * Math.sin(longitudeA),
    ).multiplyScalar(surfaceOffset);
    const pointB = new THREE.Vector3(
      Math.cos(latitudeB) * Math.cos(longitudeB),
      Math.sin(latitudeB),
      Math.cos(latitudeB) * Math.sin(longitudeB),
    ).multiplyScalar(surfaceOffset + random() * 0.035);

    positions.push(pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

export function ParticleGlobe({ className = '', isCompact = false, reducedMotion = false }: ParticleGlobeProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount || !getWebGLAvailability()) {
      setUseFallback(true);
      return undefined;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let usesWindowResize = false;
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const pointer = new THREE.Vector2(0, 0);
    const targetPointer = new THREE.Vector2(0, 0);

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

    try {
      const scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0, isCompact ? 5.4 : 4.9);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isCompact,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.2 : 1.55));
      renderer.domElement.setAttribute('aria-hidden', 'true');
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      group.rotation.set(0.08, -0.26, -0.08);
      scene.add(group);

      const radius = 1.46;
      const detail = reducedMotion ? 4 : isCompact ? 5 : 6;
      const globeGeometry = new THREE.IcosahedronGeometry(radius, detail);
      const guideGeometry = createGuideGeometry(radius * 1.01);
      const orbitGeometry = createOrbitGeometry(radius * 1.28);
      const connectionGeometry = createConnectionGeometry(radius * 1.04, isCompact ? 48 : 86);
      geometries.push(globeGeometry, guideGeometry, orbitGeometry, connectionGeometry);

      const uniforms: GlobeUniforms = {
        uTime: { value: 0 },
        uScan: { value: -0.9 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, isCompact ? 1.2 : 1.55) },
        pointLightPosition: { value: new THREE.Vector3(2.6, 1.8, 3.2) },
      };

      const globeMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: globeVertexShader,
        fragmentShader: globeFragmentShader,
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
      const guideMaterial = new THREE.LineBasicMaterial({
        color: 0xa8eaff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      });
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x6da8ff,
        transparent: true,
        opacity: 0.09,
        blending: THREE.AdditiveBlending,
      });
      const connectionMaterial = new THREE.LineBasicMaterial({
        color: 0x8fdfff,
        transparent: true,
        opacity: 0.11,
        blending: THREE.AdditiveBlending,
      });
      materials.push(globeMaterial, pointMaterial, guideMaterial, orbitMaterial, connectionMaterial);

      const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
      const pointCloud = new THREE.Points(globeGeometry, pointMaterial);
      const guideLines = new THREE.LineSegments(guideGeometry, guideMaterial);
      const orbitLines = new THREE.LineSegments(orbitGeometry, orbitMaterial);
      const connectionLines = new THREE.LineSegments(connectionGeometry, connectionMaterial);
      group.add(orbitLines, guideLines, connectionLines, globeMesh, pointCloud);

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
        pointer.lerp(targetPointer, 0.045);
        uniforms.uTime.value = reducedMotion ? 0 : time;
        uniforms.uMouse.value.copy(pointer);
        uniforms.uScan.value = Math.sin(time * 0.42) * 0.86;
        uniforms.pointLightPosition.value.set(2.4 + pointer.x * 0.8, 1.7 + pointer.y * 0.5, 3.2);

        group.rotation.y = -0.26 + (reducedMotion ? 0 : time * 0.045) + pointer.x * 0.08;
        group.rotation.x = 0.08 + pointer.y * 0.045;
        orbitLines.rotation.z = reducedMotion ? 0 : time * 0.018;
        connectionLines.rotation.y = reducedMotion ? 0 : Math.sin(time * 0.16) * 0.035;

        if (renderer && camera) {
          renderer.render(scene, camera);
        }
        frameRef.current = window.requestAnimationFrame(animate);
      };

      frameRef.current = window.requestAnimationFrame(animate);
      setUseFallback(false);
      return cleanup;
    } catch (error) {
      console.error('Particle globe renderer unavailable.', error);
      cleanup();
      setUseFallback(true);
      return undefined;
    }
  }, [isCompact, reducedMotion]);

  return (
    <div className={`particle-globe ${useFallback ? 'particle-globe--fallback' : ''} ${className}`}>
      <div className="particle-globe__mount" ref={mountRef} aria-hidden="true" />
      {useFallback ? <div className="particle-globe__fallback" aria-hidden="true" /> : null}
    </div>
  );
}
