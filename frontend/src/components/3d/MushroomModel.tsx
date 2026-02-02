import { useRef, useEffect, useState, useCallback, createContext, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import MushroomParticles from './MushroomParticles';
import ParticleSystem from './ParticleSystem';
import MyceliumLines from './MyceliumLines';
import ExplosionTransition from './ExplosionTransition';
import { NoiseOverlay } from './shaders/NoiseOverlay';

interface FloatingGroupProps {
  children: React.ReactNode;
}

const FloatingGroup = ({ children }: FloatingGroupProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
  });

  return <group ref={groupRef}>{children}</group>;
};

/** WebGL context-lost 保护：阻止事件冒泡，避免整页假死；通知父级切换静态背景 */
const OnContextLostContext = createContext<(() => void) | null>(null);

function WebGLContextGuard() {
  const { gl } = useThree();
  const onContextLost = useContext(OnContextLostContext);

  useEffect(() => {
    const canvas = gl.domElement;
    const handler = (e: Event) => {
      e.preventDefault();
      if (typeof (e as WebGLContextEvent).preventDefault === 'function') (e as WebGLContextEvent).preventDefault();
      console.warn('[MushroomScene] WebGL context lost, switching to static background.');
      onContextLost?.();
    };
    canvas.addEventListener('webglcontextlost', handler, false);
    return () => canvas.removeEventListener('webglcontextlost', handler);
  }, [gl, onContextLost]);

  return null;
}

interface MushroomSceneProps {
  className?: string;
  color?: string;
  secondaryColor?: string;
  glowColor?: string;
  showParticleField?: boolean;
  showMycelium?: boolean;
  showOrbitalRing?: boolean;
  morphFactor?: number;
  companionColors?: string[];
  triggerExplosion?: boolean;
  onExplosionComplete?: () => void;
}

const MushroomScene = ({
  className = '',
  color = '#A3FF12',
  secondaryColor = '#8B5CF6',
  glowColor = '#00D4FF',
  showParticleField = true,
  showMycelium = true,
  showOrbitalRing = false,
  morphFactor = 0,
  companionColors = [],
  triggerExplosion = false,
  onExplosionComplete,
}: MushroomSceneProps) => {
  const [contextLost, setContextLost] = useState(false);
  const onContextLost = useCallback(() => setContextLost(true), []);

  if (contextLost) {
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)`,
        }}
        aria-hidden
      />
    );
  }

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <OnContextLostContext.Provider value={onContextLost}>
          <WebGLContextGuard />
        </OnContextLostContext.Provider>
        {/* Minimal lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={0.5} color={color} />
        <pointLight position={[-3, 2, -3]} intensity={0.3} color={secondaryColor} />
        <pointLight position={[0, -1, 2]} intensity={0.2} color={glowColor} />

        {/* Main mushroom */}
        <FloatingGroup>
          <MushroomParticles
            color={color}
            secondaryColor={secondaryColor}
            glowColor={glowColor}
            morphFactor={morphFactor}
          />

          {/* Orbital ring using unified system */}
          {showOrbitalRing && (
            <ParticleSystem
              pattern="orbital"
              count={120}
              colors={[color, glowColor]}
              radius={1.1}
              size={0.025}
              speed={1.2}
              position={[0, 0.25, 0]}
            />
          )}

          {/* Companion particles */}
          {companionColors.length > 0 && (
            <ParticleSystem
              pattern="companions"
              count={companionColors.length * 15}
              colors={companionColors}
              radius={1.2}
              size={0.02}
              position={[0, 0.15, 0]}
            />
          )}
        </FloatingGroup>

        {/* Explosion transition */}
        {triggerExplosion && (
          <ExplosionTransition
            trigger={triggerExplosion}
            onComplete={onExplosionComplete}
            color={color}
          />
        )}

        {/* Mycelium network */}
        {showMycelium && <MyceliumLines count={12} color="#00F0FF" glowColor="#00D4FF" />}

        {/* Background particle field */}
        {showParticleField && (
          <ParticleSystem
            pattern="field"
            count={1500}
            colors={[color]}
            size={0.008}
            radius={6}
          />
        )}

        {/* Post-processing */}
        <EffectComposer>
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.8}
            radius={0.6}
          />
          <NoiseOverlay noiseIntensity={0.05} vignetteIntensity={0.35} grainIntensity={0.03} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default MushroomScene;
