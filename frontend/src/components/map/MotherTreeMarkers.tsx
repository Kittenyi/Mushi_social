import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Mother Tree locations in Chiang Mai
export const MOTHER_TREE_LOCATIONS: {
  id: string;
  name: string;
  nameThai: string;
  coordinates: [number, number]; // [lng, lat]
}[] = [
  {
    id: '706-community',
    name: '706 Community',
    nameThai: '706 ชุมชน',
    coordinates: [98.9817, 18.7883],
  },
  {
    id: 'yellow-coworking',
    name: 'Yellow Coworking',
    nameThai: 'Yellow โคเวิร์คกิ้ง',
    coordinates: [98.9927, 18.7871], // Near Nimman area
  },
];

interface MotherTreeMarkersProps {
  map: mapboxgl.Map | null;
  onTreeClick?: (treeId: string, coordinates: [number, number]) => void;
}

const MotherTreeMarkers = ({ map, onTreeClick }: MotherTreeMarkersProps) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clean up existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    MOTHER_TREE_LOCATIONS.forEach((tree) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'mother-tree-marker';
      el.dataset.treeId = tree.id;
      el.innerHTML = `
        <div class="tree-glow-outer"></div>
        <div class="tree-glow-middle"></div>
        <div class="tree-glow-inner"></div>
        <div class="tree-core"></div>
        <div class="tree-particles"></div>
      `;

      // Add click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onTreeClick?.(tree.id, tree.coordinates);
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(tree.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Animate particles
    let startTime = performance.now();
    const animate = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / 1000;

      document.querySelectorAll('.mother-tree-marker').forEach((marker) => {
        const particles = marker.querySelector('.tree-particles') as HTMLElement;
        if (particles) {
          // Create floating particles effect via CSS custom property
          particles.style.setProperty('--anim-time', `${elapsed}`);
        }

        // Pulse the glow layers
        const outer = marker.querySelector('.tree-glow-outer') as HTMLElement;
        const middle = marker.querySelector('.tree-glow-middle') as HTMLElement;
        if (outer && middle) {
          const pulse = Math.sin(elapsed * 1.5) * 0.3 + 0.7;
          outer.style.opacity = `${pulse * 0.4}`;
          middle.style.opacity = `${pulse * 0.6}`;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, onTreeClick]);

  return null; // Markers are added directly to the map
};

export default MotherTreeMarkers;

// Inject styles for mother tree markers
const styleId = 'mother-tree-marker-styles';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .mother-tree-marker {
      width: 80px;
      height: 80px;
      position: relative;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .mother-tree-marker:hover {
      transform: scale(1.2);
    }
    
    .tree-glow-outer,
    .tree-glow-middle,
    .tree-glow-inner,
    .tree-core {
      position: absolute;
      border-radius: 50%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    
    .tree-glow-outer {
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(163, 255, 18, 0.3) 0%, transparent 70%);
      animation: tree-pulse-outer 3s ease-in-out infinite;
    }
    
    .tree-glow-middle {
      width: 50px;
      height: 50px;
      background: radial-gradient(circle, rgba(163, 255, 18, 0.5) 0%, transparent 70%);
      animation: tree-pulse-middle 2.5s ease-in-out infinite 0.3s;
    }
    
    .tree-glow-inner {
      width: 30px;
      height: 30px;
      background: radial-gradient(circle, rgba(163, 255, 18, 0.7) 0%, rgba(0, 212, 255, 0.3) 100%);
      animation: tree-pulse-inner 2s ease-in-out infinite 0.6s;
    }
    
    .tree-core {
      width: 12px;
      height: 12px;
      background: linear-gradient(135deg, #A3FF12 0%, #00D4FF 100%);
      box-shadow: 
        0 0 10px #A3FF12,
        0 0 20px rgba(163, 255, 18, 0.8),
        0 0 40px rgba(163, 255, 18, 0.4);
    }
    
    .tree-particles {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      pointer-events: none;
    }
    
    .tree-particles::before,
    .tree-particles::after {
      content: '';
      position: absolute;
      width: 4px;
      height: 4px;
      background: #A3FF12;
      border-radius: 50%;
      animation: tree-particle-float 4s ease-in-out infinite;
      box-shadow: 0 0 6px #A3FF12;
    }
    
    .tree-particles::before {
      left: 20%;
      animation-delay: 0s;
    }
    
    .tree-particles::after {
      right: 20%;
      animation-delay: 2s;
    }
    
    @keyframes tree-pulse-outer {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.2; }
    }
    
    @keyframes tree-pulse-middle {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.4; }
    }
    
    @keyframes tree-pulse-inner {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; }
    }
    
    @keyframes tree-particle-float {
      0% { transform: translateY(40px) scale(0); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
