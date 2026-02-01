import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Soul type color mapping
const SOUL_COLORS: Record<string, { primary: string; secondary: string }> = {
  degen: { primary: '#9945FF', secondary: '#FF6B9D' },
  whale: { primary: '#FFD700', secondary: '#FFA500' },
  builder: { primary: '#00D4FF', secondary: '#0066FF' },
  artist: { primary: '#FF6B9D', secondary: '#9945FF' },
  explorer: { primary: '#A3FF12', secondary: '#00D4FF' },
  collector: { primary: '#FFD700', secondary: '#9945FF' },
  default: { primary: '#A3FF12', secondary: '#8B5CF6' },
};

interface MushiAvatarProps {
  soulType?: string;
  gender?: 'rounded' | 'angular';
}

// Mushroom cap component
const MushroomCap = ({
  color,
  glowColor,
  gender,
}: {
  color: string;
  glowColor: string;
  gender: 'rounded' | 'angular';
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const breathe = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.03 + 1;
      meshRef.current.scale.set(breathe, breathe * 0.95, breathe);
    }
    if (glowRef.current) {
      const glow = Math.sin(state.clock.getElapsedTime() * 2) * 0.2 + 0.6;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glow;
    }
  });

  const capGeometry = useMemo(() => {
    return gender === 'angular'
      ? new THREE.DodecahedronGeometry(1, 1)
      : new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
  }, [gender]);

  // Pre-generate spot positions
  const spots = useMemo(
    () =>
      [...Array(5)].map((_, i) => ({
        angle: (i / 5) * Math.PI * 2,
        scale: 0.12 + Math.random() * 0.08,
      })),
    []
  );

  return (
    <group position={[0, 0.8, 0]}>
      <mesh ref={meshRef} geometry={capGeometry} rotation={[gender === 'angular' ? 0.2 : 0, 0, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      <mesh ref={glowRef} scale={1.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      {spots.map((spot, i) => (
        <mesh
          key={i}
          position={[Math.cos(spot.angle) * 0.6, 0.3, Math.sin(spot.angle) * 0.6]}
          scale={spot.scale}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Mushroom stem
const MushroomStem = ({ color }: { color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.3, 0]}>
      <cylinderGeometry args={[0.25, 0.35, 1.2, 16]} />
      <meshStandardMaterial color="#F5F5DC" emissive={color} emissiveIntensity={0.1} roughness={0.6} />
    </mesh>
  );
};

// Floating particles (simplified, integrated)
const FloatingParticles = ({ color }: { color: string }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const count = Math.max(1, 30);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 1.5 + Math.random();

      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;

      vel[i * 3 + 1] = Math.random() * 0.02 + 0.01;
    }
    // 避免 THREE.BufferGeometry computeBoundingSphere 得到 NaN
    for (let j = 0; j < pos.length; j++) {
      if (!Number.isFinite(pos[j])) pos[j] = 0;
    }

    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < posArr.length / 3; i++) {
      posArr[i * 3] += Math.sin(time + i) * 0.005;
      posArr[i * 3 + 1] += velocities[i * 3 + 1] * 0.5;
      posArr[i * 3 + 2] += Math.cos(time + i) * 0.005;
      if (posArr[i * 3 + 1] > 3) posArr[i * 3 + 1] = -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Main scene
const MushiScene = ({ soulType, gender }: { soulType: string; gender: 'rounded' | 'angular' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const colors = SOUL_COLORS[soulType] || SOUL_COLORS.default;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 2]} intensity={1} color={colors.primary} />
      <pointLight position={[-2, 1, -2]} intensity={0.5} color={colors.secondary} />

      <MushroomCap color={colors.primary} glowColor={colors.secondary} gender={gender} />
      <MushroomStem color={colors.primary} />
      <FloatingParticles color={colors.primary} />
    </group>
  );
};

const MushiAvatar3D = ({ soulType = 'explorer', gender = 'rounded' }: MushiAvatarProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <MushiScene soulType={soulType} gender={gender} />
      </Canvas>
    </div>
  );
};

export default MushiAvatar3D;
