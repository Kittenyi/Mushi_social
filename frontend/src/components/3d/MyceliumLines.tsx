import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MyceliumLinesProps {
  count?: number;
  color?: string;
  glowColor?: string;
}

const MyceliumLines = ({ 
  count = 8, 
  color = '#00F0FF',
  glowColor = '#00F0FF'
}: MyceliumLinesProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.Line[]>([]);
  
  // Generate organic curves using CatmullRomCurve3
  const curves = useMemo(() => {
    const generatedCurves: THREE.CatmullRomCurve3[] = [];
    
    for (let i = 0; i < count; i++) {
      // Create organic control points
      const points: THREE.Vector3[] = [];
      const startX = (Math.random() - 0.5) * 8;
      const startZ = (Math.random() - 0.5) * 8;
      
      // 4-6 control points for each curve
      const numPoints = 4 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < numPoints; j++) {
        const t = j / (numPoints - 1);
        const spreadFactor = Math.sin(t * Math.PI) * 2;
        
        points.push(new THREE.Vector3(
          startX + (Math.random() - 0.5) * spreadFactor * 2,
          -2 + Math.random() * 0.3, // Ground level with slight variation
          startZ + t * 6 - 3 + (Math.random() - 0.5) * spreadFactor
        ));
      }
      
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
      generatedCurves.push(curve);
    }
    
    return generatedCurves;
  }, [count]);

  // Create geometries from curves
  const lineGeometries = useMemo(() => {
    return curves.map(curve => {
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return geometry;
    });
  }, [curves]);

  // Animate the lines
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Gentle floating movement
    groupRef.current.position.y = Math.sin(time * 0.3) * 0.05;
    
    // Animate line opacity through material
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
        const pulse = Math.sin(time * 0.8 + index * 0.5) * 0.3 + 0.7;
        child.material.opacity = pulse * 0.6;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {lineGeometries.map((geometry, index) => (
        <primitive 
          key={index} 
          object={new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
              color: index % 2 === 0 ? color : glowColor,
              transparent: true,
              opacity: 0.5,
              blending: THREE.AdditiveBlending
            })
          )}
        />
      ))}
      
      {/* Glow particles along the curves */}
      {curves.map((curve, curveIndex) => (
        <MyceliumGlowPoints 
          key={curveIndex} 
          curve={curve} 
          color={glowColor}
          index={curveIndex}
        />
      ))}
    </group>
  );
};

interface MyceliumGlowPointsProps {
  curve: THREE.CatmullRomCurve3;
  color: string;
  index: number;
}

const MyceliumGlowPoints = ({ curve, color, index }: MyceliumGlowPointsProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const points = curve.getPoints(20);
    const posArray = new Float32Array(points.length * 3);
    
    points.forEach((point, i) => {
      posArray[i * 3] = point.x;
      posArray[i * 3 + 1] = point.y;
      posArray[i * 3 + 2] = point.z;
    });
    
    return posArray;
  }, [curve]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const material = pointsRef.current.material as THREE.PointsMaterial;
    
    // Pulsing glow effect
    const pulse = Math.sin(time * 1.2 + index * 0.7) * 0.4 + 0.6;
    material.opacity = pulse * 0.8;
    material.size = 0.03 + pulse * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default MyceliumLines;
