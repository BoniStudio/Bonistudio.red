import { useEffect, useRef, useState } from 'react';

const vertexShader = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_intensity;

  vec3 hash3(vec2 p) {
    vec3 q = vec3(
      dot(p, vec2(127.1, 311.7)),
      dot(p, vec2(269.5, 183.3)),
      dot(p, vec2(419.2, 371.9))
    );
    return fract(sin(q) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(dot(hash3(i + vec2(0.0, 0.0)).xy, f), dot(hash3(i + vec2(1.0, 0.0)).xy, f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash3(i + vec2(0.0, 1.0)).xy, f - vec2(0.0, 1.0)), dot(hash3(i + vec2(1.0, 1.0)).xy, f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 0.35;

    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      value += amplitude * noise(p * frequency);
      amplitude *= 0.52;
      frequency *= 1.42;
    }

    return value;
  }

  float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float minDistance = 18.0;

    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash3(n + g).xy;
        o = 0.5 + 0.32 * sin(u_time * 0.36 + 6.2831 * o);
        vec2 r = g + o - f;
        minDistance = min(minDistance, dot(r, r));
      }
    }

    return sqrt(minDistance);
  }

  vec2 curl(vec2 p) {
    float e = 0.42;
    float n1 = fbm(p + vec2(e, 0.0), 5);
    float n2 = fbm(p - vec2(e, 0.0), 5);
    float n3 = fbm(p + vec2(0.0, e), 5);
    float n4 = fbm(p - vec2(0.0, e), 5);
    return vec2((n3 - n4) / (2.0 * e), (n2 - n1) / (2.0 * e));
  }

  float grain(vec2 uv, float time) {
    return fract(sin(dot(uv * time, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 st = (uv - 0.5) * 2.0;
    st.x *= u_resolution.x / max(u_resolution.y, 1.0);

    float time = u_time * 0.18;
    vec2 mouse = (u_mouse / u_resolution.xy - 0.5) * 2.0;
    mouse.x *= u_resolution.x / max(u_resolution.y, 1.0);

    vec2 curlForce = curl(st * 2.2 + vec2(time * 0.38, -time * 0.18)) * 0.46;
    vec2 flow = st + curlForce;

    float d1 = fbm(flow * 1.4 + time * 1.18, 7) * 0.36;
    float d2 = fbm(flow * 2.5 - time * 0.72, 5) * 0.25;
    float d3 = fbm(flow * 4.4 + time * 0.46, 4) * 0.14;
    float plasma = (
      sin((flow.x + d1) * 7.2 + time * 1.8) +
      sin((flow.y - d2) * 6.4 - time * 1.4) +
      sin((flow.x + flow.y + d3) * 5.4 + time)
    ) * 0.18;

    float total = d1 + d2 + d3 + plasma;
    float ribbonA = 1.0 - abs(flow.x + total * 0.72 + sin(flow.y * 2.7 + time) * 0.08);
    float ribbonB = 1.0 - abs(flow.x * 0.82 + total * 0.56 - 0.2 + cos(flow.y * 2.1 - time * 0.8) * 0.1);
    float ribbonC = 1.0 - abs(flow.x * 1.18 + total * 0.48 + 0.34);
    ribbonA = smoothstep(0.24, 0.94, ribbonA);
    ribbonB = smoothstep(0.22, 0.88, ribbonB);
    ribbonC = smoothstep(0.28, 0.82, ribbonC);

    float cells = 1.0 - smoothstep(0.18, 0.72, voronoi(flow * 2.35 + time * 0.24));
    float streak = smoothstep(0.34, 0.7, sin((flow.x + total) * 18.0 + time * 2.2) * 0.5 + 0.5);
    float energy = max(ribbonA * 0.7, max(ribbonB * 0.52, ribbonC * 0.32));
    energy *= 0.76 + streak * 0.18 + cells * 0.14;

    float mouseField = smoothstep(0.8, 0.0, length(st - mouse)) * 0.18;
    energy = clamp((energy + mouseField) * u_intensity, 0.0, 1.0);

    vec3 graphite = vec3(0.012, 0.022, 0.034);
    vec3 deepBlue = vec3(0.02, 0.09, 0.18);
    vec3 blue = vec3(0.18, 0.38, 0.72);
    vec3 cyan = vec3(0.37, 0.86, 1.0);
    vec3 violet = vec3(0.42, 0.32, 0.82);
    vec3 magenta = vec3(0.48, 0.22, 0.52);

    float colorNoise = fbm(flow * 3.4 + time * 0.28, 4) * 0.5 + 0.5;
    vec3 cold = mix(deepBlue, blue, smoothstep(0.18, 0.74, colorNoise));
    cold = mix(cold, cyan, ribbonA * 0.34);
    cold = mix(cold, violet, ribbonB * 0.22);
    cold = mix(cold, magenta, ribbonC * 0.07);

    float vignette = smoothstep(1.2, 0.18, length(uv - 0.5));
    float scanline = sin(uv.y * u_resolution.y * 1.8) * 0.012;
    float grainValue = (grain(uv, u_time * 0.32) - 0.5) * 0.028;

    vec3 color = mix(graphite, cold, energy);
    color += (scanline + grainValue);
    color *= vignette;

    float alpha = clamp(0.08 + energy * 0.38, 0.0, 0.52) * vignette;
    gl_FragColor = vec4(color, alpha);
  }
`;

type WebGLFluidBackgroundProps = {
  className?: string;
  isCompact?: boolean;
  reducedMotion?: boolean;
};

function getContext(canvas: HTMLCanvasElement) {
  return canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
    stencil: false,
  });
}

export function WebGLFluidBackground({
  className = '',
  isCompact = false,
  reducedMotion = false,
}: WebGLFluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') {
      return undefined;
    }

    const activeCanvas = canvas;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vertex: WebGLShader | null = null;
    let fragment: WebGLShader | null = null;
    let buffer: WebGLBuffer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let usesWindowResize = false;
    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };
    let intensity = isCompact ? 0.72 : 0.86;
    let targetIntensity = intensity;

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

      if (gl) {
        if (buffer) {
          gl.deleteBuffer(buffer);
        }
        if (program) {
          gl.deleteProgram(program);
        }
        if (vertex) {
          gl.deleteShader(vertex);
        }
        if (fragment) {
          gl.deleteShader(fragment);
        }
      }
    };

    function compileShader(type: number, source: string) {
      if (!gl) {
        throw new Error('Missing WebGL context');
      }

      const shader = gl.createShader(type);
      if (!shader) {
        throw new Error('Unable to create shader');
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info ?? 'Shader compile failed');
      }

      return shader;
    }

    function syncSize() {
      if (!gl) {
        return;
      }

      const rect = activeCanvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, isCompact ? 1.05 : 1.35);
      activeCanvas.width = Math.max(1, Math.floor(rect.width * ratio));
      activeCanvas.height = Math.max(1, Math.floor(rect.height * ratio));
      pointer.x = activeCanvas.width * 0.5;
      pointer.y = activeCanvas.height * 0.5;
      targetPointer.x = pointer.x;
      targetPointer.y = pointer.y;
      gl.viewport(0, 0, activeCanvas.width, activeCanvas.height);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = activeCanvas.getBoundingClientRect();
      const ratio = activeCanvas.width / Math.max(1, rect.width);
      targetPointer.x = (event.clientX - rect.left) * ratio;
      targetPointer.y = (rect.height - (event.clientY - rect.top)) * ratio;
      targetIntensity = isCompact ? 0.82 : 1.02;
    }

    try {
      gl = getContext(activeCanvas);

      if (!gl) {
        setFallback(true);
        return undefined;
      }

      vertex = compileShader(gl.VERTEX_SHADER, vertexShader);
      fragment = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
      program = gl.createProgram();

      if (!program) {
        throw new Error('Unable to create shader program');
      }

      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? 'Shader program link failed');
      }

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
      const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

      if (!timeLocation || !resolutionLocation || !mouseLocation || !intensityLocation) {
        throw new Error('Missing shader uniforms');
      }

      gl.clearColor(0, 0, 0, 0);
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      syncSize();
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(syncSize);
        resizeObserver.observe(activeCanvas);
      } else {
        usesWindowResize = true;
        window.addEventListener('resize', syncSize, { passive: true });
      }

      window.addEventListener('pointermove', handlePointerMove, { passive: true });

      const render = (now: number) => {
        if (!gl || !program || !buffer) {
          return;
        }

        pointer.x += (targetPointer.x - pointer.x) * 0.04;
        pointer.y += (targetPointer.y - pointer.y) * 0.04;
        intensity += (targetIntensity - intensity) * 0.055;
        targetIntensity += ((isCompact ? 0.72 : 0.86) - targetIntensity) * 0.025;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.uniform1f(timeLocation, reducedMotion ? 0 : now * 0.001);
        gl.uniform2f(resolutionLocation, activeCanvas.width, activeCanvas.height);
        gl.uniform2f(mouseLocation, pointer.x, pointer.y);
        gl.uniform1f(intensityLocation, intensity);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (!reducedMotion) {
          frameRef.current = window.requestAnimationFrame(render);
        }
      };

      frameRef.current = window.requestAnimationFrame(render);
      setFallback(false);
      return cleanup;
    } catch (error) {
      console.error('Fluid background renderer unavailable.', error);
      cleanup();
      setFallback(true);
      return undefined;
    }
  }, [isCompact, reducedMotion]);

  return (
    <div className={`webgl-fluid-background ${fallback ? 'webgl-fluid-background--fallback' : ''} ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {fallback ? <div className="webgl-fluid-background__fallback" aria-hidden="true" /> : null}
    </div>
  );
}
