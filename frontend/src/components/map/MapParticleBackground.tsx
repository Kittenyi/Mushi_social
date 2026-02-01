import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ZoomParticlesProps {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
}

// Particle system that responds to zoom level
const ParticleSystem = ({ zoom, minZoom = 5, maxZoom = 18 }: ZoomParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { size } = useThree();
  
  // Calculate density based on zoom
  // Low zoom (high altitude) = sparse particles
  // High zoom (ground level) = dense particles
  const normalizedZoom = useMemo(() => {
    return Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)));
  }, [zoom, minZoom, maxZoom]);

  const baseCount = 800;
  const maxCount = 2500;
  const rawCount = Math.floor(baseCount + (maxCount - baseCount) * (Number.isFinite(normalizedZoom) ? normalizedZoom : 0));
  const count = Math.max(1, Math.min(maxCount, Number.isFinite(rawCount) ? rawCount : baseCount));

  const geometry = useMemo(() => {
    const positions = new Float32Array(maxCount * 3);
    const colors = new Float32Array(maxCount * 3);
    const sizes = new Float32Array(maxCount);

    const color1 = new THREE.Color('#A3FF12');
    const color2 = new THREE.Color('#00D4FF');
    const color3 = new THREE.Color('#8B5CF6');

    for (let i = 0; i < maxCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 15;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      const colorChoice = Math.random();
      let particleColor: THREE.Color;
      if (colorChoice < 0.5) particleColor = color1;
      else if (colorChoice < 0.8) particleColor = color2;
      else particleColor = color3;

      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;

      sizes[i] = 0.02 + Math.random() * 0.04;
    }
    for (let j = 0; j < positions.length; j++) {
      if (!Number.isFinite(positions[j])) positions[j] = 0;
    }

    return { positions, colors, sizes };
  }, []);

  // Update visible particle count based on zoom
  useEffect(() => {
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      geo.setDrawRange(0, count);
    }
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Gentle floating motion - more pronounced at high zoom
    const motionIntensity = 0.3 + normalizedZoom * 0.5;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const originalY = (i % 100) / 100 * 15 - 7.5;
      
      // Slow floating motion
      positions[i3 + 1] = originalY + Math.sin(time * 0.3 + i * 0.1) * motionIntensity;
      
      // Slight horizontal drift
      positions[i3] += Math.sin(time * 0.2 + i * 0.05) * 0.001;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Adjust opacity based on zoom
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.4 + normalizedZoom * 0.3;
    material.size = 0.03 + normalizedZoom * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[geometry.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Floating spores/pollen effect
const SporeEffect = ({ zoom }: { zoom: number }) => {
  const sporesRef = useRef<THREE.Points>(null);
  
  const normalizedZoom = useMemo(() => {
    return Math.max(0, Math.min(1, (zoom - 5) / 13));
  }, [zoom]);

  const geometry = useMemo(() => {
    const count = Math.max(1, 200);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 15;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;
    }
    for (let j = 0; j < positions.length; j++) {
      if (!Number.isFinite(positions[j])) positions[j] = 0;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!sporesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    sporesRef.current.rotation.y = time * 0.02;
    sporesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    
    // More visible at close zoom
    const material = sporesRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.2 + normalizedZoom * 0.4;
  });

  return (
    <points ref={sporesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FFEC8B"
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

interface MapParticleBackgroundProps {
  zoom: number;
  className?: string;
}

const MapParticleBackground = ({ zoom, className = '' }: MapParticleBackgroundProps) => {
  return (
    <div 
      className={`${className}`}
      style={{ 
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <ambientLight intensity={0.2} />
        <ParticleSystem zoom={zoom} />
        <SporeEffect zoom={zoom} />
      </Canvas>
    </div>
  );
};

export default MapParticleBackground;
