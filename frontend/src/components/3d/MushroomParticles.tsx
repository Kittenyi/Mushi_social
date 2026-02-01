import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MushroomParticlesProps {
  color?: string;
  secondaryColor?: string;
  glowColor?: string;
  morphFactor?: number; // 0 = rounded, 1 = angular
}

const MushroomParticles = ({ 
  color = '#A3FF12', 
  secondaryColor = '#8B5CF6',
  glowColor = '#00D4FF',
  morphFactor = 0
}: MushroomParticlesProps) => {
  const capRef = useRef<THREE.Points>(null);
  const stemRef = useRef<THREE.Points>(null);
  const spotsRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Points>(null);

  // Generate outer glow particles - sparse ambient glow (reduced density by 10%)
  const glowGeometry = useMemo(() => {
    const count = 135; // Reduced from 150
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.0 + Math.random() * 0.6;
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi) * 0.6 + 0.3;
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    for (let j = 0; j < positions.length; j++) {
      if (!Number.isFinite(positions[j])) positions[j] = 0;
    }
    return positions;
  }, []);

  // 🍄 Classic toadstool cap - morphable between round and angular
  const capGeometry = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const baseColor = new THREE.Color(color);
    const accentColor = new THREE.Color(secondaryColor);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const u = Math.random();
      
      // Larger umbrella cap - radius up to 0.85
      const radius = Math.sqrt(u) * 0.85;
      const normalizedR = radius / 0.85;
      
      // Morph between round dome and angular/faceted shape
      const roundDome = Math.sqrt(1 - normalizedR * normalizedR * 0.6) * 0.45;
      const angularDome = (1 - normalizedR) * 0.5; // More pyramid-like
      const domeHeight = roundDome * (1 - morphFactor) + angularDome * morphFactor;
      
      // Edge treatment - round vs sharp
      const roundEdge = Math.pow(normalizedR, 2.5) * 0.22;
      const sharpEdge = Math.pow(normalizedR, 4) * 0.15;
      const edgeDrop = roundEdge * (1 - morphFactor) + sharpEdge * morphFactor;
      
      // Bottom curve - smooth vs flat
      const bottomCurve = Math.sin(normalizedR * Math.PI * 0.5) * 0.05 * (1 - morphFactor);
      
      const y = 0.5 + domeHeight - edgeDrop + bottomCurve + (Math.random() - 0.5) * 0.025;
      
      // Add angular faceting based on morphFactor
      const facetAngle = Math.floor(theta / (Math.PI / 4)) * (Math.PI / 4);
      const facetedTheta = theta * (1 - morphFactor * 0.5) + facetAngle * morphFactor * 0.5;
      
      positions[i3] = radius * Math.cos(facetedTheta);
      positions[i3 + 1] = y;
      positions[i3 + 2] = radius * Math.sin(facetedTheta);
      
      // Color gradient
      const blend = Math.pow(normalizedR, 2) * 0.3;
      const particleColor = baseColor.clone().lerp(accentColor, blend);
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }
    
    return { positions, colors };
  }, [color, secondaryColor, morphFactor]);

  // Stem - tapered cylinder with purple gradient
  const stemGeometry = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const creamColor = new THREE.Color('#f0ebe3');
    const purpleColor = new THREE.Color(secondaryColor);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const height = Math.random();
      
      // Tapered: thinner at top, wider at base
      const radiusTop = 0.1;
      const radiusBottom = 0.18;
      const r = radiusTop + (radiusBottom - radiusTop) * (1 - height);
      
      // Slight bulge in middle (classic mushroom stem)
      const bulge = Math.sin(height * Math.PI) * 0.03;
      const finalR = r + bulge;
      
      // Height from -0.5 to cap underside at 0.5
      const y = -0.5 + height * 1.0;
      
      positions[i3] = finalR * Math.cos(theta) + (Math.random() - 0.5) * 0.015;
      positions[i3 + 1] = y;
      positions[i3 + 2] = finalR * Math.sin(theta) + (Math.random() - 0.5) * 0.015;
      
      // Gradient: more purple at base, cream at top
      const purpleBlend = Math.pow(1 - height, 1.5) * 0.35;
      const particleColor = creamColor.clone().lerp(purpleColor, purpleBlend);
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }
    
    return { positions, colors };
  }, [secondaryColor]);

  // Decorative spots on cap - ring around outer edge
  const spotsGeometry = useMemo(() => {
    const count = 200; // Fewer spots for edge ring
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Evenly distribute around the edge
      const theta = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      
      // Place spots at outer edge (radius 0.7-0.85)
      const radius = 0.70 + Math.random() * 0.15;
      
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      
      // Sit on cap surface - match rounded cap formula
      const distFromCenter = Math.sqrt(x * x + z * z);
      const normalizedR = Math.min(distFromCenter / 0.85, 1);
      const domeHeight = Math.sqrt(1 - normalizedR * normalizedR * 0.6) * 0.45;
      const edgeDrop = Math.pow(normalizedR, 2.5) * 0.22;
      const bottomCurve = Math.sin(normalizedR * Math.PI * 0.5) * 0.05;
      const capY = 0.5 + domeHeight - edgeDrop + bottomCurve;
      
      positions[i3] = x;
      positions[i3 + 1] = capY + 0.018 + Math.random() * 0.008;
      positions[i3 + 2] = z;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const breathe = Math.sin(time * 0.8) * 0.03;
    
    if (capRef.current) {
      capRef.current.scale.setScalar(1 + breathe);
      capRef.current.position.y = breathe * 0.2;
    }
    
    if (stemRef.current) {
      stemRef.current.scale.x = 1 + breathe * 0.2;
      stemRef.current.scale.z = 1 + breathe * 0.2;
    }
    
    if (spotsRef.current) {
      spotsRef.current.scale.setScalar(1 + breathe);
      spotsRef.current.position.y = breathe * 0.2;
    }
    
    if (glowRef.current) {
      const glowPulse = Math.sin(time * 0.5) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(glowPulse);
      glowRef.current.rotation.y = time * 0.03;
      const material = glowRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.2 + Math.sin(time * 0.6) * 0.08;
    }
  });

  // Create a blended purple that harmonizes with green
  const harmonicPurple = useMemo(() => {
    const green = new THREE.Color(color);
    const purple = new THREE.Color(secondaryColor);
    // Desaturate and lighten purple to blend better
    return purple.lerp(green, 0.25).offsetHSL(0, -0.2, 0.1).getHexString();
  }, [color, secondaryColor]);

  return (
    <group position={[0, 0.15, 0]}>
      {/* Outer glow - sparse cyan particles */}
      <points ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[glowGeometry, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={glowColor}
          size={0.012}
          sizeAttenuation
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Cap top - gradient green to purple */}
      <points ref={capRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[capGeometry.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[capGeometry.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Stem - cream with purple gradient */}
      <points ref={stemRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stemGeometry.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[stemGeometry.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.01}
          sizeAttenuation
          transparent
          opacity={0.7}
        />
      </points>

      {/* Spots - brighter purple with larger size */}
      <points ref={spotsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[spotsGeometry, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={secondaryColor}
          size={0.032}
          sizeAttenuation
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default MushroomParticles;
