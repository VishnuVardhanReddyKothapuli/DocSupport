import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface GlitterWarpProps {
  width?: number | string;
  height?: number | string;
  speed?: number;
  color?: string;
  density?: number;
  brightness?: number;
  starSize?: number;
  focalDepth?: number;
  turbulence?: number;
  autoPlay?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const GlitterWarp: React.FC<GlitterWarpProps> = ({
  width = "100%",
  height = "100%",
  speed = 1.0,
  color = "#B19EEF",
  density = 20.0,
  brightness = 1.0,
  starSize = 0.1,
  focalDepth = 0.05,
  turbulence = 0.0,
  autoPlay = true,
  className,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(!autoPlay);

  useEffect(() => {
    isPausedRef.current = !autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Parse hex color into RGB (0.0 to 1.0)
    const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const rgb = hexMatch
      ? {
          r: parseInt(hexMatch[1], 16) / 255,
          g: parseInt(hexMatch[2], 16) / 255,
          b: parseInt(hexMatch[3], 16) / 255,
        }
      : { r: 0.694, g: 0.620, b: 0.937 };

    const rect = container.getBoundingClientRect();
    const parentRect = container.parentElement?.getBoundingClientRect();
    const w = rect.width || parentRect?.width || window.innerWidth || 300;
    const h = rect.height || parentRect?.height || window.innerHeight || 300;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(pixelRatio);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(w * pixelRatio, h * pixelRatio, 1) },
      uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
      uDensity: { value: density },
      uBrightness: { value: brightness },
      uStarSize: { value: starSize },
      uFocalDepth: { value: focalDepth },
      uTurbulence: { value: turbulence },
    };

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float iTime;
      uniform vec3 iResolution;
      uniform vec3 uColor;
      uniform float uDensity;
      uniform float uBrightness;
      uniform float uStarSize;
      uniform float uFocalDepth;
      uniform float uTurbulence;

      void main() {
        vec2 screenPos = gl_FragCoord.xy;
        vec2 centerOffset = screenPos - (iResolution.xy * 0.5);
        vec2 normalizedCoords = centerOffset / iResolution.y;

        vec3 viewDirection = normalize(vec3(normalizedCoords, uFocalDepth));

        vec3 travelOffset = vec3(0.0, 0.0, iTime);

        // Layer 1: Primary starfield warp tunnel
        vec3 spacePosition = (viewDirection * uDensity) + travelOffset;

        if (uTurbulence > 0.0) {
          spacePosition.x += sin(spacePosition.z * 0.5 + iTime) * uTurbulence;
          spacePosition.y += cos(spacePosition.z * 0.3 + iTime * 0.7) * uTurbulence;
        }

        vec3 gridCell = floor(spacePosition);
        vec3 cellOffset = fract(spacePosition);

        vec3 hashVector = vec3(2.154, -6.21, 0.42);
        vec3 starPosition = fract(cross(gridCell, hashVector)) * 0.5 + 0.25;

        float distToStar = distance(cellOffset, starPosition);
        float intensityFalloff = uStarSize - distToStar;
        float starIntensity = max(0.0, intensityFalloff * 10.0 * uBrightness);
        starIntensity = starIntensity * starIntensity;

        // Layer 2: Deeper parallax starfield layer for rich 3D cosmic depth
        vec3 spacePosition2 = (viewDirection * (uDensity * 1.55)) + (travelOffset * 1.25) + vec3(19.3, 7.1, 13.5);
        vec3 gridCell2 = floor(spacePosition2);
        vec3 cellOffset2 = fract(spacePosition2);
        vec3 starPosition2 = fract(cross(gridCell2, hashVector)) * 0.5 + 0.25;
        float dist2 = distance(cellOffset2, starPosition2);
        float falloff2 = (uStarSize * 0.88) - dist2;
        float intensity2 = max(0.0, falloff2 * 10.0 * uBrightness);
        starIntensity += intensity2 * intensity2 * 0.75;

        if (starIntensity < 0.01) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        // Brilliant core + luminous halo glow
        float core = smoothstep(0.2, 0.9, starIntensity);
        vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), core * 0.7) * starIntensity;

        gl_FragColor = vec4(finalColor, min(1.0, starIntensity * 1.4));
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      depthTest: false,
      depthWrite: false,
      premultipliedAlpha: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    startTimeRef.current = performance.now();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      if (!isPausedRef.current) {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        uniforms.iTime.value = elapsed * speed;
      }
      renderer.render(scene, camera);
    };
    animate();

    const updateSize = (rw: number, rh: number) => {
      if (rw <= 0 || rh <= 0) return;
      renderer.setSize(rw, rh, false);
      uniforms.iResolution.value.set(rw * pixelRatio, rh * pixelRatio, 1);
    };

    const handleResize = () => {
      if (!container) return;
      const newRect = container.getBoundingClientRect();
      const parentR = container.parentElement?.getBoundingClientRect();
      const rw = newRect.width || parentR?.width || window.innerWidth;
      const rh = newRect.height || parentR?.height || window.innerHeight;
      updateSize(rw, rh);
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: rw, height: rh } = entry.contentRect;
        if (rw > 0 && rh > 0) {
          updateSize(rw, rh);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId.current);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [speed, color, density, brightness, starSize, focalDepth, turbulence, autoPlay]);

  const styleWidth = typeof width === "number" ? `${width}px` : width;
  const styleHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width: styleWidth, height: styleHeight }}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {children && (
        <div className="relative z-10 w-full h-full pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

GlitterWarp.displayName = "GlitterWarp";
export default GlitterWarp;
