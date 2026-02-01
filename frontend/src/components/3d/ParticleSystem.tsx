import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type ParticlePattern = 'orbital' | 'sphere' | 'field' | 'companions';

interface ParticleSystemProps {
  pattern?: ParticlePattern;
  count?: number;
  colors?: string[];
  radius?: number;
  size?: number;
  speed?: number;
  opacity?: number;
  animated?: boolean;
  position?: [number, number, number];
}

/**
 * Unified particle system supporting multiple patterns:
 * - orbital: Ring of particles rotating around center
 * - sphere: Spherical distribution with float animation
 * - field: Background particle field with drift
 * - companions: Multi-color orbital particles
 */
const ParticleSystem = ({
  pattern = 'sphere',
  count: countProp = 100,
  colors = ['#A3FF12'],
  radius = 1.5,
  size = 0.02,
  speed = 1,
  opacity = 0.7,
  animated = true,
  position = [0, 0, 0],
}: ParticleSystemProps) => {
  const count = Math.max(1, countProp);
  const pointsRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Points>(null);

  const colorObjects = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors]);

  // Generate positions and colors based on pattern
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const particleColors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = 0,
        y = 0,
        z = 0;

      switch (pattern) {
        case 'orbital': {
          // Ring distribution
          const theta = (i / count) * Math.PI * 2;
          const r = radius + (Math.random() - 0.5) * 0.05;
          x = r * Math.cos(theta);
          y = (Math.random() - 0.5) * 0.03;
          z = r * Math.sin(theta);
          break;
        }
        case 'sphere':
        case 'companions': {
          // Spherical distribution
          const theta = (i / count) * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = radius + Math.random() * 0.3;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.cos(phi) * 0.5 + 0.2;
          z = r * Math.sin(phi) * Math.sin(theta);
          break;
        }
        case 'field': {
          // Large spherical field
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = Math.pow(Math.random(), 0.5) * radius;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta) - 2;
          z = r * Math.cos(phi);
          // Drift velocities
          velocities[i3] = (Math.random() - 0.5) * 0.002;
          velocities[i3 + 1] = Math.random() * 0.003 + 0.001;
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;
          break;
        }
      }

      positions[i3] = Number.isFinite(x) ? x : 0;
      positions[i3 + 1] = Number.isFinite(y) ? y : 0;
      positions[i3 + 2] = Number.isFinite(z) ? z : 0;

      // Color assignment
      const color = colorObjects[i % colorObjects.length];
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;
    }
    for (let j = 0; j < positions.length; j++) {
      if (!Number.isFinite(positions[j])) positions[j] = 0;
    }

    return { positions, colors: particleColors, velocities };
  }, [pattern, count, radius, colorObjects]);

  // Glow layer for orbital pattern
  const glowPositions = useMemo(() => {
    if (pattern !== 'orbital') return null;
    const glowCount = Math.floor(count * 0.5);
    const pos = new Float32Array(glowCount * 3);
    for (let i = 0; i < glowCount; i++) {
      const theta = (i / glowCount) * Math.PI * 2;
      const r = radius + 0.08 + Math.random() * 0.06;
      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      pos[i * 3 + 2] = r * Math.sin(theta);
    }
    return pos;
  }, [pattern, count, radius]);

  useFrame((state) => {
    if (!animated || !pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    if (pattern === 'orbital') {
      pointsRef.current.rotation.y = time * speed * 0.5;
      pointsRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      if (glowRef.current) {
        glowRef.current.rotation.y = -time * speed * 0.3;
        const mat = glowRef.current.material as THREE.PointsMaterial;
        mat.opacity = 0.3 + Math.sin(time * 2) * 0.15;
      }
    } else if (pattern === 'sphere' || pattern === 'companions') {
      pointsRef.current.rotation.y = time * 0.2 * speed;
      pointsRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = opacity * (0.85 + Math.sin(time * 2) * 0.15);
    } else if (pattern === 'field') {
      const posAttr = pointsRef.current.geometry.attributes.position;
      const pos = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        pos[i3] += geometry.velocities[i3] + Math.sin(time * 0.5 + i) * 0.0005;
        pos[i3 + 1] += geometry.velocities[i3 + 1];
        pos[i3 + 2] += geometry.velocities[i3 + 2] + Math.cos(time * 0.3 + i) * 0.0005;
        if (pos[i3 + 1] > radius) pos[i3 + 1] = -radius;
      }
      posAttr.needsUpdate = true;
      pointsRef.current.rotation.y = time * 0.02;
    }
  });

  const useVertexColors = pattern === 'companions' || colors.length > 1;

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
          {useVertexColors && (
            <bufferAttribute attach="attributes-color" args={[geometry.colors, 3]} />
          )}
        </bufferGeometry>
        <pointsMaterial
          color={useVertexColors ? undefined : colors[0]}
          vertexColors={useVertexColors}
          size={size}
          sizeAttenuation
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Glow layer for orbital */}
      {pattern === 'orbital' && glowPositions && (
        <points ref={glowRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[glowPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={colors[1] || colors[0]}
            size={size * 0.7}
            sizeAttenuation
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};

export default ParticleSystem;
