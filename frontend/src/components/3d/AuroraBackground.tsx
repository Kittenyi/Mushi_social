import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AuroraBackgroundProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// Aurora shader material
const AuroraShaderMaterial = ({
  primaryColor,
  secondaryColor,
}: {
  primaryColor: THREE.Color;
  secondaryColor: THREE.Color;
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPrimaryColor: { value: primaryColor },
      uSecondaryColor: { value: secondaryColor },
    }),
    [primaryColor, secondaryColor]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform float uTime;
        uniform vec3 uPrimaryColor;
        uniform vec3 uSecondaryColor;
        varying vec2 vUv;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
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
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Create aurora waves
          float noise1 = snoise(vec3(uv.x * 2.0, uv.y * 1.5 + uTime, uTime * 0.5));
          float noise2 = snoise(vec3(uv.x * 3.0 + 10.0, uv.y * 2.0 - uTime * 0.7, uTime * 0.3));
          float noise3 = snoise(vec3(uv.x * 1.5 - 5.0, uv.y * 2.5 + uTime * 0.4, uTime * 0.6));
          
          float combinedNoise = (noise1 + noise2 * 0.5 + noise3 * 0.3) / 1.8;
          
          // Create vertical gradient for aurora
          float verticalGradient = smoothstep(0.2, 0.8, uv.y);
          float auroraShape = combinedNoise * verticalGradient;
          
          // Mix colors based on noise
          vec3 color1 = uPrimaryColor;
          vec3 color2 = uSecondaryColor;
          vec3 auroraColor = mix(color1, color2, noise2 * 0.5 + 0.5);
          
          // Add brightness variation
          float brightness = 0.3 + auroraShape * 0.7;
          auroraColor *= brightness;
          
          // Fade edges
          float edgeFade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
          float horizontalFade = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x);
          
          float alpha = auroraShape * edgeFade * horizontalFade * 0.6;
          
          gl_FragColor = vec4(auroraColor, alpha);
        }
      `}
      transparent
      side={THREE.DoubleSide}
    />
  );
};

const AuroraScene = ({
  primaryColor,
  secondaryColor,
}: {
  primaryColor: string;
  secondaryColor: string;
}) => {
  const primary = useMemo(() => new THREE.Color(primaryColor), [primaryColor]);
  const secondary = useMemo(() => new THREE.Color(secondaryColor), [secondaryColor]);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[10, 8]} />
      <AuroraShaderMaterial primaryColor={primary} secondaryColor={secondary} />
    </mesh>
  );
};

const AuroraBackground = ({
  className = '',
  primaryColor = '#A3FF12',
  secondaryColor = '#8B5CF6',
}: AuroraBackgroundProps) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <AuroraScene primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </Canvas>
    </div>
  );
};

export default AuroraBackground;
