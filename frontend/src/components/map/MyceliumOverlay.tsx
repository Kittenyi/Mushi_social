import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Soul type color mapping
const SOUL_COLORS: Record<string, string> = {
  degen: '#9945FF',    // Purple for Degen
  whale: '#FFD700',    // Gold for Whale
  builder: '#00D4FF',  // Cyan for Builder
  artist: '#FF6B9D',   // Pink for Artist
  explorer: '#A3FF12', // Neon green for Explorer
  default: '#00F0FF',  // Default cyan
};

interface ConnectionPoint {
  id: string;
  position: [number, number]; // [x, y] in normalized coords (-1 to 1)
  soulType?: string;
}

interface MyceliumConnection {
  from: ConnectionPoint;
  to: ConnectionPoint;
}

interface MyceliumOverlayProps {
  connections?: MyceliumConnection[];
  className?: string;
}

// Particle flow line component
const FlowingLine = ({ 
  from, 
  to, 
  color = '#00F0FF',
  particleCount = 30,
}: {
  from: [number, number];
  to: [number, number];
  color?: string;
  particleCount?: number;
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const progressRef = useRef<Float32Array>(new Float32Array(particleCount));
  
  // Create the curve
  const curve = useMemo(() => {
    const start = new THREE.Vector3(from[0] * 5, from[1] * 3, 0);
    const end = new THREE.Vector3(to[0] * 5, to[1] * 3, 0);
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2 + (Math.random() - 0.5) * 1,
      (start.y + end.y) / 2 + (Math.random() - 0.5) * 0.5,
      0.2 + Math.random() * 0.3
    );
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [from, to]);

  // Line geometry
  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [curve]);

  // Particle positions and initial progress
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      progressRef.current[i] = Math.random();
      sz[i] = 0.02 + Math.random() * 0.03;
    }
    
    return { positions: pos, sizes: sz };
  }, [particleCount]);

  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      // Move particles along the curve
      progressRef.current[i] += 0.002 + Math.sin(time + i) * 0.001;
      if (progressRef.current[i] > 1) progressRef.current[i] = 0;
      
      const point = curve.getPoint(progressRef.current[i]);
      posArray[i * 3] = point.x;
      posArray[i * 3 + 1] = point.y;
      posArray[i * 3 + 2] = point.z;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Pulse the line opacity
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.3 + Math.sin(time * 2) * 0.1;
    }
  });

  // Create line objects
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  }), [color]);

  const glowMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  }), [color]);

  return (
    <group>
      {/* Base line */}
      <primitive 
        ref={lineRef}
        object={new THREE.Line(lineGeometry, lineMaterial)} 
      />
      
      {/* Flowing particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Glow layer */}
      <primitive object={new THREE.Line(lineGeometry, glowMaterial)} />
    </group>
  );
};

// Ripple effect component
const RippleEffect = ({
  position,
  color,
  startTime,
  duration = 2,
}: {
  position: [number, number];
  color: string;
  startTime: number;
  duration?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const elapsed = state.clock.getElapsedTime() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Hide when complete
    if (progress >= 1) {
      groupRef.current.visible = false;
      return;
    }
    
    // Animate each ring with staggered timing
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      
      const ringDelay = i * 0.15;
      const ringProgress = Math.max(0, Math.min((elapsed - ringDelay) / (duration - ringDelay), 1));
      
      const scale = 0.5 + ringProgress * 3;
      ring.scale.set(scale, scale, 1);
      
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - ringProgress) * 0.6;
    });
  });

  return (
    <group ref={groupRef} position={[position[0] * 5, position[1] * 3, 0.1]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
        >
          <ringGeometry args={[0.15, 0.2, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main scene component
const MyceliumScene = ({ 
  connections,
  ripples,
}: { 
  connections: MyceliumConnection[];
  ripples: Array<{ id: string; position: [number, number]; color: string; startTime: number }>;
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.z = 5;
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.2} />
      
      {/* Mycelium connections */}
      {connections.map((conn, idx) => (
        <FlowingLine
          key={`${conn.from.id}-${conn.to.id}-${idx}`}
          from={conn.from.position}
          to={conn.to.position}
          color={SOUL_COLORS[conn.from.soulType || 'default']}
          particleCount={20 + Math.floor(Math.random() * 20)}
        />
      ))}
      
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <RippleEffect
          key={ripple.id}
          position={ripple.position}
          color={ripple.color}
          startTime={ripple.startTime}
        />
      ))}
    </>
  );
};

const MyceliumOverlay = ({ connections = [], className = '' }: MyceliumOverlayProps) => {
  const rippleRef = useRef<Array<{ id: string; position: [number, number]; color: string; startTime: number }>>([]);
  
  // Demo connections for testing
  const demoConnections: MyceliumConnection[] = useMemo(() => [
    {
      from: { id: 'mushi1', position: [-0.3, 0.2], soulType: 'explorer' },
      to: { id: 'mushi2', position: [0.4, -0.1], soulType: 'degen' },
    },
    {
      from: { id: 'mushi2', position: [0.4, -0.1], soulType: 'degen' },
      to: { id: 'mushi3', position: [0.1, 0.4], soulType: 'whale' },
    },
    {
      from: { id: 'mushi1', position: [-0.3, 0.2], soulType: 'explorer' },
      to: { id: 'mushi4', position: [-0.5, -0.3], soulType: 'builder' },
    },
  ], []);

  const activeConnections = connections.length > 0 ? connections : demoConnections;

  return (
    <div className={`absolute inset-0 ${className}`} style={{ pointerEvents: 'none' }}>
      <Canvas
        gl={{ 
          alpha: true, 
          antialias: true,
          premultipliedAlpha: false,
        }}
        style={{ background: 'transparent' }}
      >
        <MyceliumScene 
          connections={activeConnections}
          ripples={rippleRef.current}
        />
      </Canvas>
    </div>
  );
};

export default MyceliumOverlay;
