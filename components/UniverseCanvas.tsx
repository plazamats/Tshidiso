'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { getBassLevel } from '../lib/audio-bridge';

/* ─── Ultra High-Performance Heart Nebula (1 Draw Call via THREE.Points) ─── */
function HeartNebula() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const total = 75;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);

    const cPink = new THREE.Color('#ffb6da');
    const cGold = new THREE.Color('#ffe2a2');
    const cPurple = new THREE.Color('#d4a0ff');
    const cWhite = new THREE.Color('#fff0f5');

    // Outer contour
    for (let i = 0; i < 50; i++) {
      const a = (i / 50) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(a), 3) * 0.05;
      const y = (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.05;
      const z = Math.sin(a * 3) * 0.25 + (Math.random() - 0.5) * 0.15;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const chosen = i % 3 === 0 ? cPink : i % 3 === 1 ? cGold : cPurple;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }

    // Inner heart volume
    for (let i = 50; i < 75; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.65;
      const x = 16 * Math.pow(Math.sin(a), 3) * r * 0.05;
      const y = (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r * 0.05;
      const z = (Math.random() - 0.5) * 0.3;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const chosen = Math.random() > 0.5 ? cPink : cWhite;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }

    return [pos, col];
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.04 + pointer.x * 0.15;
    pointsRef.current.rotation.x = pointer.y * 0.08;
    // The heart beats in time with their song's bass
    const bass = getBassLevel();
    const scale = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.03 + bass * bass * 0.35;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group position={[0, 0.2, -2.5]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ─── Ultra High-Performance Galaxy Spiral (1 Draw Call via THREE.Points) ─── */
function GalaxySpiral() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const total = 250;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);

    const cPink = new THREE.Color('#ffb6da');
    const cPurple = new THREE.Color('#c4a0ff');
    const cPeach = new THREE.Color('#ffecd2');
    const cBlue = new THREE.Color('#a0c4ff');
    const cGold = new THREE.Color('#ffe2a2');
    const palette = [cPink, cPurple, cPeach, cBlue, cGold];

    const arms = 3;
    for (let i = 0; i < total; i++) {
      const arm = i % arms;
      const t = (i / total) * 4;
      const angle = t * Math.PI * 2 + (arm * Math.PI * 2) / arms;
      const radius = t * 1.2;
      const spread = t * 0.3;

      pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;

      const chosen = palette[i % palette.length];
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group position={[0, 0, -8]} rotation={[1.2, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ─── Main Optimized Canvas ─── */
export default function UniverseCanvas() {
  return (
    <Canvas
      className="universe-canvas"
      dpr={[1, 1.25]}
      camera={{ position: [0, 0, 6], fov: 48 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      }}
    >
      <fog attach="fog" args={['#07051a', 4, 16]} />
      <Stars radius={80} depth={50} count={1200} factor={3.2} saturation={0.3} fade speed={0.5} />
      <Sparkles count={90} scale={[11, 8, 5]} size={2.2} speed={0.25} color="#ffc4e1" />
      <Sparkles count={40} scale={[8, 6, 4]} size={1.4} speed={0.12} color="#ffe2a2" />
      <GalaxySpiral />
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.45}>
        <HeartNebula />
      </Float>
    </Canvas>
  );
}
