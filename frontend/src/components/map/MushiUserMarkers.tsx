import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { MushiProfile } from '@/components/profile/MushiProfileDrawer';

// Mock Mushi users for demo - in production, fetch from database
export const DEMO_MUSHI_USERS: MushiProfile[] = [
  {
    id: 'mushi-1',
    nickname: 'CryptoNomad',
    soulType: 'explorer',
    gender: 'rounded',
    interests: ['DeFi', 'Travel', 'Coffee'],
    walletLabel: '0x1a2b...3c4d',
    isFriend: false,
  },
  {
    id: 'mushi-2',
    nickname: 'DegenKing',
    soulType: 'degen',
    gender: 'angular',
    interests: ['NFTs', 'Memes', 'Gaming'],
    walletLabel: '0x5e6f...7g8h',
    isFriend: true,
  },
  {
    id: 'mushi-3',
    nickname: 'WhaleWatcher',
    soulType: 'whale',
    gender: 'rounded',
    interests: ['Analytics', 'Trading', 'Data'],
    walletLabel: '0x9i0j...1k2l',
    isFriend: false,
  },
  {
    id: 'mushi-4',
    nickname: 'ArtistSoul',
    soulType: 'artist',
    gender: 'rounded',
    interests: ['Generative Art', 'Music', 'Design'],
    walletLabel: '0x3m4n...5o6p',
    isFriend: false,
  },
  {
    id: 'mushi-5',
    nickname: 'BuilderDAO',
    soulType: 'builder',
    gender: 'angular',
    interests: ['Smart Contracts', 'DAOs', 'Open Source'],
    walletLabel: '0x7q8r...9s0t',
    isFriend: true,
  },
];

// Random positions around Chiang Mai for demo
const MUSHI_POSITIONS: { [key: string]: [number, number] } = {
  'mushi-1': [98.9850, 18.7900],
  'mushi-2': [98.9780, 18.7860],
  'mushi-3': [98.9900, 18.7920],
  'mushi-4': [98.9750, 18.7840],
  'mushi-5': [98.9870, 18.7830],
};

// Soul type colors for markers
const SOUL_MARKER_COLORS: Record<string, string> = {
  degen: '#9945FF',
  whale: '#FFD700',
  builder: '#00D4FF',
  artist: '#FF6B9D',
  explorer: '#A3FF12',
  collector: '#FFD700',
  default: '#A3FF12',
};

interface MushiUserMarkersProps {
  map: mapboxgl.Map | null;
  onMushiClick?: (profile: MushiProfile) => void;
}

const MushiUserMarkers = ({ map, onMushiClick }: MushiUserMarkersProps) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clean up existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    DEMO_MUSHI_USERS.forEach((mushi) => {
      const position = MUSHI_POSITIONS[mushi.id];
      if (!position) return;

      const color = SOUL_MARKER_COLORS[mushi.soulType] || SOUL_MARKER_COLORS.default;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'mushi-user-marker';
      el.dataset.mushiId = mushi.id;
      el.dataset.soulType = mushi.soulType;
      el.innerHTML = `
        <div class="mushi-marker-glow" style="--marker-color: ${color}"></div>
        <div class="mushi-marker-ring" style="--marker-color: ${color}"></div>
        <div class="mushi-marker-core" style="--marker-color: ${color}">
          <div class="mushi-marker-icon">🍄</div>
        </div>
        <div class="mushi-marker-label">${mushi.nickname}</div>
      `;

      const openProfile = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        onMushiClick?.(mushi);
      };
      el.addEventListener('click', openProfile);
      el.addEventListener('touchend', openProfile, { passive: false });
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.touchAction = 'manipulation';

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(position)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Animate markers
    let startTime = performance.now();
    const animate = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / 1000;

      document.querySelectorAll('.mushi-user-marker').forEach((marker, index) => {
        const glow = marker.querySelector('.mushi-marker-glow') as HTMLElement;
        const ring = marker.querySelector('.mushi-marker-ring') as HTMLElement;

        if (glow) {
          const pulse = Math.sin(elapsed * 2 + index * 0.5) * 0.3 + 0.7;
          glow.style.opacity = `${pulse * 0.5}`;
          glow.style.transform = `translate(-50%, -50%) scale(${0.9 + pulse * 0.2})`;
        }

        if (ring) {
          const ringPulse = Math.sin(elapsed * 1.5 + index * 0.7) * 0.2 + 0.8;
          ring.style.opacity = `${ringPulse * 0.6}`;
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
  }, [map, onMushiClick]);

  return null;
};

export default MushiUserMarkers;

// Inject styles for mushi user markers
const styleId = 'mushi-user-marker-styles';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .mushi-user-marker {
      width: 60px;
      height: 60px;
      position: relative;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .mushi-user-marker:hover {
      transform: scale(1.2);
      z-index: 100;
    }
    
    .mushi-marker-glow,
    .mushi-marker-ring,
    .mushi-marker-core {
      position: absolute;
      border-radius: 50%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    
    .mushi-marker-glow {
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, var(--marker-color) 0%, transparent 70%);
      opacity: 0.4;
    }
    
    .mushi-marker-ring {
      width: 40px;
      height: 40px;
      border: 2px solid var(--marker-color);
      opacity: 0.6;
      animation: mushi-ring-pulse 2s ease-in-out infinite;
    }
    
    .mushi-marker-core {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, var(--marker-color), rgba(139, 92, 246, 0.8));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 0 10px var(--marker-color),
        0 0 20px rgba(163, 255, 18, 0.4);
    }
    
    .mushi-marker-icon {
      font-size: 14px;
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
    }
    
    .mushi-marker-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 10px;
      font-weight: 500;
      color: rgba(163, 255, 18, 0.9);
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .mushi-user-marker:hover .mushi-marker-label {
      opacity: 1;
    }
    
    @keyframes mushi-ring-pulse {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.6;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.15);
        opacity: 0.3;
      }
    }
  `;
  document.head.appendChild(style);
}
