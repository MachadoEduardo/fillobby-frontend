import { useEffect, useRef, type FC } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

export type MoltenMetalColorMode = "molten" | "ember" | "frost";

export interface MoltenMetalProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  detail?: number;
  glow?: number;
  coreSize?: number;
  swirl?: number;
  fold?: number;
  blackPoint?: number;
  brightness?: number;
  colorMode?: MoltenMetalColorMode;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  opacity?: number;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];

  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const colorModeToFloat = (mode: MoltenMetalColorMode) =>
  mode === "ember" ? 1 : mode === "frost" ? 2 : 0;

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform bool uEnableMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float time = iTime * uSpeed;
  vec2 p = uScale * ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;

  vec2 drift = vec2(0.0);
  if (uEnableMouse) {
    drift = (uMouse - 0.5) * uMouseStrength * 2.0;
  }
  p += drift;

  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;

  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float glowCore = uGlow * uCoreSize;

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= uDetail) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / length(vec2(sin(i.x + t), cos(i.y + t)));
  }

  c /= 6.0;
  float intensity = max(c - uBlackPoint, 0.0) * uBrightness;
  float g = clamp(intensity, 0.0, 1.0);
  float mid = uColorMode > 1.5 ? 0.65 : uColorMode > 0.5 ? 0.35 : 0.5;
  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  col = mix(col, uColor3, smoothstep(mid, 1.0, g));

  float a = g;
  if (uGrain > 0.5) {
    float gr = hash(gl_FragCoord.xy + iTime);
    a += (gr - 0.5) * uGrainIntensity;
  }
  a = clamp(a, 0.0, 1.0) * uOpacity;
  fragColor = vec4(col * a, a);
}
`;

type MoltenMetalContext = {
  program: Program;
};

const contexts = new WeakMap<HTMLDivElement, MoltenMetalContext>();

const MoltenMetal: FC<MoltenMetalProps> = ({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.4,
  scale = 3.3,
  detail = 5,
  glow = 1.45,
  coreSize = 0.12,
  swirl = 0.8,
  fold = -0.28,
  blackPoint = 0.12,
  brightness = 0.95,
  colorMode = "ember",
  grain = true,
  grainIntensity = 0.025,
  mouseInteraction = true,
  mouseStrength = 0.12,
  opacity = 0.55,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.2 },
        uScale: { value: 3.2 },
        uDetail: { value: 3 },
        uGlow: { value: 1.15 },
        uCoreSize: { value: 0.08 },
        uSwirl: { value: 0.65 },
        uFold: { value: -0.18 },
        uBlackPoint: { value: 0.12 },
        uBrightness: { value: 0.95 },
        uColorMode: { value: 1 },
        uGrain: { value: 1 },
        uGrainIntensity: { value: 0.025 },
        uOpacity: { value: 0.55 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseStrength: { value: 0.12 },
        uEnableMouse: { value: true },
        uColor1: { value: new Float32Array(hexToRgb("#17313A")) },
        uColor2: { value: new Float32Array(hexToRgb("#4F7D83")) },
        uColor3: { value: new Float32Array(hexToRgb("#D8663B")) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    contexts.set(container, { program });

    const setSize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(
        Math.max(1, Math.floor(width)),
        Math.max(1, Math.floor(height)),
      );
      const resolution = program.uniforms.iResolution.value as Float32Array;
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targetMouse: [number, number] = [0.5, 0.5];
    const currentMouse: [number, number] = [0.5, 0.5];
    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInside) {
        targetMouse[0] = 0.5;
        targetMouse[1] = 0.5;
        return;
      }

      targetMouse[0] = (event.clientX - rect.left) / rect.width;
      targetMouse[1] = 1 - (event.clientY - rect.top) / rect.height;
    };

    if (!reducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
    }

    let animationFrame = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const startTime = performance.now();
    const loop = (time: number) => {
      program.uniforms.iTime.value = (time - startTime) * 0.001;
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      const mouse = program.uniforms.uMouse.value as Float32Array;
      mouse[0] = currentMouse[0];
      mouse[1] = currentMouse[1];
      renderer.render({ scene: mesh });
      animationFrame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };
    const start = () => {
      if (
        !reducedMotion &&
        isVisible &&
        isPageVisible &&
        animationFrame === 0
      ) {
        animationFrame = requestAnimationFrame(loop);
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    });
    intersectionObserver.observe(container);

    const handleVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointermove", handlePointerMove);
      contexts.delete(container);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const uniforms = container
      ? contexts.get(container)?.program.uniforms
      : undefined;
    if (!uniforms) return;

    uniforms.uSpeed.value = speed;
    uniforms.uScale.value = scale;
    uniforms.uDetail.value = detail;
    uniforms.uGlow.value = glow;
    uniforms.uCoreSize.value = Math.max(coreSize, 0.001);
    uniforms.uSwirl.value = swirl;
    uniforms.uFold.value = fold;
    uniforms.uBlackPoint.value = blackPoint;
    uniforms.uBrightness.value = brightness;
    uniforms.uColorMode.value = colorModeToFloat(colorMode);
    uniforms.uGrain.value = grain ? 1 : 0;
    uniforms.uGrainIntensity.value = grainIntensity;
    uniforms.uOpacity.value = opacity;
    uniforms.uMouseStrength.value = mouseStrength;
    uniforms.uEnableMouse.value = mouseInteraction;

    [
      [uniforms.uColor1.value, hexToRgb(color1)],
      [uniforms.uColor2.value, hexToRgb(color2)],
      [uniforms.uColor3.value, hexToRgb(color3)],
    ].forEach(([target, color]) => {
      const output = target as Float32Array;
      const rgb = color as [number, number, number];
      output.set(rgb);
    });
  }, [
    blackPoint,
    brightness,
    color1,
    color2,
    color3,
    colorMode,
    coreSize,
    detail,
    fold,
    glow,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseStrength,
    opacity,
    scale,
    speed,
    swirl,
  ]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-hidden ${className}`.trim()}
      aria-hidden="true"
    />
  );
};

export default MoltenMetal;
