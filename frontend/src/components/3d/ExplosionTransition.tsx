import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExplosionTransitionProps {
  trigger: boolean;
  onComplete?: () => void;
  color?: string;
}

const ExplosionTransition = ({ trigger, onComplete, color = '#A3FF12' }: ExplosionTransitionProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [phase, setPhase] = useState<'idle' | 'imploding' | 'exploding' | 'done'>('idle');
  const startTime = useRef(0);
  const originalPositions = useRef<Float32Array | null>(null);

  const count = 800;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Start from edges of screen (large sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 3;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi);
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Velocity towards center
      velocities[i3] = -positions[i3];
      velocities[i3 + 1] = -positions[i3 + 1];
      velocities[i3 + 2] = -positions[i3 + 2];
    }
    for (let j = 0; j < positions.length; j++) {
      if (!Number.isFinite(positions[j])) positions[j] = 0;
    }

    return { positions, velocities };
  }, []);

  useEffect(() => {
    if (trigger && phase === 'idle') {
      setPhase('imploding');
      startTime.current = 0;
      originalPositions.current = geometry.positions.slice();
    }
  }, [trigger, phase, geometry.positions]);

  useFrame((state, delta) => {
    if (!pointsRef.current || phase === 'idle' || phase === 'done') return;

    startTime.current += delta;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const material = pointsRef.current.material as THREE.PointsMaterial;

    if (phase === 'imploding') {
      // Implode towards center over 0.6 seconds
      const progress = Math.min(startTime.current / 0.6, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        if (originalPositions.current) {
          positions[i3] = originalPositions.current[i3] * (1 - eased);
          positions[i3 + 1] = originalPositions.current[i3 + 1] * (1 - eased);
          positions[i3 + 2] = originalPositions.current[i3 + 2] * (1 - eased);
        }
      }

      material.opacity = 0.8;
      material.size = 0.03 + progress * 0.02;

      if (progress >= 1) {
        setPhase('exploding');
        startTime.current = 0;
        // Generate new outward velocities
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = 8 + Math.random() * 12;

          geometry.velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
          geometry.velocities[i3 + 1] = speed * Math.cos(phi);
          geometry.velocities[i3 + 2] = speed * Math.sin(phi) * Math.sin(theta);
        }
      }
    } else if (phase === 'exploding') {
      // Explode outward over 0.5 seconds
      const progress = Math.min(startTime.current / 0.5, 1);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] += geometry.velocities[i3] * delta;
        positions[i3 + 1] += geometry.velocities[i3 + 1] * delta;
        positions[i3 + 2] += geometry.velocities[i3 + 2] * delta;
      }

      material.opacity = 0.9 * (1 - progress);
      material.size = 0.05 + progress * 0.03;

      if (progress >= 1) {
        setPhase('done');
        onComplete?.();
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (phase === 'idle') return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ExplosionTransition;
