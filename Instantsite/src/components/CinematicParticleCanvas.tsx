import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════
   GLSL SHADERS FOR CINEMATIC MONOCHROME PARTICLE FIELD
   All motion, curl flow, breathing displacement, and mouse interaction
   are calculated 100% on the GPU for 60 FPS instanced performance.
   ═══════════════════════════════════════════════════════════════════════════ */

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aAlpha;
  attribute float aType; // 0.0 = Main Cloud, 1.0 = Stars, 2.0 = Orbits, 3.0 = Satellites
  attribute vec3 aRandom;
  attribute float aPhase;

  varying float vAlpha;
  varying float vType;

  // 3D Simplex Noise Implementation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z);
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

  vec3 curlNoise(vec3 p) {
    const float e = 0.08;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = vec3(snoise(p - dx), snoise(p - dx + vec3(12.34, 45.67, 89.01)), snoise(p - dx + vec3(98.76, 54.32, 10.98)));
    vec3 p_x1 = vec3(snoise(p + dx), snoise(p + dx + vec3(12.34, 45.67, 89.01)), snoise(p + dx + vec3(98.76, 54.32, 10.98)));
    vec3 p_y0 = vec3(snoise(p - dy), snoise(p - dy + vec3(12.34, 45.67, 89.01)), snoise(p - dy + vec3(98.76, 54.32, 10.98)));
    vec3 p_y1 = vec3(snoise(p + dy), snoise(p + dy + vec3(12.34, 45.67, 89.01)), snoise(p + dy + vec3(98.76, 54.32, 10.98)));
    vec3 p_z0 = vec3(snoise(p - dz), snoise(p - dz + vec3(12.34, 45.67, 89.01)), snoise(p - dz + vec3(98.76, 54.32, 10.98)));
    vec3 p_z1 = vec3(snoise(p + dz), snoise(p + dz + vec3(12.34, 45.67, 89.01)), snoise(p + dz + vec3(98.76, 54.32, 10.98)));

    float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
    float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
    float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);

    return vec3(x, y, z);
  }

  void main() {
    vType = aType;
    vec3 pos = position;
    float time = uTime * 0.08;

    if (aType < 0.5) {
      vec3 curl = curlNoise(pos * 0.08 + vec3(time * 0.15));
      float lowFreq = snoise(pos * 0.04 + vec3(time * 0.08));
      float breath = 1.0 + sin(time * 0.6 + aPhase) * 0.04 + lowFreq * 0.03;
      pos += curl * (0.8 + aRandom.x * 0.5) * breath;
      pos *= breath;

      vec2 mDist = uMouse * 45.0 - pos.xy;
      float dist = length(mDist);
      if (dist < 35.0) {
        float force = (35.0 - dist) / 35.0;
        pos.xy += normalize(mDist) * force * 4.5;
        pos.z += force * 3.0;
      }
    } 
    else if (aType < 1.5) {
      float slowTime = time * 0.03;
      pos.x += sin(slowTime + aPhase) * 1.5;
      pos.y += cos(slowTime * 0.8 + aPhase) * 1.5;
      pos.z += sin(slowTime * 0.5 + aRandom.y) * 1.0;
    }
    else if (aType < 2.5) {
      float angle = time * 0.25 * aRandom.z + aPhase;
      float r = length(pos.xy);
      pos.x = cos(angle) * r;
      pos.y = sin(angle) * r;
      pos.z += sin(time * 0.5 + aPhase) * 1.2;
    }
    else {
      float satAngle = -time * 0.15 * aRandom.x + aPhase;
      float satR = length(pos.xz);
      pos.x = cos(satAngle) * satR;
      pos.z = sin(satAngle) * satR;
      pos.y += cos(time * 0.3 + aPhase) * 2.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float sizeAtten = (120.0 / -mvPosition.z) * uPixelRatio;
    float dynamicPulse = 1.0 + sin(time * 1.2 + aPhase) * 0.15;
    gl_PointSize = aSize * sizeAtten * dynamicPulse;

    vAlpha = aAlpha * smoothstep(0.0, 10.0, -mvPosition.z) * smoothstep(140.0, 60.0, -mvPosition.z);
  }
`;

const fragmentShader = `
  precision highp float;
  varying float vAlpha;
  varying float vType;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) discard;

    float core = 1.0 - smoothstep(0.0, 0.45, dist);
    float glow = exp(-dist * 4.5);
    float brightness = core * 0.75 + glow * 0.45;

    vec3 col = vec3(0.98, 0.98, 1.0);
    if (vType > 0.5 && vType < 1.5) {
      col = vec3(1.0, 0.95, 0.9);
    } else if (vType > 1.5 && vType < 2.5) {
      col = vec3(0.9, 0.96, 1.0);
    }

    gl_FragColor = vec4(col, brightness * vAlpha);
  }
`;

export interface CinematicParticleCanvasProps {
  className?: string;
  style?: React.CSSProperties;
}

export function CinematicParticleCanvas({ className = '', style }: CinematicParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      1,
      1000
    );
    camera.position.z = 75;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const PARTICLE_COUNT = 38000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const types = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const typeRand = Math.random();

      if (typeRand < 0.70) {
        types[i] = 0.0;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 26.0;

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85;
        positions[i3 + 2] = r * Math.cos(phi) * 0.9;
        sizes[i] = 1.1 + Math.random() * 1.8;
        alphas[i] = 0.25 + Math.random() * 0.45;
      } else if (typeRand < 0.85) {
        types[i] = 1.0;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 30.0 + Math.random() * 45.0;

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);
        sizes[i] = 0.8 + Math.random() * 1.2;
        alphas[i] = 0.15 + Math.random() * 0.35;
      } else if (typeRand < 0.94) {
        types[i] = 2.0;
        const angle = Math.random() * Math.PI * 2;
        const radius = 18.0 + Math.random() * 16.0;
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = Math.sin(angle) * radius;
        positions[i3 + 2] = (Math.random() - 0.5) * 6.0;
        sizes[i] = 1.4 + Math.random() * 2.0;
        alphas[i] = 0.3 + Math.random() * 0.45;
      } else {
        types[i] = 3.0;
        const satAngle = Math.random() * Math.PI * 2;
        const satR = 24.0 + Math.random() * 22.0;
        positions[i3] = Math.cos(satAngle) * satR;
        positions[i3 + 1] = (Math.random() - 0.5) * 12.0;
        positions[i3 + 2] = Math.sin(satAngle) * satR;
        sizes[i] = 1.6 + Math.random() * 2.2;
        alphas[i] = 0.4 + Math.random() * 0.5;
      }

      randoms[i3] = Math.random();
      randoms[i3 + 1] = Math.random();
      randoms[i3 + 2] = Math.random();
      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aType', new THREE.BufferAttribute(types, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const mouseTarget = new THREE.Vector2(0, 0);
    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTarget.set(x, y);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      uniforms.uMouse.value.lerp(mouseTarget, 0.05);

      particles.rotation.y = elapsedTime * 0.015;
      particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        ...style,
      }}
    />
  );
}
export default CinematicParticleCanvas;
